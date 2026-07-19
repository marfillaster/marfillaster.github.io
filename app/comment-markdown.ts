import type { Element, Root } from "hast";
import rehypeParse from "rehype-parse";
import rehypeSanitize from "rehype-sanitize";
import type { Options as SanitizeOptions } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";

// Comments intentionally use a smaller vocabulary than posts. Raw HTML is
// omitted by remark-rehype, then this allowlist removes everything outside the
// markdown-lite contract (including images and headings).
const commentSchema: SanitizeOptions = {
  strip: ["script", "style"],
  tagNames: [
    "a",
    "blockquote",
    "br",
    "code",
    "em",
    "li",
    "ol",
    "p",
    "pre",
    "strong",
    "ul",
  ],
  attributes: {
    a: ["href", "title"],
    code: ["className"],
  },
  protocols: {
    href: ["http", "https", "mailto"],
  },
};

function markUserLinks() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName === "a") {
        node.properties = {
          ...node.properties,
          rel: ["nofollow", "ugc"],
        };
      }
    });
  };
}

export function renderCommentMarkdown(source: string): string {
  const file = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize, commentSchema)
    .use(markUserLinks)
    .use(rehypeStringify)
    .processSync(source);

  return String(file);
}

/** Sanitize Reddit's pre-rendered body_html through the identical allowlist. */
export function sanitizeCommentHtml(source: string): string {
  const file = unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeSanitize, commentSchema)
    .use(markUserLinks)
    .use(rehypeStringify)
    .processSync(source);

  return String(file);
}
