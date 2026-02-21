import { Github, Mail, Linkedin, Instagram } from "lucide-react";
import ThemeToggle from "./components/ThemeToggle";

const socialLinks = [
  {
    icon: Github,
    href: "https://github.com/youngkwonko",
    label: "GitHub",
  },
  {
    icon: Mail,
    href: "mailto:youngkwon@example.com",
    label: "Email",
  },
  {
    icon: Linkedin,
    href: "https://linkedin.com/in/youngkwonko",
    label: "LinkedIn",
  },
  {
    icon: Instagram,
    href: "https://instagram.com/youngkwonko",
    label: "Instagram",
  },
];

const navLinks = ["About", "blog", "portfolio"];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-10">
      {/* 태양/달 + 이름 */}
      <div className="flex flex-col items-center">
        <ThemeToggle />
        <h1 className="text-5xl font-light tracking-widest uppercase text-stone-800 dark:text-stone-100 transition-colors duration-300">
          Youngkwon{" "}
          <span className="text-stone-400 dark:text-stone-500">Ko</span>
        </h1>
      </div>

      {/* Social Icons */}
      <div className="flex items-center gap-6">
        {socialLinks.map(({ icon: Icon, href, label }) => (
          <a
            key={label}
            href={href}
            aria-label={label}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 transition-colors duration-200"
          >
            <Icon size={20} strokeWidth={1.5} />
          </a>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-stone-200 dark:bg-stone-700 transition-colors duration-300" />

      {/* Navigation */}
      <nav className="flex items-center gap-10">
        {navLinks.map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase()}`}
            className="text-xs tracking-[0.2em] uppercase text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 transition-colors duration-200"
          >
            {link}
          </a>
        ))}
      </nav>
    </main>
  );
}
