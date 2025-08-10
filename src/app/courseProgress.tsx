'use client';

import Link from "next/link";
import CourseSectionCard from "@/components/courseSectionCard";
import GoalsCard from "@/components/GoalsCard";
import React from "react";
import { useCourseStore } from "@/stores/useCourseStore";

const CourseSectionCardsContainer = ({
  courseSlug,
  sections,
}: {
  courseSlug: string;
  sections: { id: string; title: string; slug: string }[];
}) => {
  const { setSelectedSection } = useCourseStore();

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full dialog-shadow rounded-lg p-5 mt-10">
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
                iconUrl="/images/plain-logo.png"
              />
            </Link>
          ))
        ) : (
          <p>No sections available.</p>
        )}
      </div>

      <div className="max-w-xl mx-auto my-10">
        <GoalsCard />
      </div>
    </>
  );
};

export default CourseSectionCardsContainer;