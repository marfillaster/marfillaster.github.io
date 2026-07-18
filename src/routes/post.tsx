import type { MetaFunction } from "react-router";
import { useLocation } from "react-router";
import {
  findPostByPath,
  postMetaDescriptors,
  PostRoute,
} from "../lib/post-route";

const contentModules = import.meta.glob("../content/**/*.{md,mdx}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

export const meta: MetaFunction = ({ location }) => {
  const post = findPostByPath(location.pathname);
  if (!post) {
    return [{ title: "Post not found" }];
  }

  return postMetaDescriptors(post);
};

export default function PostPage() {
  const location = useLocation();
  const postMeta = findPostByPath(location.pathname);

  if (!postMeta) {
    return null;
  }

  const html = contentModules[postMeta.contentModule];
  if (html === undefined) {
    throw new Error(`Missing content module for ${postMeta.contentModule}`);
  }

  return (
    <PostRoute
      html={html}
      postMeta={postMeta}
    />
  );
}
