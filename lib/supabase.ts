import { createClient } from "@supabase/supabase-js";

export type Timeline = {
  id: string;
  start_date: string;
  end_date: string;
  title: string;
  description: string;
  sort_order: number;
  created_at: string;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  description: string;
  category: "dev-log" | "problem-solving" | "paper-review" | "etc";
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type PortfolioItem = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  date: string;
  link: string;
  type: "project" | "paper";
  published: boolean;
  sort_order: number;
  created_at: string;
};

/** Call this inside a function/handler — never at module level. */
export function createSupabaseClient() {
  // No Database generic: query results typed as `any`, avoids TypeScript
  // inference issues with the select() chain on some compiler versions.
  // Use the Post type above to manually assert result shapes where needed.
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
