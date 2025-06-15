
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Buscar subscription atual no banco
    const { data: subscription, error: subError } = await supabaseClient
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (subError && subError.code !== 'PGRST116') {
      throw new Error(`Database error: ${subError.message}`);
    }

    const now = new Date();
    
    // Se não tem subscription, verificar se precisa criar trial
    if (!subscription) {
      logStep("No subscription found, creating trial");
      const trialEndDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const { error: insertError } = await supabaseClient
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          plan_type: 'trial',
          status: 'trial',
          trial_start_date: now.toISOString(),
          trial_end_date: trialEndDate.toISOString(),
          started_at: now.toISOString(),
          expires_at: trialEndDate.toISOString()
        });

      if (insertError) throw new Error(`Error creating trial: ${insertError.message}`);

      return new Response(JSON.stringify({
        status: 'trial',
        trial_end_date: trialEndDate.toISOString(),
        days_remaining: 7,
        can_edit: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Verificar se trial expirou
    if (subscription.status === 'trial' && subscription.trial_end_date) {
      const trialEndDate = new Date(subscription.trial_end_date);
      if (now > trialEndDate) {
        logStep("Trial expired, updating status");
        await supabaseClient
          .from('user_subscriptions')
          .update({ status: 'expired', expires_at: now.toISOString() })
          .eq('user_id', user.id);

        return new Response(JSON.stringify({
          status: 'expired',
          trial_end_date: subscription.trial_end_date,
          days_remaining: 0,
          can_edit: false
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // Trial ainda ativo
      const daysRemaining = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return new Response(JSON.stringify({
        status: 'trial',
        trial_end_date: subscription.trial_end_date,
        days_remaining: daysRemaining,
        can_edit: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Se tem stripe_customer_id, verificar no Stripe
    if (subscription.stripe_customer_id) {
      const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
      
      // Verificar assinaturas ativas (cartão)
      const subscriptions = await stripe.subscriptions.list({
        customer: subscription.stripe_customer_id,
        status: 'active',
        limit: 1
      });

      if (subscriptions.data.length > 0) {
        const stripeSubscription = subscriptions.data[0];
        const currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
        
        logStep("Active Stripe subscription found", { 
          subscriptionId: stripeSubscription.id,
          currentPeriodEnd: currentPeriodEnd.toISOString()
        });

        // Atualizar no banco
        await supabaseClient
          .from('user_subscriptions')
          .update({
            status: 'active',
            payment_method: 'card',
            current_period_end: currentPeriodEnd.toISOString(),
            expires_at: currentPeriodEnd.toISOString()
          })
          .eq('user_id', user.id);

        return new Response(JSON.stringify({
          status: 'active',
          payment_method: 'card',
          current_period_end: currentPeriodEnd.toISOString(),
          can_edit: true
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // Verificar pagamentos PIX recentes
      const { data: pixPayments } = await supabaseClient
        .from('pix_payments')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'succeeded')
        .order('paid_at', { ascending: false })
        .limit(1);

      if (pixPayments && pixPayments.length > 0) {
        const lastPixPayment = pixPayments[0];
        const paidAt = new Date(lastPixPayment.paid_at);
        const expiresAt = new Date(paidAt.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dias

        if (now < expiresAt) {
          logStep("Active PIX payment found", { 
            paymentId: lastPixPayment.id,
            expiresAt: expiresAt.toISOString()
          });

          // Atualizar no banco
          await supabaseClient
            .from('user_subscriptions')
            .update({
              status: 'active',
              payment_method: 'pix',
              expires_at: expiresAt.toISOString()
            })
            .eq('user_id', user.id);

          return new Response(JSON.stringify({
            status: 'active',
            payment_method: 'pix',
            expires_at: expiresAt.toISOString(),
            can_edit: true
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
      }
    }

    // Se chegou aqui, não tem assinatura ativa
    logStep("No active subscription found");
    await supabaseClient
      .from('user_subscriptions')
      .update({ status: 'expired', expires_at: now.toISOString() })
      .eq('user_id', user.id);

    return new Response(JSON.stringify({
      status: 'expired',
      can_edit: false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
