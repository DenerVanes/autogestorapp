
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      throw new Error("No signature provided");
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET") || ""
    );

    logStep("Event type", { type: event.type });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        
        if (userId) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          
          await supabaseClient.from('user_subscriptions').insert({
            user_id: userId,
            plan_type: 'pro_recurring',
            status: 'active',
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            stripe_price_id: subscription.items.data[0].price.id,
            amount: subscription.items.data[0].price.unit_amount! / 100,
            payment_method: 'card',
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            expires_at: new Date(subscription.current_period_end * 1000).toISOString()
          });
          
          logStep("Subscription created", { userId, subscriptionId: session.subscription });
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        if (paymentIntent.payment_method_types.includes('pix')) {
          const userId = paymentIntent.metadata?.user_id;
          
          if (userId) {
            // Atualizar pagamento PIX
            await supabaseClient
              .from('pix_payments')
              .update({
                status: 'paid',
                paid_at: new Date().toISOString()
              })
              .eq('stripe_payment_intent_id', paymentIntent.id);

            // Criar assinatura PIX de 30 dias
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);

            await supabaseClient.from('user_subscriptions').insert({
              user_id: userId,
              plan_type: 'pro_pix',
              status: 'active',
              amount: paymentIntent.amount / 100,
              payment_method: 'pix',
              expires_at: expiresAt.toISOString()
            });
            
            logStep("PIX subscription created", { userId, amount: paymentIntent.amount });
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const userId = subscription.metadata?.user_id;
          
          if (userId) {
            await supabaseClient
              .from('user_subscriptions')
              .update({
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
                status: 'active'
              })
              .eq('stripe_subscription_id', subscription.id);
            
            logStep("Subscription renewed", { userId, subscriptionId: subscription.id });
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        
        await supabaseClient
          .from('user_subscriptions')
          .update({ status: 'cancelled' })
          .eq('stripe_subscription_id', subscription.id);
        
        logStep("Subscription cancelled", { subscriptionId: subscription.id });
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
