// Hand-written types for src/lib/post-meta.mjs (kept .mjs so the plain-Node
// build scripts can import it without a TS loader).

export type PostToc = ReadonlyArray<[string, string]>;

export interface PostSeo {
  author?: string;
  breadcrumbName?: string;
  dependencies?: string;
  keywords?: string[];
  ogImage?: string;
  ogImageAlt?: string;
  schemaType?: string;
}

export interface PostHero {
  eyebrow?: string;
  title?: string;
  description?: string;
}

export interface PostTabs {
  ariaLabel: string;
  items: Array<{ href: string; label: string }>;
}

export interface PostRedirect {
  exact?: string;
  prefix?: string;
  toPath: string;
}

export interface PostMeta {
  feed: boolean;
  route: boolean;
  href: string;
  routePath: string;
  contentModule: string;
  contentFile: string;
  eyebrow: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  category: string;
  sectionBlurb?: string;
  sectionOrder: number;
  order: number;
  headingPrefix?: string;
  toc: PostToc;
  hero?: PostHero;
  seo?: PostSeo;
  publishedLabel?: string;
  redirects?: PostRedirect[];
  series?: false | { current?: string };
  tabs?: PostTabs;
}

export interface PostIndexSection {
  name: string;
  blurb?: string;
  posts: Array<{
    href: string;
    eyebrow: string;
    title: string;
    description: string;
    datePublished: string;
    dateModified: string;
  }>;
}

export interface PostIndex {
  posts: PostMeta[];
  sections: PostIndexSection[];
}

export function readFrontmatter(
  source: string,
  filePath: string,
): Record<string, unknown> | null;

export function parsePost(
  relativePath: string,
  source: string,
  options?: { includeRouteOnly?: boolean },
): PostMeta | null;

export function parsePosts(
  entries: Iterable<[string, string]>,
  options?: { includeRouteOnly?: boolean },
): PostMeta[];

export function sortFeedItems(posts: PostMeta[]): PostMeta[];

export function buildPostIndex(posts: PostMeta[]): PostIndex;
