import type { Handle } from "remix/ui";
import { ASSET_MANIFEST } from "../assets-manifest.generated.ts";
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

export function CommentBody(handle: Handle<{ bodyHtml: string }>) {
  return () => (
    <div
      className="typeset mt-3 max-w-none text-sm"
      innerHTML={handle.props.bodyHtml}
    />
  );
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
    const permalink = `${commentsPath}#c-${comment.id}`;
    const canRenderChildren = depth < MAX_COMMENT_DEPTH;

    return (
      <li id={`c-${comment.id}`} className={depth > 1 ? "border-l pl-4" : ""}>
        <details open className="group py-3">
          <summary className="cursor-pointer list-none text-xs text-muted-foreground marker:hidden">
            <span className="font-medium text-foreground">{comment.author}</span>
            {" · "}
            <time dateTime={comment.createdAt}>
              {formatCommentDate(comment.createdAt)} UTC
            </time>
          </summary>

          {comment.hidden ? (
            <p className="mt-2 text-sm italic text-muted-foreground">
              This comment was hidden by a moderator.
            </p>
          ) : (
            <CommentBody bodyHtml={comment.bodyHtml} />
          )}

          <p className="mt-2 text-xs text-muted-foreground">
            <a
              href={permalink}
              className="underline underline-offset-4 hover:text-foreground"
            >
              permalink
            </a>
            {allowReplies && !comment.hidden && depth < MAX_COMMENT_DEPTH ? (
              <>
                {" · "}
                <a
                  href={`${commentsPath}?reply_to=${encodeURIComponent(comment.id)}#comment-form`}
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  Reply
                </a>
              </>
            ) : null}
          </p>

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
  values?: CommentFormValues;
}

export interface CommentFormValues {
  author: string;
  body: string;
  parentId: string;
  returnTo: string;
}

export function CommentForm(handle: Handle<CommentFormProps>) {
  return () => {
    const { postSlug, replyTo, returnTo, turnstileSiteKey, values } =
      handle.props;
    const action = commentRoutePath(postSlug);
    const parentId = values?.parentId ?? replyTo?.id ?? "";
    return (
      <form
        id="comment-form"
        method="post"
        action={action}
        className="mt-8 border-t pt-6"
        data-comment-composer
      >
        <h2 className="text-lg font-semibold tracking-tight">
          {replyTo ? `Reply to ${replyTo.author}` : "Add a comment"}
        </h2>
        <input type="hidden" name="parent_id" value={parentId} />
        <input
          type="hidden"
          name="return_to"
          value={values?.returnTo ?? returnTo}
        />
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
            value={values?.author ?? ""}
            className="mt-2 block w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </label>
        <div className="mt-4">
          <span className="block text-sm font-medium">Comment</span>
          <div
            className="mt-2 flex border-b"
            role="tablist"
            aria-label="Comment editor"
          >
            <button
              type="button"
              role="tab"
              aria-selected="true"
              data-comment-tab="write"
              className="border-b-2 border-foreground px-3 py-2 text-sm font-medium text-foreground"
            >
              Write
            </button>
            <button
              type="button"
              role="tab"
              aria-selected="false"
              data-comment-tab="preview"
              className="border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Preview
            </button>
          </div>
          <label className="block" data-comment-write-pane>
            <span className="sr-only">Comment markdown</span>
            <textarea
              name="body"
              maxlength={4000}
              rows={6}
              required
              value={values?.body ?? ""}
              className="mt-3 block w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </label>
          <div
            role="tabpanel"
            aria-live="polite"
            data-comment-preview-pane
            className="min-h-36 py-3"
            hidden
          />
        </div>
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
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
          >
            Post comment
          </button>
          <button
            type="submit"
            name="intent"
            value="preview"
            formnovalidate
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Preview
          </button>
        </div>
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
  formValues?: CommentFormValues;
  previewHtml?: string;
}

export function CommentsFragment(handle: Handle<CommentsFragmentProps>) {
  return () => {
    const path = commentRoutePath(handle.props.postSlug);
    return (
      <div data-first-party-comments data-comments-fragment>
        {handle.props.previewHtml === undefined ? null : (
          <section
            className="mt-8 rounded-md border bg-muted/30 p-4"
            aria-labelledby="comment-preview-heading"
          >
            <h2
              id="comment-preview-heading"
              className="text-sm font-semibold tracking-tight"
            >
              Comment preview
            </h2>
            {handle.props.previewHtml ? (
              <CommentBody bodyHtml={handle.props.previewHtml} />
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Nothing to preview.
              </p>
            )}
          </section>
        )}
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
          values={handle.props.formValues}
        />
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
        {/* The entry module arms the same viewport-triggered Turnstile loader
            the post pages use, so the third-party script isn't requested until
            the widget is near the viewport. */}
        <script type="module" src={ASSET_MANIFEST.comments} />
      </div>
    </SiteShell>
  );
}
