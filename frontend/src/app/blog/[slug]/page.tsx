import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import { blogAPI } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { BlogPostJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await blogAPI.get(slug);
    return {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt,
      openGraph: {
        title: post.meta_title || post.title,
        description: post.meta_description || post.excerpt,
        type: "article",
        publishedTime: post.created_at,
        modifiedTime: post.updated_at,
      },
    };
  } catch {
    return { title: "Post Not Found" };
  }
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let post;
  try {
    post = await blogAPI.get(slug);
  } catch {
    notFound();
  }

  return (
    <>
      <BlogPostJsonLd
        title={post.title}
        description={post.excerpt}
        url={`${SITE_URL}/blog/${post.slug}`}
        datePublished={post.created_at}
        dateModified={post.updated_at}
      />
      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/blog"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            {post.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(post.created_at)}
            </span>
            {post.reading_time && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.reading_time} min read
              </span>
            )}
          </div>
          {post.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-300"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="prose-cyber whitespace-pre-wrap">{post.content}</div>
      </article>
    </>
  );
}
