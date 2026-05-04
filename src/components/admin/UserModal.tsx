"use client";

import { useEffect, useRef, useState } from "react";
import ConfirmDialog from "./ConfirmDialog";

type ConfirmState = {
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: "default" | "danger";
  onConfirm: () => void;
} | null;

const fieldClass =
  "w-full border border-gray-300 dark:border-gray-700 dark:bg-[#0f1420] dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B923AE]/40 focus:border-[#B923AE]/40 transition-colors";

type Enrollment = {
  _id: string;
  courseId: { _id?: string; name: string };
  accessLevel: "limited" | "full";
};

type CourseOption = { _id: string; name: string };

type Props = {
  user: any | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function UserModal({ user, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    name: user?.name || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    password: "",
    role: user?.role || "student",
  });

  const [enrollments, setEnrollments] = useState<Enrollment[]>(user?.enrollments || []);
  const [saving, setSaving] = useState(false);

  const [allCourses, setAllCourses] = useState<CourseOption[]>([]);
  const [newCourseId, setNewCourseId] = useState("");
  const [newAccessLevel, setNewAccessLevel] = useState<"limited" | "full">("limited");
  const [addingEnrollment, setAddingEnrollment] = useState(false);
  const [addError, setAddError] = useState("");

  const [confirm, setConfirm] = useState<ConfirmState>(null);

  // Snapshot of access levels at modal open — used to detect dirty access-level changes.
  // New enrollments (added via API) and removed ones aren't in this map, so they don't count as dirty.
  const initialEnrollmentMapRef = useRef(
    new Map<string, "limited" | "full">(
      (user?.enrollments || []).map((e: any) => [e._id, e.accessLevel])
    )
  );

  const isDirty =
    form.name !== (user?.name || "") ||
    form.lastName !== (user?.lastName || "") ||
    form.email !== (user?.email || "") ||
    form.password !== "" ||
    form.role !== (user?.role || "student") ||
    enrollments.some((enr) => {
      const initial = initialEnrollmentMapRef.current.get(enr._id);
      return initial !== undefined && initial !== enr.accessLevel;
    });

  function attemptClose() {
    if (!isDirty) {
      onClose();
      return;
    }
    setConfirm({
      title: "Discard changes?",
      message: "You have unsaved changes. Leave without saving?",
      confirmLabel: "Discard",
      variant: "danger",
      onConfirm: () => {
        setConfirm(null);
        onClose();
      },
    });
  }

  useEffect(() => {
    if (!user?._id) return;
    fetch("/api/courses")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) =>
        setAllCourses(
          (data || []).map((c: any) => ({ _id: c._id, name: c.name }))
        )
      )
      .catch(() => setAllCourses([]));
  }, [user?._id]);

  const enrolledCourseIds = new Set(
    enrollments.map((e) => e.courseId?._id).filter(Boolean) as string[]
  );
  const availableCourses = allCourses.filter((c) => !enrolledCourseIds.has(c._id));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setConfirm({
      title: user ? "Save changes?" : "Create user?",
      message: user
        ? "This will update the user's details and any access-level changes."
        : "A new user will be created with the details provided.",
      confirmLabel: user ? "Save" : "Create",
      onConfirm: () => {
        setConfirm(null);
        void performSave();
      },
    });
  }

  async function performSave() {
    setSaving(true);

    const method = user ? "PATCH" : "POST";
    const url = user ? `/api/users/${user._id}` : "/api/users";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      setSaving(false);
      alert("❌ Failed to save user");
      return;
    }

    for (const enr of enrollments) {
      const patchRes = await fetch(`/api/enrollments/${enr._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessLevel: enr.accessLevel }),
      });

      if (!patchRes.ok) {
        console.warn(`⚠️ Failed to update enrollment ${enr._id}`);
      }
    }

    setSaving(false);
    onSaved();
    onClose();
  }

  function handleDeleteEnrollment(enr: Enrollment) {
    setConfirm({
      title: "Remove this enrollment?",
      message: `The user will lose access to "${enr.courseId?.name ?? "this course"}". Their progress will be preserved.`,
      confirmLabel: "Remove",
      variant: "danger",
      onConfirm: () => {
        setConfirm(null);
        void performDeleteEnrollment(enr._id);
      },
    });
  }

  async function performDeleteEnrollment(enrollmentId: string) {
    const res = await fetch(`/api/enrollments/${enrollmentId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      alert("❌ Failed to delete enrollment");
      return;
    }
    setEnrollments((prev) => prev.filter((e) => e._id !== enrollmentId));
  }

  function handleAccessChange(enrollmentId: string, newAccess: "limited" | "full") {
    setEnrollments((prev) =>
      prev.map((e) =>
        e._id === enrollmentId ? { ...e, accessLevel: newAccess } : e
      )
    );
  }

  async function handleAddEnrollment() {
    setAddError("");
    if (!user?._id || !newCourseId) return;

    setAddingEnrollment(true);
    const res = await fetch("/api/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user._id,
        courseId: newCourseId,
        accessLevel: newAccessLevel,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setAddError(data.error || "Failed to add enrollment");
      setAddingEnrollment(false);
      return;
    }

    const created = await res.json();
    setEnrollments((prev) => [
      ...prev,
      {
        _id: created._id,
        courseId: {
          _id: created.courseId?._id ?? newCourseId,
          name: created.courseId?.name ?? "",
        },
        accessLevel: created.accessLevel ?? newAccessLevel,
      },
    ]);
    setNewCourseId("");
    setNewAccessLevel("limited");
    setAddingEnrollment(false);
  }

  return (
    <div
      className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => {
        // Only trigger when the click is on the backdrop itself,
        // not bubbled up from the form or the ConfirmDialog overlay.
        if (e.target === e.currentTarget) attemptClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#1a1f29] dark:border dark:border-gray-700 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-7 pt-6 pb-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-[#212B36] dark:text-gray-100">
            {user ? "Edit user" : "Add user"}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {user
              ? "Update account details, role, and course enrollments."
              : "Create a new user account."}
          </p>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-7 py-6 flex flex-col gap-6">
          {/* Account details */}
          <section>
            <h3 className="text-xs uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400 mb-3">
              Account details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  First name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={fieldClass}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Last name
                </label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className={fieldClass}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={fieldClass}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  {user ? "New password" : "Password"}
                </label>
                <input
                  type="password"
                  placeholder={user ? "Leave empty to keep current" : ""}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={fieldClass}
                  required={!user}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className={fieldClass}
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </section>

          {/* Enrollments — only for existing users */}
          {user && (
            <section>
              <h3 className="text-xs uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400 mb-3">
                Enrollments
              </h3>

              {enrollments.length > 0 ? (
                <div className="space-y-2 mb-3">
                  {enrollments.map((enr) => (
                    <div
                      key={enr._id}
                      className="flex items-center gap-3 border border-gray-200 dark:border-gray-700 dark:bg-[#0f1420] rounded-lg px-3 py-2"
                    >
                      <span className="text-sm font-medium flex-1 truncate text-[#1B2633] dark:text-gray-200">
                        {enr.courseId?.name}
                      </span>
                      <select
                        value={enr.accessLevel}
                        onChange={(e) =>
                          handleAccessChange(enr._id, e.target.value as "limited" | "full")
                        }
                        className="border border-gray-300 dark:border-gray-700 dark:bg-[#1a1f29] dark:text-gray-100 rounded-md px-2 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#B923AE]/40"
                      >
                        <option value="limited">Limited</option>
                        <option value="full">Full</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleDeleteEnrollment(enr)}
                        title="Remove enrollment"
                        aria-label="Remove enrollment"
                        className="w-8 h-8 inline-flex items-center justify-center rounded-md text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <path d="M3 6h18" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500 italic mb-3">
                  No enrollments yet.
                </p>
              )}

              {/* Add new enrollment */}
              <div className="bg-gray-50 dark:bg-[#0f1420] border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <p className="text-xs uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400 mb-3">
                  Add enrollment
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px_auto] gap-2 items-end">
                  <select
                    value={newCourseId}
                    onChange={(e) => setNewCourseId(e.target.value)}
                    className={fieldClass}
                  >
                    <option value="">Select a course…</option>
                    {availableCourses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={newAccessLevel}
                    onChange={(e) => setNewAccessLevel(e.target.value as "limited" | "full")}
                    className={fieldClass}
                  >
                    <option value="limited">Limited</option>
                    <option value="full">Full</option>
                  </select>
                  <button
                    type="button"
                    disabled={!newCourseId || addingEnrollment}
                    onClick={handleAddEnrollment}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#B923AE] hover:bg-[#A01F97] text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    {addingEnrollment ? "Adding…" : "Add"}
                  </button>
                </div>
                {addError && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-2">{addError}</p>
                )}
                {availableCourses.length === 0 && allCourses.length > 0 && (
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                    User is enrolled in all available courses.
                  </p>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Sticky footer */}
        <div className="px-7 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1f29] rounded-b-2xl flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={attemptClose}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 rounded-lg bg-[#B923AE] hover:bg-[#A01F97] text-white text-sm font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "Saving…" : user ? "Save changes" : "Create user"}
          </button>
        </div>
      </form>

      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          variant={confirm.variant}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}