import { Link } from "react-router";
import type { MetaFunction } from "react-router";
import { SiteShell } from "../components/site-shell";

const title = "marfillaster · notes";
const description =
  "Build logs and case studies on home networking, residential solar, and other long-running experiments by marfillaster.";
const url = "https://marfillaster.github.io/";

export const meta: MetaFunction = () => [
  { title },
  { name: "description", content: description },
  { property: "og:title", content: title },
  { property: "og:description", content: description },
  { property: "og:url", content: url },
  { property: "og:type", content: "website" },
  { property: "og:site_name", content: title },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: title },
  { name: "twitter:description", content: description },
  { tagName: "link", rel: "canonical", href: url },
];

const posts = [
  {
    href: "/mikrotik-home-network/",
    eyebrow: "Build log · 2026-05",
    title: "Building a usable home network behind residential CGNAT",
    description:
      "VLANs, a UniFi controller running on the router itself, routed IPv6 over WireGuard, and encrypted DNS. Reproducible, paste-ready snippets for the MikroTik RB5009.",
  },
  {
    href: "/solar-report/",
    eyebrow: "Case study · 2026-04",
    title: "Residential 6.5 kWp solar performance — Cavite, Philippines",
    description:
      "Five months of real generation, self-sufficiency, battery behavior, and bill impact from a 6.5 kWp / 14.3 kWh / 8 kW system, with monthly tariff math and ROI payback.",
  },
] as const;

export default function Index() {
  return (
    <SiteShell>
      <div className="container max-w-[48rem] py-16 leading-relaxed">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          marfillaster · notes
        </p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Long-running experiments, written down.
        </h1>
        <ul className="mt-12 space-y-10">
          {posts.map((p) => (
            <li key={p.href}>
              <Link to={p.href} className="group block">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {p.eyebrow}
                </p>
                <h2 className="mt-2 text-balance text-xl font-semibold tracking-tight group-hover:underline underline-offset-4 sm:text-2xl">
                  {p.title}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {p.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>

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
}
