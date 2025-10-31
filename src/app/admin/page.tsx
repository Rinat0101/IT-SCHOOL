"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import UserModal from "@/components/admin/UserModal";

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

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } else {
      alert("❌ Failed to delete user");
    }
  }

  async function handleAccessChange(enrollmentId: string, newAccess: string) {
    const res = await fetch(`/api/enrollments/${enrollmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access: newAccess }),
    });

    if (res.ok) {
      await fetchUsers(); // refresh data
    } else {
      alert("❌ Failed to update access");
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <button
          onClick={() => {
            setEditingUser(null);
            setModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add User
        </button>
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-left text-sm text-gray-600">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Course Access</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t align-top">
                <td className="px-4 py-2">
                  {u.name} {u.lastName}
                </td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2 capitalize">{u.role}</td>
                <td className="px-4 py-2 text-sm text-gray-700">
                  {u.enrollments?.length ? (
                    <div className="flex flex-col gap-1">
                      {u.enrollments.map((enr) => (
                        <div key={enr._id}>
                          {enr.courseId?.name
                            ? `${enr.courseId.name} — ${enr.accessLevel === "full" ? "Full" : "Limited"}`
                            : "Unknown course"}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">No enrollments</span>
                  )}
                </td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    onClick={() => {
                      setEditingUser(u);
                      setModalOpen(true);
                    }}
                    className="px-3 py-1 rounded bg-green-400 hover:bg-green-500 text-white"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(u._id)}
                    className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <UserModal user={editingUser} onClose={() => setModalOpen(false)} onSaved={fetchUsers} />
      )}
    </div>
  );
}
