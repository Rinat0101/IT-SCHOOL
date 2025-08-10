import React from "react";
import Link from "next/link";
import type { Lesson } from "@/types";

type Props = {
  lessons: {
    id: string;
    title: string;
    slug: string;
    lessonType: Lesson["lessonType"];
    isMandatory: boolean;
  }[];
  currentLessonSlug: string;
};

export default function DaySideBar({ lessons, currentLessonSlug }: Props) {
  return (
    <nav>
      <h2 className="text-lg font-semibold mb-4">Lessons</h2>
      <ul className="space-y-2">
        {lessons.map((lesson) => {
          const isActive = lesson.slug === currentLessonSlug;

          return (
            <li key={lesson.id}>
              <Link
                href={lesson.slug}
                className={`block px-4 py-2 rounded-md transition ${
                  isActive
                    ? "bg-blue-600 text-white font-semibold"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {lesson.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}