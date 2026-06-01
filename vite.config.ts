import { reactRouter } from "@react-router/dev/vite";
import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import rehypeSlug from "rehype-slug";
import rehypeMdxCodeProps from "rehype-mdx-code-props";
import { defineConfig } from "vite";
// @ts-ignore This helper runs in Vite's Node context.
import { buildPostIndex, readRoutablePosts } from "./scripts/post-metadata.mjs";

const virtualPostIndexId = "virtual:post-index";
const resolvedVirtualPostIndexId = `\0${virtualPostIndexId}`;

export default defineConfig({
  plugins: [
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
      ...mdx({
        remarkPlugins: [remarkFrontmatter, remarkGfm],
        rehypePlugins: [rehypeSlug, rehypeMdxCodeProps],
        providerImportSource: "@mdx-js/react",
      }),
      enforce: "pre",
    },
    reactRouter(),
  ],
});
