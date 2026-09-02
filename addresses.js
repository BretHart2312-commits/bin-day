// Cloudflare Pages Function: GET /api/addresses?postcode=CB13JD
// Forwards server-to-server to the council's own endpoint. Browsers can't do
// this directly because that endpoint doesn't send CORS headers allowing
// requests from a different domain than greatercambridgewaste.org.

const UPSTREAM = "https://www.greatercambridgewaste.org/bin-calendar/addresses";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders() });
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const postcode = url.searchParams.get("postcode");

  if (!postcode) {
    return new Response(JSON.stringify({ error: "postcode is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }

  const cleaned = postcode.trim().replace(/\s+/g, "").toUpperCase();
  const upstreamUrl = `${UPSTREAM}?postcode=${encodeURIComponent(cleaned)}`;

  const upstreamRes = await fetch(upstreamUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; BinDayApp/1.0)",
      Accept: "application/json, text/plain, */*",
      Referer: "https://www.greatercambridgewaste.org/find-your-bin-collection-day",
    },
  });

  const body = await upstreamRes.text();

  return new Response(body, {
    status: upstreamRes.status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}
