import { reactRouter } from "@react-router/dev/vite";
import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeMdxCodeProps from "rehype-mdx-code-props";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    {
      ...mdx({
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug, rehypeMdxCodeProps],
        providerImportSource: "@mdx-js/react",
      }),
      enforce: "pre",
    },
    reactRouter(),
  ],
});
