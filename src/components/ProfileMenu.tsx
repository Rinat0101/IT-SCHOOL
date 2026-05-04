"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

type UserLite = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

function initials(name?: string | null) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "U";
}

export default function ProfileMenu({ user }: { user: UserLite }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!open) return;
      const t = e.target as Node;
      if (popRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative">
      {/* Avatar button */}
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="h-10 w-10 rounded-full overflow-hidden ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-gray-300 dark:hover:ring-gray-600 focus:outline-none focus:ring-2 focus:ring-[#B923AE]/40"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {user?.image ? (
          <Image
            src={user.image}
            alt={user?.name ?? "User"}
            width={40}
            height={40}
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full grid place-items-center bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-semibold">
            {initials(user?.name)}
          </div>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          ref={popRef}
          role="menu"
          className="absolute right-0 mt-3 w-80 rounded-2xl bg-white dark:bg-[#1a1f29] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50"
        >
          {/* Header */}
          <div className="px-5 py-4">
            <div className="text-lg font-semibold text-[#1B2633] dark:text-gray-100 leading-6">
              {user?.name ?? "User"}
            </div>
            <div className="text-sm text-[#6B778C] dark:text-gray-400 truncate">
              {user?.email ?? ""}
            </div>
          </div>

          <div className="h-px bg-gray-100 dark:bg-gray-700" />

          {/* About me */}
          <div className="px-5 py-2">
            <Link
              href="/about"
              className="block w-full text-left text-sm font-semibold text-[#1B2633] dark:text-gray-200 hover:text-[#B923AE] dark:hover:text-[#F4B8FF] transition-colors"
            >
              About me
            </Link>
          </div>

          <div className="h-px bg-gray-100 dark:bg-gray-700" />

          {/* Logout */}
          <div className="px-5 pb-4 pt-2">
            <LogoutButton />
          </div>
        </div>
      )}
    </div>
  );
}