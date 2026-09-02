// Cloudflare Pages Function: GET /api/collections?uprn=200004175273&numberOfCollections=16

const UPSTREAM = "https://www.greatercambridgewaste.org/bin-calendar/collections";

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
  const uprn = url.searchParams.get("uprn");
  const numberOfCollections = url.searchParams.get("numberOfCollections") || "16";

  if (!uprn) {
    return new Response(JSON.stringify({ error: "uprn is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }

  const upstreamUrl = `${UPSTREAM}?uprn=${encodeURIComponent(uprn)}&numberOfCollections=${encodeURIComponent(numberOfCollections)}`;

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
