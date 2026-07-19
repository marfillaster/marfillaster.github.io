import type { RemixNode } from "remix/ui";
import type { PostMeta } from "../src/lib/post-meta.mjs";
import { renderCommentMarkdown } from "./comment-markdown.ts";
import {
  MAX_COMMENT_DEPTH,
  assembleThread,
  commentDepth,
  commentRoutePath,
  hashCommentIp,
  localReturnPath,
  normalizeFirstPartyComments,
  postSlugFromRouteParam,
} from "./comments.ts";
import { Document } from "./document.tsx";
import {
  COMMENTS_CACHE_CONTROL,
  CommentsFragment,
  CommentsPage,
  RedditThread,
  commentsDescriptors,
} from "./pages/comments.tsx";
import type { CommentRow, Platform } from "./platform.ts";
import { getRedditMirror } from "./reddit.ts";
import { absoluteUrl } from "./site.ts";

type RenderNode = (node: RemixNode, init?: ResponseInit) => Response;

function findThreadRoot(
  comments: ReturnType<typeof assembleThread>,
  id: string,
): ReturnType<typeof assembleThread>[number] | undefined {
  for (const comment of comments) {
    if (comment.id === id) return comment;
    const child = findThreadRoot(comment.children, id);
    if (child) return child;
  }
  return undefined;
}

function noStore(status: number, message: string): Response {
  return new Response(message, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function findPost(posts: PostMeta[], routeSlug: string): PostMeta | undefined {
  const postSlug = postSlugFromRouteParam(routeSlug);
  return posts.find((post) => post.href === postSlug);
}

function cacheKeys(origin: string, postSlug: string): Request[] {
  const path = commentRoutePath(postSlug);
  return [0, 1].map(
    (fragment) => new Request(new URL(`${path}?frag=${fragment}`, origin)),
  );
}

export async function purgeCommentCache(
  platform: Platform,
  origin: string,
  postSlug: string,
): Promise<void> {
  if (!platform.httpCache) return;
  await Promise.all(
    cacheKeys(origin, postSlug).map((key) => platform.httpCache!.delete(key)),
  );
}

export async function handleCommentsGet(
  request: Request,
  routeSlug: string,
  posts: PostMeta[],
  platform: Platform,
  renderNode: RenderNode,
): Promise<Response> {
  if (!platform.comments.enabled) return noStore(404, "Comments are not enabled.");

  const post = findPost(posts, routeSlug);
  if (!post) return noStore(404, "Article not found.");

  const url = new URL(request.url);
  const fragment = url.searchParams.get("fragment") === "1";
  const replyId = url.searchParams.get("reply_to");
  const threadId = url.searchParams.get("thread");
  const cache = platform.httpCache;
  const cacheKey = cacheKeys(url.origin, post.href)[fragment ? 1 : 0];
  if (cache && !replyId && !threadId) {
    const hit = await cache.match(cacheKey);
    if (hit) return hit;
  }

  const rows = await platform.comments.listThread(post.href);
  const fullThread = assembleThread(normalizeFirstPartyComments(rows));
  const selectedRoot = threadId ? findThreadRoot(fullThread, threadId) : undefined;
  const comments = selectedRoot ? [selectedRoot] : fullThread;
  const reply = replyId
    ? rows.find(
        (row) =>
          row.id === replyId &&
          !row.hidden &&
          (commentDepth(rows, row.id) ?? MAX_COMMENT_DEPTH) < MAX_COMMENT_DEPTH,
      )
    : undefined;
  const replyTo = reply ? { id: reply.id, author: reply.author } : undefined;
  const reddit = await getRedditMirror(
    platform,
    post.href,
    absoluteUrl(post.href),
    url.origin,
  );
  const redditNode = reddit ? (
    <RedditThread
      comments={reddit.comments}
      commentsPath={commentRoutePath(post.href)}
      submissionUrl={reddit.submissionUrl}
    />
  ) : undefined;

  const props = {
    postSlug: post.href,
    comments,
    replyTo,
    returnTo: fragment ? post.href : commentRoutePath(post.href),
    turnstileSiteKey: platform.turnstileSiteKey,
    reddit: redditNode,
  };

  const rendered = fragment
    ? renderNode(<CommentsFragment {...props} />)
    : renderNode(
        <Document descriptors={commentsDescriptors(post.title)}>
          <CommentsPage
            {...props}
            postTitle={post.title}
            postHref={post.href}
          />
        </Document>,
      );
  const body = fragment
    ? (await rendered.text())
        .replace(/^<!DOCTYPE html>/, "")
        .replace(/<!-- rmx:flush fragment -->\s*$/, "")
    : rendered.body;
  const response = new Response(body, rendered);
  response.headers.set("Cache-Control", COMMENTS_CACHE_CONTROL);

  if (cache && !replyId && !threadId) {
    platform.waitUntil(cache.put(cacheKey, response.clone()));
  }
  return response;
}

function value(form: FormData, name: string): string {
  const entry = form.get(name);
  return typeof entry === "string" ? entry : "";
}

export async function handleCommentsPost(
  request: Request,
  routeSlug: string,
  posts: PostMeta[],
  platform: Platform,
): Promise<Response> {
  if (!platform.comments.enabled) return noStore(404, "Comments are not enabled.");
  const post = findPost(posts, routeSlug);
  if (!post) return noStore(404, "Article not found.");

  const form = await request.formData();
  if (value(form, "website")) {
    return new Response("Thanks.", { headers: { "Cache-Control": "no-store" } });
  }

  const ip = request.headers.get("CF-Connecting-IP") ?? "127.0.0.1";
  const salt =
    platform.secrets.commentIpSalt ??
    platform.secrets.turnstileSecretKey ??
    "comments-local-dev";
  const ipHash = await hashCommentIp(ip, salt);
  if (await platform.rateLimit.hit(`comments:${ipHash}`)) {
    return noStore(429, "Too many comments. Try again later.");
  }

  const challengeToken = value(form, "cf-turnstile-response");
  if (!(await platform.challenge.verify(challengeToken, ip))) {
    return noStore(403, "Comment verification failed.");
  }

  const author = value(form, "author").trim();
  const bodyMd = value(form, "body").trim();
  const parentId = value(form, "parent_id") || null;
  if (author.length < 2 || author.length > 40) {
    return noStore(400, "Display name must be between 2 and 40 characters.");
  }
  if (bodyMd.length < 1 || bodyMd.length > 4000) {
    return noStore(400, "Comment must be between 1 and 4000 characters.");
  }

  if (parentId) {
    const parent = await platform.comments.get(parentId);
    if (!parent || parent.postSlug !== post.href) {
      return noStore(400, "Reply target does not belong to this article.");
    }
    const rows = await platform.comments.listThread(post.href);
    const depth = commentDepth(rows, parent.id);
    if (depth === null || depth >= MAX_COMMENT_DEPTH) {
      return noStore(400, "This thread has reached its reply depth limit.");
    }
  }

  const row: CommentRow = {
    id: crypto.randomUUID(),
    postSlug: post.href,
    parentId,
    author,
    bodyMd,
    bodyHtml: renderCommentMarkdown(bodyMd),
    ipHash,
    createdAt: new Date().toISOString(),
    hidden: false,
  };
  await platform.comments.insert(row);

  const origin = new URL(request.url).origin;
  await purgeCommentCache(platform, origin, post.href);
  const fallback = commentRoutePath(post.href);
  const returnTo = localReturnPath(value(form, "return_to"), fallback);
  return new Response(null, {
    status: 303,
    headers: {
      Location: `${returnTo}#c-${row.id}`,
      "Cache-Control": "no-store",
    },
  });
}

export async function handleCommentModeration(
  request: Request,
  platform: Platform,
): Promise<Response> {
  if (!platform.moderation.authorized(request)) {
    return Response.json(
      { error: "unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  let input: { id?: unknown; hidden?: unknown };
  try {
    input = (await request.json()) as typeof input;
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }
  if (typeof input.id !== "string" || typeof input.hidden !== "boolean") {
    return Response.json({ error: "invalid_input" }, { status: 400 });
  }

  const comment = await platform.comments.get(input.id);
  if (!comment) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }
  await platform.comments.setHidden(comment.id, input.hidden);
  await purgeCommentCache(
    platform,
    new URL(request.url).origin,
    comment.postSlug,
  );
  return Response.json(
    { ok: true, id: comment.id, hidden: input.hidden },
    { headers: { "Cache-Control": "no-store" } },
  );
}
