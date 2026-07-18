// Text-module imports bundled by wrangler for the Remix worker (see
// wrangler.remix.jsonc `rules`).

declare module "*.mdx" {
  const source: string;
  export default source;
}

declare module "*.md" {
  const source: string;
  export default source;
}
