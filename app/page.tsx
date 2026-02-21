import { Github, Mail, Linkedin, Instagram } from "lucide-react";
import ThemeToggle from "./components/ThemeToggle";

const socialLinks = [
  {
    icon: Github,
    href: "https://github.com/K0ykwon",
    label: "GitHub",
  },
  {
    icon: Mail,
    href: "mailto:yko081524@yonsei.ac.kr",
    label: "Email",
  },
  {
    icon: Linkedin,
    href: "https://linkedin.com/in/koykwon",
    label: "LinkedIn",
  },
  {
    icon: Instagram,
    href: "https://instagram.com/koykwon_",
    label: "Instagram",
  },
];

const navLinks = ["About", "Blog", "Portfolio"];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-10">
      {/* ThemeToggle + 이름 + 태그라인 */}
      <div className="flex flex-col items-center animate-fade-up">
        <ThemeToggle />
        <h1 className="text-5xl font-light tracking-widest uppercase text-stone-800 dark:text-stone-100 transition-colors duration-300">
          Youngkwon{" "}
          <span className="text-stone-400 dark:text-neutral-400">Ko</span>
        </h1>
        <p className="mt-3 text-[10px] tracking-[0.3em] uppercase text-stone-400 dark:text-stone-500 transition-colors duration-300">
          Artificial Intelligence · Yonsei University
        </p>
      </div>

      {/* Social Icons */}
      <div className="flex items-center gap-7 animate-fade-up-delay-1">
        {socialLinks.map(({ icon: Icon, href, label }) => (
          <a
            key={label}
            href={href}
            aria-label={label}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-100 transition-all duration-200 hover:-translate-y-0.5"
          >
            <Icon size={20} strokeWidth={1.5} />
          </a>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-stone-200 dark:bg-stone-700 transition-colors duration-300 animate-fade-up-delay-2" />

      {/* Navigation */}
      <nav className="flex items-center gap-10 animate-fade-up-delay-3">
        {navLinks.map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase()}`}
            className="group relative text-xs tracking-[0.2em] uppercase text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors duration-200"
          >
            {link}
            <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-stone-400 dark:bg-stone-500 group-hover:w-full transition-all duration-300" />
          </a>
        ))}
      </nav>
    </main>
  );
}
