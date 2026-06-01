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
    posts: Array<{
      feed: boolean;
      route: boolean;
      href: string;
      routePath: string;
      contentModule: string;
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
      toc: Array<[string, string]>;
      hero?: {
        eyebrow?: string;
        title?: string;
        description?: string;
      };
      seo?: {
        author?: string;
        breadcrumbName?: string;
        dependencies?: string;
        keywords?: string[];
        ogImage?: string;
        ogImageAlt?: string;
        schemaType?: "Article" | "BlogPosting" | "TechArticle";
      };
      publishedLabel?: string;
      redirects?: Array<{
        exact?: string;
        prefix?: string;
        toPath: string;
      }>;
      series?: false | {
        current?: string;
      };
      tabs?: {
        ariaLabel: string;
        items: Array<{
          href: string;
          label: string;
        }>;
      };
    }>;
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
