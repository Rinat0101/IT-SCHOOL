"use client";

import React from "react";
import Link from "next/link";
import LessonCard from "./LessonCard";
import type { Lesson } from "@/types";

interface DayViewProps {
  dayTitle: string;
  lessons: Lesson[];
  className?: string;
  courseSlug: string;
  sectionSlug: string;
  moduleSlug: string;
  weekSlug: string;
  daySlug: string;
}

export default function DayView({
  dayTitle,
  lessons,
  className,
  courseSlug,
  sectionSlug,
  moduleSlug,
  weekSlug,
  daySlug,
}: DayViewProps) {
  return (
    <section className={`flex flex-col h-full bg-[#F9FAFB] p-4 ${className || ""}`}>
      <h2 className="text-lg font-bold text-[#101828] mb-3">{dayTitle}</h2>

      <div className="flex-1 space-y-4 overflow-auto pr-1">
        {lessons.length ? (
          lessons.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/courses/${courseSlug}/${sectionSlug}/${moduleSlug}/${weekSlug}/${daySlug}/${lesson.slug}`}
              className="block"
            >
              <LessonCard
                title={lesson.title}
                type={lesson.lessonType}
                isMandatory={lesson.isMandatory}
              />
            </Link>
          ))
        ) : (
          <div className="h-full min-h-[120px] border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm italic">
            No lessons
          </div>
        )}
      </div>
    </section>
  );
}
