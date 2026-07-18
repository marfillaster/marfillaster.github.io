// Purges the Cloudflare zone cache after a deploy so stale edge copies of the
// version-keyed documents (app/http-caching.ts) die immediately instead of
// waiting out s-maxage. Wired into the deploy command at Phase 5 cutover —
// run only as part of a deploy, never against the live zone casually.
//
// Env: CLOUDFLARE_ZONE_ID, CLOUDFLARE_API_TOKEN (token needs Zone → Cache
// Purge permission).

const zoneId = process.env.CLOUDFLARE_ZONE_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;

if (!zoneId || !apiToken) {
  console.error("purge-zone: CLOUDFLARE_ZONE_ID and CLOUDFLARE_API_TOKEN must be set");
  process.exit(1);
}

const response = await fetch(
  `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ purge_everything: true }),
  },
);

const result = await response.json();
if (!response.ok || !result.success) {
  console.error("purge-zone: purge failed", JSON.stringify(result.errors ?? result));
  process.exit(1);
}

console.log(`purge-zone: zone cache purged (id ${result.result?.id ?? "n/a"})`);
