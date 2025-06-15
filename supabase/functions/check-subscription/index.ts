
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
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Buscar assinatura atual do usuário
    const { data: subscription } = await supabaseClient
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const now = new Date();
    let subscriptionStatus = {
      has_access: false,
      plan_type: 'none',
      expires_at: null,
      days_remaining: 0,
      is_trial: false,
      is_expired: false
    };

    if (subscription) {
      const expiresAt = new Date(subscription.expires_at);
      const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      subscriptionStatus = {
        has_access: subscription.status === 'trial' || subscription.status === 'active',
        plan_type: subscription.plan_type,
        expires_at: subscription.expires_at,
        days_remaining: Math.max(0, daysRemaining),
        is_trial: subscription.plan_type === 'trial',
        is_expired: subscription.status === 'expired' || daysRemaining <= 0
      };

      // Atualizar status se expirou
      if (daysRemaining <= 0 && subscription.status !== 'expired') {
        await supabaseClient
          .from('user_subscriptions')
          .update({ status: 'expired' })
          .eq('id', subscription.id);
        
        subscriptionStatus.is_expired = true;
        subscriptionStatus.has_access = false;
      }
    }

    logStep("Subscription status checked", subscriptionStatus);

    return new Response(JSON.stringify(subscriptionStatus), {
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
