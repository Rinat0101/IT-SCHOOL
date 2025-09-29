"use client";

import React from "react";
import Link from "next/link";
import LessonCard from "./LessonCard";
import type { Lesson } from "@/types";

interface DayViewProps {
  dayTitle: string;
  lessons?: Lesson[];   // make optional
  className?: string;
  courseSlug: string;
  sectionSlug: string;
  moduleSlug: string;
  weekSlug: string;
  daySlug: string;

  // 🆕 Enrollment progress: completed lessons
  completedLessons?: string[];
}

export default function DayView({
  dayTitle,
  lessons = [],          // ✅ always fallback to []
  className,
  courseSlug,
  sectionSlug,
  moduleSlug,
  weekSlug,
  daySlug,
  completedLessons = [],
}: DayViewProps) {
  console.log({ courseSlug, sectionSlug, moduleSlug, weekSlug, daySlug, lessons });
  return (
    <section className={`flex flex-col h-full bg-[#F9FAFB] p-4 ${className || ""}`}>
      <h2 className="text-lg font-bold text-[#101828] mb-3">{dayTitle}</h2>

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
                  title={lesson.title}
                  type={lesson.lessonType}
                  isMandatory={lesson.isMandatory}
                  isCompleted={isCompleted} // ✅ highlight progress
                />
              </Link>
            );
          })
        ) : (
          <div className="h-full min-h-[120px] border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm italic">
            No lessons
          </div>
        )}
      </div>
    </section>
  );
}