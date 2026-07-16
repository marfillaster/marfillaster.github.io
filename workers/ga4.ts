// Minimal Google service-account auth + GA4 Data API client for the Workers runtime.
// No Node APIs (googleapis/google-auth-library don't run here) — signs the JWT
// with Web Crypto and talks to the REST endpoints directly.

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
}

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const GA4_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

// Cached per-isolate; a cold start just re-mints it.
let cachedToken: { value: string; expiresAt: number } | null = null;

function base64url(bytes: ArrayBuffer | Uint8Array): string {
  const buf = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let str = "";
  for (const b of buf) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemToPkcs8(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
  const raw = atob(b64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes.buffer;
}

async function signJwt(key: ServiceAccountKey): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: key.client_email,
    scope: GA4_SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  };

  const encoder = new TextEncoder();
  const unsigned = `${base64url(encoder.encode(JSON.stringify(header)))}.${base64url(
    encoder.encode(JSON.stringify(claims)),
  )}`;

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    pemToPkcs8(key.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    encoder.encode(unsigned),
  );

  return `${unsigned}.${base64url(signature)}`;
}

async function getAccessToken(rawKey: string): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.value;
  }

  const key: ServiceAccountKey = JSON.parse(rawKey);
  const jwt = await signJwt(key);

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    throw new Error(`token exchange failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

async function callGA4<T>(
  propertyId: string,
  accessToken: string,
  endpoint: "runReport" | "runRealtimeReport",
  body: unknown,
): Promise<T> {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:${endpoint}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    throw new Error(`GA4 ${endpoint} failed: ${res.status} ${await res.text()}`);
  }

  return res.json() as Promise<T>;
}

interface GA4ReportRow {
  dimensionValues: { value: string }[];
  metricValues: { value: string }[];
}

interface GA4ReportResponse {
  rows?: GA4ReportRow[];
}

// GA4 records pagePath with a trailing slash, and sometimes the same page
// gets tracked both with and without one. Collapse both onto one canonical
// key so counts don't split across variants.
export function normalizePath(path: string): string {
  return path === "/" || path.endsWith("/") ? path : `${path}/`;
}

// Per-page view counts for a GA4 date range (accepts GA4's relative date
// keywords like "yesterday", "2daysAgo", "today", or "YYYY-MM-DD"). Used by
// the daily cron (one day at a time) and the resync endpoint (a wide range).
export async function getViewsByPath(
  serviceAccountKey: string,
  propertyId: string,
  startDate: string,
  endDate: string,
): Promise<Map<string, number>> {
  const accessToken = await getAccessToken(serviceAccountKey);

  const report = await callGA4<GA4ReportResponse>(propertyId, accessToken, "runReport", {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }],
    limit: 100000,
  });

  const totals = new Map<string, number>();
  for (const row of report.rows ?? []) {
    const key = normalizePath(row.dimensionValues[0].value);
    const views = Number(row.metricValues[0].value);
    totals.set(key, (totals.get(key) ?? 0) + views);
  }
  return totals;
}

// GA4's Realtime API has no `pagePath` dimension — only `unifiedScreenName`
// (the page title), which the caller supplies since it already knows it
// statically from the post's own frontmatter.
export async function getActiveUsers(
  serviceAccountKey: string,
  propertyId: string,
  pageTitle: string,
): Promise<number> {
  const accessToken = await getAccessToken(serviceAccountKey);

  const realtime = await callGA4<GA4ReportResponse>(
    propertyId,
    accessToken,
    "runRealtimeReport",
    {
      dimensions: [{ name: "unifiedScreenName" }],
      metrics: [{ name: "activeUsers" }],
      dimensionFilter: {
        filter: {
          fieldName: "unifiedScreenName",
          stringFilter: { value: pageTitle, matchType: "EXACT" },
        },
      },
    },
  );

  return realtime.rows?.reduce((sum, r) => sum + Number(r.metricValues[0].value), 0) ?? 0;
}
