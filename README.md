# Bin Day — deployment guide (Cloudflare Workers)

Your account's Cloudflare dashboard deploys via **Workers with static
assets**, not classic Pages — that's why the earlier `functions/api/*.js`
folder didn't work. This version uses the structure that setup expects:

```
wrangler.jsonc   <- tells Cloudflare how to run this
worker.js        <- handles /api/* requests, serves everything else as static files
public/          <- your app (index.html, app.js, manifest.json, sw.js, icons/)
```

## Update your GitHub repo
1. Open your `bin-day` repo on GitHub.
2. Delete the old `functions` folder, `index.html`, `app.js`, `manifest.json`,
   `sw.js`, and `icons` folder from the repo root (you can delete files via
   the GitHub web UI — open each, click the trash icon, commit).
3. Upload the new files/folders from this package (`wrangler.jsonc`,
   `worker.js`, and the whole `public/` folder) using "Add file → Upload
   files", preserving the folder structure. Commit.
4. Since your Cloudflare project is already connected to this repo, pushing
   the commit should trigger an automatic redeploy. Check the deployment
   log in the Cloudflare dashboard (Workers & Pages → your project →
   Deployments) to confirm it succeeds.

## Test it
Visit `https://bin-day.oliver-holt-2312.workers.dev/api/addresses?postcode=YOURPOSTCODE`
directly — you should see the same JSON you saw before. If so, open the
site's home page, enter your postcode, and confirm this week's bins show up.

## Install on Android
Open the URL in Chrome on your phone → menu (⋮) → **Add to Home screen**.
