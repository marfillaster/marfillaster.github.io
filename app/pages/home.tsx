// Port of src/routes/_index.tsx (homepage). Meta descriptors copied verbatim.

import type { Handle } from "remix/ui";
import type { PostIndex } from "../../src/lib/post-meta.mjs";
import type { MetaDescriptor } from "../head.ts";
import { SiteShell } from "../components.tsx";

const title = "Home-lab build logs — MikroTik, solar, EV, home finance · marfillaster";
const siteName = "marfillaster · notes";
const description =
  "Build logs and case studies on MikroTik RB5009 home networking behind residential CGNAT, residential solar and battery, plug-in EV running costs, and home-finance field logs — long-running experiments.";
const url = "https://blog.homestack.space/";

export const homeDescriptors: MetaDescriptor[] = [
  { title },
  { name: "description", content: description },
  { property: "og:title", content: title },
  { property: "og:description", content: description },
  { property: "og:url", content: url },
  { property: "og:type", content: "website" },
  { property: "og:site_name", content: siteName },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: title },
  { name: "twitter:description", content: description },
  { tagName: "link", rel: "canonical", href: url },
];

export function HomePage(handle: Handle<{ index: PostIndex }>) {
  return () => {
    const sections = handle.props.index.sections;
    return (
      <SiteShell>
        <div className="container max-w-[48rem] py-16 leading-relaxed">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            marfillaster · notes
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            MikroTik RB5009, residential solar, plug-in EV, and home finance —
            build logs and field notes.
          </h1>
          <div className="mt-12 space-y-16">
            {sections.map((section) => {
              const catId = `cat-${section.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "")}`;
              return (
                <section aria-labelledby={catId}>
                  <h2
                    id={catId}
                    className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    {section.name}
                  </h2>
                  {section.blurb ? (
                    <p className="mt-3 max-w-[42rem] text-sm text-muted-foreground">
                      {section.blurb}
                    </p>
                  ) : null}
                  <ul className="mt-8 space-y-10">
                    {section.posts.map((p) => (
                      <li>
                        <a href={p.href} className="group block">
                          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            {p.eyebrow}
                          </p>
                          <h3 className="mt-2 text-balance text-xl font-semibold tracking-tight group-hover:underline underline-offset-4 sm:text-2xl">
                            {p.title}
                          </h3>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {p.description}
                          </p>
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>

          <section
            id="about"
            className="mt-20 scroll-mt-20 border-t pt-10"
            aria-labelledby="about-heading"
          >
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              About
            </p>
            <h2
              id="about-heading"
              className="mt-3 text-balance text-2xl font-semibold tracking-tight"
            >
              Ken Marfilla
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Based in Cavite, Philippines. These notes are personal build logs
              and case studies from long-running experiments at home — networking
              behind residential CGNAT, residential solar and battery, and
              whatever else turns into a project worth writing down.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Find me on{" "}
              <a
                href="https://github.com/marfillaster"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground"
              >
                GitHub
              </a>
              .
            </p>
          </section>
        </div>
      </SiteShell>
    );
  };
}
