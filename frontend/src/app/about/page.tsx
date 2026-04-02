import { Shield, Code, Brain, Zap, ExternalLink, Github, Twitter, Linkedin, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PersonJsonLd } from "@/components/seo/JsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Athithan Raj V — AI security researcher, full-stack developer, and founder of CyberBolt. Building tools and content to make AI security accessible.",
};

export default function AboutPage() {
  return (
    <>
      <PersonJsonLd
        name="Athithan Raj V"
        jobTitle="AI Security Researcher & Developer"
        description="Founder of CyberBolt. Building tools and content to make AI security accessible to everyone."
      />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="mb-16">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-8">
            <div className="flex-shrink-0">
              <div className="h-28 w-28 rounded-full bg-gradient-to-br from-cyber-400 to-brand-500 p-1">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-950 text-3xl font-bold text-cyber-400">
                  AR
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl">
                Athithan Raj V
              </h1>
              <p className="mt-2 text-lg text-cyber-400 font-medium">
                AI Security Researcher & Full-Stack Developer
              </p>
              <p className="mt-4 text-gray-400 leading-relaxed max-w-2xl">
                I build CyberBolt to make AI security accessible to everyone — from developers
                shipping their first LLM-powered feature to security teams evaluating model risks.
                I believe the best defense starts with understanding the attack.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a href="https://github.com/boltathi" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-gray-800/50 px-4 py-1.5 text-sm text-gray-300 hover:border-cyber-400/30 hover:text-white transition-colors">
                  <Github className="h-4 w-4" /> GitHub
                </a>
                <a href="https://x.com/securecyberbolt" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-gray-800/50 px-4 py-1.5 text-sm text-gray-300 hover:border-cyber-400/30 hover:text-white transition-colors">
                  <Twitter className="h-4 w-4" /> Twitter
                </a>
                <a href="https://www.linkedin.com/company/securecyberbolt" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-gray-800/50 px-4 py-1.5 text-sm text-gray-300 hover:border-cyber-400/30 hover:text-white transition-colors">
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* What I Do */}
        <section className="mb-16">
          <h2 className="mb-6 text-xl font-bold text-white">What I Focus On</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {[
              {
                icon: Brain,
                title: "AI & LLM Security",
                desc: "Prompt injection, adversarial attacks, model robustness, and securing AI systems in production. I research how LLMs fail and how to defend them.",
              },
              {
                icon: Code,
                title: "Full-Stack Development",
                desc: "Building production-grade applications with Flask, Next.js, and Redis. Every tool on CyberBolt is built from scratch — no templates.",
              },
              {
                icon: Shield,
                title: "Security Engineering",
                desc: "OWASP Top 10, application security, JWT auth patterns, rate limiting, input sanitization — the foundations that keep software safe.",
              },
              {
                icon: Zap,
                title: "Knowledge Sharing",
                desc: "I write hands-on articles that let you try attacks yourself. No theory-only content — every article has something you can run on your machine.",
              },
            ].map((area) => (
              <div key={area.title} className="rounded-xl border border-white/10 bg-gray-900/50 p-5">
                <area.icon className="mb-3 h-6 w-6 text-cyber-400" />
                <h3 className="font-semibold text-white">{area.title}</h3>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">{area.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* About CyberBolt */}
        <section className="mb-16">
          <h2 className="mb-4 text-xl font-bold text-white">About CyberBolt</h2>
          <div className="prose-cyber space-y-4">
            <p className="text-gray-300 leading-relaxed">
              CyberBolt is an independent platform dedicated to AI security education.
              Every article is written to be <strong>hands-on</strong> — you won&apos;t just read about
              prompt injection, you&apos;ll execute attacks on your own machine using free tools like Ollama.
            </p>
            <p className="text-gray-300 leading-relaxed">
              The platform also includes an <strong>OWASP Top 10 Checklist Generator</strong> powered
              by a local LLM, a full-text search engine, and an enterprise-grade content editor.
              Everything runs on a single VPS with Redis — no cloud dependencies, no vendor lock-in.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Built with Flask, Next.js 15, Redis, and Ollama. The entire stack is optimized for
              speed, security, and simplicity.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-xl border border-white/10 bg-gradient-to-r from-cyber-950/50 to-brand-950/30 p-8 text-center">
          <h2 className="text-xl font-bold text-white">Want to learn AI security?</h2>
          <p className="mt-2 text-gray-400">
            Start with the articles — every one is designed to teach by doing.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link href="/articles" className="cyber-btn gap-2">
              Read Articles <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/contact" className="cyber-btn-outline gap-2">
              Get in Touch <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
