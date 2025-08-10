"use client";

import React from "react";
import LessonCard from "./LessonCard";
import type { Lesson } from "@/types";

interface DayViewProps {
  dayTitle: string;
  lessons: Lesson[];
  className?: string; // allow parent to pass flex-1, etc.
}

export default function DayView({ dayTitle, lessons, className }: DayViewProps) {
  return (
    <section
      className={`flex flex-col h-full bg-[#F9FAFB] rounded-lg p-4 shadow-md ${className || ""}`}
    >
      {/* Header stays pinned */}
      <h2 className="text-lg font-bold text-[#101828] mb-3">{dayTitle}</h2>

      {/* List grows and scrolls if it overflows */}
      <div className="flex-1 space-y-4 overflow-auto pr-1">
        {lessons.length ? (
          lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              title={lesson.title}
              type={lesson.lessonType}
              isMandatory={lesson.isMandatory}
            />
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