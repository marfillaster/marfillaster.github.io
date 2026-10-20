// -----------------------------------------------------------------------------
// The two hast tree helpers the markdown renderers need, kept here instead of
// pulling in hast-util-to-string and unist-util-visit. Semantics match the
// subset of those packages the renderers relied on.
// -----------------------------------------------------------------------------

import type { Element, Nodes, Parents, Root } from "hast";

/**
 * Concatenated text of every text descendant, in tree order (the DOM's
 * `textContent`). A childless node with a `value` (text, comment, raw)
 * returns that value.
 */
export function textContent(node: Nodes): string {
  if ("children" in node) {
    return node.children.map(descendantText).join("");
  }
  return "value" in node ? node.value : "";
}

function descendantText(node: Nodes): string {
  if (node.type === "text") {
    return node.value;
  }
  return "children" in node ? node.children.map(descendantText).join("") : "";
}

/**
 * Called for each element with its index in, and its parent. Return a number
 * to continue at that index in the parent (after removing the node, say);
 * the element's children are then not walked.
 */
export type ElementVisitor = (
  node: Element,
  index: number,
  parent: Parents,
) => number | void;

/**
 * Depth-first, pre-order walk over every element below `tree`. The visitor
 * may replace `parent.children[index]`: the walk still descends into the
 * element it was given, then moves on to the next sibling.
 */
export function visitElements(tree: Root | Element, visitor: ElementVisitor): void {
  walk(tree, visitor);
}

function walk(parent: Parents, visitor: ElementVisitor): void {
  let index = 0;
  while (index < parent.children.length) {
    const node = parent.children[index];
    if (node.type === "element") {
      const next = visitor(node, index, parent);
      if (typeof next === "number") {
        index = next;
        continue;
      }
    }
    if ("children" in node) {
      walk(node, visitor);
    }
    index += 1;
  }
}
