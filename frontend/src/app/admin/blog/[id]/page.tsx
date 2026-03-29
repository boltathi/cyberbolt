"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { blogAPI } from "@/lib/api";
import RichTextEditor from "@/components/editor/RichTextEditor";

export default function AdminBlogEditorPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === "new";

  const [form, setForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    tags: "",
    published: false,
    meta_title: "",
    meta_description: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isNew) {
      loadPost();
    }
  }, [id]);

  const loadPost = async () => {
    try {
      const data = await blogAPI.adminList(1, 100);
      const post = data.items.find((p) => p.id === id);
      if (post) {
        setForm({
          title: post.title,
          content: post.content,
          excerpt: post.excerpt,
          tags: post.tags.join(", "),
          published: post.published,
          meta_title: post.meta_title || "",
          meta_description: post.meta_description || "",
        });
      }
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    try {
      if (isNew) {
        await blogAPI.create(payload);
      } else {
        await blogAPI.update(id, payload);
      }
      router.push("/admin/blog");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <Link href="/admin/blog" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-white">
          {isNew ? "New Blog Post" : "Edit Blog Post"}
        </h1>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="cyber-card space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Title *</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="cyber-input" placeholder="Blog post title" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Excerpt *</label>
            <textarea required rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="cyber-textarea" placeholder="Brief description" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Content *</label>
            <RichTextEditor
              required
              value={form.content}
              onChange={(content) => setForm({ ...form, content })}
              placeholder="Write your blog post..."
              rows={20}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Tags</label>
            <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="cyber-input" placeholder="tag1, tag2" />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="rounded border-white/10 bg-gray-900" />
            Published
          </label>
        </div>

        <div className="cyber-card space-y-4">
          <h2 className="text-lg font-semibold text-white">SEO Settings</h2>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Meta Title</label>
            <input value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} className="cyber-input" placeholder="Custom meta title" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Meta Description</label>
            <textarea rows={2} value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} className="cyber-textarea" placeholder="Custom meta description" />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="cyber-btn gap-2">
            <Save className="h-4 w-4" /> {saving ? "Saving..." : isNew ? "Create Post" : "Update Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
