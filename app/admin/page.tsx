"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createSupabaseClient, type Post, type Timeline } from "@/lib/supabase";
import ThemeToggle from "../components/ThemeToggle";

type Category = "dev-log" | "problem-solving" | "paper-review" | "etc";
type Section = "posts" | "timeline";

type PostFormData = {
  title: string;
  slug: string;
  category: Category;
  description: string;
  content: string;
  published: boolean;
};

type TimelineFormData = {
  id?: string;
  start_date: string;
  end_date: string;
  title: string;
  description: string;
  sort_order: number;
};

const emptyPostForm: PostFormData = {
  title: "",
  slug: "",
  category: "dev-log",
  description: "",
  content: "",
  published: true,
};

const emptyTimelineForm: TimelineFormData = {
  start_date: "",
  end_date: "Present",
  title: "",
  description: "",
  sort_order: 0,
};

function autoSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

const categoryLabel: Record<Category, string> = {
  "dev-log": "Dev Log",
  "problem-solving": "Problem Solving",
  "paper-review": "Paper Review",
  etc: "Etc",
};

const inputClass =
  "w-full bg-transparent border-b border-stone-200 dark:border-stone-700/60 py-2 text-sm font-light text-stone-700 dark:text-stone-300 outline-none focus:border-stone-400 dark:focus:border-stone-500 transition-colors duration-200 placeholder:text-stone-200 dark:placeholder:text-stone-700";

// ─── Login Form ───────────────────────────────────────────────────────────────

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    setLoading(false);
    if (res.ok) onLogin();
    else setError("Invalid credentials");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8">
      <div className="w-full max-w-xs">
        <h1 className="text-lg font-light tracking-widest uppercase text-stone-800 dark:text-stone-100 mb-10 text-center transition-colors duration-300">
          Admin
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] tracking-[0.25em] uppercase text-stone-400 dark:text-stone-500">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className={inputClass}
              placeholder="yko081524"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] tracking-[0.25em] uppercase text-stone-400 dark:text-stone-500">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className={inputClass}
            />
          </div>
          {error && (
            <p className="text-[9px] tracking-[0.2em] uppercase text-red-400">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 text-[9px] tracking-[0.3em] uppercase text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-stone-700 py-3 hover:text-stone-700 dark:hover:text-stone-200 hover:border-stone-400 dark:hover:border-stone-500 transition-colors duration-200 cursor-pointer disabled:opacity-50"
          >
            {loading ? "..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Post Editor ──────────────────────────────────────────────────────────────

function PostEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial: PostFormData & { id?: string };
  onSave: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<PostFormData>(initial);
  const [slugManual, setSlugManual] = useState(!!initial.slug);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const set = <K extends keyof PostFormData>(k: K, v: PostFormData[K]) => {
    setForm((f) => {
      const next = { ...f, [k]: v };
      if (k === "title" && !slugManual) next.slug = autoSlug(v as string);
      return next;
    });
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.slug.trim()) {
      setError("Title and slug are required");
      return;
    }
    setSaving(true);
    setError("");
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      category: form.category,
      description: form.description.trim(),
      content: form.content,
      published: form.published,
    };
    const { error: err } = initial.id
      ? await createSupabaseClient().from("posts").update(payload).eq("id", initial.id)
      : await createSupabaseClient().from("posts").insert(payload);
    setSaving(false);
    if (err) setError(err.message);
    else onSave();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (!file.type.startsWith("image/")) { setError("이미지 파일만 업로드 가능합니다"); return; }
    if (file.size > 5 * 1024 * 1024) { setError("이미지는 5MB 이하여야 합니다"); return; }

    setUploading(true);
    setError("");
    const ext = file.name.split(".").pop() ?? "jpg";
    const base = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "-").slice(0, 40);
    const filename = `${Date.now()}-${base}.${ext}`;

    const supabase = createSupabaseClient();
    const { error: uploadError } = await supabase.storage
      .from("blog-images")
      .upload(filename, file, { contentType: file.type });

    if (uploadError) {
      setError(`업로드 실패: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("blog-images").getPublicUrl(filename);
    const markdownImage = `![](${urlData.publicUrl})`;

    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart ?? form.content.length;
      const end = textarea.selectionEnd ?? form.content.length;
      const before = form.content.slice(0, start);
      const after = form.content.slice(end);
      const sep = before.length > 0 && !before.endsWith("\n\n") ? "\n\n" : "";
      set("content", before + sep + markdownImage + "\n\n" + after);
      setTimeout(() => {
        textarea.focus();
        const pos = (before + sep + markdownImage + "\n\n").length;
        textarea.setSelectionRange(pos, pos);
      }, 0);
    } else {
      set("content", form.content + "\n\n" + markdownImage + "\n\n");
    }
    setUploading(false);
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="flex items-center justify-between mb-10 max-w-5xl mx-auto">
        <button
          onClick={onCancel}
          className="text-[9px] tracking-[0.3em] uppercase text-stone-300 dark:text-stone-600 hover:text-stone-600 dark:hover:text-stone-400 transition-colors duration-200 cursor-pointer"
        >
          ← Cancel
        </button>
        <div className="flex items-center gap-4">
          {error && <span className="text-[9px] tracking-[0.15em] uppercase text-red-400">{error}</span>}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || saving}
            className="text-[9px] tracking-[0.3em] uppercase text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-stone-700 px-5 py-2.5 hover:text-stone-700 dark:hover:text-stone-200 hover:border-stone-400 dark:hover:border-stone-500 transition-colors duration-200 cursor-pointer disabled:opacity-40"
          >
            {uploading ? "업로드 중..." : "이미지 업로드"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="text-[9px] tracking-[0.3em] uppercase text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-stone-700 px-5 py-2.5 hover:text-stone-700 dark:hover:text-stone-200 hover:border-stone-400 dark:hover:border-stone-500 transition-colors duration-200 cursor-pointer disabled:opacity-40"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] tracking-[0.25em] uppercase text-stone-400 dark:text-stone-500">Title</label>
            <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} className={inputClass} placeholder="Post title" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] tracking-[0.25em] uppercase text-stone-400 dark:text-stone-500">Slug</label>
            <input type="text" value={form.slug} onChange={(e) => { setSlugManual(true); set("slug", e.target.value); }} className={inputClass} placeholder="post-url-slug" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] tracking-[0.25em] uppercase text-stone-400 dark:text-stone-500">Category</label>
            <select value={form.category} onChange={(e) => set("category", e.target.value as Category)} className="bg-transparent border-b border-stone-200 dark:border-stone-700/60 py-2 text-sm font-light text-stone-700 dark:text-stone-300 outline-none focus:border-stone-400 dark:focus:border-stone-500 transition-colors duration-200 cursor-pointer">
              <option value="dev-log">Dev Log</option>
              <option value="problem-solving">Problem Solving</option>
              <option value="paper-review">Paper Review</option>
              <option value="etc">Etc</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] tracking-[0.25em] uppercase text-stone-400 dark:text-stone-500">Description</label>
            <input type="text" value={form.description} onChange={(e) => set("description", e.target.value)} className={inputClass} placeholder="Short description" />
          </div>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => set("published", !form.published)} className={`w-8 h-4 rounded-full relative transition-colors duration-200 cursor-pointer ${form.published ? "bg-stone-400 dark:bg-stone-500" : "bg-stone-200 dark:bg-stone-700"}`}>
            <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-200 ${form.published ? "translate-x-4" : "translate-x-0.5"}`} />
          </button>
          <span className="text-[9px] tracking-[0.2em] uppercase text-stone-400 dark:text-stone-500">
            {form.published ? "Published" : "Draft"}
          </span>
        </div>

        <div className="flex md:hidden gap-6 mb-4 border-b border-stone-100 dark:border-stone-800/60">
          {(["edit", "preview"] as const).map((tab) => (
            <button key={tab} onClick={() => setMobileTab(tab)} className={`text-[9px] tracking-[0.25em] uppercase pb-2.5 border-b -mb-px transition-colors duration-200 cursor-pointer ${mobileTab === tab ? "text-stone-700 dark:text-stone-200 border-stone-400 dark:border-stone-500" : "text-stone-300 dark:text-stone-600 border-transparent"}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="md:grid md:grid-cols-2 gap-6 h-[60vh]">
          <div className={`h-full ${mobileTab === "preview" ? "hidden md:block" : "block"}`}>
            <label className="hidden md:block text-[9px] tracking-[0.25em] uppercase text-stone-300 dark:text-stone-600 mb-2 transition-colors duration-300">Markdown</label>
            <textarea ref={textareaRef} value={form.content} onChange={(e) => set("content", e.target.value)} className="w-full h-full bg-stone-50/50 dark:bg-stone-900/30 border border-stone-100 dark:border-stone-800/60 rounded-sm p-4 font-mono text-xs text-stone-600 dark:text-stone-400 outline-none focus:border-stone-300 dark:focus:border-stone-600 resize-none transition-colors duration-200 leading-relaxed" placeholder={"# Title\n\nWrite your post in markdown..."} spellCheck={false} />
          </div>
          <div className={`h-full overflow-y-auto ${mobileTab === "edit" ? "hidden md:block" : "block"}`}>
            <label className="hidden md:block text-[9px] tracking-[0.25em] uppercase text-stone-300 dark:text-stone-600 mb-2 transition-colors duration-300">Preview</label>
            <div className="bg-stone-50/50 dark:bg-stone-900/30 border border-stone-100 dark:border-stone-800/60 rounded-sm p-4 h-[calc(100%-1.5rem)] overflow-y-auto prose-blog">
              {form.content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.content}</ReactMarkdown>
              ) : (
                <p className="text-[9px] tracking-[0.3em] uppercase text-stone-200 dark:text-stone-700">Preview will appear here</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Timeline Editor ──────────────────────────────────────────────────────────

function TimelineEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial: TimelineFormData;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<TimelineFormData>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof TimelineFormData>(k: K, v: TimelineFormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim() || !form.start_date.trim() || !form.end_date.trim()) {
      setError("Start date, end date, and title are required");
      return;
    }
    setSaving(true);
    setError("");
    const payload = {
      start_date: form.start_date.trim(),
      end_date: form.end_date.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      sort_order: form.sort_order,
    };
    const { error: err } = form.id
      ? await createSupabaseClient().from("timeline").update(payload).eq("id", form.id)
      : await createSupabaseClient().from("timeline").insert(payload);
    setSaving(false);
    if (err) setError(err.message);
    else onSave();
  };

  return (
    <div className="min-h-screen px-8 py-14 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-16">
        <button
          onClick={onCancel}
          className="text-[9px] tracking-[0.3em] uppercase text-stone-300 dark:text-stone-600 hover:text-stone-600 dark:hover:text-stone-400 transition-colors duration-200 cursor-pointer"
        >
          ← Cancel
        </button>
        <div className="flex items-center gap-4">
          {error && <span className="text-[9px] tracking-[0.15em] uppercase text-red-400">{error}</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-[9px] tracking-[0.3em] uppercase text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-stone-700 px-5 py-2.5 hover:text-stone-700 dark:hover:text-stone-200 hover:border-stone-400 dark:hover:border-stone-500 transition-colors duration-200 cursor-pointer disabled:opacity-40"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-light tracking-widest uppercase text-stone-800 dark:text-stone-100 transition-colors duration-300">
          {form.id ? "Edit Entry" : "New Entry"}
        </h2>
      </div>

      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] tracking-[0.25em] uppercase text-stone-400 dark:text-stone-500">
              Start Date
            </label>
            <input
              type="text"
              value={form.start_date}
              onChange={(e) => set("start_date", e.target.value)}
              className={inputClass}
              placeholder="2023.03"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] tracking-[0.25em] uppercase text-stone-400 dark:text-stone-500">
              End Date
            </label>
            <input
              type="text"
              value={form.end_date}
              onChange={(e) => set("end_date", e.target.value)}
              className={inputClass}
              placeholder="Present"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] tracking-[0.25em] uppercase text-stone-400 dark:text-stone-500">
            Title
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className={inputClass}
            placeholder="Yonsei University, Dept. of AI"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] tracking-[0.25em] uppercase text-stone-400 dark:text-stone-500">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className="w-full bg-transparent border-b border-stone-200 dark:border-stone-700/60 py-2 text-sm font-light text-stone-700 dark:text-stone-300 outline-none focus:border-stone-400 dark:focus:border-stone-500 transition-colors duration-200 placeholder:text-stone-200 dark:placeholder:text-stone-700 resize-none"
            rows={3}
            placeholder="Undergraduate student studying AI..."
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] tracking-[0.25em] uppercase text-stone-400 dark:text-stone-500">
            Order (낮을수록 위에 표시)
          </label>
          <input
            type="number"
            value={form.sort_order}
            onChange={(e) => set("sort_order", parseInt(e.target.value) || 0)}
            className={inputClass}
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Admin Panel (Posts + Timeline tabs) ──────────────────────────────────────

function AdminPanel({
  posts,
  timeline,
  section,
  onSectionChange,
  onNewPost,
  onEditPost,
  onRefreshPosts,
  onNewTimeline,
  onEditTimeline,
  onRefreshTimeline,
}: {
  posts: Post[];
  timeline: Timeline[];
  section: Section;
  onSectionChange: (s: Section) => void;
  onNewPost: () => void;
  onEditPost: (post: Post) => void;
  onRefreshPosts: () => void;
  onNewTimeline: () => void;
  onEditTimeline: (item: Timeline) => void;
  onRefreshTimeline: () => void;
}) {
  const [deletingPost, setDeletingPost] = useState<string | null>(null);
  const [deletingTimeline, setDeletingTimeline] = useState<string | null>(null);

  const handleDeletePost = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    setDeletingPost(id);
    await createSupabaseClient().from("posts").delete().eq("id", id);
    setDeletingPost(null);
    onRefreshPosts();
  };

  const handleDeleteTimeline = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    setDeletingTimeline(id);
    await createSupabaseClient().from("timeline").delete().eq("id", id);
    setDeletingTimeline(null);
    onRefreshTimeline();
  };

  return (
    <div className="min-h-screen px-8 py-14 max-w-xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-12">
        <Link
          href="/"
          className="text-[9px] tracking-[0.3em] uppercase text-stone-300 dark:text-stone-600 hover:text-stone-600 dark:hover:text-stone-400 transition-colors duration-200"
        >
          ← Home
        </Link>
        <div className="flex items-center gap-6">
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.reload();
            }}
            className="text-[9px] tracking-[0.25em] uppercase text-stone-300 dark:text-stone-600 hover:text-stone-500 dark:hover:text-stone-400 transition-colors duration-200 cursor-pointer"
          >
            Logout
          </button>
          <ThemeToggle compact />
        </div>
      </header>

      {/* Tab bar */}
      <div className="flex gap-8 mb-12 border-b border-stone-100 dark:border-stone-800/60">
        {(["posts", "timeline"] as Section[]).map((tab) => (
          <button
            key={tab}
            onClick={() => onSectionChange(tab)}
            className={`text-[9px] tracking-[0.25em] uppercase pb-3 border-b -mb-px transition-colors duration-200 cursor-pointer ${
              section === tab
                ? "text-stone-700 dark:text-stone-200 border-stone-400 dark:border-stone-500"
                : "text-stone-300 dark:text-stone-600 border-transparent hover:text-stone-500 dark:hover:text-stone-400"
            }`}
          >
            {tab === "posts" ? "Posts" : "Timeline"}
          </button>
        ))}
      </div>

      {/* ── Posts tab ───────────────────────────────── */}
      {section === "posts" && (
        <>
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-2xl font-light tracking-widest uppercase text-stone-800 dark:text-stone-100 transition-colors duration-300">
                Posts
              </h1>
              <p className="mt-1.5 text-[9px] tracking-[0.3em] uppercase text-stone-400 dark:text-stone-500 transition-colors duration-300">
                {posts.length} post{posts.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={onNewPost}
              className="text-[9px] tracking-[0.3em] uppercase text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-stone-700 px-5 py-2.5 hover:text-stone-700 dark:hover:text-stone-200 hover:border-stone-400 dark:hover:border-stone-500 transition-colors duration-200 cursor-pointer"
            >
              + New Post
            </button>
          </div>

          {posts.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-[9px] tracking-[0.4em] uppercase text-stone-200 dark:text-stone-700">
                No posts yet
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-stone-100 dark:divide-stone-800/60">
              {posts.map((post) => (
                <li key={post.id} className="py-6 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                      <time className="text-[9px] tracking-[0.2em] uppercase text-stone-300 dark:text-stone-600 transition-colors duration-300">
                        {fmtDate(post.created_at)}
                      </time>
                      <span className="text-[8px] tracking-[0.15em] uppercase text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-stone-700/80 px-1.5 py-0.5 transition-colors duration-300">
                        {categoryLabel[post.category as Category]}
                      </span>
                      {!post.published && (
                        <span className="text-[8px] tracking-[0.15em] uppercase text-stone-300 dark:text-stone-600">
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-light tracking-wide text-stone-700 dark:text-stone-300 truncate transition-colors duration-300">
                      {post.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <button
                      onClick={() => onEditPost(post)}
                      className="text-[9px] tracking-[0.2em] uppercase text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors duration-200 cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id, post.title)}
                      disabled={deletingPost === post.id}
                      className="text-[9px] tracking-[0.2em] uppercase text-stone-300 dark:text-stone-600 hover:text-red-400 dark:hover:text-red-400 transition-colors duration-200 cursor-pointer disabled:opacity-40"
                    >
                      {deletingPost === post.id ? "..." : "Delete"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* ── Timeline tab ─────────────────────────────── */}
      {section === "timeline" && (
        <>
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-2xl font-light tracking-widest uppercase text-stone-800 dark:text-stone-100 transition-colors duration-300">
                Timeline
              </h1>
              <p className="mt-1.5 text-[9px] tracking-[0.3em] uppercase text-stone-400 dark:text-stone-500 transition-colors duration-300">
                {timeline.length} entr{timeline.length !== 1 ? "ies" : "y"}
              </p>
            </div>
            <button
              onClick={onNewTimeline}
              className="text-[9px] tracking-[0.3em] uppercase text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-stone-700 px-5 py-2.5 hover:text-stone-700 dark:hover:text-stone-200 hover:border-stone-400 dark:hover:border-stone-500 transition-colors duration-200 cursor-pointer"
            >
              + New Entry
            </button>
          </div>

          {timeline.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-[9px] tracking-[0.4em] uppercase text-stone-200 dark:text-stone-700">
                No entries yet
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-stone-100 dark:divide-stone-800/60">
              {timeline.map((item) => (
                <li key={item.id} className="py-6 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[9px] tracking-[0.2em] uppercase text-stone-300 dark:text-stone-600 mb-1.5 transition-colors duration-300">
                      {item.start_date} — {item.end_date}
                      <span className="ml-3 text-stone-200 dark:text-stone-700">
                        order {item.sort_order}
                      </span>
                    </p>
                    <p className="text-sm font-light tracking-wide text-stone-700 dark:text-stone-300 transition-colors duration-300">
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="mt-0.5 text-[11px] text-stone-400 dark:text-stone-500 transition-colors duration-300 truncate max-w-xs">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <button
                      onClick={() => onEditTimeline(item)}
                      className="text-[9px] tracking-[0.2em] uppercase text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors duration-200 cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTimeline(item.id, item.title)}
                      disabled={deletingTimeline === item.id}
                      className="text-[9px] tracking-[0.2em] uppercase text-stone-300 dark:text-stone-600 hover:text-red-400 dark:hover:text-red-400 transition-colors duration-200 cursor-pointer disabled:opacity-40"
                    >
                      {deletingTimeline === item.id ? "..." : "Delete"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

// ─── Admin Page Root ──────────────────────────────────────────────────────────

type PostEditorState =
  | { mode: "none" }
  | { mode: "new" }
  | { mode: "edit"; post: Post };

type TimelineEditorState =
  | { mode: "none" }
  | { mode: "new" }
  | { mode: "edit"; item: Timeline };

export default function AdminPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [timeline, setTimeline] = useState<Timeline[]>([]);
  const [postEditor, setPostEditor] = useState<PostEditorState>({ mode: "none" });
  const [timelineEditor, setTimelineEditor] = useState<TimelineEditorState>({ mode: "none" });
  const [section, setSection] = useState<Section>("posts");

  const checkAuth = async () => {
    const res = await fetch("/api/auth/check");
    const { ok } = await res.json();
    setAuthed(ok);
    setAuthChecked(true);
  };

  const fetchPosts = async () => {
    const { data } = await createSupabaseClient()
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    setPosts((data as Post[]) ?? []);
  };

  const fetchTimeline = async () => {
    const { data } = await createSupabaseClient()
      .from("timeline")
      .select("*")
      .order("sort_order", { ascending: true });
    setTimeline((data as Timeline[]) ?? []);
  };

  useEffect(() => { checkAuth(); }, []);
  useEffect(() => {
    if (authed) { fetchPosts(); fetchTimeline(); }
  }, [authed]);

  if (!authChecked) return null;

  if (!authed) {
    return (
      <LoginForm
        onLogin={() => {
          setAuthed(true);
          fetchPosts();
          fetchTimeline();
        }}
      />
    );
  }

  if (postEditor.mode === "new") {
    return (
      <PostEditor
        initial={{ ...emptyPostForm }}
        onSave={() => { setPostEditor({ mode: "none" }); fetchPosts(); }}
        onCancel={() => setPostEditor({ mode: "none" })}
      />
    );
  }

  if (postEditor.mode === "edit") {
    const p = postEditor.post;
    return (
      <PostEditor
        initial={{ id: p.id, title: p.title, slug: p.slug, category: p.category, description: p.description, content: p.content, published: p.published }}
        onSave={() => { setPostEditor({ mode: "none" }); fetchPosts(); }}
        onCancel={() => setPostEditor({ mode: "none" })}
      />
    );
  }

  if (timelineEditor.mode === "new") {
    return (
      <TimelineEditor
        initial={{ ...emptyTimelineForm, sort_order: timeline.length }}
        onSave={() => { setTimelineEditor({ mode: "none" }); fetchTimeline(); }}
        onCancel={() => setTimelineEditor({ mode: "none" })}
      />
    );
  }

  if (timelineEditor.mode === "edit") {
    const t = timelineEditor.item;
    return (
      <TimelineEditor
        initial={{ id: t.id, start_date: t.start_date, end_date: t.end_date, title: t.title, description: t.description, sort_order: t.sort_order }}
        onSave={() => { setTimelineEditor({ mode: "none" }); fetchTimeline(); }}
        onCancel={() => setTimelineEditor({ mode: "none" })}
      />
    );
  }

  return (
    <AdminPanel
      posts={posts}
      timeline={timeline}
      section={section}
      onSectionChange={setSection}
      onNewPost={() => setPostEditor({ mode: "new" })}
      onEditPost={(post) => setPostEditor({ mode: "edit", post })}
      onRefreshPosts={fetchPosts}
      onNewTimeline={() => setTimelineEditor({ mode: "new" })}
      onEditTimeline={(item) => setTimelineEditor({ mode: "edit", item })}
      onRefreshTimeline={fetchTimeline}
    />
  );
}
