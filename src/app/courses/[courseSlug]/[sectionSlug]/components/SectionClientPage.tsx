"use client";

import { useEffect } from "react";
import { useCourseStore } from "@/stores/useCourseStore";
import Breadcrumbs from "@/app/path";
import ModuleWrapper from "./ModuleWrapper";
import type { CourseHeader, SectionDeepForPage } from "@/types/index";

interface SectionClientPageProps {
  course: CourseHeader;             // slim course info
  section: SectionDeepForPage;      // deep section structure
  enrollment?: any;                 // user’s enrollment for progress
}

export default function SectionClientPage({ course, section, enrollment }: SectionClientPageProps) {
  const setSelectedCourse = useCourseStore((s) => s.setSelectedCourse);
  const setSelectedSection = useCourseStore((s) => s.setSelectedSection);

  // hydrate Zustand store
  useEffect(() => {
    setSelectedCourse(course as any);
    setSelectedSection(section as any);
  }, [course, section, setSelectedCourse, setSelectedSection]);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-xl font-bold !text-black mb-4">{section.title}</h1>

        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Courses", href: "/courses" },
            { label: course.name, href: `/courses/${course.slug}` },
            { label: section.title },
          ]}
          className="mb-6"
        />

        {/* Module wrapper now gets enrollment */}
        <ModuleWrapper enrollment={enrollment} />
      </div>
    </div>
  );
}