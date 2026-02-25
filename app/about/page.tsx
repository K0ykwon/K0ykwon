export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "../components/ThemeToggle";
import { createSupabaseClient, type Timeline } from "@/lib/supabase";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "AI developer and researcher at Yonsei University.",
};

const bio = [
  "Hi, I'm Youngkwon Ko.",
  "I study AI at Yonsei University, with a focus on NLP, agent systems, and reinforcement learning.",
  "Currently serving as an AI developer in the R.O.K.N, where I work on building intelligent systems for real-world environments.",
  "I'm particularly interested in startups, productization of AI, and IR/pitch-related activities.",
  "Feel free to reach out for collaboration, projects, or conversations around AI and startups.",
];

const stack = [
  { group: "Languages", items: ["Python", "TypeScript", "C/C++", "Kotlin"] },
  { group: "AI / ML", items: ["PyTorch", "TensorFlow", "NumPy", "Pandas"] },
  { group: "Web", items: ["Next.js", "FastAPI", "Flask", "Node.js"] },
  { group: "Tools", items: ["Docker", "Firebase", "Figma", "Git"] },
];

const contacts = [
  {
    label: "Email",
    value: "yko081524@yonsei.ac.kr",
    href: "mailto:yko081524@yonsei.ac.kr",
  },
  {
    label: "GitHub",
    value: "K0ykwon",
    href: "https://github.com/K0ykwon",
  },
  {
    label: "LinkedIn",
    value: "youngkwon-ko",
    href: "https://www.linkedin.com/in/youngkwon-ko-355984390/",
  },
  {
    label: "Instagram",
    value: "koykwon_",
    href: "https://instagram.com/koykwon_",
  },
];

export default async function AboutPage() {
  let timeline: Timeline[] = [];
  try {
    const { data } = await createSupabaseClient()
      .from("timeline")
      .select("*")
      .order("sort_order", { ascending: true });
    timeline = (data as Timeline[]) ?? [];
  } catch {
    // table may not exist yet
  }

  return (
    <div className="min-h-screen px-8 py-14 max-w-xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-16 animate-fade-up">
        <Link
          href="/"
          className="text-[9px] tracking-[0.3em] uppercase text-stone-300 dark:text-stone-600 hover:text-stone-600 dark:hover:text-stone-400 transition-colors duration-200"
        >
          ← Home
        </Link>
        <ThemeToggle compact />
      </header>

      {/* ── Story ─────────────────────────────────────────────── */}
      <section id="story" className="mb-16 animate-fade-up">
        <div className="mb-10">
          <h1 className="text-3xl font-light tracking-widest uppercase text-stone-800 dark:text-stone-100 transition-colors duration-300">
            Story
          </h1>
          <p className="mt-2 text-[10px] tracking-[0.3em] uppercase text-stone-400 dark:text-stone-500 transition-colors duration-300">
            About Me
          </p>
        </div>

        <div className="mb-10">
          <Image
            src="/profile/image.png"
            alt="Youngkwon Ko"
            width={160}
            height={160}
            className="rounded-full object-cover"
            priority
          />
        </div>

        {/* Bio */}
        <div className="flex flex-col gap-5 mb-14">
          {bio.map((text, i) => (
            <p
              key={i}
              className={`font-light leading-relaxed tracking-wide transition-colors duration-300 ${
                i === 0
                  ? "text-base text-stone-700 dark:text-stone-200"
                  : "text-sm text-stone-500 dark:text-stone-400"
              }`}
            >
              {text}
            </p>
          ))}
        </div>

        {/* Timeline */}
        {timeline.length > 0 && (
          <div className="relative pl-5 border-l border-stone-100 dark:border-stone-800/80 flex flex-col gap-10 transition-colors duration-300">
            {timeline.map((item) => (
              <div key={item.id} className="relative">
                {/* dot */}
                <div className="absolute -left-[21px] top-[5px] w-2 h-2 rounded-full bg-stone-200 dark:bg-stone-700 transition-colors duration-300" />
                {/* date range */}
                <p className="text-[9px] tracking-[0.2em] uppercase text-stone-300 dark:text-stone-600 mb-1.5 transition-colors duration-300">
                  {item.start_date} — {item.end_date}
                </p>
                {/* title */}
                <p className="text-sm font-light tracking-wide text-stone-700 dark:text-stone-300 mb-1 transition-colors duration-300">
                  {item.title}
                </p>
                {/* description */}
                {item.description && (
                  <p className="text-[11px] leading-relaxed tracking-wide text-stone-400 dark:text-stone-500 transition-colors duration-300">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-stone-100 dark:bg-stone-800/60 mb-14 animate-fade-up-delay-1 transition-colors duration-300" />

      {/* ── Stack ─────────────────────────────────────────────── */}
      <section id="stack" className="mb-14 animate-fade-up-delay-1">
        <div className="mb-8">
          <h2 className="text-xl font-light tracking-widest uppercase text-stone-800 dark:text-stone-100 transition-colors duration-300">
            Stack
          </h2>
        </div>
        <div className="flex flex-col gap-4">
          {stack.map(({ group, items }) => (
            <div key={group} className="flex gap-6">
              <span className="w-20 shrink-0 text-[9px] tracking-[0.2em] uppercase text-stone-300 dark:text-stone-600 pt-0.5 transition-colors duration-300">
                {group}
              </span>
              <p className="text-sm font-light text-stone-500 dark:text-stone-400 leading-relaxed transition-colors duration-300">
                {items.join(" · ")}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-stone-100 dark:bg-stone-800/60 mb-14 animate-fade-up-delay-2 transition-colors duration-300" />

      {/* ── Contact ───────────────────────────────────────────── */}
      <section id="contact" className="animate-fade-up-delay-2">
        <div className="mb-8">
          <h2 className="text-xl font-light tracking-widest uppercase text-stone-800 dark:text-stone-100 transition-colors duration-300">
            Contact
          </h2>
        </div>
        <div className="flex flex-col gap-4 mb-10">
          {contacts.map(({ label, value, href }) => (
            <div key={label} className="flex gap-6">
              <span className="w-20 shrink-0 text-[9px] tracking-[0.2em] uppercase text-stone-300 dark:text-stone-600 pt-0.5 transition-colors duration-300">
                {label}
              </span>
              <a
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="text-sm font-light text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors duration-200"
              >
                {value}
              </a>
            </div>
          ))}
        </div>

        {/* CV Download — place your CV at /public/cv.pdf */}
        <a
          href="/cv.pdf"
          download
          className="inline-block text-[9px] tracking-[0.3em] uppercase text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-stone-700 px-6 py-3 hover:text-stone-700 dark:hover:text-stone-200 hover:border-stone-400 dark:hover:border-stone-500 transition-colors duration-200"
        >
          Download CV
        </a>
      </section>
    </div>
  );
}
