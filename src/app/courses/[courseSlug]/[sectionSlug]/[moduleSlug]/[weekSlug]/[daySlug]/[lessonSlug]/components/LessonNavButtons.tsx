"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { Lesson } from "@/types";

interface LessonNavButtonsProps {
  currentLesson: Pick<Lesson, "id" | "slug" | "title">;
  lessons: Pick<Lesson, "slug" | "title">[];
}

export default function LessonNavButtons({ currentLesson, lessons }: LessonNavButtonsProps) {
  const { courseSlug, sectionSlug, moduleSlug, weekSlug, daySlug } = useParams() as Record<
    string,
    string
  >;

  const currentIndex = lessons.findIndex((lesson) => lesson.slug === currentLesson.slug);

  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  return (
    <div className="mt-10 flex justify-between items-center gap-6">
      {/* Back Button */}
      {prevLesson ? (
        <Link
          href={`/courses/${courseSlug}/${sectionSlug}/${moduleSlug}/${weekSlug}/${daySlug}/${prevLesson.slug}`}
          className="border border-pink-500 text-pink-600 font-semibold px-4 py-2 rounded-md flex items-center gap-2 hover:bg-pink-50 transition"
        >
          ← Back
        </Link>
      ) : (
        <span className="border border-gray-300 text-gray-400 font-semibold px-4 py-2 rounded-md flex items-center gap-2 cursor-not-allowed">
          ← Back
        </span>
      )}

      {/* Titles */}
      <div className="flex-1 text-center text-gray-800 text-lg font-medium">
        <div>{prevLesson?.title || ""}</div>
        <div className="text-sm text-gray-400">|</div>
        <div>{nextLesson?.title || ""}</div>
      </div>

      {/* Next Button */}
      {nextLesson ? (
        <Link
          href={`/courses/${courseSlug}/${sectionSlug}/${moduleSlug}/${weekSlug}/${daySlug}/${nextLesson.slug}`}
          className="border border-pink-500 text-pink-600 font-semibold px-4 py-2 rounded-md flex items-center gap-2 hover:bg-pink-50 transition"
        >
          Next →
        </Link>
      ) : (
        <span className="border border-gray-300 text-gray-400 font-semibold px-4 py-2 rounded-md flex items-center gap-2 cursor-not-allowed">
          Next →
        </span>
      )}
    </div>
  );
}
