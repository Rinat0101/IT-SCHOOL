"use client";

import Link from "next/link";
import CourseSectionCard from "@/components/courseSectionCard";
import React, { useMemo } from "react";
import { useCourseStore } from "@/stores/useCourseStore";
import type { Lesson } from "@/types";

const getLessonId = (l: any): string =>
  l?.id || l?.datoCmsId || l?._id || l?.lessonId || l?.slug || "";

type SectionLite = {
  id: string;
  title: string;
  slug: string;
  order?: number;
  modules?: {
    id: string;
    weeks: {
      id: string;
      days: {
        id: string;
        lessons: Lesson[];
      }[];
    }[];
  }[];
};

type EnrollmentLite = {
  _id: string;
  courseId: { _id: string; datoCmsId: string; slug: string; name: string };
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "cancelled";
  accessLevel?: "limited" | "full"; // 🟣 added
  goals?: {
    choices: string[];
    location?: string;
    deadline?: string;
  };
};

type UserProgressLite = {
  courseId: string;
  completedLessons: string[];
};

export default function CourseSectionCardsContainer({
  courseSlug,
  sections,
  courseName,
  enrollment,
  userProgress,
}: {
  courseSlug: string;
  sections: SectionLite[];
  courseName?: string;
  enrollment?: EnrollmentLite;
  userProgress?: UserProgressLite;
}) {
  const { setSelectedSection } = useCourseStore();
  const accessLevel = enrollment?.accessLevel ?? "limited";

  // 🧮 Completion per section
  const getCompletionForSection = useMemo(() => {
    if (!userProgress?.completedLessons) return () => 0;
    return (sectionId: string): number => {
      const section = sections.find((s) => s.id === sectionId);
      if (!section || !section.modules) return 0;
      const allLessons =
        section.modules?.flatMap((m) =>
          m.weeks?.flatMap((w) => w.days?.flatMap((d) => d.lessons ?? []))
        ) ?? [];
      const mandatoryLessons = allLessons.some((l) => l.isMandatory)
        ? allLessons.filter((l) => l.isMandatory)
        : allLessons;
      const totalWeight = mandatoryLessons.reduce(
        (acc, l) => acc + (l.lessonType === "Lab" ? 2 : 1),
        0
      );
      const completedWeight = mandatoryLessons.reduce((acc, l) => {
        const id = getLessonId(l);
        if (userProgress.completedLessons.includes(id)) {
          return acc + (l.lessonType === "Lab" ? 2 : 1);
        }
        return acc;
      }, 0);
      return totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
    };
  }, [sections, userProgress]);

  // 🔒 Determine if section should be locked
  const isSectionLocked = (index: number) => {
    if (accessLevel === "full") return false;
    // limited students: allow first section + first module of second section
    if (index === 0) return false;
    if (index === 1) return false;
    return true;
  };

  return (
    <div className="w-full bg-white dark:bg-[#0b0f17] min-h-screen">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8 py-8">
        {courseName && (
          <h1 className="text-xl font-bold text-[#212B36] dark:text-gray-100 mb-4">{courseName}</h1>
        )}

        {/* Sections grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full dialog-shadow rounded-lg p-5 mt-10 bg-white dark:bg-[#1a1f29] dark:border dark:border-gray-800">
          {sections?.length ? (
            sections.map((section, idx) => {
              const locked = isSectionLocked(idx);
              const card = (
                <CourseSectionCard
                  title={section.title}
                  completionPercentage={getCompletionForSection(section.id)}
                />
              );

              return locked ? (
                <div
                  key={section.id}
                  className="relative opacity-30 cursor-not-allowed"
                >
                  {card}
                 
                </div>
              ) : (
                <Link
                  key={section.id}
                  href={`/courses/${courseSlug}/${section.slug}`}
                  onClick={() =>
                    setSelectedSection({
                      id: section.id,
                      title: section.title,
                      slug: section.slug,
                    })
                  }
                  className="block"
                >
                  {card}
                </Link>
              );
            })
          ) : (
            <p className="text-[#6B778C] dark:text-gray-400">No sections available.</p>
          )}
        </div>

      </div>
    </div>
  );
}