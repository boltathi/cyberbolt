import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import { articlesAPI } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { ArticleJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const article = await articlesAPI.get(slug);
    return {
      title: article.meta_title || article.title,
      description: article.meta_description || article.excerpt,
      openGraph: {
        title: article.meta_title || article.title,
        description: article.meta_description || article.excerpt,
        type: "article",
        publishedTime: article.created_at,
        modifiedTime: article.updated_at,
        images: article.og_image ? [article.og_image] : [],
      },
    };
  } catch {
    return { title: "Article Not Found" };
  }
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let article;
  try {
    article = await articlesAPI.get(slug);
  } catch {
    notFound();
  }

  return (
    <>
      <ArticleJsonLd
        title={article.title}
        description={article.excerpt}
        url={`${SITE_URL}/articles/${article.slug}`}
        datePublished={article.created_at}
        dateModified={article.updated_at}
        image={article.og_image}
      />
      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/articles"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Articles
        </Link>

        <header className="mb-8">
          <div className="mb-4 inline-flex rounded-full bg-cyber-400/10 px-3 py-1 text-sm font-medium text-cyber-400">
            {article.category}
          </div>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            {article.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(article.created_at)}
            </span>
            {article.reading_time && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {article.reading_time} min read
              </span>
            )}
          </div>
          {article.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
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

        <div
          className="prose-cyber"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>
    </>
  );
}
