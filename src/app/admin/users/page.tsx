"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { t } from "@/lib/i18n";
import { useLocale } from "@/components/LocaleProvider";
import type { User } from "@/lib/types";

export default function AdminUsersPage() {
  const { locale } = useLocale();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<User[]>("/admin/users", { auth: true })
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function patch(id: string, body: Partial<Pick<User, "role" | "is_active">>) {
    const updated = await apiRequest<User>(`/admin/users/${id}`, {
      method: "PATCH",
      auth: true,
      body,
    });
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">{t(locale, "admin.usersTitle")}</h1>

      {loading ? (
        <p className="mt-8 text-muted">{t(locale, "admin.loading")}</p>
      ) : (
        <div className="mt-6 space-y-2">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-black/5"
            >
              <div className="min-w-0">
                <div className="font-medium">
                  {u.name || "—"}{" "}
                  {!u.is_active && (
                    <span className="ml-1 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                      {t(locale, "admin.blocked")}
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted">
                  {u.email ?? `${u.auth_provider}-${t(locale, "admin.account")}`} · {u.role}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    patch(u.id, { role: u.role === "admin" ? "user" : "admin" })
                  }
                  className="rounded-full bg-white px-3 py-1.5 text-xs font-medium ring-1 ring-black/10 hover:ring-primary/40"
                >
                  {u.role === "admin" ? t(locale, "admin.removeAdmin") : t(locale, "admin.makeAdmin")}
                </button>
                <button
                  onClick={() => patch(u.id, { is_active: !u.is_active })}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 ${
                    u.is_active
                      ? "bg-white text-red-600 ring-red-200 hover:bg-red-50"
                      : "bg-white text-green-700 ring-green-200 hover:bg-green-50"
                  }`}
                >
                  {u.is_active ? t(locale, "admin.block") : t(locale, "admin.unblock")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
