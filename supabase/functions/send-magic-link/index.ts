import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, redirectTo } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "Email requis" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Generate magic link using admin API
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: email,
      options: { redirectTo: redirectTo || "" },
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const magicLink = data.properties.action_link;

    // Load email template
    const RESEND_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_KEY) {
      return new Response(JSON.stringify({ error: "Resend non configuré" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Build email HTML
    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#021130;font-family:'Inter',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#021130;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;border:4px solid #f1f5f9;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
<tr><td style="padding:40px 36px;">
<div style="background:rgba(37,99,235,0.08);border-radius:20px;padding:4px 14px;display:inline-block;margin-bottom:20px;">
<span style="font-size:12px;font-weight:600;color:#2563eb;text-transform:uppercase;letter-spacing:0.02em;">Connexion</span>
</div>
<h1 style="font-size:24px;font-weight:700;color:#1d1e24;margin:0 0 16px;line-height:1.35;">
Votre lien d'accès <span style="color:#2563eb;">TerraGrow</span>
</h1>
<p style="font-size:15px;line-height:1.6;color:#707078;margin:0 0 28px;">
Cliquez sur le bouton ci-dessous pour vous connecter à votre espace de test TerraGrow. Ce lien est valable pendant 1 heure.
</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center">
<a href="${magicLink}" target="_blank" style="display:inline-block;background:#021130;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:0 28px;line-height:40px;height:40px;border-radius:8px;">
Se connecter
</a>
</td></tr>
</table>
<p style="font-size:13px;color:#a7a7ae;margin:24px 0 0;text-align:center;">
Si vous n'avez pas demandé ce lien, ignorez cet e-mail.
</p>
<div style="border-top:1px solid #f1f5f9;margin:24px 0 0;padding:20px 0 0;">
<p style="font-size:12px;color:#a7a7ae;text-align:center;margin:0;">
<a href="${magicLink}" style="color:#2563eb;word-break:break-all;">${magicLink}</a>
</p>
</div>
</td></tr>
</table>
<table role="presentation" width="520" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:28px 16px;">
<p style="font-size:12px;color:#a7a7ae;margin:0;text-align:center;">Cet e-mail a été envoyé automatiquement — TerraGrow</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;

    // Send via Resend API
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "TerraGrow <noreply@terragrow.fr>",
        to: email,
        subject: "Votre lien d'accès TerraGrow",
        html: html,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      return new Response(JSON.stringify({ error: resendData.message || "Erreur Resend" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
