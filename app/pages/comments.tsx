import type { Handle, RemixNode } from "remix/ui";
import type { MetaDescriptor } from "../head.ts";
import {
  MAX_COMMENT_DEPTH,
  commentRoutePath,
  type ThreadComment,
} from "../comments.ts";
import { SiteShell } from "../components.tsx";

export const COMMENTS_CACHE_CONTROL = "public, max-age=0, s-maxage=300";

export function commentsDescriptors(postTitle: string): MetaDescriptor[] {
  return [
    { title: `Comments on ${postTitle} · marfillaster · notes` },
    { name: "robots", content: "noindex" },
  ];
}

function formatCommentDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? value
    : date.toLocaleString("en", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "UTC",
      });
}

interface CommentItemProps {
  comment: ThreadComment;
  depth: number;
  commentsPath: string;
  allowReplies: boolean;
}

function CommentItem(handle: Handle<CommentItemProps>) {
  return () => {
    const { comment, depth, commentsPath, allowReplies } = handle.props;
    const permalink = comment.permalink ?? `${commentsPath}#c-${comment.id}`;
    const canRenderChildren = depth < MAX_COMMENT_DEPTH;

    return (
      <li id={`c-${comment.id}`} className={depth > 1 ? "border-l pl-4" : ""}>
        <details open className="group py-3">
          <summary className="cursor-pointer list-none text-xs text-muted-foreground marker:hidden">
            <span className="font-medium text-foreground">{comment.author}</span>
            {comment.score === undefined ? null : ` · ${comment.score} points`}
            {" · "}
            <time dateTime={comment.createdAt}>
              {formatCommentDate(comment.createdAt)} UTC
            </time>
            {" · "}
            <a
              href={permalink}
              className="underline underline-offset-4 hover:text-foreground"
            >
              permalink
            </a>
          </summary>

          {comment.hidden ? (
            <p className="mt-2 text-sm italic text-muted-foreground">
              {comment.hiddenReason === "unavailable"
                ? "This comment is unavailable."
                : "This comment was hidden by a moderator."}
            </p>
          ) : (
            <div
              className="typeset mt-3 max-w-none text-sm"
              innerHTML={comment.bodyHtml}
            />
          )}

          {allowReplies && !comment.hidden && depth < MAX_COMMENT_DEPTH ? (
            <p className="mt-2 text-xs text-muted-foreground">
              <a
                href={`${commentsPath}?reply_to=${encodeURIComponent(comment.id)}#comment-form`}
                className="underline underline-offset-4 hover:text-foreground"
              >
                Reply
              </a>
            </p>
          ) : null}

          {comment.children.length > 0 ? (
            canRenderChildren ? (
              <ul className="mt-2 space-y-1">
                {comment.children.map((child) => (
                  <CommentItem
                    comment={child}
                    depth={depth + 1}
                    commentsPath={commentsPath}
                    allowReplies={allowReplies}
                  />
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">
                <a
                  href={
                    comment.children[0].permalink ??
                    `${commentsPath}?thread=${encodeURIComponent(comment.children[0].id)}#c-${comment.children[0].id}`
                  }
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  Continue this thread
                </a>
              </p>
            )
          ) : null}
        </details>
      </li>
    );
  };
}

export function ThreadList(
  handle: Handle<{
    comments: ThreadComment[];
    commentsPath: string;
    allowReplies?: boolean;
  }>,
) {
  return () => {
    if (handle.props.comments.length === 0) {
      return (
        <p className="mt-5 text-sm text-muted-foreground">
          No comments yet. Start the conversation.
        </p>
      );
    }

    return (
      <ul className="mt-5 space-y-2">
        {handle.props.comments.map((comment) => (
          <CommentItem
            comment={comment}
            depth={1}
            commentsPath={handle.props.commentsPath}
            allowReplies={handle.props.allowReplies ?? false}
          />
        ))}
      </ul>
    );
  };
}

interface CommentFormProps {
  postSlug: string;
  replyTo?: { id: string; author: string };
  returnTo: string;
  turnstileSiteKey?: string;
}

export function CommentForm(handle: Handle<CommentFormProps>) {
  return () => {
    const { postSlug, replyTo, returnTo, turnstileSiteKey } = handle.props;
    const action = commentRoutePath(postSlug);
    return (
      <form id="comment-form" method="post" action={action} className="mt-8 border-t pt-6">
        <h2 className="text-lg font-semibold tracking-tight">
          {replyTo ? `Reply to ${replyTo.author}` : "Add a comment"}
        </h2>
        <input type="hidden" name="parent_id" value={replyTo?.id ?? ""} />
        <input type="hidden" name="return_to" value={returnTo} />
        <div className="absolute -left-[10000px]" aria-hidden>
          <label>
            Website
            <input name="website" tabindex={-1} autocomplete="off" />
          </label>
        </div>
        <label className="mt-4 block text-sm font-medium">
          Display name
          <input
            name="author"
            minlength={2}
            maxlength={40}
            required
            className="mt-2 block w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Comment
          <textarea
            name="body"
            maxlength={4000}
            rows={6}
            required
            className="mt-2 block w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </label>
        <p className="mt-2 text-xs text-muted-foreground">
          Markdown links, lists, quotes, emphasis, and code are supported.
        </p>
        {turnstileSiteKey ? (
          <div
            className="cf-turnstile mt-4"
            data-sitekey={turnstileSiteKey}
            data-response-field-name="cf-turnstile-response"
          />
        ) : (
          <input type="hidden" name="cf-turnstile-response" value="node-dev" />
        )}
        <button
          type="submit"
          className="mt-4 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Post comment
        </button>
      </form>
    );
  };
}

export interface CommentsFragmentProps {
  postSlug: string;
  comments: ThreadComment[];
  replyTo?: { id: string; author: string };
  returnTo: string;
  turnstileSiteKey?: string;
  reddit?: RemixNode;
}

export function CommentsFragment(handle: Handle<CommentsFragmentProps>) {
  return () => {
    const path = commentRoutePath(handle.props.postSlug);
    return (
      <div data-first-party-comments>
        <ThreadList
          comments={handle.props.comments}
          commentsPath={path}
          allowReplies
        />
        <CommentForm
          postSlug={handle.props.postSlug}
          replyTo={handle.props.replyTo}
          returnTo={handle.props.returnTo}
          turnstileSiteKey={handle.props.turnstileSiteKey}
        />
        {handle.props.reddit}
      </div>
    );
  };
}

export function CommentsPage(
  handle: Handle<CommentsFragmentProps & { postTitle: string; postHref: string }>,
) {
  return () => (
    <SiteShell>
      <div className="container max-w-[48rem] py-12 leading-relaxed">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Comments
        </p>
        <h1 className="mt-3 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          {handle.props.postTitle}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          <a
            href={handle.props.postHref}
            className="underline underline-offset-4 hover:text-foreground"
          >
            Back to the article
          </a>
        </p>
        <CommentsFragment {...handle.props} />
        {handle.props.turnstileSiteKey ? (
          <script
            async
            defer
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          />
        ) : null}
      </div>
    </SiteShell>
  );
}

export function RedditThread(
  handle: Handle<{
    comments: ThreadComment[];
    commentsPath: string;
    submissionUrl: string;
  }>,
) {
  return () => (
    <section className="mt-10 border-t pt-8" aria-labelledby="reddit-comments-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="reddit-comments-heading" className="text-lg font-semibold tracking-tight">
          Discussion on Reddit
        </h2>
        <a
          href={handle.props.submissionUrl}
          rel="nofollow ugc"
          className="text-xs underline underline-offset-4 text-muted-foreground hover:text-foreground"
        >
          Reply on Reddit
        </a>
      </div>
      <ThreadList
        comments={handle.props.comments}
        commentsPath={handle.props.commentsPath}
      />
    </section>
  );
}
