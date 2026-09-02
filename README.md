# Bin Day — deployment guide

This is a complete, working app. You need to publish it somewhere with a
public HTTPS URL so your phone can reach it. Recommended: **Cloudflare
Pages** (free), because it hosts the static site *and* runs the two small
proxy functions in `functions/api/` that talk to the council's server on
your behalf (avoids a browser security restriction called CORS).

## 1. Create a free Cloudflare account
Go to https://dash.cloudflare.com/sign-up and sign up (email + password).
No card required for this.

## 2. Deploy the site
1. In the Cloudflare dashboard, go to **Workers & Pages** → **Create** →
   **Pages** → **Upload assets**.
2. Give the project a name, e.g. `bin-day`.
3. Drag the whole `bin-app` folder (or a zip of it) into the upload area.
   Cloudflare automatically detects the `functions/` folder and deploys
   those as serverless functions alongside the static files.
4. Click **Deploy**. You'll get a URL like `https://bin-day-xyz.pages.dev`.

## 3. Test it
Open that URL in a browser, enter your postcode, pick your address, and
confirm this week's bins show up correctly.

## 4. Install it on Android
1. Open the URL in **Chrome** on your Android phone.
2. Tap the **⋮** menu → **Add to Home screen** (Chrome may also prompt you
   automatically).
3. Confirm. You'll get an app icon that opens full-screen, like a native app.

## Notes
- Your postcode/address is stored only in your phone's browser storage
  (`localStorage`) — it is never sent to any server I control, only to the
  council's own site via the proxy.
- The proxy functions add no logging or storage of their own; they just
  relay the request and response.
- If Cloudflare ever changes how Pages deploys work, the fallback is any
  host that supports serverless functions alongside static files (Netlify
  is a very similar free alternative — same folder structure works there
  as Netlify Functions with a small path change from `/api/` to
  `/.netlify/functions/`).
