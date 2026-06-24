"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import type { Lead } from "@/lib/types";

const statusOptions: Lead["status"][] = ["new", "in_progress", "done"];
const statusLabel: Record<Lead["status"], string> = {
  new: "Новая",
  in_progress: "В работе",
  done: "Завершена",
};

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<Lead[]>("/admin/leads", { auth: true })
      .then(setLeads)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(id: string, status: Lead["status"]) {
    await apiRequest(`/admin/leads/${id}`, {
      method: "PATCH",
      auth: true,
      body: { status },
    });
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Заявки</h1>

      {loading ? (
        <p className="mt-8 text-muted">Загрузка…</p>
      ) : leads.length === 0 ? (
        <p className="mt-8 text-muted">Заявок пока нет.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {leads.map((l) => (
            <div
              key={l.id}
              className="rounded-[var(--radius-card)] bg-white p-5 shadow-sm ring-1 ring-black/5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">
                    {l.name || "Без имени"} ·{" "}
                    <span className="text-primary">{l.contact}</span>
                  </div>
                  <div className="text-xs text-muted">
                    {l.service || "—"} · бюджет: {l.budget || "—"} ·{" "}
                    {new Date(l.created_at).toLocaleString("ru-RU")}
                  </div>
                </div>
                <select
                  value={l.status}
                  onChange={(e) =>
                    updateStatus(l.id, e.target.value as Lead["status"])
                  }
                  className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {statusLabel[s]}
                    </option>
                  ))}
                </select>
              </div>
              {l.message && (
                <p className="mt-3 text-sm text-ink/90">{l.message}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
