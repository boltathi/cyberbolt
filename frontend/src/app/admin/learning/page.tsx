"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";
import { learningAPI } from "@/lib/api";
import type { LearningResource, PaginatedResponse } from "@/types";
import { DIFFICULTY_COLORS } from "@/lib/utils";

export default function AdminLearningPage() {
  const [data, setData] = useState<PaginatedResponse<LearningResource>>({
    items: [], total: 0, page: 1, per_page: 20, total_pages: 0,
  });
  const [page, setPage] = useState(1);

  const loadResources = async () => {
    try {
      const result = await learningAPI.adminList(page, 20);
      setData(result);
    } catch {}
  };

  useEffect(() => {
    loadResources();
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await learningAPI.delete(id);
      loadResources();
    } catch {}
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Learning Resources</h1>
        <Link href="/admin/learning/new" className="cyber-btn gap-2 text-sm">
          <Plus className="h-4 w-4" /> New Resource
        </Link>
      </div>

      <div className="cyber-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-gray-400">
              <th className="pb-3 font-medium">Title</th>
              <th className="pb-3 font-medium">Category</th>
              <th className="pb-3 font-medium">Difficulty</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.items.map((resource) => (
              <tr key={resource.id}>
                <td className="py-3 font-medium text-white">{resource.title}</td>
                <td className="py-3 text-gray-400">{resource.category}</td>
                <td className="py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${DIFFICULTY_COLORS[resource.difficulty] || ""}`}>
                    {resource.difficulty}
                  </span>
                </td>
                <td className="py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${resource.published ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                    {resource.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/learning/${resource.id}`} className="rounded p-1 text-gray-400 hover:bg-white/5 hover:text-white">
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button onClick={() => handleDelete(resource.id)} className="rounded p-1 text-gray-400 hover:bg-red-400/10 hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.items.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-500">No learning resources yet.</p>
        )}
      </div>

      {data.total_pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="cyber-btn-outline text-sm disabled:opacity-50">Previous</button>
          <span className="px-4 text-sm text-gray-400">Page {page} of {data.total_pages}</span>
          <button disabled={page >= data.total_pages} onClick={() => setPage(page + 1)} className="cyber-btn-outline text-sm disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
