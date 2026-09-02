const UPSTREAM_ADDRESSES = "https://www.greatercambridgewaste.org/bin-calendar/addresses";
const UPSTREAM_COLLECTIONS = "https://www.greatercambridgewaste.org/bin-calendar/collections";

const UPSTREAM_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; BinDayApp/1.0)",
  Accept: "application/json, text/plain, */*",
  Referer: "https://www.greatercambridgewaste.org/find-your-bin-collection-day",
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

async function proxy(upstreamBase, params) {
  const upstreamUrl = `${upstreamBase}?${params.toString()}`;
  const res = await fetch(upstreamUrl, { headers: UPSTREAM_HEADERS });
  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS" && url.pathname.startsWith("/api/")) {
      return new Response(null, { headers: corsHeaders() });
    }

    if (url.pathname === "/api/addresses") {
      const postcode = url.searchParams.get("postcode");
      if (!postcode) {
        return new Response(JSON.stringify({ error: "postcode is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders() },
        });
      }
      const cleaned = postcode.trim().replace(/\s+/g, "").toUpperCase();
      const params = new URLSearchParams({ postcode: cleaned });
      return proxy(UPSTREAM_ADDRESSES, params);
    }

    if (url.pathname === "/api/collections") {
      const uprn = url.searchParams.get("uprn");
      if (!uprn) {
        return new Response(JSON.stringify({ error: "uprn is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders() },
        });
      }
      const numberOfCollections = url.searchParams.get("numberOfCollections") || "16";
      const params = new URLSearchParams({ uprn, numberOfCollections });
      return proxy(UPSTREAM_COLLECTIONS, params);
    }

    return env.ASSETS.fetch(request);
  },
};
