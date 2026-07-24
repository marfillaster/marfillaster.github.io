import assert from "node:assert/strict";
import { createHtmlResponse } from "remix/response/html";
import { createElement } from "remix/ui";
import { renderToStream } from "remix/ui/server";
import { Comments } from "../app/components.tsx";
import { renderCommentMarkdown } from "../app/comment-markdown.ts";
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
import { memoryPlatform } from "./lib/memory-platform.mjs";

const renderNode = (node, init) =>
  createHtmlResponse(renderToStream(node), init);

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

const unsafe = renderCommentMarkdown(
  "**safe** <script>alert(1)</script> ![pixel](https://bad.example/x.png) " +
    "[bad](javascript:alert(1)) [good](https://example.com)",
);
assert.match(unsafe, /<strong>safe<\/strong>/);
assert.doesNotMatch(unsafe, /script|img|javascript:/i);
assert.match(unsafe, /href="https:\/\/example.com"/);
assert.match(unsafe, /rel="nofollow ugc"/);

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
const commentsShell = await createHtmlResponse(
  renderToStream(
    createElement(Comments, { firstParty: true, postHref: "/article/" }),
    {
      resolveClientEntry: () => ({
        href: "/assets/comments.js",
        exportName: "CommentsThread",
      }),
      resolveFrame: (src, name) => {
        assert.equal(name, "comments");
        assert.equal(src, "/comments/article?fragment=1");
        return '<p><a href="/comments/article">View or add comments</a></p>';
      },
    },
  ),
).text();
assert.match(commentsShell, /<!-- rmx:f:/);
assert.match(commentsShell, /View or add comments/);
assert.doesNotMatch(commentsShell, /data-first-party-comments|comment-form/);

const invalidChallenge = memoryPlatform({ challenge: false });
let response = await handleCommentsPost(
  new Request("https://example.com/comments/article", {
    method: "POST",
    body: new URLSearchParams({ author: "Ken", body: "Hello" }),
  }),
  "article",
  posts,
  invalidChallenge.platform,
  renderNode,
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
  renderNode,
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
  renderNode,
);
assert.equal(response.status, 429);

const previewOnly = memoryPlatform({ challenge: false, cache: true });
const previewDraft =
  "**safe** `code` <script>alert(1)</script> " +
  "![pixel](https://bad.example/x.png) [bad](javascript:alert(1)) " +
  "[good](https://example.com)";
response = await handleCommentsPost(
  new Request("https://example.com/comments/article?fragment=1", {
    method: "POST",
    body: new URLSearchParams({
      intent: "preview",
      author: "K<em>en",
      body: previewDraft,
      parent_id: "unvalidated-parent",
      return_to: "/article/",
    }),
  }),
  "article",
  posts,
  previewOnly.platform,
  renderNode,
);
assert.equal(response.status, 200);
assert.equal(response.headers.get("Cache-Control"), "no-store");
assert.match(response.headers.get("Content-Type"), /^text\/html/);
const previewFragment = await response.text();
assert.match(previewFragment, /class="typeset mt-3 max-w-none text-sm"/);
assert.match(previewFragment, /<strong>safe<\/strong> <code>code<\/code>/);
assert.match(previewFragment, /href="https:\/\/example.com"/);
assert.doesNotMatch(previewFragment, /<script|<img|javascript:/i);
assert.equal(previewOnly.rows.length, 0);
assert.equal(previewOnly.verifications, 0);
assert.equal(previewOnly.cacheCalls, 0);

const publishedCopy = memoryPlatform();
response = await handleCommentsPost(
  new Request("https://example.com/comments/article", {
    method: "POST",
    body: new URLSearchParams({ author: "Ken", body: previewDraft }),
  }),
  "article",
  posts,
  publishedCopy.platform,
  renderNode,
);
assert.equal(response.status, 303);
assert.equal(
  previewFragment,
  `<div class="typeset mt-3 max-w-none text-sm">${publishedCopy.rows[0].bodyHtml}</div>`,
);

response = await handleCommentsPost(
  new Request("https://example.com/comments/article?fragment=1", {
    method: "POST",
    body: new URLSearchParams({
      intent: "preview",
      website: "bot",
      body: "discarded",
    }),
  }),
  "article",
  posts,
  memoryPlatform({ limited: true, challenge: false }).platform,
  renderNode,
);
assert.equal(response.status, 200);
assert.equal(
  await response.text(),
  '<div class="typeset mt-3 max-w-none text-sm"></div>',
);

response = await handleCommentsPost(
  new Request("https://example.com/comments/article?fragment=1", {
    method: "POST",
    body: new URLSearchParams({ intent: "preview", body: "x".repeat(4001) }),
  }),
  "article",
  posts,
  memoryPlatform().platform,
  renderNode,
);
assert.equal(response.status, 413);

response = await handleCommentsPost(
  new Request("https://example.com/comments/article", {
    method: "POST",
    body: new URLSearchParams({
      intent: "preview",
      author: '"><img src=x onerror=alert(1)>',
      body: "safe **draft** </textarea><script>alert(1)</script>",
      parent_id: '"><script>alert(2)</script>',
      return_to: '"><script>alert(3)</script>',
    }),
  }),
  "article",
  posts,
  memoryPlatform().platform,
  renderNode,
);
assert.equal(response.status, 200);
assert.equal(response.headers.get("Cache-Control"), "no-store");
const previewPage = await response.text();
assert.match(previewPage, /Comment preview/);
assert.match(previewPage, /safe <strong>draft<\/strong>/);
assert.doesNotMatch(previewPage, /<\/textarea><script>alert\(1\)|<img src=x/i);
assert.match(previewPage, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
assert.match(previewPage, /name="parent_id" value="&quot;&gt;&lt;script/);

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
  renderNode,
);
assert.equal(response.status, 303);
assert.match(response.headers.get("Location"), /^\/article\/#c-/);
assert.equal(accepted.rows.length, 1);
assert.match(accepted.rows[0].bodyHtml, /<strong>thread<\/strong>/);
assert.doesNotMatch(accepted.rows[0].ipHash, /192\.0\.2\.10/);
// The thread's edge entries have to go network-wide, not just in the colo that
// took the POST — and scoped to the thread's own path, so a new comment does
// not drop the article or the homepage.
assert.deepEqual(accepted.purges, [{ pathPrefixes: ["/comments/article"] }]);

response = await handleCommentsGet(
  new Request("https://example.com/comments/article?fragment=1"),
  "article",
  posts,
  accepted.platform,
  renderNode,
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
  renderNode,
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
  renderNode,
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
  renderNode,
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

console.log("comments verification passed");
