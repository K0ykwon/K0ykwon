export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { createSupabaseClient } from "@/lib/supabase";
import ThemeToggle from "../../components/ThemeToggle";
import GiscusComments from "../../components/GiscusComments";

const categoryLabel: Record<string, string> = {
  projects: "Projects",
  "problem-solving": "Problem Solving",
  "paper-review": "Paper Review",
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return {};
  try {
    const { slug } = await params;
    const { data } = await createSupabaseClient()
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .single();
    return {
      title: data?.title ?? "Blog",
      description: data?.description ?? "",
    };
  } catch {
    return {};
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: post } = await createSupabaseClient()
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!post) notFound();

  return (
    <div className="min-h-screen px-8 py-14 max-w-xl mx-auto">
      <header className="flex items-center justify-between mb-16">
        <Link
          href="/blog"
          className="text-[9px] tracking-[0.3em] uppercase text-stone-300 dark:text-stone-600 hover:text-stone-600 dark:hover:text-stone-400 transition-colors duration-200"
        >
          ← Blog
        </Link>
        <ThemeToggle compact />
      </header>

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <time className="text-[9px] tracking-[0.2em] uppercase text-stone-300 dark:text-stone-600 transition-colors duration-300">
            {fmtDate(post.created_at)}
          </time>
          <span className="text-[8px] tracking-[0.15em] uppercase text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-stone-700/80 px-1.5 py-0.5 transition-colors duration-300">
            {categoryLabel[post.category] ?? post.category}
          </span>
        </div>
        <h1 className="text-2xl font-light tracking-wide text-stone-800 dark:text-stone-100 transition-colors duration-300 mb-3">
          {post.title}
        </h1>
        {post.description && (
          <p className="text-[11px] leading-relaxed text-stone-400 dark:text-stone-500 transition-colors duration-300">
            {post.description}
          </p>
        )}
      </div>

      <div className="w-full h-px bg-stone-100 dark:bg-stone-800/60 mb-10 transition-colors duration-300" />

      <div className="prose-blog">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
        >
          {post.content}
        </ReactMarkdown>
      </div>

      <GiscusComments />
    </div>
  );
}
