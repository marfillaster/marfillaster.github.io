// -----------------------------------------------------------------------------
// Head descriptor model. Kept intentionally identical in shape to the React
// Router MetaFunction descriptor arrays so the per-page metadata ported from
// the RR7 routes copies over verbatim; app/document.tsx renders them as tags.
// -----------------------------------------------------------------------------

export type MetaDescriptor =
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string }
  | { tagName: "link"; rel: string; href: string }
  | { "script:ld+json": object };

export function descriptorTitle(descriptors: MetaDescriptor[]): string | undefined {
  for (const d of descriptors) {
    if ("title" in d) {
      return d.title;
    }
  }
  return undefined;
}
