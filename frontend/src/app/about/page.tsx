import { Shield, Code, Brain, Zap, ExternalLink, Twitter, Linkedin, ArrowRight, Users } from "lucide-react";
import Link from "next/link";
import { PersonJsonLd } from "@/components/seo/JsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Athithan Raj P & Pavithra Mohan — AI security researchers and the team behind CyberBolt. Spreading cybersecurity education in a simplified, real-time way.",
};

export default function AboutPage() {
  return (
    <>
      <PersonJsonLd
        name="Athithan Raj P"
        jobTitle="AI Security Researcher & Full-Stack Developer"
        description="Co-founder of CyberBolt. Spreading cybersecurity education in a simplified, real-time way."
      />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="mb-16">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-8">
            <div className="flex-shrink-0">
              <div className="h-28 w-28 rounded-full bg-gradient-to-br from-cyber-400 to-brand-500 p-1">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-950 text-3xl font-bold text-cyber-400">
                  CB
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl">
                Meet the Team
              </h1>
              <p className="mt-2 text-lg text-cyber-400 font-medium">
                AI Security Researchers & Full-Stack Developers
              </p>
              <p className="mt-4 text-gray-400 leading-relaxed max-w-2xl">
                We built CyberBolt to make AI security accessible to everyone — from developers
                shipping their first LLM-powered feature to security teams evaluating model risks.
                We believe the best defense starts with understanding the attack, and our mission
                is to spread cybersecurity education in a simplified, real-time way.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a href="https://x.com/securecyberbolt" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-gray-800/50 px-4 py-1.5 text-sm text-gray-300 hover:border-cyber-400/30 hover:text-white transition-colors">
                  <Twitter className="h-4 w-4" /> Twitter
                </a>
                <a href="https://www.linkedin.com/company/securecyberbolt" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-gray-800/50 px-4 py-1.5 text-sm text-gray-300 hover:border-cyber-400/30 hover:text-white transition-colors">
                  <Linkedin className="h-4 w-4" /> CyberBolt LinkedIn
                </a>
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-gray-900/50 p-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-cyber-400 to-brand-500 p-0.5">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-950 text-lg font-bold text-cyber-400">
                    AR
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Athithan Raj P</h3>
                  <p className="text-sm text-cyber-400">AI Security Researcher & Full-Stack Developer</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-400 leading-relaxed">
                Builds and architects the CyberBolt platform end-to-end — from the Flask API and Redis data layer
                to the Next.js frontend and Ollama-powered AI tools. Passionate about breaking down complex
                security concepts into hands-on, executable guides.
              </p>
              <a href="https://www.linkedin.com/in/athithanraj/" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm text-cyber-400 hover:text-cyber-300 transition-colors">
                <Linkedin className="h-4 w-4" /> LinkedIn Profile
              </a>
            </div>
            <div className="rounded-xl border border-white/10 bg-gray-900/50 p-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-brand-400 to-cyber-500 p-0.5">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-950 text-lg font-bold text-brand-400">
                    PM
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Pavithra Mohan</h3>
                  <p className="text-sm text-cyber-400">Cybersecurity Researcher & Content Strategist</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-400 leading-relaxed">
                Co-maintains CyberBolt with a focus on content quality, research accuracy, and making
                cybersecurity education approachable for learners at every level. Ensures every article
                delivers real-world value.
              </p>
              <a href="https://www.linkedin.com/in/pavithrakavi/" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm text-cyber-400 hover:text-cyber-300 transition-colors">
                <Linkedin className="h-4 w-4" /> LinkedIn Profile
              </a>
            </div>
          </div>
        </div>

        {/* What I Do */}
        <section className="mb-16">
          <h2 className="mb-6 text-xl font-bold text-white">What We Focus On</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {[
              {
                icon: Brain,
                title: "AI & LLM Security",
                desc: "Prompt injection, adversarial attacks, model robustness, and securing AI systems in production. We research how LLMs fail and how to defend them.",
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
                desc: "We write hands-on articles that let you try attacks yourself. No theory-only content — every article has something you can run on your machine.",
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
              CyberBolt is an independent platform dedicated to spreading cybersecurity education
              in a simplified, real-time way. Every article is written to be <strong>hands-on</strong> — you
              won&apos;t just read about prompt injection, you&apos;ll execute attacks on your own machine
              using free tools like Ollama.
            </p>
            <p className="text-gray-300 leading-relaxed">
              The platform includes an <strong>OWASP Top 10 Checklist Generator</strong> powered
              by a local LLM, a full-text search engine, and an enterprise-grade content editor.
              Everything runs on a single VPS with Redis — no cloud dependencies, no vendor lock-in.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Built with Flask, Next.js 15, Redis, and Ollama. Maintained by Athithan Raj P and
              Pavithra Mohan, the entire stack is optimized for speed, security, and simplicity.
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
