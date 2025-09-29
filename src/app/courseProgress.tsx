"use client";

import Link from "next/link";
import CourseSectionCard from "@/components/courseSectionCard";
import GoalsCard from "@/components/GoalsCard";
import React from "react";
import { useCourseStore } from "@/stores/useCourseStore";

// Section shape
type SectionLite = { id: string; title: string; slug: string };

// Enrollment shape (simplified, expand later)
type EnrollmentLite = {
  _id: string;
  courseId: { _id: string; datoCmsId: string; slug: string; name: string };
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "cancelled";
  goals?: {
    choices: string[];
    location?: string;
    deadline?: string;
  };
  labs?: {
    lessonId: string;
    repoLink: string;
    submittedAt: string;
  }[];
};

export default function CourseSectionCardsContainer({
  courseSlug,
  sections,
  courseName,
  enrollment,
}: {
  courseSlug: string;
  sections: SectionLite[];
  courseName?: string;
  enrollment?: EnrollmentLite;
}) {
  const { setSelectedSection } = useCourseStore();

  // 🔹 Placeholder: compute completion per section
  const getCompletionForSection = (sectionId: string): number => {
    if (!enrollment) return 0;
    // TODO: match labs/completed lessons with section lessons
    return 0;
  };

  return (
    <div className="w-full bg-white min-h-screen">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8 py-8">
        {/* Course title */}
        {courseName ? (
          <h1 className="text-xl font-bold !text-[#212B36] mb-4">{courseName}</h1>
        ) : null}

        {/* Sections grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full dialog-shadow rounded-lg p-5 mt-10 bg-white">
          {sections?.length ? (
            sections.map((section) => (
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
                <CourseSectionCard
                  title={section.title}
                  completionPercentage={getCompletionForSection(section.id)}
                />
              </Link>
            ))
          ) : (
            <p className="text-[#6B778C]">No sections available.</p>
          )}
        </div>

        {/* Goals */}
        {enrollment?.goals && (
          <div className="max-w-xl mx-auto my-10">
            <GoalsCard goals={enrollment.goals} />
          </div>
        )}
      </div>
    </div>
  );
}