"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function AboutPage() {
  const { data: session } = useSession();
  const [form, setForm] = useState({
    fullName: "",
    github: "",
    linkedin: "",
    personalWebsite: "",
    profilePicture: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ✅ Load user info from API (using user.id instead of email)
  useEffect(() => {
    async function fetchUser() {
      if (!session?.user?.id) return;
      const res = await fetch(`/api/users/${session.user.id}`);
      if (res.ok) {
        const data = await res.json();
        setForm({
          fullName: `${data.name ?? ""} ${data.lastName ?? ""}`.trim(),
          github: data.github || "",
          linkedin: data.linkedin || "",
          personalWebsite: data.personalWebsite || "",
          profilePicture: data.profilePicture || "",
        });
      }
      setLoading(false);
    }
    fetchUser();
  }, [session]);

  // ✅ Handle save
  async function handleSave() {
    if (!session?.user?.id) return;
    setSaving(true);

    const [firstName, ...rest] = form.fullName.split(" ");
    const lastName = rest.join(" ");

    const res = await fetch(`/api/users/${session.user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: firstName,
        lastName,
        github: form.github,
        linkedin: form.linkedin,
        personalWebsite: form.personalWebsite,
        profilePicture: form.profilePicture,
      }),
    });

    if (res.ok) {
      alert("Profile updated successfully ✅");
    } else {
      alert("Error updating profile ❌");
    }
    setSaving(false);
  }

  // ✅ Handle file upload (preview only for now)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setForm((f) => ({ ...f, profilePicture: url }));
    }
  };

  // ✅ Handle delete image
  const handleDeleteImage = () => {
    setForm((f) => ({ ...f, profilePicture: "" }));
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="flex flex-col items-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-6">About me</h2>

        <div className="flex gap-6 items-center mb-6">
          {/* Profile picture */}
          <div className="flex flex-col items-center">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50"
            >
              {form.profilePicture ? (
                <Image
                  src={form.profilePicture}
                  alt="Profile"
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-500">
                  <Image
                    src="/icons/add_image.svg"
                    alt="Upload"
                    width={28}
                    height={28}
                  />
                  <span className="text-sm mt-1">Upload photo</span>
                </div>
              )}
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Action buttons */}
            {form.profilePicture && (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="hover:text-blue-600 font-medium"
                >
                  Choose another
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={handleDeleteImage}
                  className="hover:text-red-600 font-medium"
                >
                  Delete
                </button>
              </div>
            )}

            <p className="text-xs text-gray-400 mt-2 text-center">
              Allowed *.jpeg, *.jpg, *.png, *.gif <br /> Max size of 3.1 MB
            </p>
          </div>

          {/* Info fields */}
          <div className="flex flex-col gap-4 flex-1">
            <input
              type="text"
              placeholder="Full name"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="input"
            />
            <input
              type="text"
              placeholder="GitHub"
              value={form.github}
              onChange={(e) => setForm({ ...form, github: e.target.value })}
              className="input"
            />
            <input
              type="text"
              placeholder="LinkedIn"
              value={form.linkedin}
              onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
              className="input"
            />
            <input
              type="text"
              placeholder="Personal Website"
              value={form.personalWebsite}
              onChange={(e) =>
                setForm({ ...form, personalWebsite: e.target.value })
              }
              className="input"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 rounded-lg bg-blue-1 text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}