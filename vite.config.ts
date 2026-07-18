import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import YAML from "yaml";
import { renderMarkdown } from "./src/lib/render-markdown";
// @ts-ignore This helper runs in Vite's Node context.
import { buildPostIndex, readRoutablePosts } from "./scripts/post-metadata.mjs";

const virtualPostIndexId = "virtual:post-index";
const resolvedVirtualPostIndexId = `\0${virtualPostIndexId}`;

function frontmatterHeadingPrefix(source: string): string | undefined {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    return undefined;
  }

  const frontmatter = YAML.parse(match[1]);
  const prefix = frontmatter?.headingPrefix;
  return typeof prefix === "string" && prefix.trim() !== "" ? prefix : undefined;
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    {
      name: "post-index-frontmatter",
      resolveId(id) {
        if (id === virtualPostIndexId) {
          return resolvedVirtualPostIndexId;
        }
      },
      async load(id) {
        if (id !== resolvedVirtualPostIndexId) {
          return;
        }

        const postIndex = buildPostIndex(await readRoutablePosts());
        return `export default ${JSON.stringify(postIndex)};`;
      },
    },
    {
      // Markdown/MDX content compiles to a rendered HTML string at build time
      // via the framework-neutral renderer — no React in the content pipeline.
      name: "markdown-html",
      enforce: "pre",
      transform(source, id) {
        if (!/\/src\/content\/[^?]+\.(md|mdx)$/.test(id)) {
          return;
        }

        const { html } = renderMarkdown(source, {
          headingPrefix: frontmatterHeadingPrefix(source),
        });
        return { code: `export default ${JSON.stringify(html)};`, map: null };
      },
    },
    reactRouter(),
  ],
});
