import Link from "next/link";
import { blogAPI } from "@/lib/api";
import { formatDate, truncate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Lifestyle blog posts, personal thoughts, and reflections from CyberBolt.",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");

  let data;
  try {
    data = await blogAPI.list(page, 12);
  } catch {
    data = { items: [], total: 0, page: 1, per_page: 12, total_pages: 0 };
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Blog</h1>
        <p className="mt-2 text-gray-400">
          Personal thoughts, lifestyle musings, and reflections.
        </p>
      </div>

      {data.items.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.items.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="cyber-card group"
            >
              <h2 className="mb-2 text-lg font-semibold text-white group-hover:text-cyber-400 transition-colors">
                {post.title}
              </h2>
              <p className="mb-4 text-sm text-gray-400">
                {truncate(post.excerpt, 140)}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{formatDate(post.created_at)}</span>
                {post.reading_time && <span>{post.reading_time} min read</span>}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-gray-500">
          No blog posts yet. Check back soon!
        </div>
      )}

      {data.total_pages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link href={`/blog?page=${page - 1}`} className="cyber-btn-outline text-sm">
              Previous
            </Link>
          )}
          <span className="px-4 text-sm text-gray-400">
            Page {page} of {data.total_pages}
          </span>
          {page < data.total_pages && (
            <Link href={`/blog?page=${page + 1}`} className="cyber-btn-outline text-sm">
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
