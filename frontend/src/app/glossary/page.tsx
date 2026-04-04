import Link from "next/link";
import { BookOpen, Search, Shield } from "lucide-react";
import { glossaryAPI } from "@/lib/api";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cybersecurity Glossary — CyberBolt",
  description:
    "A comprehensive glossary of 60+ cybersecurity terms, from Access Control to Zero Trust. Learn the essential vocabulary for security professionals.",
};

export default async function GlossaryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() || "";
  const category = params.category || "";

  let data;
  try {
    data = await glossaryAPI.list(query, category);
  } catch {
    data = { terms: [], total: 0, categories: [] };
  }

  // Group terms by first letter
  const grouped: Record<string, typeof data.terms> = {};
  for (const term of data.terms) {
    const letter = term.term[0].toUpperCase();
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(term);
  }
  const letters = Object.keys(grouped).sort();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyber-400/30 bg-cyber-400/10 px-4 py-1.5 text-sm text-cyber-400">
          <BookOpen className="h-4 w-4" />
          {data.total} Terms
        </div>
        <h1 className="text-3xl font-bold text-white">Cybersecurity Glossary</h1>
        <p className="mt-2 text-gray-400">
          Essential cybersecurity terminology explained in plain language. From fundamentals to advanced concepts.
        </p>
      </div>

      {/* Search */}
      <form action="/glossary" method="GET" className="mb-6">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search terms..."
            className="cyber-input w-full pl-10"
          />
          {category && <input type="hidden" name="category" value={category} />}
        </div>
      </form>

      {/* Category filters */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/glossary"
          className={`rounded-full px-3 py-1 text-sm transition-colors ${
            !category
              ? "bg-cyber-400/20 text-cyber-400"
              : "bg-gray-800 text-gray-400 hover:text-white"
          }`}
        >
          All
        </Link>
        {data.categories.map((cat) => (
          <Link
            key={cat.name}
            href={`/glossary?category=${encodeURIComponent(cat.name)}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
            className={`rounded-full px-3 py-1 text-sm transition-colors ${
              category === cat.name
                ? "bg-cyber-400/20 text-cyber-400"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {cat.name} ({cat.count})
          </Link>
        ))}
      </div>

      {/* Alpha jump bar */}
      {letters.length > 3 && (
        <div className="mb-6 flex flex-wrap gap-1">
          {letters.map((letter) => (
            <a
              key={letter}
              href={`#letter-${letter}`}
              className="flex h-8 w-8 items-center justify-center rounded bg-gray-800/50 text-xs font-bold text-gray-400 hover:bg-cyber-400/20 hover:text-cyber-400 transition-colors"
            >
              {letter}
            </a>
          ))}
        </div>
      )}

      {/* Search results info */}
      {(query || category) && (
        <div className="mb-6 flex items-center justify-between rounded-lg border border-white/10 bg-gray-900/50 px-4 py-3">
          <p className="text-sm text-gray-400">
            {data.total} term{data.total !== 1 ? "s" : ""} found
            {query && (
              <>
                {" "}for <span className="font-medium text-cyber-400">&ldquo;{query}&rdquo;</span>
              </>
            )}
            {category && (
              <>
                {" "}in <span className="font-medium text-white">{category}</span>
              </>
            )}
          </p>
          <Link href="/glossary" className="text-sm text-cyber-400 hover:underline">
            Clear filters
          </Link>
        </div>
      )}

      {/* Terms */}
      {letters.length > 0 ? (
        <div className="space-y-10">
          {letters.map((letter) => (
            <section key={letter} id={`letter-${letter}`}>
              <h2 className="mb-4 flex items-center gap-3 text-2xl font-bold text-white">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyber-400/10 text-cyber-400">
                  {letter}
                </span>
                <span className="h-px flex-1 bg-white/10" />
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {grouped[letter].map((term) => (
                  <div
                    key={term.slug}
                    className="rounded-xl border border-white/10 bg-gray-900/50 p-5 hover:border-cyber-400/20 transition-colors"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-white">{term.term}</h3>
                      <span className="whitespace-nowrap rounded-full bg-gray-800 px-2 py-0.5 text-[10px] font-medium text-gray-400">
                        {term.category}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-400">
                      {term.definition}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <Shield className="mx-auto mb-4 h-12 w-12 text-gray-700" />
          <p className="text-gray-500">No terms found. Try a different search.</p>
        </div>
      )}

      {/* CTA */}
      <div className="mt-16 rounded-xl border border-white/10 bg-gray-900/50 p-8 text-center">
        <h2 className="mb-2 text-xl font-bold text-white">Want to go deeper?</h2>
        <p className="mb-6 text-gray-400">
          Read our in-depth articles that explain these concepts with real-world examples and code.
        </p>
        <Link href="/articles" className="cyber-btn">
          Browse Articles →
        </Link>
      </div>
    </div>
  );
}
