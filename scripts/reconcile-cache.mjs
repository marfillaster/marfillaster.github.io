// Post-deploy: asks the live Worker to purge what this deploy changed
// (workers/cache-reconcile.ts). A shortcut, not the mechanism — the gateway
// reconciles before the first request each isolate serves and the hourly cron
// runs it too — so a failure here warns and leaves the deploy green.
//
// Run by `pnpm cf:deploy` after `wrangler deploy`.

const url = process.env.RECONCILE_URL ?? "https://blog.homestack.space/api/cache/reconcile";
const attempts = 4;

for (let attempt = 1; attempt <= attempts; attempt++) {
  try {
    const response = await fetch(url, { headers: { "Cache-Control": "no-cache" } });
    const body = await response.text();
    if (response.ok) {
      console.log(`cache reconcile: ${body}`);
      process.exit(0);
    }
    console.warn(`cache reconcile attempt ${attempt}: ${response.status} ${body}`);
  } catch (error) {
    console.warn(`cache reconcile attempt ${attempt}: ${error}`);
  }
  if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, 5000 * attempt));
}

console.warn(
  "cache reconcile did not complete; the Worker retries on its next request and hourly",
);
