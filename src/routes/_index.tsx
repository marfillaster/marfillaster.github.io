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
        <p className="mt-3 text-sm text-muted-foreground">
          Each entry stands alone; pick the parts that match your situation.
        </p>

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
      </div>
    </SiteShell>
  );
}
