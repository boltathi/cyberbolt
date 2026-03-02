import { Shield, Code, Brain, Mail } from "lucide-react";
import { PersonJsonLd } from "@/components/seo/JsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about CyberBolt — AI security researcher, developer, and technology enthusiast.",
};

export default function AboutPage() {
  return (
    <>
      <PersonJsonLd
        description="AI security researcher, developer, and technology enthusiast behind CyberBolt."
      />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyber-400 to-brand-500">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            About CyberBolt
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            AI Security Researcher &amp; Developer
          </p>
        </div>

        <div className="prose-cyber mx-auto space-y-6">
          <p className="text-gray-300 leading-relaxed">
            Welcome to CyberBolt — a platform dedicated to exploring the intersection
            of artificial intelligence and cybersecurity. I believe in making complex
            security concepts accessible and actionable for developers, researchers,
            and technology enthusiasts.
          </p>

          <p className="text-gray-300 leading-relaxed">
            Through in-depth articles, structured learning paths, and hands-on
            resources, this platform aims to bridge the gap between cutting-edge AI
            research and practical security implementation.
          </p>
        </div>

        {/* Skills / Focus Areas */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Brain,
              title: "AI/ML Security",
              desc: "Adversarial ML, model robustness, and securing AI systems in production.",
            },
            {
              icon: Code,
              title: "Software Development",
              desc: "Full-stack development with modern frameworks and security-first architecture.",
            },
            {
              icon: Mail,
              title: "Knowledge Sharing",
              desc: "Technical writing, mentoring, and building learning resources for the community.",
            },
          ].map((area) => (
            <div key={area.title} className="cyber-card text-center">
              <area.icon className="mx-auto mb-3 h-8 w-8 text-cyber-400" />
              <h3 className="font-semibold text-white">{area.title}</h3>
              <p className="mt-2 text-sm text-gray-400">{area.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
