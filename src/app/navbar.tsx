'use client';

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import ProfileMenu from "@/components/ProfileMenu";

type SafeUser = { 
  name?: string | null; 
  email?: string | null; 
  image?: string | null; 
  enrollments?: any[]; // 🔹 add this to catch enrollments
};

export default function Navbar() {
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated";
  const user = (session?.user ?? {}) as SafeUser;

  return (
    <header className="w-full bg-white border-b border-gray-100">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8 h-16 flex items-center">
        <div className="shrink-0">
          <Link href="/dashboard" aria-label="Home" className="flex items-center gap-2">
            <Image src="/images/logo.svg" alt="Logo" width={62} height={44} priority />
          </Link>
        </div>

        <nav className="flex-1 flex justify-center">
          <Link
            href="/courses"
            className="relative text-sm font-semibold text-[#1B2633] hover:text-[#B923AE]"
          >
            Courses
            <span className="absolute left-0 -bottom-1.5 h-[2px] w-full bg-[#B923AE] rounded-full" />
          </Link>
        </nav>

        <div className="shrink-0 flex items-center gap-4">
          {isAuthed ? (
            <ProfileMenu
              user={{
                name: user.name ?? null,
                email: user.email ?? null,
                image: user.image ?? null,
              }}
            />
          ) : (
            <Link 
              href="/api/auth/signin" 
              className="text-sm font-semibold text-[#B923AE] hover:underline"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}