const UPSTREAM = "https://www.greatercambridgewaste.org/bin-calendar/collections";

const UPSTREAM_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; BinDayApp/1.0)",
  Accept: "application/json, text/plain, */*",
  Referer: "https://www.greatercambridgewaste.org/find-your-bin-collection-day",
};

exports.handler = async function (event) {
  const qs = event.queryStringParameters || {};
  const uprn = qs.uprn;
  const numberOfCollections = qs.numberOfCollections || "16";

  if (!uprn) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "uprn is required" }),
    };
  }

  const url = `${UPSTREAM}?uprn=${encodeURIComponent(uprn)}&numberOfCollections=${encodeURIComponent(numberOfCollections)}`;

  const res = await fetch(url, { headers: UPSTREAM_HEADERS });
  const body = await res.text();

  return {
    statusCode: res.status,
    headers: { "Content-Type": "application/json" },
    body,
  };
};
