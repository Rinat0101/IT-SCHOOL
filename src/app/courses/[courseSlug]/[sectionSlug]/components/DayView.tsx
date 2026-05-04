"use client";

import React from "react";
import Link from "next/link";
import LessonCard from "./LessonCard";
import type { Lesson } from "@/types";
import { cleanTitle } from "@/app/utils/cleanTitles"; // ✅ import helper

interface DayViewProps {
  dayTitle: string;
  lessons?: Lesson[]; // make optional
  className?: string;
  courseSlug: string;
  sectionSlug: string;
  moduleSlug: string;
  weekSlug: string;
  daySlug: string;
  completedLessons?: string[]; // from enrollment
}

export default function DayView({
  dayTitle,
  lessons = [],
  className,
  courseSlug,
  sectionSlug,
  moduleSlug,
  weekSlug,
  daySlug,
  completedLessons = [],
}: DayViewProps) {

  return (
    <section className={`flex flex-col h-full bg-[#F9FAFB] dark:bg-transparent p-4 ${className || ""}`}>
      {/* ✅ Clean the day title */}
      <h2 className="text-lg font-bold text-[#101828] dark:text-gray-100 mb-3">
        {cleanTitle(dayTitle)}
      </h2>

      <div className="flex-1 space-y-4 overflow-auto pr-1">
        {lessons.length > 0 ? (
          lessons.map((lesson) => {
            const isCompleted = completedLessons.includes(lesson.id);

            return (
              <Link
                key={lesson.id}
                href={`/courses/${courseSlug}/${sectionSlug}/${moduleSlug}/${weekSlug}/${daySlug}/${lesson.slug}`}
                className="block"
              >
                <LessonCard
                  title={cleanTitle(lesson.title)} // ✅ clean lesson titles too
                  type={lesson.lessonType}
                  isMandatory={lesson.isMandatory}
                  isCompleted={isCompleted}
                />
              </Link>
            );
          })
        ) : (
          <div className="h-full min-h-[120px] border border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm italic">
            No lessons
          </div>
        )}
      </div>
    </section>
  );
}