// -----------------------------------------------------------------------------
// Builds the post index and rendered-HTML cache from Platform.content().
// Markdown renders at request time via the pure renderer from Phase 0; each
// route's HTML is memoized for the life of the process (content only changes
// with a deploy).
// -----------------------------------------------------------------------------

import {
  buildPostIndex,
  parsePosts,
  sortFeedItems,
  type PostIndex,
  type PostMeta,
} from "../src/lib/post-meta.mjs";
import { renderMarkdown } from "../src/lib/render-markdown.ts";
import { normalizeHref } from "./site.ts";
import type { Platform } from "./platform.ts";

export interface AppData {
  index: PostIndex;
  routablePosts: PostMeta[];
  feedItems: PostMeta[];
  findPostByPath(pathname: string): PostMeta | undefined;
  /** Render (and memoize) a post's markdown body. */
  postHtml(post: PostMeta): string;
  /** Render (and memoize) a raw content file with no heading prefix. */
  contentHtml(contentFile: string): string;
}

export function createAppData(platform: Platform): AppData {
  const content = platform.content();
  const routablePosts = parsePosts(content, { includeRouteOnly: true });
  const feedPosts = routablePosts.filter((post) => post.feed);
  const index = buildPostIndex(feedPosts);
  const htmlCache = new Map<string, string>();

  function renderFile(contentFile: string, headingPrefix?: string): string {
    const cacheKey = `${headingPrefix ?? ""}:${contentFile}`;
    const cached = htmlCache.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    const source = content.get(contentFile);
    if (source === undefined) {
      throw new Error(`Missing content file: ${contentFile}`);
    }

    const { html } = renderMarkdown(source, { headingPrefix });
    htmlCache.set(cacheKey, html);
    return html;
  }

  return {
    index,
    routablePosts,
    feedItems: sortFeedItems(feedPosts),
    findPostByPath(pathname) {
      const href = normalizeHref(pathname);
      return routablePosts.find((post) => post.href === href);
    },
    postHtml(post) {
      return renderFile(post.contentFile, post.headingPrefix);
    },
    contentHtml(contentFile) {
      return renderFile(contentFile);
    },
  };
}
