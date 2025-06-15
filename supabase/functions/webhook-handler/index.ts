
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[WEBHOOK-HANDLER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event;
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        logStep("Webhook signature verification failed", { error: err.message });
        return new Response(`Webhook signature verification failed`, { status: 400 });
      }
    } else {
      event = JSON.parse(body);
    }

    logStep(`Processing event: ${event.type}`, { eventId: event.id });

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object, supabaseClient);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object, supabaseClient);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object, supabaseClient);
        break;
      
      case 'customer.subscription.updated':
      case 'customer.subscription.created':
        await handleSubscriptionUpdated(event.data.object, supabaseClient);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object, supabaseClient);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object, supabaseClient);
        break;
      
      default:
        logStep(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in webhook-handler", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleCheckoutCompleted(session: any, supabaseClient: any) {
  logStep("Processing checkout.session.completed", { sessionId: session.id });
  
  const userId = session.metadata?.user_id;
  const paymentMethod = session.metadata?.payment_method;
  
  if (!userId) {
    logStep("No user_id in session metadata");
    return;
  }

  if (session.mode === 'subscription' && paymentMethod === 'card') {
    // Assinatura recorrente criada
    const subscription = session.subscription;
    await supabaseClient
      .from('user_subscriptions')
      .update({
        stripe_customer_id: session.customer,
        stripe_subscription_id: subscription,
        status: 'active',
        payment_method: 'card'
      })
      .eq('user_id', userId);
    
    logStep("Updated subscription for card payment", { userId, subscriptionId: subscription });
  }
}

async function handleInvoicePaymentSucceeded(invoice: any, supabaseClient: any) {
  logStep("Processing invoice.payment_succeeded", { invoiceId: invoice.id });
  
  const subscription = invoice.subscription;
  if (!subscription) return;

  const { data: userSub } = await supabaseClient
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription)
    .single();

  if (userSub) {
    const currentPeriodEnd = new Date(invoice.period_end * 1000);
    await supabaseClient
      .from('user_subscriptions')
      .update({
        status: 'active',
        current_period_end: currentPeriodEnd.toISOString(),
        expires_at: currentPeriodEnd.toISOString()
      })
      .eq('stripe_subscription_id', subscription);
    
    logStep("Updated subscription after successful payment", { subscription, currentPeriodEnd });
  }
}

async function handleInvoicePaymentFailed(invoice: any, supabaseClient: any) {
  logStep("Processing invoice.payment_failed", { invoiceId: invoice.id });
  
  const subscription = invoice.subscription;
  if (!subscription) return;

  await supabaseClient
    .from('user_subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_subscription_id', subscription);
  
  logStep("Updated subscription to past_due", { subscription });
}

async function handleSubscriptionUpdated(subscription: any, supabaseClient: any) {
  logStep("Processing subscription updated", { subscriptionId: subscription.id });
  
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
  
  await supabaseClient
    .from('user_subscriptions')
    .update({
      status: subscription.status,
      current_period_end: currentPeriodEnd.toISOString(),
      expires_at: currentPeriodEnd.toISOString()
    })
    .eq('stripe_subscription_id', subscription.id);
  
  logStep("Updated subscription status", { subscriptionId: subscription.id, status: subscription.status });
}

async function handleSubscriptionDeleted(subscription: any, supabaseClient: any) {
  logStep("Processing subscription deleted", { subscriptionId: subscription.id });
  
  await supabaseClient
    .from('user_subscriptions')
    .update({ status: 'canceled' })
    .eq('stripe_subscription_id', subscription.id);
  
  logStep("Updated subscription to canceled", { subscriptionId: subscription.id });
}

async function handlePaymentIntentSucceeded(paymentIntent: any, supabaseClient: any) {
  logStep("Processing payment_intent.succeeded", { paymentIntentId: paymentIntent.id });
  
  // Para pagamentos PIX
  if (paymentIntent.payment_method_types.includes('pix')) {
    const customerId = paymentIntent.customer;
    
    // Buscar usuário pelo customer ID
    const { data: userSub } = await supabaseClient
      .from('user_subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (userSub) {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dias

      // Registrar pagamento PIX
      await supabaseClient
        .from('pix_payments')
        .upsert({
          user_id: userSub.user_id,
          stripe_payment_intent_id: paymentIntent.id,
          amount: paymentIntent.amount,
          status: 'succeeded',
          paid_at: now.toISOString(),
          expires_at: expiresAt.toISOString()
        }, { onConflict: 'stripe_payment_intent_id' });

      // Atualizar subscription
      await supabaseClient
        .from('user_subscriptions')
        .update({
          status: 'active',
          payment_method: 'pix',
          expires_at: expiresAt.toISOString()
        })
        .eq('user_id', userSub.user_id);
      
      logStep("Updated subscription after PIX payment", { 
        userId: userSub.user_id, 
        paymentIntentId: paymentIntent.id,
        expiresAt: expiresAt.toISOString()
      });
    }
  }
}
