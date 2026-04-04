import {
  Shield, Code, Brain, Zap, ExternalLink, Twitter, Linkedin,
  ArrowRight, BookOpen, Layers, Server, Database, Cpu,
  ChevronDown, ChevronUp, Heart, Eye, Users, Sparkles, Globe,
  Calendar, Rocket, Target, Award,
} from "lucide-react";
import Link from "next/link";
import { PersonJsonLd } from "@/components/seo/JsonLd";
import type { Metadata } from "next";
import FaqAccordion from "./FaqAccordion";

export const metadata: Metadata = {
  title: "About",
  description: "Athithan Raj P & Pavithra Mohan — AI security researchers and the team behind CyberBolt. Spreading cybersecurity education in a simplified, real-time way.",
};

const stats = [
  { label: "Articles Published", value: "12+", icon: BookOpen },
  { label: "Categories Covered", value: "10", icon: Layers },
  { label: "Team Members", value: "2", icon: Users },
  { label: "Open Source", value: "100%", icon: Code },
];

const techStack = [
  { name: "Flask", desc: "Python API", color: "from-green-400 to-emerald-500" },
  { name: "Next.js 15", desc: "React Frontend", color: "from-white to-gray-400" },
  { name: "Redis", desc: "Data & Cache", color: "from-red-400 to-rose-500" },
  { name: "Ollama", desc: "Local LLM", color: "from-purple-400 to-violet-500" },
  { name: "Tailwind", desc: "Styling", color: "from-cyan-400 to-sky-500" },
  { name: "TypeScript", desc: "Type Safety", color: "from-blue-400 to-indigo-500" },
];

const milestones = [
  { date: "Jan 2026", title: "Idea Born", desc: "CyberBolt concept created — a hands-on cybersecurity education platform.", icon: Sparkles },
  { date: "Feb 2026", title: "Platform Built", desc: "Flask + Next.js + Redis stack fully architected and deployed on Contabo VPS.", icon: Rocket },
  { date: "Mar 2026", title: "Content Launch", desc: "First articles published covering AI Security, Web Security, and Cloud Security.", icon: BookOpen },
  { date: "Apr 2026", title: "AI Tools Live", desc: "OWASP Checklist Generator powered by local Ollama LLM goes live.", icon: Cpu },
];

const values = [
  { icon: Code, title: "Open Source", desc: "Our entire stack is transparent. No black boxes, no vendor lock-in. Learn from the code itself." },
  { icon: Eye, title: "Privacy First", desc: "Zero tracking, no analytics cookies. We use a local LLM — your data never leaves the server." },
  { icon: Brain, title: "Hands-On Learning", desc: "Every article has something you can run on your machine. No theory-only content." },
  { icon: Heart, title: "Community Driven", desc: "Built for learners at every level. We simplify complex concepts without dumbing them down." },
];

const teamMembers = [
  {
    name: "Athithan Raj P",
    initials: "AR",
    role: "AI Security Researcher & Full-Stack Developer",
    bio: "Builds and architects the CyberBolt platform end-to-end — from the Flask API and Redis data layer to the Next.js frontend and Ollama-powered AI tools. Passionate about breaking down complex security concepts into hands-on, executable guides.",
    linkedin: "https://www.linkedin.com/in/athithanraj/",
    gradient: "from-cyber-400 to-brand-500",
    initialsColor: "text-cyber-400",
    skills: ["Python", "Flask", "Next.js", "Redis", "JWT", "Ollama", "Docker", "Nginx"],
  },
  {
    name: "Pavithra Mohan",
    initials: "PM",
    role: "Cybersecurity Researcher & Content Strategist",
    bio: "Co-maintains CyberBolt with a focus on content quality, research accuracy, and making cybersecurity education approachable for learners at every level. Ensures every article delivers real-world value.",
    linkedin: "https://www.linkedin.com/in/pavithrakavi/",
    gradient: "from-brand-400 to-cyber-500",
    initialsColor: "text-brand-400",
    skills: ["OWASP", "Threat Modeling", "Content Strategy", "Security Research", "Technical Writing"],
  },
];

const faqItems = [
  { q: "What is CyberBolt?", a: "CyberBolt is an independent cybersecurity education platform focused on AI security. We publish hands-on articles, provide tools like the OWASP Checklist Generator, and make complex security topics accessible to everyone." },
  { q: "Is CyberBolt free to use?", a: "Yes, 100%. All articles, tools, and resources on CyberBolt are completely free. We believe cybersecurity education should be accessible to everyone." },
  { q: "How can I contribute?", a: "Reach out via our Contact page or connect with us on LinkedIn. We welcome article suggestions, bug reports, and collaboration ideas from the community." },
  { q: "Does CyberBolt track users?", a: "No. We don't use analytics cookies or third-party trackers." },
];

export default function AboutPage() {
  return (
    <>
      <PersonJsonLd
        name="Athithan Raj P"
        jobTitle="AI Security Researcher & Full-Stack Developer"
        description="Co-founder of CyberBolt. Spreading cybersecurity education in a simplified, real-time way."
        linkedinUrl="https://www.linkedin.com/in/athithanraj/"
      />
      <PersonJsonLd
        name="Pavithra Mohan"
        jobTitle="Cybersecurity Researcher & Content Strategist"
        description="Co-maintainer of CyberBolt. Focused on content quality, research accuracy, and accessible cybersecurity education."
        linkedinUrl="https://www.linkedin.com/in/pavithrakavi/"
      />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="mb-12">
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
        </div>

        {/* Platform Stats */}
        <section className="mb-16">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-white/10 bg-gray-900/50 p-5 text-center group hover:border-cyber-400/30 transition-colors">
                <stat.icon className="mx-auto mb-2 h-5 w-5 text-cyber-400 group-hover:scale-110 transition-transform" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="mt-1 text-xs text-gray-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Team Members */}
        <section className="mb-16">
          <div className="grid gap-6 sm:grid-cols-2">
            {teamMembers.map((member) => (
              <div key={member.name} className="rounded-xl border border-white/10 bg-gray-900/50 p-6">
                <div className="flex items-center gap-4">
                  <div className={`h-14 w-14 rounded-full bg-gradient-to-br ${member.gradient} p-0.5`}>
                    <div className={`flex h-full w-full items-center justify-center rounded-full bg-gray-950 text-lg font-bold ${member.initialsColor}`}>
                      {member.initials}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{member.name}</h3>
                    <p className="text-sm text-cyber-400">{member.role}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-400 leading-relaxed">
                  {member.bio}
                </p>
                {/* Skills Tags */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {member.skills.map((skill) => (
                    <span key={skill} className="rounded-full border border-white/10 bg-gray-800/60 px-2.5 py-0.5 text-xs text-gray-300">
                      {skill}
                    </span>
                  ))}
                </div>
                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm text-cyber-400 hover:text-cyber-300 transition-colors">
                  <Linkedin className="h-4 w-4" /> LinkedIn Profile
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* What We Focus On */}
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

        {/* Our Values */}
        <section className="mb-16">
          <h2 className="mb-6 text-xl font-bold text-white">Our Values</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {values.map((v) => (
              <div key={v.title} className="flex gap-4 rounded-xl border border-white/10 bg-gray-900/50 p-5">
                <v.icon className="mt-0.5 h-6 w-6 flex-shrink-0 text-cyber-400" />
                <div>
                  <h3 className="font-semibold text-white">{v.title}</h3>
                  <p className="mt-1 text-sm text-gray-400 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="mb-16">
          <h2 className="mb-6 text-xl font-bold text-white">Built With</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {techStack.map((tech) => (
              <div key={tech.name} className="rounded-xl border border-white/10 bg-gray-900/50 p-4 text-center group hover:border-white/20 transition-colors">
                <div className={`mx-auto mb-2 h-10 w-10 rounded-lg bg-gradient-to-br ${tech.color} flex items-center justify-center`}>
                  <Server className="h-5 w-5 text-gray-950" />
                </div>
                <div className="font-semibold text-white text-sm">{tech.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{tech.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline / Milestones */}
        <section className="mb-16">
          <h2 className="mb-6 text-xl font-bold text-white">Our Journey</h2>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-cyber-400/50 via-brand-400/30 to-transparent sm:left-1/2 sm:-translate-x-px" />

            <div className="space-y-8">
              {milestones.map((m, i) => (
                <div key={m.title} className={`relative flex items-start gap-6 sm:gap-0 ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"}`}>
                  {/* Content */}
                  <div className={`flex-1 ${i % 2 === 0 ? "sm:pr-12 sm:text-right" : "sm:pl-12 sm:text-left"}`}>
                    <div className="rounded-xl border border-white/10 bg-gray-900/50 p-4 sm:inline-block">
                      <div className="text-xs text-cyber-400 font-medium uppercase tracking-wider">{m.date}</div>
                      <h3 className="mt-1 font-semibold text-white">{m.title}</h3>
                      <p className="mt-1 text-sm text-gray-400 leading-relaxed">{m.desc}</p>
                    </div>
                  </div>

                  {/* Dot */}
                  <div className="absolute left-0 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-gray-950 sm:relative sm:left-auto">
                    <m.icon className="h-4 w-4 text-cyber-400" />
                  </div>

                  {/* Spacer for the other side */}
                  <div className="hidden flex-1 sm:block" />
                </div>
              ))}
            </div>
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

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="mb-6 text-xl font-bold text-white">Frequently Asked Questions</h2>
          <FaqAccordion items={faqItems} />
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
