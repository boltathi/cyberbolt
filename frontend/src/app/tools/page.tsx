import Link from "next/link";
import { Shield, AlertTriangle, Wrench } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security Tools — CyberBolt",
  description:
    "Free cybersecurity tools: OWASP Top 10 Checklist Generator and live CVE Threat Feed from the National Vulnerability Database.",
};

const tools = [
  {
    title: "OWASP Top 10 Checklist",
    description:
      "Generate a tailored OWASP Top 10 security checklist for your application using local AI. Input your app name and type, get actionable recommendations for each vulnerability category.",
    href: "/tools/owasp-checklist",
    icon: Shield,
    badge: "AI-Powered",
    badgeColor: "bg-cyber-400/10 text-cyber-400 border-cyber-400/30",
    access: "Admin login required",
  },
  {
    title: "CVE Threat Feed",
    description:
      "Live vulnerability feed from the National Vulnerability Database (NVD). See the latest CVEs with CVSS severity scores and CISA Known Exploited Vulnerabilities (KEV) status.",
    href: "/tools/cve-feed",
    icon: AlertTriangle,
    badge: "Live Feed",
    badgeColor: "bg-red-400/10 text-red-400 border-red-400/30",
    access: "Public — no login needed",
  },
];

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyber-400/30 bg-cyber-400/10 px-4 py-1.5 text-sm text-cyber-400">
          <Wrench className="h-4 w-4" />
          Security Tools
        </div>
        <h1 className="text-3xl font-bold text-white">Cybersecurity Tools</h1>
        <p className="mt-2 text-gray-400">
          Free, practical tools for security professionals and learners.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group rounded-xl border border-white/10 bg-gray-900/50 p-8 hover:border-cyber-400/30 transition-all duration-200"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-800 group-hover:bg-cyber-400/10 transition-colors">
                <tool.icon className="h-6 w-6 text-gray-400 group-hover:text-cyber-400 transition-colors" />
              </div>
              <span
                className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${tool.badgeColor}`}
              >
                {tool.badge}
              </span>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-white group-hover:text-cyber-400 transition-colors">
              {tool.title}
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-gray-400">
              {tool.description}
            </p>
            <p className="text-xs text-gray-600">{tool.access}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
