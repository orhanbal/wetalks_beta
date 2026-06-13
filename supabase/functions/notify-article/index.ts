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

    const body = await req.json();
    const { article_id, notify_followers = true, notify_subscribers = true } = body as {
      article_id: string;
      notify_followers?: boolean;
      notify_subscribers?: boolean;
    };

    if (!article_id) {
      return new Response(
        JSON.stringify({ error: "article_id gerekli." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch article
    const { data: article } = await supabase
      .from("articles")
      .select("id, title, excerpt, date, category, reading_time, og_image, author_id, published")
      .eq("id", article_id)
      .maybeSingle();

    if (!article || !article.published) {
      return new Response(
        JSON.stringify({ error: "Makale bulunamadı veya yayında değil." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch site settings
    const { data: settingsRows } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["resend_api_key", "resend_from_email", "resend_from_name", "site_title", "site_domain"]);

    const settings: Record<string, string> = {};
    (settingsRows ?? []).forEach((r: { key: string; value: string }) => {
      settings[r.key] = r.value;
    });

    const resendApiKey = settings["resend_api_key"];
    const fromEmail = settings["resend_from_email"] || "bulten@wetalks.tr";
    const fromName = settings["resend_from_name"] || settings["site_title"] || "wetalks.tr";
    const siteDomain = settings["site_domain"] || "wetalks.tr";
    const siteUrl = `https://${siteDomain}`;

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "Resend API anahtarı yapılandırılmamış." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Collect recipient emails
    const recipientSet = new Set<string>();
    const recipientMap: { email: string; unsubscribe_token: string | null }[] = [];

    // 1. Followers of the author (users who follow this author)
    if (notify_followers && article.author_id) {
      const { data: follows } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("following_id", article.author_id);

      if (follows && follows.length > 0) {
        const followerIds = follows.map((f: { follower_id: string }) => f.follower_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", followerIds);

        // Get emails from auth.users via service role
        const { data: users } = await supabase.auth.admin.listUsers();
        const emailMap: Record<string, string> = {};
        (users?.users ?? []).forEach((u) => {
          if (u.email) emailMap[u.id] = u.email;
        });

        (profiles ?? []).forEach((p: { id: string }) => {
          const email = emailMap[p.id];
          if (email && !recipientSet.has(email)) {
            recipientSet.add(email);
            recipientMap.push({ email, unsubscribe_token: null });
          }
        });
      }
    }

    // 2. Newsletter subscribers
    if (notify_subscribers) {
      const { data: subscribers } = await supabase
        .from("newsletter_subscribers")
        .select("email, unsubscribe_token")
        .eq("status", "active");

      (subscribers ?? []).forEach((s: { email: string; unsubscribe_token: string }) => {
        if (!recipientSet.has(s.email)) {
          recipientSet.add(s.email);
          recipientMap.push({ email: s.email, unsubscribe_token: s.unsubscribe_token });
        }
      });
    }

    if (recipientMap.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, sent: 0, message: "Bildirim gönderilecek alıcı yok." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const subject = `Yeni yazı: ${article.title}`;
    const articleUrl = `${siteUrl}/yazi/${article.id}`;

    const articleHtml = `
      <div style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;background:#fff;">
        ${article.og_image ? `<img src="${article.og_image}" alt="${article.title}" style="width:100%;height:200px;object-fit:cover;display:block;" />` : ''}
        <div style="padding:24px;">
          <div style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">${article.category} · ${article.reading_time} dk okuma</div>
          <h2 style="font-size:20px;font-weight:800;color:#111;margin:0 0 10px;line-height:1.3;">${article.title}</h2>
          <p style="font-size:14px;color:#6b7280;margin:0 0 18px;line-height:1.6;">${article.excerpt}</p>
          <a href="${articleUrl}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:10px 22px;border-radius:8px;font-size:13px;font-weight:700;">Yazıyı Oku</a>
        </div>
      </div>
    `;

    let sentCount = 0;
    const errors: string[] = [];

    for (const recipient of recipientMap) {
      const unsubUrl = recipient.unsubscribe_token
        ? `${siteUrl}/bulten-iptal?token=${recipient.unsubscribe_token}`
        : `${siteUrl}`;

      const html = `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:'Inter',Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#f8f9fa;">
    <div style="background:#111;border-radius:12px 12px 0 0;padding:24px 32px;text-align:center;">
      <a href="${siteUrl}" style="color:#c8f542;font-size:20px;font-weight:800;text-decoration:none;letter-spacing:-0.02em;">${fromName}</a>
      <p style="color:#888;font-size:13px;margin:6px 0 0;">Yeni Yazı Bildirimi</p>
    </div>
    <div style="background:#f8f9fa;padding:24px 32px;">
      <p style="font-size:15px;color:#374151;margin:0 0 20px;line-height:1.6;">Takip ettiğiniz yazar yeni bir yazı yayımladı:</p>
      ${articleHtml}
    </div>
    <div style="background:#fff;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
      <p style="font-size:12px;color:#9ca3af;margin:0 0 8px;">
        Bu bildirimleri almak istemiyorsanız <a href="${unsubUrl}" style="color:#6b7280;">aboneliğinizi iptal edebilirsiniz</a>.
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
          to: [recipient.email],
          subject,
          html,
        }),
      });

      if (res.ok) {
        sentCount++;
      } else {
        const err = await res.json().catch(() => ({}));
        errors.push(`${recipient.email}: ${(err as { message?: string }).message ?? 'Hata'}`);
      }
    }

    // Log
    await supabase.from("article_notification_logs").insert({
      article_id: article.id,
      article_title: article.title,
      recipient_count: sentCount,
      notify_followers,
      notify_subscribers,
      status: errors.length === 0 ? "success" : "error",
      error_message: errors.length > 0 ? errors.slice(0, 5).join('; ') : null,
    });

    return new Response(
      JSON.stringify({ ok: true, sent: sentCount, total: recipientMap.length, errors: errors.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
