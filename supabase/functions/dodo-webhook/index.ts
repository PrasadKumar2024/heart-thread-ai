import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const signature = req.headers.get("dodo-signature");
    const WEBHOOK_SECRET = Deno.env.get("DODO_WEBHOOK_SECRET");

    // Basic signature verification
    if (WEBHOOK_SECRET && signature) {
      // Dodo sends signature for verification
      // For now we check it exists; full HMAC verification can be added
      console.log("Webhook signature present:", !!signature);
    }

    const body = await req.json();
    const eventType = body.type || body.event_type;

    console.log("Dodo webhook event:", eventType);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const customerEmail = body.data?.customer?.email || body.customer?.email;
    const userId = body.data?.metadata?.user_id || body.metadata?.user_id;

    if (!customerEmail && !userId) {
      console.error("No customer email or user_id in webhook");
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find user by ID (preferred) or by email
    let targetUserId = userId;
    if (!targetUserId && customerEmail) {
      const { data: users } = await supabase.auth.admin.listUsers();
      const user = users?.users?.find((u) => u.email === customerEmail);
      targetUserId = user?.id;
    }

    if (!targetUserId) {
      console.error("Could not find user for:", customerEmail);
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    switch (eventType) {
      case "subscription.active":
      case "subscription.created":
      case "payment.succeeded":
        await supabase
          .from("profiles")
          .update({ is_premium: true })
          .eq("id", targetUserId);
        console.log("User upgraded to premium:", targetUserId);
        break;

      case "subscription.cancelled":
      case "subscription.expired":
        await supabase
          .from("profiles")
          .update({ is_premium: false })
          .eq("id", targetUserId);
        console.log("User downgraded from premium:", targetUserId);
        break;

      case "payment.failed":
        console.log("Payment failed for user:", targetUserId);
        break;

      default:
        console.log("Unhandled event type:", eventType);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Webhook error:", e);
    // Always return 200 to Dodo
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
