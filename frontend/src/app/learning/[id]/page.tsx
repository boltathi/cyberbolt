import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Tag,
  ExternalLink,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { learningAPI } from "@/lib/api";
import { formatDate, DIFFICULTY_COLORS, SITE_URL } from "@/lib/utils";
import type { Metadata } from "next";
import type { LearningResource } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const resource = await learningAPI.get(id);
    const desc =
      resource.meta_description ||
      resource.excerpt ||
      resource.description ||
      "";
    return {
      title: resource.meta_title || resource.title,
      description: desc,
      openGraph: {
        title: resource.meta_title || resource.title,
        description: desc,
        type: "article",
        publishedTime: resource.created_at,
        modifiedTime: resource.updated_at,
      },
    };
  } catch {
    return { title: "Resource Not Found" };
  }
}

export default async function LearningDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let resource: LearningResource;
  try {
    resource = await learningAPI.get(id);
  } catch {
    notFound();
  }

  const description = resource.content || resource.description || resource.excerpt || "";
  const difficultyClass = DIFFICULTY_COLORS[resource.difficulty] || "";

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LearningResource",
            name: resource.title,
            description:
              resource.excerpt || resource.description || "",
            url: `${SITE_URL}/learning/${resource.id}`,
            datePublished: resource.created_at,
            dateModified: resource.updated_at,
            educationalLevel: resource.difficulty,
            learningResourceType: resource.resource_type || "article",
            isAccessibleForFree: resource.is_free ?? true,
            provider: {
              "@type": "Organization",
              name: "CyberBolt",
              url: SITE_URL,
            },
          }),
        }}
      />

      {/* Back link */}
      <Link
        href="/learning"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Learning Hub
      </Link>

      {/* Header */}
      <header className="mb-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-cyber-400/10 px-3 py-1 text-sm font-medium text-cyber-400">
            <BookOpen className="h-3.5 w-3.5" />
            {resource.category}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${difficultyClass}`}
          >
            {resource.difficulty}
          </span>
          {resource.resource_type && (
            <span className="rounded-full bg-gray-800 px-3 py-1 text-sm font-medium text-gray-300">
              {resource.resource_type}
            </span>
          )}
          {resource.is_free !== undefined && (
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                resource.is_free
                  ? "bg-green-500/20 text-green-400"
                  : "bg-orange-500/20 text-orange-400"
              }`}
            >
              {resource.is_free ? "Free" : "Paid"}
            </span>
          )}
        </div>

        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          {resource.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDate(resource.created_at)}
          </span>
          {resource.estimated_minutes && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {resource.estimated_minutes >= 60
                ? `${Math.floor(resource.estimated_minutes / 60)}h ${resource.estimated_minutes % 60}m`
                : `${resource.estimated_minutes} min`}
            </span>
          )}
          <span className="flex items-center gap-1">
            <GraduationCap className="h-4 w-4" />
            {resource.difficulty}
          </span>
        </div>

        {resource.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {resource.tags.map((tag) => (
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

      {/* External link CTA */}
      {resource.external_url && (
        <div className="mb-8 rounded-lg border border-cyber-400/20 bg-cyber-400/5 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Access this resource
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                This resource is hosted externally.{" "}
                {resource.is_free ? "It's free to access." : ""}
              </p>
            </div>
            <a
              href={resource.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="cyber-btn inline-flex items-center gap-2 whitespace-nowrap"
            >
              Open Resource <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}

      {/* Content body */}
      {description ? (
        <div
          className="prose-cyber"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      ) : (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center">
          <BookOpen className="mx-auto mb-4 h-10 w-10 text-gray-600" />
          <p className="text-gray-400">
            No additional content available for this resource.
          </p>
          {resource.external_url && (
            <a
              href={resource.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="cyber-btn mt-4 inline-flex items-center gap-2"
            >
              Visit External Resource <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      )}
    </article>
  );
}
