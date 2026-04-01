import Link from "next/link";
import { Search, X as XIcon } from "lucide-react";
import { articlesAPI } from "@/lib/api";
import { formatDate, truncate, CATEGORIES } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Articles",
  description: "In-depth articles on AI security, machine learning, cybersecurity, and technology.",
};

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const category = params.category;
  const query = params.q?.trim() || "";

  let data;
  let isSearchMode = false;
  try {
    if (query) {
      isSearchMode = true;
      const articles = await articlesAPI.search(query);
      data = { items: articles, total: articles.length, page: 1, per_page: articles.length, total_pages: 1 };
    } else {
      data = await articlesAPI.list(page, 12, category);
    }
  } catch {
    data = { items: [], total: 0, page: 1, per_page: 12, total_pages: 0 };
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Articles</h1>
        <p className="mt-2 text-gray-400">
          Explore our collection of in-depth articles on AI security and technology.
        </p>
      </div>

      {/* Search Bar */}
      <form action="/articles" method="GET" className="mb-6">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search articles..."
            className="cyber-input w-full pl-10 pr-10"
          />
          {query && (
            <Link
              href="/articles"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              aria-label="Clear search"
            >
              <XIcon className="h-5 w-5" />
            </Link>
          )}
        </div>
      </form>

      {/* Search result info */}
      {isSearchMode && (
        <div className="mb-6 flex items-center justify-between rounded-lg border border-white/10 bg-gray-900/50 px-4 py-3">
          <p className="text-sm text-gray-400">
            Found <span className="font-medium text-white">{data.total}</span> result{data.total !== 1 ? "s" : ""} for{" "}
            <span className="font-medium text-cyber-400">&ldquo;{query}&rdquo;</span>
          </p>
          <Link href="/articles" className="text-sm text-cyber-400 hover:underline">
            Clear search
          </Link>
        </div>
      )}

      {/* Category Filters (hide during search) */}
      {!isSearchMode && (
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href="/articles"
            className={`rounded-full px-3 py-1 text-sm transition-colors ${
              !category
                ? "bg-cyber-400/20 text-cyber-400"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            All
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/articles?category=${encodeURIComponent(cat)}`}
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                category === cat
                  ? "bg-cyber-400/20 text-cyber-400"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>
      )}

      {/* Articles Grid */}
      {data.items.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.items.map((article) => (
            <Link
              key={article.id}
              href={`/articles/${article.slug}`}
              className="cyber-card group"
            >
              <div className="mb-3 inline-flex rounded-full bg-cyber-400/10 px-3 py-1 text-xs font-medium text-cyber-400">
                {article.category}
              </div>
              <h2 className="mb-2 text-lg font-semibold text-white group-hover:text-cyber-400 transition-colors">
                {article.title}
              </h2>
              <p className="mb-4 text-sm text-gray-400">
                {truncate(article.excerpt, 140)}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{formatDate(article.created_at)}</span>
                {article.reading_time && (
                  <span>{article.reading_time} min read</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-gray-500">
          No articles found. Check back soon!
        </div>
      )}

      {/* Pagination (hide during search) */}
      {!isSearchMode && data.total_pages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/articles?page=${page - 1}${category ? `&category=${category}` : ""}`}
              className="cyber-btn-outline text-sm"
            >
              Previous
            </Link>
          )}
          <span className="px-4 text-sm text-gray-400">
            Page {page} of {data.total_pages}
          </span>
          {page < data.total_pages && (
            <Link
              href={`/articles?page=${page + 1}${category ? `&category=${category}` : ""}`}
              className="cyber-btn-outline text-sm"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
