import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { ReactNode } from "react";
import type { LinksFunction, MetaFunction } from "react-router";
import stylesheet from "./styles.css?url";

const siteTitle = "Home-lab build logs — MikroTik, solar, EV · marfillaster";
const siteDescription =
  "Build logs and case studies on MikroTik RB5009 home networking behind residential CGNAT, residential solar and battery, and plug-in EV running costs — long-running experiments.";
const siteUrl = "https://blog.homestack.space/";
const author = "marfillaster";
const GA_MEASUREMENT_ID = "G-S37EV14XH2";

const favicon =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' fill='%231c1917'/%3E%3Ctext x='32' y='39' text-anchor='middle' font-family='Arial,sans-serif' font-size='21' font-weight='700' fill='%23fafaf9'%3Em%3C/text%3E%3C/svg%3E";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "icon", href: favicon },
  {
    rel: "alternate",
    type: "application/rss+xml",
    title: "marfillaster · notes RSS",
    href: "/rss.xml",
  },
];

export const meta: MetaFunction = () => [
  { title: siteTitle },
  { name: "description", content: siteDescription },
  { name: "author", content: author },
  { property: "og:site_name", content: siteTitle },
  { property: "og:url", content: siteUrl },
  { property: "og:type", content: "website" },
  { name: "theme-color", content: "#fafaf9" },
  { tagName: "link", rel: "canonical", href: siteUrl },
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${GA_MEASUREMENT_ID}');`,
          }}
        />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return <Outlet />;
}
