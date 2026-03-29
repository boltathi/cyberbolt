"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Loader2, CheckCircle2, AlertTriangle, XCircle, RotateCcw, LogIn } from "lucide-react";
import type { OwaspChecklistItem, OwaspChecklistResponse } from "@/types";
import { useAuthStore } from "@/lib/store";
import { owaspAPI } from "@/lib/api";

const APP_TYPES = [
  "Web Application",
  "Mobile Application",
  "REST API",
  "Desktop Application",
  "IoT Device",
  "Microservices",
  "E-Commerce",
  "SaaS Platform",
];

const severityColors: Record<string, string> = {
  Critical: "bg-red-500/20 text-red-400 border-red-500/30",
  High: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

export default function OwaspChecklistPage() {
  const router = useRouter();
  const { isAuthenticated, hydrate } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [appName, setAppName] = useState("");
  const [appType, setAppType] = useState("");
  const [status, setStatus] = useState<"idle" | "generating" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<OwaspChecklistResponse | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Shield className="h-8 w-8 animate-pulse text-cyber-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="cyber-card space-y-4">
          <Shield className="mx-auto h-12 w-12 text-cyber-400" />
          <h1 className="text-2xl font-bold text-white">Admin Access Required</h1>
          <p className="text-gray-400">
            The OWASP Checklist Generator is an admin-only tool. Please log in to continue.
          </p>
          <button
            onClick={() => router.push("/admin/login")}
            className="cyber-btn mx-auto gap-2"
          >
            <LogIn className="h-4 w-4" /> Go to Admin Login
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName.trim() || !appType) return;

    setStatus("generating");
    setErrorMsg("");
    setResult(null);
    setCheckedItems(new Set());

    try {
      const data = await owaspAPI.generate(appName.trim(), appType);
      setResult(data);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Failed to generate checklist.");
    }
  };

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleReset = () => {
    setStatus("idle");
    setResult(null);
    setCheckedItems(new Set());
    setAppName("");
    setAppType("");
  };

  const completedCount = checkedItems.size;
  const totalCount = result?.checklist.length ?? 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cyber-400/10">
          <Shield className="h-7 w-7 text-cyber-400" />
        </div>
        <h1 className="text-3xl font-bold text-white">OWASP Top 10 Checklist Generator</h1>
        <p className="mt-2 text-gray-400">
          Enter your application details and get a tailored security checklist
          powered by AI.
        </p>
      </div>

      {/* Input Form */}
      {status !== "done" && (
        <form onSubmit={handleSubmit} className="cyber-card mx-auto max-w-xl space-y-6">
          <div>
            <label htmlFor="appName" className="mb-1 block text-sm font-medium text-gray-300">
              Application Name
            </label>
            <input
              id="appName"
              type="text"
              required
              maxLength={100}
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="cyber-input"
              placeholder="e.g. ShopApp, HealthTracker, PaymentGateway"
              disabled={status === "generating"}
            />
          </div>

          <div>
            <label htmlFor="appType" className="mb-1 block text-sm font-medium text-gray-300">
              Application Type
            </label>
            <select
              id="appType"
              required
              value={appType}
              onChange={(e) => setAppType(e.target.value)}
              className="cyber-input"
              disabled={status === "generating"}
            >
              <option value="">Select application type...</option>
              {APP_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={status === "generating" || !appName.trim() || !appType}
            className="cyber-btn w-full gap-2"
          >
            {status === "generating" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Checklist… (~30s)
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" /> Generate Security Checklist
              </>
            )}
          </button>

          {status === "error" && (
            <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
              {errorMsg}
            </div>
          )}
        </form>
      )}

      {/* Results */}
      {status === "done" && result && (
        <div className="space-y-6">
          {/* Summary bar */}
          <div className="cyber-card flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {result.app_name}{" "}
                <span className="text-sm font-normal text-gray-400">({result.app_type})</span>
              </h2>
              <p className="text-sm text-gray-400">
                {completedCount} of {totalCount} items reviewed
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Progress bar */}
              <div className="h-2 w-32 rounded-full bg-gray-800">
                <div
                  className="h-2 rounded-full bg-cyber-400 transition-all"
                  style={{ width: `${totalCount ? (completedCount / totalCount) * 100 : 0}%` }}
                />
              </div>
              <span className="text-sm font-medium text-cyber-400">
                {totalCount ? Math.round((completedCount / totalCount) * 100) : 0}%
              </span>
              <button onClick={handleReset} className="cyber-btn gap-1 px-3 py-1.5 text-xs">
                <RotateCcw className="h-3 w-3" /> New
              </button>
            </div>
          </div>

          {/* Checklist items */}
          <div className="space-y-4">
            {result.checklist.map((item: OwaspChecklistItem) => {
              const isChecked = checkedItems.has(item.id);
              return (
                <div
                  key={item.id}
                  className={`cyber-card cursor-pointer transition-all ${
                    isChecked ? "border-cyber-400/30 opacity-75" : ""
                  }`}
                  onClick={() => toggleCheck(item.id)}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <div className="mt-1 flex-shrink-0">
                      {isChecked ? (
                        <CheckCircle2 className="h-5 w-5 text-cyber-400" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-600" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-bold text-cyber-400">
                          {item.id}
                        </span>
                        <h3
                          className={`font-semibold text-white ${isChecked ? "line-through opacity-60" : ""}`}
                        >
                          {item.category}
                        </h3>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                            severityColors[item.severity] || severityColors.Medium
                          }`}
                        >
                          {item.severity === "Critical" && <XCircle className="mr-1 inline h-3 w-3" />}
                          {item.severity === "High" && <AlertTriangle className="mr-1 inline h-3 w-3" />}
                          {item.severity}
                        </span>
                      </div>

                      <p className="text-sm text-gray-400">{item.description}</p>

                      <div className="rounded-lg bg-gray-800/50 p-3">
                        <p className="text-sm font-medium text-cyber-300">
                          AI Recommendation:
                        </p>
                        <p className="mt-1 text-sm text-gray-300">{item.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
