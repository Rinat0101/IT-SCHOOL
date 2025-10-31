"use client";

import { useState } from "react";

type Enrollment = {
  _id: string;
  courseId: { name: string };
  accessLevel: "limited" | "full";
};

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    // ✅ Update basic user info first
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

    // ✅ Then update each enrollment's access level
    for (const enr of enrollments) {
      const patchRes = await fetch(`/api/enrollments/${enr._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessLevel: enr.accessLevel }), // keep name consistent
      });

      if (!patchRes.ok) {
        console.warn(`⚠️ Failed to update enrollment ${enr._id}`);
      }
    }

    setSaving(false);
    onSaved();
    onClose();
  }

  function handleAccessChange(enrollmentId: string, newAccess: string) {
    setEnrollments((prev) =>
      prev.map((e) =>
        e._id === enrollmentId ? { ...e, accessLevel: newAccess } : e
      )
    );
  }

  return (
    <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">
          {user ? "Edit User" : "Add User"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Basic Info */}
          <input
            type="text"
            placeholder="First name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border border-gray-300 rounded-md p-2"
            required
          />
          <input
            type="text"
            placeholder="Last name"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            className="border border-gray-300 rounded-md p-2"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border border-gray-300 rounded-md p-2"
            required
          />

          {/* Password */}
          <input
            type="password"
            placeholder={user ? "New Password (leave empty to keep)" : "Password"}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="border border-gray-300 rounded-md p-2"
            required={!user}
          />

          {/* Role */}
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="border border-gray-300 rounded-md p-2"
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>

          {/* Enrollments Access */}
          {user?.enrollments?.length ? (
            <div className="border-t border-gray-300 pt-3 mt-2">
              <h3 className="font-medium mb-2 text-gray-700">Enrollments Access</h3>
              <div className="space-y-2">
                {enrollments.map((enr) => (
                  <div
                    key={enr._id}
                    className="flex justify-between items-center border border-gray-300 rounded-md p-2"
                  >
                    <span className="text-sm">{enr.courseId?.name}</span>
                    <select
                      value={enr.accessLevel}
                      onChange={(e) =>
                        handleAccessChange(enr._id, e.target.value)
                      }
                      className="border border-gray-300 rounded-md p-1"
                    >
                      <option value="limited">Limited</option>
                      <option value="full">Full</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            user && (
              <p className="text-gray-400 text-sm border-t pt-3">
                No enrollments yet
              </p>
            )
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}