// components/LessonNavButtons.tsx
"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import type { Lesson } from "@/types";

interface LessonNavButtonsProps {
  currentLesson: Pick<Lesson, "id" | "slug" | "title">;
  lessons: Pick<Lesson, "slug" | "title">[];
}

export default function LessonNavButtons({
  currentLesson,
  lessons,
}: LessonNavButtonsProps) {
  const pathname = usePathname() || "";

  const {
    courseSlug = "",
    sectionSlug = "",
    moduleSlug = "",
    weekSlug = "",
    daySlug = "",
  } = (useParams() as Record<string, string>) ?? {};

  // Find current lesson index; if not found (idx === -1), try URL last segment
  let idx = lessons.findIndex((l) => l.slug === currentLesson.slug);
  if (idx === -1 && pathname) {
    const lastSeg = pathname.split("#")[0].split("?")[0].replace(/\/+$/, "").split("/").pop() || "";
    idx = lessons.findIndex((l) => l.slug === lastSeg);
  }

  const prev = idx > 0 ? lessons[idx - 1] : null;
  const next = idx >= 0 && idx < lessons.length - 1 ? lessons[idx + 1] : null;

  const pathFor = (slug: string) =>
    `/courses/${courseSlug}/${sectionSlug}/${moduleSlug}/${weekSlug}/${daySlug}/${slug}`;

  const btnBase =
    "inline-flex items-center justify-center gap-2 h-[40px] min-w-[140px] px-4 rounded-lg border text-sm font-bold transition";
  const btnPurple =
    "border-[#D58AD7] text-[#B923AE] dark:text-[#F4B8FF] dark:border-[#F4B8FF]/40 hover:bg-[#B923AE]/5 dark:hover:bg-[#F4B8FF]/10 focus:outline-none focus:ring-2 focus:ring-[#B923AE]/30";
  const btnDisabled =
    "border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed pointer-events-none";

  return (
    <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
      {/* Back */}
      <div className="text-center sm:text-right">
        {prev ? (
          <Link
            href={pathFor(prev.slug)}
            prefetch={false}
            rel="prev"
            className={`${btnBase} ${btnPurple}`}
            aria-label="Go to previous lesson"
          >
            <span aria-hidden>←</span>
            Back
          </Link>
        ) : (
          <span className={`${btnBase} ${btnDisabled}`} aria-disabled="true">
            <span aria-hidden>←</span>
            Back
          </span>
        )}

        <div className="mt-3 text-[14px] leading-[22px] font-normal text-[#1B2633] dark:text-gray-300">
          {prev?.title ?? ""}
        </div>
      </div>

      {/* Next */}
      <div className="text-center sm:text-left">
        {next ? (
          <Link
            href={pathFor(next.slug)}
            prefetch={false}
            rel="next"
            className={`${btnBase} ${btnPurple}`}
            aria-label="Go to next lesson"
          >
            Next
            <span aria-hidden>→</span>
          </Link>
        ) : (
          <span className={`${btnBase} ${btnDisabled}`} aria-disabled="true">
            Next
            <span aria-hidden>→</span>
          </span>
        )}

        <div className="mt-3 text-[14px] leading-[22px] font-normal text-[#1B2633] dark:text-gray-300">
          {next?.title ?? ""}
        </div>
      </div>
    </div>
  );
}