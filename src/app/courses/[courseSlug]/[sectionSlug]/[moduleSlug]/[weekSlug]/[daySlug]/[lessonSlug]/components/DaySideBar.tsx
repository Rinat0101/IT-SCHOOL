"use client";

import Link from "next/link";
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
  currentLessonSlug,
  currentDayTitle,
  sectionHref,
  className = "",
}: Props) {
  return (
    <aside className={`w-full ${className}`}>
      {/* Header with back button + day title */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex items-center gap-2">
          <Link href={sectionHref} className="text-gray-600 hover:text-black flex items-center">
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

          <h2 className="text-sm font-semibold uppercase text-[#212B36]">{currentDayTitle}</h2>
        </div>
      </div>

      <ul className="relative">
        {lessons.map((l, idx) => {
          const isActive = l.slug === currentLessonSlug;
          return (
            <li key={l.id} className="relative pl-16 pb-10">
              {/* vertical rail */}
              {idx < lessons.length - 1 && (
                <div
                  className="absolute left-4 w-px bg-gray-300"
                  style={{
                    top: "1.25rem",
                    bottom: "-1.25rem",
                  }}
                />
              )}

              {/* circle */}
              <div
                className="absolute top-5 left-4 -translate-x-1/2 -translate-y-1/2
                           w-4 h-4 rounded-full border-2 bg-white
                           flex items-center justify-center"
                style={{ borderColor: isActive ? "#00AB55" : "#C1C7D0" }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: isActive ? "#00AB55" : "#C1C7D0" }}
                />
              </div>

              {/* badge + title */}
              <div className="ml-2">
                <span
                  className="inline-block text-[11px] font-semibold text-white rounded-md px-2 py-1"
                  style={{
                    backgroundColor: l.lessonType === "Lab" ? "#F5C71A" : "#06B6A9",
                  }}
                >
                  {TYPE_BADGE[l.lessonType]}
                </span>

                <h4 className="mt-1 text-sm font-medium text-[#212B36]">
                  <Link href={l.slug} className="hover:underline">
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
