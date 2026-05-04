"use client";

import Link from "next/link";
import { useCourseStore } from "@/stores/useCourseStore";
import type { Lesson } from "@/types";

type Props = {
  lessons: {
    id: string;
    title: string;
    slug: string;
    lessonType: Lesson["lessonType"];
    isMandatory: boolean;
    order?: number | null;
  }[];
  baseHref: string;
  currentLessonSlug: string;
  currentDayTitle: string;
  sectionHref: string;
  className?: string;
};

const TYPE_BADGE: Record<Lesson["lessonType"], string> = {
  Lesson: "LESSON",
  Lab: "LAB",
  Assessment: "ASSESSMENT",
  "Class Recording": "CLASS RECORDING",
  Extra: "EXTRA",
};

export default function DaySidebar({
  lessons,
  baseHref,
  currentLessonSlug,
  currentDayTitle,
  sectionHref,
  className = "",
}: Props) {
  const cleanBase = baseHref.replace(/\/+$/, "").replace(/\/{2,}/g, "/");
  const sorted = [...lessons].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const activeExists = sorted.some((l) => l.slug === currentLessonSlug);

  const completedLessons = useCourseStore((s) => s.completedLessons);
  const completedSet = new Set(completedLessons);

  return (
    <aside className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex items-center gap-2">
          <Link
            href={sectionHref}
            className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-gray-100 flex items-center"
            aria-label="Back to section"
            title="Back to section"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 15.707a1 1 0 01-1.414 0L6.586 11l4.707-4.707a1 1 0 111.414 1.414L9.414 11l3.293 3.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>

          <h2 className="text-sm font-semibold uppercase text-[#212B36] dark:text-gray-100">
            {currentDayTitle}
          </h2>
        </div>
      </div>

      {/* Lessons list */}
      <ul className="relative">
        {sorted.map((l, idx) => {
          const href = `${cleanBase}/${encodeURIComponent(l.slug)}`;
          const isActive = activeExists && currentLessonSlug === l.slug;
          const isCompleted = completedSet.has(l.id);

          const size = isCompleted
            ? isActive
              ? 20
              : 16
            : isActive
            ? 18
            : 14;

          return (
            <li key={l.id} className="relative pl-16 pb-5">
              {/* Connecting line */}
              {idx < sorted.length - 1 && (
                <div
                  className="absolute left-4 w-px bg-gray-300 dark:bg-gray-700 z-0"
                  style={{
                    top: `calc(${size / 2}px + 0.6rem)`,
                    bottom: "-1.25rem",
                  }}
                />
              )}

              {/* Circle */}
              <div
                className="absolute top-5 left-4 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-200 z-10"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  borderRadius: "50%",
                  border: `2px solid ${
                    isCompleted ? "#00AB55" : isActive ? "#00AB55" : "#C1C7D0"
                  }`,
                  // Uses --background CSS var which flips with the theme so the circle masks the line.
                  backgroundColor: isCompleted ? "#00AB55" : "var(--background)",
                  // Thin white ring around the active lesson's indicator.
                  boxShadow: isActive ? "0 0 0 1.5px #FFFFFF" : undefined,
                }}
                aria-hidden
              >
                {isCompleted ? (
                  <img
                    src="/icons/check.svg"
                    alt="Completed"
                    style={{
                      width: isActive ? "11px" : "9px",
                      height: isActive ? "11px" : "9px",
                    }}
                  />
                ) : null}
              </div>

              {/* Lesson text */}
              <div className="ml-2">
                <span
                  className="inline-block text-[11px] font-semibold text-white rounded-md px-2 py-1"
                  style={{
                    backgroundColor:
                      l.lessonType === "Lab" ? "#F5C71A" : "#06B6A9",
                  }}
                >
                  {TYPE_BADGE[l.lessonType]}
                </span>

                <h4
                  className={`mt-1 text-sm font-bold transition-all duration-200 ${
                    isActive ? "text-[#000] dark:text-white text-[15px]" : "text-[#212B36] dark:text-gray-200"
                  }`}
                >
                  <Link
                    href={href}
                    className={`hover:underline ${
                      isCompleted ? "text-gray-500 dark:text-gray-400" : ""
                    }`}
                    {...(isActive ? { "aria-current": "page" } : {})}
                  >
                    {l.title}
                  </Link>
                </h4>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}