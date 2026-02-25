import type { MetadataRoute } from "next";
import { createSupabaseClient } from "@/lib/supabase";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://k0ykwon.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: posts } = await createSupabaseClient()
    .from("posts")
    .select("slug, updated_at")
    .eq("published", true);

  const postEntries: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...postEntries,
  ];
}
