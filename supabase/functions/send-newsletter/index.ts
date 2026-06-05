import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch Resend settings
    const { data: settingsRows } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["resend_api_key", "resend_from_email", "resend_from_name", "site_title", "site_domain"]);

    const settings: Record<string, string> = {};
    (settingsRows ?? []).forEach((r: { key: string; value: string }) => {
      settings[r.key] = r.value;
    });

    const resendApiKey = settings["resend_api_key"];
    const fromEmail = settings["resend_from_email"] || "bulten@obtalks.tr";
    const fromName = settings["resend_from_name"] || settings["site_title"] || "obtalks.tr";
    const siteDomain = settings["site_domain"] || "obtalks.tr";
    const siteUrl = `https://${siteDomain}`;

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "Resend API anahtarı yapılandırılmamış." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get articles from last 7 days
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: articles } = await supabase
      .from("articles")
      .select("id, title, excerpt, date, category, reading_time, og_image")
      .eq("published", true)
      .gte("date", since.split("T")[0])
      .order("date", { ascending: false });

    if (!articles || articles.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, sent: 0, message: "Bu hafta yayımlanan makale yok." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get active subscribers
    const { data: subscribers } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, unsubscribe_token")
      .eq("status", "active");

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, sent: 0, message: "Aktif abone yok." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const subject = `Haftalık Bülten — ${articles.length} yeni yazı`;

    const articlesHtml = articles.map((a: {
      id: string; title: string; excerpt: string; date: string;
      category: string; reading_time: number; og_image: string | null;
    }) => `
      <div style="border:1px solid #e5e7eb;border-radius:10px;padding:20px 24px;margin-bottom:16px;background:#fff;">
        ${a.og_image ? `<img src="${a.og_image}" alt="${a.title}" style="width:100%;height:160px;object-fit:cover;border-radius:6px;margin-bottom:14px;" />` : ''}
        <div style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">${a.category} · ${a.reading_time} dk okuma</div>
        <h2 style="font-size:18px;font-weight:700;color:#111;margin:0 0 8px;line-height:1.3;">${a.title}</h2>
        <p style="font-size:14px;color:#6b7280;margin:0 0 14px;line-height:1.6;">${a.excerpt}</p>
        <a href="${siteUrl}/makale/${a.id}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:8px 18px;border-radius:6px;font-size:13px;font-weight:600;">Oku</a>
      </div>
    `).join('');

    let sentCount = 0;
    const errors: string[] = [];

    for (const sub of subscribers as { id: string; email: string; unsubscribe_token: string }[]) {
      const unsubUrl = `${siteUrl}/bulten-iptal?token=${sub.unsubscribe_token}`;

      const html = `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:'Inter',Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#f8f9fa;">
    <!-- Header -->
    <div style="background:#111;border-radius:12px 12px 0 0;padding:24px 32px;text-align:center;">
      <a href="${siteUrl}" style="color:#c8f542;font-size:20px;font-weight:800;text-decoration:none;letter-spacing:-0.02em;">${fromName}</a>
      <p style="color:#888;font-size:13px;margin:6px 0 0;">Haftalık Bülten</p>
    </div>

    <!-- Body -->
    <div style="background:#f8f9fa;padding:24px 32px;">
      <p style="font-size:15px;color:#374151;margin:0 0 20px;line-height:1.6;">
        Bu hafta ${articles.length} yeni yazı yayımlandı. İşte öne çıkanlar:
      </p>
      ${articlesHtml}
    </div>

    <!-- Footer -->
    <div style="background:#fff;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
      <p style="font-size:12px;color:#9ca3af;margin:0 0 8px;">
        Bu bülteni almak istemiyorsanız <a href="${unsubUrl}" style="color:#6b7280;">aboneliğinizi iptal edebilirsiniz</a>.
      </p>
      <p style="font-size:12px;color:#d1d5db;margin:0;">${siteUrl}</p>
    </div>
  </div>
</body>
</html>`;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${fromName} <${fromEmail}>`,
          to: [sub.email],
          subject,
          html,
        }),
      });

      if (res.ok) {
        sentCount++;
      } else {
        const err = await res.json();
        errors.push(`${sub.email}: ${err.message ?? 'Hata'}`);
      }
    }

    // Log the send
    await supabase.from("newsletter_send_logs").insert({
      subject,
      recipient_count: sentCount,
      status: errors.length === 0 ? "success" : "error",
      error_message: errors.length > 0 ? errors.slice(0, 5).join('; ') : null,
    });

    return new Response(
      JSON.stringify({ ok: true, sent: sentCount, errors: errors.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
