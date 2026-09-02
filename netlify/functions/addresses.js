const UPSTREAM = "https://www.greatercambridgewaste.org/bin-calendar/addresses";

const UPSTREAM_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; BinDayApp/1.0)",
  Accept: "application/json, text/plain, */*",
  Referer: "https://www.greatercambridgewaste.org/find-your-bin-collection-day",
};

exports.handler = async function (event) {
  const postcode = event.queryStringParameters && event.queryStringParameters.postcode;

  if (!postcode) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "postcode is required" }),
    };
  }

  const cleaned = postcode.trim().replace(/\s+/g, "").toUpperCase();
  const url = `${UPSTREAM}?postcode=${encodeURIComponent(cleaned)}`;

  const res = await fetch(url, { headers: UPSTREAM_HEADERS });
  const body = await res.text();

  return {
    statusCode: res.status,
    headers: { "Content-Type": "application/json" },
    body,
  };
};
