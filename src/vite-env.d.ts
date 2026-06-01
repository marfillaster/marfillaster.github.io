/// <reference types="vite/client" />

declare module "*.mdx" {
  import type { ComponentType } from "react";
  const MDXComponent: ComponentType<Record<string, unknown>>;
  export default MDXComponent;
}

declare module "*.md" {
  import type { ComponentType } from "react";
  const MDXComponent: ComponentType<Record<string, unknown>>;
  export default MDXComponent;
}

declare module "virtual:post-index" {
  const postIndex: {
    sections: Array<{
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
    }>;
  };

  export default postIndex;
}
