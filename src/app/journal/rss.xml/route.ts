import { getJournal } from "@/lib/journal/service";
import { POST_TYPE_LABEL } from "@/lib/journal/types";
import { SITE_URL } from "@/lib/site";

export const revalidate = 300;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET() {
  const { posts } = await getJournal();
  const items = posts
    .slice(0, 50)
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${SITE_URL}/journal/${p.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/journal/${p.slug}</guid>
      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
      <category>${esc(POST_TYPE_LABEL[p.type])}</category>
      <description>${esc(p.excerpt)}</description>
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Sack — Field Notes</title>
    <link>${SITE_URL}/journal</link>
    <atom:link href="${SITE_URL}/journal/rss.xml" rel="self" type="application/rss+xml" />
    <description>Devlogs, lanzamientos y notas de trabajo.</description>
    <language>es</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
