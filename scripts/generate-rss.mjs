import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readFeedPosts, sortFeedItems } from "./post-metadata.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const siteUrl = "https://blog.homestack.space";
const feedUrl = `${siteUrl}/rss.xml`;
const feedOutputPath = resolve(repoRoot, "public/rss.xml");

const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const month = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function toRssDate(date) {
  const [year, monthIndex, day] = date.split("-").map(Number);
  const utcDate = new Date(Date.UTC(year, monthIndex - 1, day));
  return `${weekday[utcDate.getUTCDay()]}, ${String(day).padStart(2, "0")} ${
    month[monthIndex - 1]
  } ${year} 00:00:00 +0800`;
}

function absoluteUrl(path) {
  return new URL(path, siteUrl).toString();
}

const feedItems = sortFeedItems(await readFeedPosts());
const latestDate = feedItems[0]?.dateModified ?? "2026-05-27";

const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>marfillaster · notes</title>
    <link>${siteUrl}/</link>
    <description>Build logs and case studies on MikroTik RB5009 home networking behind residential CGNAT, residential solar and battery, and plug-in EV running costs.</description>
    <language>en</language>
    <lastBuildDate>${toRssDate(latestDate)}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
${feedItems
  .map((post) => {
    const url = absoluteUrl(post.href);
    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.description)}</description>
      <category>${escapeXml(post.category)}</category>
      <pubDate>${toRssDate(post.dateModified)}</pubDate>
    </item>`;
  })
  .join("\n")}
  </channel>
</rss>
`;

await mkdir(dirname(feedOutputPath), { recursive: true });
await writeFile(feedOutputPath, rssXml);
