import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// ISO 3166-1 alpha-2 → display name map (most common countries)
const COUNTRY_NAMES: Record<string, string> = {
  TR: "Türkiye", US: "United States", GB: "United Kingdom", DE: "Germany",
  FR: "France", NL: "Netherlands", RU: "Russia", UA: "Ukraine",
  PL: "Poland", IT: "Italy", ES: "Spain", SE: "Sweden", NO: "Norway",
  DK: "Denmark", FI: "Finland", CH: "Switzerland", AT: "Austria",
  BE: "Belgium", PT: "Portugal", GR: "Greece", CZ: "Czech Republic",
  RO: "Romania", HU: "Hungary", BG: "Bulgaria", SK: "Slovakia",
  HR: "Croatia", SI: "Slovenia", RS: "Serbia", AL: "Albania",
  BA: "Bosnia and Herzegovina", ME: "Montenegro", MK: "North Macedonia",
  CN: "China", JP: "Japan", KR: "South Korea", IN: "India",
  ID: "Indonesia", PK: "Pakistan", BD: "Bangladesh", VN: "Vietnam",
  TH: "Thailand", MY: "Malaysia", PH: "Philippines", SG: "Singapore",
  AE: "United Arab Emirates", SA: "Saudi Arabia", IL: "Israel",
  IQ: "Iraq", IR: "Iran", JO: "Jordan", KW: "Kuwait", QA: "Qatar",
  CA: "Canada", MX: "Mexico", BR: "Brazil", AR: "Argentina",
  CL: "Chile", CO: "Colombia", PE: "Peru", VE: "Venezuela",
  AU: "Australia", NZ: "New Zealand", ZA: "South Africa",
  NG: "Nigeria", EG: "Egypt", KE: "Kenya", MA: "Morocco",
  TW: "Taiwan", HK: "Hong Kong",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Cloudflare provides country via CF-IPCountry header on Supabase edge
    const countryCode = req.headers.get("CF-IPCountry") ||
      req.headers.get("X-Country-Code") ||
      null;

    const country = countryCode && countryCode !== "XX" && countryCode !== "T1"
      ? countryCode.toUpperCase()
      : null;

    const countryName = country ? (COUNTRY_NAMES[country] ?? country) : null;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error } = await supabase.from("page_views").insert({
      page: body.page ?? "/",
      title: body.title ?? null,
      article_id: body.article_id ?? null,
      referrer: body.referrer ?? null,
      user_agent: body.user_agent ?? null,
      language: body.language ?? null,
      screen_width: body.screen_width ?? null,
      session_id: body.session_id ?? null,
      country,
      country_name: countryName,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
