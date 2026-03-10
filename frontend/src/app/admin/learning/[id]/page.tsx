"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { learningAPI } from "@/lib/api";

const LEARNING_CATEGORIES = [
  "ai_fundamentals",
  "adversarial_ml",
  "llm_security",
  "network_security",
  "web_security",
  "cryptography",
  "privacy",
  "incident_response",
];

const DIFFICULTIES = ["beginner", "intermediate", "advanced"];

export default function AdminLearningEditorPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === "new";

  const [form, setForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: LEARNING_CATEGORIES[0],
    difficulty: "beginner",
    tags: "",
    published: false,
    order: 0,
    meta_title: "",
    meta_description: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isNew) {
      loadResource();
    }
  }, [id]);

  const loadResource = async () => {
    try {
      const data = await learningAPI.adminList(1, 100);
      const resource = data.items.find((r) => r.id === id);
      if (resource) {
        setForm({
          title: resource.title,
          content: resource.content,
          excerpt: resource.excerpt,
          category: resource.category,
          difficulty: resource.difficulty,
          tags: resource.tags.join(", "),
          published: resource.published,
          order: resource.order,
          meta_title: resource.meta_title || "",
          meta_description: resource.meta_description || "",
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
      difficulty: form.difficulty as "beginner" | "intermediate" | "advanced",
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    try {
      if (isNew) {
        await learningAPI.create(payload);
      } else {
        await learningAPI.update(id, payload);
      }
      router.push("/admin/learning");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <Link href="/admin/learning" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to Learning
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-white">
          {isNew ? "New Learning Resource" : "Edit Learning Resource"}
        </h1>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="cyber-card space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Title *</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="cyber-input" placeholder="Resource title" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Excerpt *</label>
            <textarea required rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="cyber-textarea" placeholder="Brief description" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Content *</label>
            <textarea required rows={15} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="cyber-textarea font-mono text-sm" placeholder="Resource content..." />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">Category *</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="cyber-input">
                {LEARNING_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">Difficulty *</label>
              <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="cyber-input">
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">Order</label>
              <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} className="cyber-input" />
            </div>
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
            <input value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} className="cyber-input" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Meta Description</label>
            <textarea rows={2} value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} className="cyber-textarea" />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="cyber-btn gap-2">
            <Save className="h-4 w-4" /> {saving ? "Saving..." : isNew ? "Create Resource" : "Update Resource"}
          </button>
        </div>
      </form>
    </div>
  );
}
