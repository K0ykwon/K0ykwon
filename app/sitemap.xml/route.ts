import { createSupabaseClient } from "@/lib/supabase";

const BASE_URL = "https://k0ykwon.vercel.app";

const staticRoutes = [
  { url: BASE_URL, lastmod: new Date().toISOString().split("T")[0], changefreq: "monthly", priority: "1.0" },
  { url: `${BASE_URL}/about`, lastmod: new Date().toISOString().split("T")[0], changefreq: "monthly", priority: "0.8" },
  { url: `${BASE_URL}/blog`, lastmod: new Date().toISOString().split("T")[0], changefreq: "weekly", priority: "0.9" },
  { url: `${BASE_URL}/site-map`, lastmod: new Date().toISOString().split("T")[0], changefreq: "monthly", priority: "0.3" },
];

function urlEntry(url: string, lastmod: string, changefreq: string, priority: string) {
  return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export async function GET() {
  let blogEntries: { url: string; lastmod: string; changefreq: string; priority: string }[] = [];

  try {
    const supabase = createSupabaseClient();
    const { data: posts } = await supabase
      .from("posts")
      .select("slug, updated_at")
      .eq("published", true);

    blogEntries = (posts ?? []).map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastmod: new Date(post.updated_at).toISOString().split("T")[0],
      changefreq: "monthly",
      priority: "0.7",
    }));
  } catch {
    // fall back to static routes only
  }

  const allRoutes = [
    ...staticRoutes,
    ...blogEntries,
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map((r) => urlEntry(r.url, r.lastmod, r.changefreq, r.priority)).join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
