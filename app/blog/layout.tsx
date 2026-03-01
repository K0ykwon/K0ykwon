import type { Metadata } from "next";
import "katex/dist/katex.min.css";

export const metadata: Metadata = {
  title: "Blog",
  description: "Posts on problem solving, projects, and paper reviews.",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
