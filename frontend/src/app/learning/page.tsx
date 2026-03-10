import Link from "next/link";
import { BookOpen, GraduationCap, ArrowRight } from "lucide-react";
import { learningAPI } from "@/lib/api";
import { DIFFICULTY_COLORS } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learning Hub",
  description: "Structured learning paths and resources for mastering AI security concepts.",
};

export default async function LearningPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; path?: string }>;
}) {
  const params = await searchParams;
  const selectedCategory = params.category;
  let categories: Array<{ id: string; name: string; description: string; icon: string; count: number }> = [];
  let paths: Array<{ id: string; title: string; description: string; difficulty: string; estimated_hours: number; topics: string[] }> = [];
  let resources = { items: [], total: 0, page: 1, per_page: 20, total_pages: 0 };

  try {
    const catData = await learningAPI.categories();
    categories = catData.categories || [];
  } catch {}

  try {
    const pathData = await learningAPI.paths();
    paths = pathData.paths || [];
  } catch {}

  try {
    resources = await learningAPI.resources(selectedCategory) as typeof resources;
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
      {categories.length > 0 && (
        <section className="mb-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Categories</h2>
            {selectedCategory && (
              <Link href="/learning" className="text-sm text-cyber-400 hover:text-cyber-300 transition-colors">
                Show all →
              </Link>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/learning?category=${cat.id}`} className="cyber-card text-center transition-colors hover:border-cyber-400/40">
                <div className="mb-3 text-3xl">{cat.icon}</div>
                <h3 className="font-semibold text-white">{cat.name}</h3>
                <p className="mt-1 text-sm text-gray-400">{cat.description}</p>
                {cat.count > 0 && <p className="mt-2 text-xs text-cyber-400">{cat.count} resources</p>}
              </Link>
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
              <Link key={path.id} href={`/learning?path=${path.id}`} className="cyber-card transition-colors hover:border-cyber-400/40">
                <BookOpen className="mb-3 h-6 w-6 text-cyber-400" />
                <h3 className="text-lg font-semibold text-white">{path.title}</h3>
                <p className="mt-2 text-sm text-gray-400">{path.description}</p>
                <p className="mt-3 text-xs text-gray-500">
                  {path.topics.length} topics · {path.estimated_hours}h
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Resources */}
      {resources.items.length > 0 && (
        <section>
          <h2 className="mb-6 text-2xl font-bold text-white">All Resources</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resources.items.map((resource: { id: string; title: string; slug?: string; excerpt: string; category: string; difficulty: string }) => (
              <Link key={resource.id} href={`/learning/${resource.slug || resource.id}`} className="cyber-card transition-colors hover:border-cyber-400/40">
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
              </Link>
            ))}
          </div>
        </section>
      )}

      {resources.items.length === 0 && categories.length === 0 && (
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
