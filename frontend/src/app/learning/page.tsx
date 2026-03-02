import Link from "next/link";
import { BookOpen, GraduationCap, ArrowRight } from "lucide-react";
import { learningAPI } from "@/lib/api";
import { DIFFICULTY_COLORS } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learning Hub",
  description: "Structured learning paths and resources for mastering AI security concepts.",
};

export default async function LearningPage() {
  let categories: Record<string, { name: string; description: string; icon: string }> = {};
  let paths: Array<{ id: string; name: string; description: string; resources: string[] }> = [];
  let resources = { items: [], total: 0, page: 1, per_page: 20, total_pages: 0 };

  try {
    const catData = await learningAPI.categories();
    categories = catData.categories || {};
  } catch {}

  try {
    const pathData = await learningAPI.paths();
    paths = pathData.paths || [];
  } catch {}

  try {
    resources = await learningAPI.resources() as typeof resources;
  } catch {}

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyber-400/30 bg-cyber-400/10 px-4 py-1.5 text-sm text-cyber-400">
          <GraduationCap className="h-4 w-4" />
          Learning Hub
        </div>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Master AI Security
        </h1>
        <p className="mt-4 text-lg text-gray-400">
          Structured learning paths and curated resources to build your expertise.
        </p>
      </div>

      {/* Categories */}
      {Object.keys(categories).length > 0 && (
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-bold text-white">Categories</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(categories).map(([key, cat]) => (
              <div key={key} className="cyber-card text-center">
                <div className="mb-3 text-3xl">{cat.icon}</div>
                <h3 className="font-semibold text-white">{cat.name}</h3>
                <p className="mt-1 text-sm text-gray-400">{cat.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Learning Paths */}
      {paths.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-bold text-white">Learning Paths</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {paths.map((path) => (
              <div key={path.id} className="cyber-card">
                <BookOpen className="mb-3 h-6 w-6 text-cyber-400" />
                <h3 className="text-lg font-semibold text-white">{path.name}</h3>
                <p className="mt-2 text-sm text-gray-400">{path.description}</p>
                <p className="mt-3 text-xs text-gray-500">
                  {path.resources.length} resources
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Resources */}
      {resources.items.length > 0 && (
        <section>
          <h2 className="mb-6 text-2xl font-bold text-white">All Resources</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resources.items.map((resource: { id: string; title: string; excerpt: string; category: string; difficulty: string }) => (
              <div key={resource.id} className="cyber-card">
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-full bg-cyber-400/10 px-3 py-1 text-xs font-medium text-cyber-400">
                    {resource.category}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${DIFFICULTY_COLORS[resource.difficulty] || ""}`}>
                    {resource.difficulty}
                  </span>
                </div>
                <h3 className="font-semibold text-white">{resource.title}</h3>
                <p className="mt-2 text-sm text-gray-400">{resource.excerpt}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {resources.items.length === 0 && Object.keys(categories).length === 0 && (
        <div className="py-20 text-center">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-600" />
          <p className="text-gray-500">Learning resources are coming soon!</p>
          <Link href="/articles" className="cyber-btn mt-6 gap-2">
            Read Articles <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
