import { createClient } from "@supabase/supabase-js";

export type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  description: string;
  category: "projects" | "problem-solving" | "paper-review";
  published: boolean;
  created_at: string;
  updated_at: string;
};

type Database = {
  public: {
    Tables: {
      posts: {
        Row: Post;
        Insert: Omit<Post, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Post, "id" | "created_at" | "updated_at">>;
      };
    };
  };
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
