import assert from "node:assert/strict";
import { createHtmlResponse } from "remix/response/html";
import { renderToStream } from "remix/ui/server";
import { renderCommentMarkdown, sanitizeCommentHtml } from "../app/comment-markdown.ts";
import {
  MAX_COMMENT_DEPTH,
  assembleThread,
  commentDepth,
} from "../app/comments.ts";
import {
  handleCommentModeration,
  handleCommentsGet,
  handleCommentsPost,
} from "../app/comment-handlers.tsx";
import { normalizeRedditThread } from "../app/reddit.ts";

function row(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    postSlug: "/article/",
    parentId: null,
    author: "Reader",
    bodyMd: "Hello",
    bodyHtml: "<p>Hello</p>",
    ipHash: "hash",
    createdAt: new Date().toISOString(),
    hidden: false,
    ...overrides,
  };
}

function memoryPlatform({ limited = false, challenge = true, moderator = true } = {}) {
  const rows = [];
  return {
    rows,
    platform: {
      content: () => new Map(),
      versionId: "test",
      assets: async () => null,
      views: { get: async () => 0, put: async () => {} },
      comments: {
        enabled: true,
        listThread: async (slug) => rows.filter((item) => item.postSlug === slug),
        insert: async (item) => rows.push(item),
        setHidden: async (id, hidden) => {
          const item = rows.find((candidate) => candidate.id === id);
          if (item) item.hidden = hidden;
        },
        get: async (id) => rows.find((item) => item.id === id) ?? null,
      },
      challenge: { verify: async () => challenge },
      rateLimit: { hit: async () => limited },
      moderation: { authorized: () => moderator },
      transient: { get: async () => null, put: async () => {} },
      secrets: { commentIpSalt: "test-salt" },
      httpCache: null,
      waitUntil: (promise) => void promise,
      autoEncodesBody: false,
    },
  };
}

const unsafe = renderCommentMarkdown(
  "**safe** <script>alert(1)</script> ![pixel](https://bad.example/x.png) " +
    "[bad](javascript:alert(1)) [good](https://example.com)",
);
assert.match(unsafe, /<strong>safe<\/strong>/);
assert.doesNotMatch(unsafe, /script|img|javascript:/i);
assert.match(unsafe, /href="https:\/\/example.com"/);
assert.match(unsafe, /rel="nofollow ugc"/);

const redditHtml = sanitizeCommentHtml(
  '<div class="md"><p>hello <a href="javascript:alert(1)">bad</a></p><img src="x"><script>x</script></div>',
);
assert.match(redditHtml, /<p>hello <a rel="nofollow ugc">bad<\/a><\/p>/);
assert.doesNotMatch(redditHtml, /javascript:|img|script|<div/i);

const roots = assembleThread([
  { id: "old", parentId: null, author: "a", bodyHtml: "", createdAt: "2026-01-01T00:00:00Z", hidden: false },
  { id: "new", parentId: null, author: "b", bodyHtml: "", createdAt: "2026-02-01T00:00:00Z", hidden: false },
  { id: "reply-2", parentId: "new", author: "c", bodyHtml: "", createdAt: "2026-02-03T00:00:00Z", hidden: false },
  { id: "reply-1", parentId: "new", author: "d", bodyHtml: "", createdAt: "2026-02-02T00:00:00Z", hidden: false },
]);
assert.deepEqual(roots.map((item) => item.id), ["new", "old"]);
assert.deepEqual(roots[0].children.map((item) => item.id), ["reply-1", "reply-2"]);

const chain = Array.from({ length: MAX_COMMENT_DEPTH }, (_, index) =>
  row({ id: `depth-${index + 1}`, parentId: index ? `depth-${index}` : null }),
);
assert.equal(commentDepth(chain, `depth-${MAX_COMMENT_DEPTH}`), MAX_COMMENT_DEPTH);

const posts = [{ href: "/article/", title: "Test article" }];
const invalidChallenge = memoryPlatform({ challenge: false });
let response = await handleCommentsPost(
  new Request("https://example.com/comments/article", {
    method: "POST",
    body: new URLSearchParams({ author: "Ken", body: "Hello" }),
  }),
  "article",
  posts,
  invalidChallenge.platform,
);
assert.equal(response.status, 403);

const honeypot = memoryPlatform({ challenge: false, limited: true });
response = await handleCommentsPost(
  new Request("https://example.com/comments/article", {
    method: "POST",
    body: new URLSearchParams({ website: "bot", author: "Bot", body: "spam" }),
  }),
  "article",
  posts,
  honeypot.platform,
);
assert.equal(response.status, 200);
assert.equal(honeypot.rows.length, 0);

const rateLimited = memoryPlatform({ limited: true });
response = await handleCommentsPost(
  new Request("https://example.com/comments/article", {
    method: "POST",
    body: new URLSearchParams({ author: "Ken", body: "Hello" }),
  }),
  "article",
  posts,
  rateLimited.platform,
);
assert.equal(response.status, 429);

const accepted = memoryPlatform();
response = await handleCommentsPost(
  new Request("https://example.com/comments/article", {
    method: "POST",
    headers: { "CF-Connecting-IP": "192.0.2.10" },
    body: new URLSearchParams({
      author: "Ken",
      body: "Hello **thread**",
      "cf-turnstile-response": "ok",
      return_to: "/article/",
    }),
  }),
  "article",
  posts,
  accepted.platform,
);
assert.equal(response.status, 303);
assert.match(response.headers.get("Location"), /^\/article\/#c-/);
assert.equal(accepted.rows.length, 1);
assert.match(accepted.rows[0].bodyHtml, /<strong>thread<\/strong>/);
assert.doesNotMatch(accepted.rows[0].ipHash, /192\.0\.2\.10/);

response = await handleCommentsGet(
  new Request("https://example.com/comments/article?fragment=1"),
  "article",
  posts,
  accepted.platform,
  (node, init) => createHtmlResponse(renderToStream(node), init),
);
assert.equal(response.status, 200);
const fragment = await response.text();
assert.match(fragment, /data-first-party-comments/);
assert.match(fragment, /Hello <strong>thread<\/strong>/);
assert.doesNotMatch(fragment, /doctype|<html|rmx:flush/i);

const deepThread = memoryPlatform();
deepThread.rows.push(
  ...Array.from({ length: MAX_COMMENT_DEPTH + 1 }, (_, index) =>
    row({
      id: `deep-${index + 1}`,
      parentId: index ? `deep-${index}` : null,
      bodyMd: `Depth ${index + 1}`,
      bodyHtml: `<p>Depth ${index + 1}</p>`,
      createdAt: new Date(index * 1000).toISOString(),
    }),
  ),
);
response = await handleCommentsGet(
  new Request("https://example.com/comments/article?fragment=1"),
  "article",
  posts,
  deepThread.platform,
  (node, init) => createHtmlResponse(renderToStream(node), init),
);
const capped = await response.text();
assert.match(capped, /Continue this thread/);
assert.match(capped, /\?thread=deep-7#c-deep-7/);
assert.doesNotMatch(capped, /id="c-deep-7"/);

response = await handleCommentsGet(
  new Request("https://example.com/comments/article?fragment=1&thread=deep-7"),
  "article",
  posts,
  deepThread.platform,
  (node, init) => createHtmlResponse(renderToStream(node), init),
);
assert.match(await response.text(), /id="c-deep-7"/);

response = await handleCommentsPost(
  new Request("https://example.com/comments/article", {
    method: "POST",
    body: new URLSearchParams({
      author: "Too deep",
      body: "No seventh-level replies",
      parent_id: `deep-${MAX_COMMENT_DEPTH}`,
    }),
  }),
  "article",
  posts,
  deepThread.platform,
);
assert.equal(response.status, 400);

accepted.platform.moderation.authorized = () => false;
response = await handleCommentModeration(
  new Request("https://example.com/api/comments/hide", {
    method: "POST",
    body: JSON.stringify({ id: accepted.rows[0].id, hidden: true }),
  }),
  accepted.platform,
);
assert.equal(response.status, 401);

const reddit = normalizeRedditThread([
  { data: { children: [] } },
  {
    data: {
      children: [
        {
          kind: "t1",
          data: {
            id: "one",
            author: "redditor",
            body: "hello",
            body_html: "<div><p>hello</p></div>",
            created_utc: 1,
            score: 9,
            permalink: "/r/test/comments/x/one/",
            replies: "",
          },
        },
      ],
    },
  },
]);
assert.equal(reddit[0].id, "reddit-one");
assert.equal(reddit[0].score, 9);
assert.equal(reddit[0].bodyHtml, "<p>hello</p>");

console.log("comments verification passed");
