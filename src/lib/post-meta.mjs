// -----------------------------------------------------------------------------
// Pure post-metadata logic for the Remix app layer, which feeds it sources
// from Platform.content(). No I/O — callers supply (relativePath, source)
// pairs. Frontmatter semantics must stay in lockstep with the TOC ids emitted
// by src/lib/render-markdown.ts.
// -----------------------------------------------------------------------------

import YAML from "yaml";

export function readFrontmatter(source, filePath) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    return null;
  }

  try {
    return YAML.parse(match[1]);
  } catch (error) {
    throw new Error(`Could not parse YAML frontmatter in ${filePath}: ${error}`);
  }
}

function requiredString(post, field, filePath) {
  if (typeof post[field] !== "string" || post[field].trim() === "") {
    throw new Error(`Missing frontmatter field "${field}" in ${filePath}`);
  }

  return post[field];
}

function optionalString(value) {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function optionalStringArray(value) {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === "string" && item.trim() !== "")
    : undefined;
}

function readTabs(value) {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const ariaLabel = optionalString(value.ariaLabel);
  const items = Array.isArray(value.items)
    ? value.items
        .map((item) => ({
          href: optionalString(item?.href),
          label: optionalString(item?.label),
        }))
        .filter((item) => item.href && item.label)
    : [];

  return ariaLabel && items.length > 0 ? { ariaLabel, items } : undefined;
}

function readRedirects(value) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const redirects = value
    .map((item) => ({
      exact: optionalString(item?.exact),
      prefix: optionalString(item?.prefix),
      toPath: optionalString(item?.toPath),
    }))
    .filter((item) => item.toPath && (item.exact || item.prefix));

  return redirects.length > 0 ? redirects : undefined;
}

function readSeries(value) {
  if (value === false) {
    return false;
  }

  return value && typeof value === "object"
    ? {
        current: optionalString(value.current),
      }
    : undefined;
}

function stripFrontmatter(source) {
  return source.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, "");
}

function cleanHeadingText(value) {
  return value
    .replace(/\{#[^}]+}/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function headingSlugSource(value) {
  return value
    .replace(/\{#[^}]+}/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function slugifyHeading(value) {
  return headingSlugSource(value)
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .trim()
    .replace(/\s/g, "-");
}

function readToc(source, headingPrefix = "") {
  const seen = new Map();

  return stripFrontmatter(source)
    .split(/\r?\n/)
    .flatMap((line) => {
      const match = line.match(/^##\s+(.+)$/);
      if (!match || match[1].startsWith("#")) {
        return [];
      }

      const label = cleanHeadingText(match[1]);
      const explicitId = match[1].match(/\{#([^}]+)}/)?.[1];
      const baseSlug = explicitId ?? slugifyHeading(label);
      if (!baseSlug) {
        return [];
      }

      const count = seen.get(baseSlug) ?? 0;
      seen.set(baseSlug, count + 1);
      const slug = count === 0 ? baseSlug : `${baseSlug}-${count}`;

      return [[`#${headingPrefix}${slug}`, label]];
    });
}

function routePathFromHref(href) {
  return href.replace(/^\/+|\/+$/g, "");
}

/**
 * Parse one content file into a post record, or null when the file is not a
 * post for the requested view. `relativePath` is the path relative to
 * src/content (used for error messages and the content module specifier).
 */
export function parsePost(relativePath, source, { includeRouteOnly = false } = {}) {
  const frontmatter = readFrontmatter(source, relativePath);

  if (!frontmatter?.feed && !(includeRouteOnly && frontmatter?.route)) {
    return null;
  }

  const href = requiredString(frontmatter, "href", relativePath);
  const headingPrefix = optionalString(frontmatter.headingPrefix);

  return {
    feed: frontmatter.feed === true,
    route: frontmatter.route === true,
    href,
    routePath: routePathFromHref(href),
    contentModule: `../content/${relativePath}`,
    contentFile: relativePath,
    eyebrow: requiredString(frontmatter, "eyebrow", relativePath),
    title: requiredString(frontmatter, "title", relativePath),
    description: requiredString(frontmatter, "description", relativePath),
    datePublished: requiredString(frontmatter, "datePublished", relativePath),
    dateModified: requiredString(frontmatter, "dateModified", relativePath),
    category: requiredString(frontmatter, "category", relativePath),
    sectionBlurb:
      typeof frontmatter.sectionBlurb === "string"
        ? frontmatter.sectionBlurb
        : undefined,
    sectionOrder: Number(frontmatter.sectionOrder ?? 999),
    order: Number(frontmatter.order ?? 999),
    headingPrefix,
    toc: readToc(source, headingPrefix),
    hero:
      frontmatter.hero && typeof frontmatter.hero === "object"
        ? {
            eyebrow: optionalString(frontmatter.hero.eyebrow),
            title: optionalString(frontmatter.hero.title),
            description: optionalString(frontmatter.hero.description),
          }
        : undefined,
    seo:
      frontmatter.seo && typeof frontmatter.seo === "object"
        ? {
            author: optionalString(frontmatter.seo.author),
            breadcrumbName: optionalString(frontmatter.seo.breadcrumbName),
            dependencies: optionalString(frontmatter.seo.dependencies),
            keywords: optionalStringArray(frontmatter.seo.keywords),
            ogImage: optionalString(frontmatter.seo.ogImage),
            ogImageAlt: optionalString(frontmatter.seo.ogImageAlt),
            schemaType: optionalString(frontmatter.seo.schemaType),
          }
        : undefined,
    publishedLabel: optionalString(frontmatter.publishedLabel),
    redirects: readRedirects(frontmatter.redirects),
    series: readSeries(frontmatter.series),
    tabs: readTabs(frontmatter.tabs),
  };
}

/**
 * Parse a set of content files. `entries` is an iterable of
 * [relativePath, source] pairs (a Map works).
 */
export function parsePosts(entries, options = {}) {
  const posts = [];
  for (const [relativePath, source] of entries) {
    const post = parsePost(relativePath, source, options);
    if (post) {
      posts.push(post);
    }
  }
  return posts;
}

export function sortFeedItems(posts) {
  return [...posts].sort(
    (left, right) =>
      right.dateModified.localeCompare(left.dateModified) ||
      right.datePublished.localeCompare(left.datePublished) ||
      left.order - right.order,
  );
}

export function buildPostIndex(posts) {
  const sections = posts
    .filter((post) => post.feed)
    .sort(
      (left, right) =>
        left.sectionOrder - right.sectionOrder || left.order - right.order,
    )
    .reduce((acc, post) => {
      let section = acc.find((candidate) => candidate.name === post.category);
      if (!section) {
        section = {
          name: post.category,
          ...(post.sectionBlurb ? { blurb: post.sectionBlurb } : {}),
          posts: [],
        };
        acc.push(section);
      }

      section.posts.push({
        href: post.href,
        eyebrow: post.eyebrow,
        title: post.title,
        description: post.description,
        datePublished: post.datePublished,
        dateModified: post.dateModified,
      });

      return acc;
    }, []);

  return { posts, sections };
}
