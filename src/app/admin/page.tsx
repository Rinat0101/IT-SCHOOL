"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import UserModal from "@/components/admin/UserModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

type Enrollment = {
  _id: string;
  courseId: { name: string };
  accessLevel: "limited" | "full";
};

type User = {
  _id: string;
  name: string;
  lastName: string;
  email: string;
  role: "student" | "admin";
  enrollments?: Enrollment[];
  github?: string;
  linkedin?: string;
  personalWebsite?: string;
  profilePicture?: string;
  createdAt: string;
};

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "student" | "admin">("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [accessFilter, setAccessFilter] = useState<"all" | "limited" | "full" | "none">("all");

  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: "default" | "danger";
    onConfirm: () => void;
  } | null>(null);

  if (session?.user.role !== "admin") {
    return <p className="p-6 text-red-500">🚫 Forbidden: Admins only</p>;
  }

  async function fetchUsers() {
    setLoading(true);
    const res = await fetch("/api/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const availableCourses = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of users) {
      for (const enr of u.enrollments ?? []) {
        const name = enr.courseId?.name;
        if (name && !map.has(name)) map.set(name, name);
      }
    }
    return Array.from(map.keys()).sort();
  }, [users]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((u) => {
      if (term) {
        const haystack = `${u.name} ${u.lastName} ${u.email}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (roleFilter !== "all" && u.role !== roleFilter) return false;

      const enrollments = u.enrollments ?? [];
      if (courseFilter !== "all") {
        if (!enrollments.some((e) => e.courseId?.name === courseFilter)) return false;
      }
      if (accessFilter === "none") {
        if (enrollments.length > 0) return false;
      } else if (accessFilter !== "all") {
        const matches = enrollments.some((e) => {
          if (courseFilter !== "all") {
            return e.courseId?.name === courseFilter && e.accessLevel === accessFilter;
          }
          return e.accessLevel === accessFilter;
        });
        if (!matches) return false;
      }
      return true;
    });
  }, [users, search, roleFilter, courseFilter, accessFilter]);

  const filtersActive =
    search !== "" || roleFilter !== "all" || courseFilter !== "all" || accessFilter !== "all";

  function clearFilters() {
    setSearch("");
    setRoleFilter("all");
    setCourseFilter("all");
    setAccessFilter("all");
  }

  function handleDelete(user: User) {
    setConfirmState({
      title: "Delete this user?",
      message: `${user.name} ${user.lastName} (${user.email}) will be permanently removed along with their enrollments.`,
      confirmLabel: "Delete",
      variant: "danger",
      onConfirm: () => {
        setConfirmState(null);
        void performDelete(user._id);
      },
    });
  }

  async function performDelete(id: string) {
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } else {
      alert("❌ Failed to delete user");
    }
  }

  return (
    <div className="p-6 min-h-screen bg-white dark:bg-[#0b0f17]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold dark:text-gray-100">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage users, roles, and course enrollments.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#B923AE] hover:bg-[#A01F97] text-white text-sm font-semibold shadow-sm transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add user
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f29] p-3 flex flex-wrap items-center gap-2">
        {/* Search with icon */}
        <div className="relative flex-1 min-w-[220px]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 dark:bg-[#0f1420] dark:text-gray-100 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B923AE]/40 focus:border-[#B923AE]/40 transition-colors"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as "all" | "student" | "admin")}
          className="border border-gray-200 dark:border-gray-700 dark:bg-[#0f1420] dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B923AE]/40 focus:border-[#B923AE]/40 transition-colors"
        >
          <option value="all">All roles</option>
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 dark:bg-[#0f1420] dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B923AE]/40 focus:border-[#B923AE]/40 transition-colors"
        >
          <option value="all">All courses</option>
          {availableCourses.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={accessFilter}
          onChange={(e) =>
            setAccessFilter(e.target.value as "all" | "limited" | "full" | "none")
          }
          className="border border-gray-200 dark:border-gray-700 dark:bg-[#0f1420] dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B923AE]/40 focus:border-[#B923AE]/40 transition-colors"
        >
          <option value="all">Any access</option>
          <option value="full">Full access</option>
          <option value="limited">Limited access</option>
          <option value="none">No enrollments</option>
        </select>
        {filtersActive && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-[#B923AE] dark:text-[#F4B8FF] hover:bg-[#F4B8FF]/10 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
            Clear
          </button>
        )}
        <span className="ml-auto text-xs text-gray-500 dark:text-gray-400 font-medium tabular-nums">
          {filteredUsers.length} of {users.length}
        </span>
      </div>

      {loading ? (
        <p className="dark:text-gray-300">Loading users...</p>
      ) : filteredUsers.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm py-6 text-center border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          No users match the current filters.
        </p>
      ) : (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-[#1a1f29]">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#0f1420] text-left text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">Course access</th>
                <th className="px-5 py-3 font-semibold w-px text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-[#1B2633] dark:text-gray-200 divide-y divide-gray-100 dark:divide-gray-800">
              {filteredUsers.map((u) => (
                <tr
                  key={u._id}
                  className="align-top hover:bg-gray-50 dark:hover:bg-[#0f1420] transition-colors"
                >
                  <td className="px-5 py-3 font-medium">
                    {u.name} {u.lastName}
                  </td>
                  <td className="px-5 py-3 text-gray-600 dark:text-gray-400">{u.email}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border ${
                        u.role === "admin"
                          ? "bg-[#F4B8FF]/20 text-[#7A1773] dark:text-[#F4B8FF] border-[#F4B8FF]/60"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {u.enrollments?.length ? (
                      <div className="flex flex-wrap gap-1.5">
                        {u.enrollments.map((enr) =>
                          enr.courseId?.name ? (
                            <span
                              key={enr._id}
                              className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${
                                enr.accessLevel === "full"
                                  ? "bg-[#F4B8FF]/15 text-[#7A1773] dark:text-[#F4B8FF] border-[#F4B8FF]/50"
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                              }`}
                              title={`${enr.courseId.name} — ${enr.accessLevel === "full" ? "Full" : "Limited"} access`}
                            >
                              {enr.courseId.name}
                              <span className="opacity-60">·</span>
                              {enr.accessLevel === "full" ? "Full" : "Limited"}
                            </span>
                          ) : null
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                        No enrollments
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingUser(u);
                          setModalOpen(true);
                        }}
                        title="Edit user"
                        aria-label="Edit user"
                        className="w-8 h-8 inline-flex items-center justify-center rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#B923AE] dark:hover:text-[#F4B8FF] transition-colors"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        title="Delete user"
                        aria-label="Delete user"
                        className="w-8 h-8 inline-flex items-center justify-center rounded-md text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <path d="M3 6h18" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <path d="M10 11v6M14 11v6" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <UserModal user={editingUser} onClose={() => setModalOpen(false)} onSaved={fetchUsers} />
      )}

      {confirmState && (
        <ConfirmDialog
          title={confirmState.title}
          message={confirmState.message}
          confirmLabel={confirmState.confirmLabel}
          variant={confirmState.variant}
          onConfirm={confirmState.onConfirm}
          onCancel={() => setConfirmState(null)}
        />
      )}
    </div>
  );
}
