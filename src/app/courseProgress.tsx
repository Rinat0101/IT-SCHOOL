"use client";

import Link from "next/link";
import CourseSectionCard from "@/components/courseSectionCard";
import GoalsCard from "@/components/GoalsCard";
import React from "react";
import { useCourseStore } from "@/stores/useCourseStore";

type SectionLite = { id: string; title: string; slug: string };

export default function CourseSectionCardsContainer({
  courseSlug,
  sections,
  courseName,
}: {
  courseSlug: string;
  sections: SectionLite[];
  courseName?: string;
}) {
  const { setSelectedSection } = useCourseStore();

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
                  completionPercentage={50}
                />
              </Link>
            ))
          ) : (
            <p className="text-[#6B778C]">No sections available.</p>
          )}
        </div>

        {/* Goals */}
        {/* <div className="max-w-xl mx-auto my-10">
          <GoalsCard />
        </div> */}
      </div>
    </div>
  );
}