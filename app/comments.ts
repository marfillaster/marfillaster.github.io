import type { CommentRow } from "./platform.ts";

export const MAX_COMMENT_DEPTH = 6;

export interface ThreadComment {
  id: string;
  author: string;
  bodyHtml: string;
  createdAt: string;
  hidden: boolean;
  children: ThreadComment[];
}

export type FlatThreadComment = Omit<ThreadComment, "children"> & {
  parentId: string | null;
};

export function normalizeFirstPartyComments(rows: CommentRow[]): FlatThreadComment[] {
  return rows.map((row) => ({
    id: row.id,
    parentId: row.parentId,
    author: row.author,
    bodyHtml: row.bodyHtml,
    createdAt: row.createdAt,
    hidden: row.hidden,
  }));
}

export function assembleThread(comments: FlatThreadComment[]): ThreadComment[] {
  const nodes = new Map<string, ThreadComment>();
  for (const comment of comments) {
    nodes.set(comment.id, { ...comment, children: [] });
  }

  const roots: ThreadComment[] = [];
  for (const comment of comments) {
    const node = nodes.get(comment.id)!;
    const parent = comment.parentId ? nodes.get(comment.parentId) : undefined;
    if (parent && parent !== node) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const chronological = (a: ThreadComment, b: ThreadComment) =>
    a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id);
  for (const node of nodes.values()) {
    node.children.sort(chronological);
  }

  roots.sort(
    (a, b) =>
      b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id),
  );

  return roots;
}

export function commentRoutePath(postSlug: string): string {
  const routeSlug = postSlug.replace(/^\/+|\/+$/g, "");
  return `/comments/${encodeURIComponent(routeSlug)}`;
}

export function postSlugFromRouteParam(routeSlug: string): string {
  return `/${routeSlug.replace(/^\/+|\/+$/g, "")}/`;
}

export function commentDepth(rows: CommentRow[], id: string): number | null {
  const byId = new Map(rows.map((row) => [row.id, row]));
  const seen = new Set<string>();
  let current = byId.get(id);
  let depth = 0;

  while (current) {
    if (seen.has(current.id)) return null;
    seen.add(current.id);
    depth += 1;
    if (!current.parentId) return depth;
    current = byId.get(current.parentId);
  }

  return null;
}

export async function hashCommentIp(ip: string, salt: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${ip}\0${salt}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export function localReturnPath(value: string | null, fallback: string): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }
  try {
    const url = new URL(value, "https://local.invalid");
    if (url.origin !== "https://local.invalid") return fallback;
    return `${url.pathname}${url.search}`;
  } catch {
    return fallback;
  }
}
