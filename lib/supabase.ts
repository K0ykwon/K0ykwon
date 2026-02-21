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

type SB = ReturnType<typeof createClient>;

// Lazy singleton — created only on first access so env vars are always ready
let _client: SB | null = null;
const get = (): SB => {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _client;
};

export const supabase = new Proxy({} as SB, {
  get(_, prop) {
    const val = get()[prop as keyof SB];
    return typeof val === "function" ? (val as Function).bind(get()) : val;
  },
});
