import { sanitizeCommentHtml } from "./comment-markdown.ts";
import { assembleThread, type FlatThreadComment, type ThreadComment } from "./comments.ts";
import type { Platform } from "./platform.ts";

const TOKEN_KEY = "reddit:token";
const TOKEN_URL = "https://www.reddit.com/api/v1/access_token";
const OAUTH_ORIGIN = "https://oauth.reddit.com";
const REDDIT_ORIGIN = "https://www.reddit.com";

let memoryToken: { value: string; expiresAt: number } | null = null;

interface RedditListing {
  data?: {
    children?: RedditThing[];
  };
}

interface RedditThing {
  kind?: string;
  data?: {
    id?: string;
    name?: string;
    author?: string;
    body?: string;
    body_html?: string;
    created_utc?: number;
    score?: number;
    permalink?: string;
    url?: string;
    replies?: RedditListing | string;
  };
}

interface RedditSubmission {
  id: string;
  permalink: string;
  url: string;
  score: number;
}

export interface RedditMirror {
  comments: ThreadComment[];
  submissionUrl: string;
}

function configured(platform: Platform): boolean {
  return Boolean(
    platform.secrets.redditClientId &&
      platform.secrets.redditClientSecret &&
      platform.secrets.redditUserAgent,
  );
}

async function accessToken(platform: Platform): Promise<string> {
  const now = Date.now();
  if (memoryToken && memoryToken.expiresAt > now + 30_000) {
    return memoryToken.value;
  }

  const stored = await platform.transient.get(TOKEN_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as { value: string; expiresAt: number };
      if (parsed.expiresAt > now + 30_000) {
        memoryToken = parsed;
        return parsed.value;
      }
    } catch {
      // A malformed cache entry is equivalent to a miss.
    }
  }

  const clientId = platform.secrets.redditClientId!;
  const clientSecret = platform.secrets.redditClientSecret!;
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": platform.secrets.redditUserAgent!,
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });
  if (!response.ok) {
    throw new Error(`Reddit token exchange failed: ${response.status}`);
  }

  const payload = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };
  memoryToken = {
    value: payload.access_token,
    expiresAt: now + payload.expires_in * 1000,
  };
  await platform.transient.put(
    TOKEN_KEY,
    JSON.stringify(memoryToken),
    Math.max(60, payload.expires_in - 30),
  );
  return memoryToken.value;
}

async function redditFetch(platform: Platform, path: string): Promise<Response> {
  const response = await fetch(`${OAUTH_ORIGIN}${path}`, {
    headers: {
      Authorization: `Bearer ${await accessToken(platform)}`,
      "User-Agent": platform.secrets.redditUserAgent!,
    },
  });
  if (!response.ok) {
    throw new Error(`Reddit request failed: ${response.status}`);
  }
  return response;
}

async function discover(
  platform: Platform,
  postSlug: string,
  canonicalUrl: string,
): Promise<RedditSubmission | null> {
  const cacheKey = `reddit:discover:${postSlug}`;
  const cached = await platform.transient.get(cacheKey);
  if (cached !== null) {
    return JSON.parse(cached) as RedditSubmission | null;
  }

  const response = await redditFetch(
    platform,
    `/api/info.json?url=${encodeURIComponent(canonicalUrl)}`,
  );
  const listing = (await response.json()) as RedditListing;
  const submissions = (listing.data?.children ?? [])
    .map((thing): RedditSubmission | null => {
      const data = thing.data;
      if (!data?.id || !data.permalink) return null;
      return {
        id: data.id,
        permalink: data.permalink,
        url: `${REDDIT_ORIGIN}${data.permalink}`,
        score: data.score ?? 0,
      };
    })
    .filter((value): value is RedditSubmission => value !== null)
    .sort((a, b) => b.score - a.score);

  const selected = submissions[0] ?? null;
  await platform.transient.put(cacheKey, JSON.stringify(selected), 86_400);
  return selected;
}

function flattenReplies(
  listing: RedditListing,
  parentId: string | null,
  output: FlatThreadComment[],
) {
  for (const thing of listing.data?.children ?? []) {
    if (thing.kind !== "t1" || !thing.data?.id) continue;
    const data = thing.data;
    const removed =
      !data.author ||
      data.author === "[deleted]" ||
      data.body === "[deleted]" ||
      data.body === "[removed]";
    output.push({
      id: `reddit-${data.id}`,
      parentId,
      author: data.author ?? "[deleted]",
      bodyHtml: removed ? "" : sanitizeCommentHtml(data.body_html ?? ""),
      createdAt: new Date((data.created_utc ?? 0) * 1000).toISOString(),
      score: data.score ?? 0,
      permalink: data.permalink ? `${REDDIT_ORIGIN}${data.permalink}` : undefined,
      hidden: removed,
      hiddenReason: removed ? "unavailable" : undefined,
    });

    if (data.replies && typeof data.replies !== "string") {
      flattenReplies(data.replies, `reddit-${data.id}`, output);
    }
  }
}

export function normalizeRedditThread(payload: unknown): ThreadComment[] {
  const listings = payload as RedditListing[];
  const comments: FlatThreadComment[] = [];
  if (Array.isArray(listings) && listings[1]) {
    flattenReplies(listings[1], null, comments);
  }
  return assembleThread(comments, "score");
}

async function fetchThread(
  platform: Platform,
  postSlug: string,
  submission: RedditSubmission,
  origin: string,
): Promise<ThreadComment[]> {
  const cache = platform.httpCache;
  const cacheKey = cache
    ? new Request(new URL(`/_comments-cache/reddit/${encodeURIComponent(postSlug)}`, origin))
    : null;
  if (cache && cacheKey) {
    const hit = await cache.match(cacheKey);
    if (hit) return hit.json() as Promise<ThreadComment[]>;
  }

  const response = await redditFetch(
    platform,
    `${submission.permalink}.json?raw_json=1`,
  );
  const comments = normalizeRedditThread(await response.json());
  if (cache && cacheKey) {
    const cached = new Response(JSON.stringify(comments), {
      headers: { "Cache-Control": "public, max-age=1800" },
    });
    platform.waitUntil(cache.put(cacheKey, cached));
  }
  return comments;
}

export async function getRedditMirror(
  platform: Platform,
  postSlug: string,
  canonicalUrl: string,
  origin: string,
): Promise<RedditMirror | null> {
  if (!configured(platform)) return null;

  try {
    const submission = await discover(platform, postSlug, canonicalUrl);
    if (!submission) return null;
    const comments = await fetchThread(platform, postSlug, submission, origin);
    if (comments.length === 0) return null;
    return { comments, submissionUrl: submission.url };
  } catch (error) {
    console.error("Reddit comments unavailable", error);
    return null;
  }
}
