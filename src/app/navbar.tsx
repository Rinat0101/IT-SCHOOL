'use client';

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import ProfileMenu from "@/components/ProfileMenu";
import ThemeSwitch from "@/components/ThemeSwitch";

type SafeUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: "student" | "admin";
  enrollments?: any[];
};

export default function Navbar() {
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated";
  const user = (session?.user ?? {}) as SafeUser;
  const isAdmin = user.role === "admin";

  return (
    <header className="w-full bg-white dark:bg-[#0b0f17] border-b border-gray-100 dark:border-gray-800 transition-colors">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8 h-16 flex items-center">
        <div className="shrink-0">
          <Link href="/courses" aria-label="Home" className="flex items-center gap-2">
            <Image src="/images/logo.svg" alt="Logo" width={62} height={44} priority data-no-dark-bg />
          </Link>
        </div>

        <nav className="flex-1 flex justify-center">
          <Link
            href="/courses"
            className="relative text-sm font-semibold text-[#1B2633] dark:text-gray-200 hover:text-[#B923AE] dark:hover:text-[#F4B8FF]"
          >
            Courses
            <span className="absolute left-0 -bottom-1.5 h-[2px] w-full bg-[#B923AE] rounded-full" />
          </Link>
        </nav>

        <div className="shrink-0 flex items-center gap-4">
          {isAuthed ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-sm font-semibold text-[#1B2633] dark:text-gray-200 hover:text-[#B923AE] dark:hover:text-[#F4B8FF] transition-colors"
                >
                  Admin Dashboard
                </Link>
              )}
              <ThemeSwitch />
              <ProfileMenu
                user={{
                  name: user.name ?? null,
                  email: user.email ?? null,
                  image: user.image ?? null,
                }}
              />
            </>
          ) : (
            <>
              <ThemeSwitch />
              <Link
                href="/api/auth/signin"
                className="text-sm font-semibold text-[#B923AE] dark:text-[#F4B8FF] hover:underline"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}