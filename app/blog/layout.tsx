import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Posts on problem solving, projects, and paper reviews.",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
