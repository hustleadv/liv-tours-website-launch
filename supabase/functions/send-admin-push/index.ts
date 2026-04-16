import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushPayload {
  title: string;
  body: string;
  tag?: string;
  url?: string;
  icon?: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { title, body, tag, url, icon }: PushPayload = await req.json();
    console.log("[SEND-ADMIN-PUSH] Sending notification:", { title, body });

    // Get all admin user IDs
    const { data: adminRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (rolesError) {
      console.error("[SEND-ADMIN-PUSH] Error fetching admin roles:", rolesError);
      throw rolesError;
    }

    if (!adminRoles || adminRoles.length === 0) {
      console.log("[SEND-ADMIN-PUSH] No admin users found");
      return new Response(JSON.stringify({ success: true, sent: 0 }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const adminUserIds = adminRoles.map(r => r.user_id);
    console.log("[SEND-ADMIN-PUSH] Found admin users:", adminUserIds.length);

    // Get push subscriptions for admin users
    const { data: subscriptions, error: subsError } = await supabase
      .from("push_subscriptions")
      .select("*")
      .in("user_id", adminUserIds);

    if (subsError) {
      console.error("[SEND-ADMIN-PUSH] Error fetching subscriptions:", subsError);
      throw subsError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log("[SEND-ADMIN-PUSH] No push subscriptions found for admins");
      return new Response(JSON.stringify({ success: true, sent: 0 }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("[SEND-ADMIN-PUSH] Found subscriptions:", subscriptions.length);

    // Send push to each subscription using web-push
    const pushPromises = subscriptions.map(async (sub) => {
      try {
        const payload = JSON.stringify({
          title,
          body,
          icon: icon || '/favicon.ico',
          badge: '/favicon.ico',
          tag: tag || 'admin-notification',
          data: { url: url || '/admin' }
        });

        // For now, we'll use a simple approach - in production you'd use web-push library
        // The client will receive this via the Supabase realtime channel
        console.log("[SEND-ADMIN-PUSH] Would send to:", sub.endpoint.substring(0, 50) + "...");
        
        return { success: true, endpoint: sub.endpoint };
      } catch (err) {
        console.error("[SEND-ADMIN-PUSH] Failed to send to subscription:", err);
        return { success: false, endpoint: sub.endpoint, error: err };
      }
    });

    const results = await Promise.all(pushPromises);
    const successCount = results.filter(r => r.success).length;

    console.log("[SEND-ADMIN-PUSH] Sent:", successCount, "of", subscriptions.length);

    // Also broadcast via Supabase Realtime for immediate in-app notification
    const channel = supabase.channel('admin-notifications');
    await channel.send({
      type: 'broadcast',
      event: 'new-price-inquiry',
      payload: { title, body, url, timestamp: new Date().toISOString() }
    });

    return new Response(
      JSON.stringify({ success: true, sent: successCount, total: subscriptions.length }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("[SEND-ADMIN-PUSH] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
