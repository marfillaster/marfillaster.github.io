import { readdir, readFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import YAML from "yaml";

const contentDir = resolve(process.cwd(), "src/content");

async function listContentFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        return listContentFiles(path);
      }

      return [".md", ".mdx"].includes(extname(entry.name)) ? [path] : [];
    }),
  );

  return files.flat();
}

function readFrontmatter(source, filePath) {
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

export async function readFeedPosts() {
  const contentFiles = await listContentFiles(contentDir);
  const posts = [];

  for (const filePath of contentFiles) {
    const source = await readFile(filePath, "utf8");
    const frontmatter = readFrontmatter(source, filePath);

    if (!frontmatter?.feed) {
      continue;
    }

    posts.push({
      href: requiredString(frontmatter, "href", filePath),
      eyebrow: requiredString(frontmatter, "eyebrow", filePath),
      title: requiredString(frontmatter, "title", filePath),
      description: requiredString(frontmatter, "description", filePath),
      datePublished: requiredString(frontmatter, "datePublished", filePath),
      dateModified: requiredString(frontmatter, "dateModified", filePath),
      category: requiredString(frontmatter, "category", filePath),
      sectionBlurb:
        typeof frontmatter.sectionBlurb === "string"
          ? frontmatter.sectionBlurb
          : undefined,
      sectionOrder: Number(frontmatter.sectionOrder ?? 999),
      order: Number(frontmatter.order ?? 999),
    });
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
  const sections = [...posts]
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

  return { sections };
}
