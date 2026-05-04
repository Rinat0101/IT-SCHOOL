"use client";

import { useEffect } from "react";
import { useCourseStore } from "@/stores/useCourseStore";
import Breadcrumbs from "@/app/path";
import ModuleWrapper from "./ModuleWrapper";
import type { CourseHeader, SectionDeepForPage } from "@/types/index";
import { cleanTitle } from "@/app/utils/cleanTitles";

interface SectionClientPageProps {
  course: CourseHeader;
  section: SectionDeepForPage;
  enrollment?: any;
  userProgress?: {
    courseId: string;
    completedLessons: string[];
  };
}

export default function SectionClientPage({
  course,
  section,
  enrollment,
  userProgress,
}: SectionClientPageProps) {
  const setSelectedCourse = useCourseStore((s) => s.setSelectedCourse);
  const setSelectedSection = useCourseStore((s) => s.setSelectedSection);
  const setSelectedModule = useCourseStore((s) => s.setSelectedModule);
  const setSelectedWeekId = useCourseStore((s) => s.setSelectedWeekId);

  // 🟣 Reset and hydrate Zustand store on section change
  useEffect(() => {
    // 🧹 Clear previous section/module/week state
    useCourseStore.setState({
      selectedCourse: null,
      selectedSection: null,
      selectedModule: null,
      selectedWeekId: null,
    });

    // 🆕 Set new course + section
    setSelectedCourse(course as any);
    setSelectedSection(section as any);
  }, [
    course.id, // run only when switching course or section
    section.id,
    setSelectedCourse,
    setSelectedSection,
    setSelectedModule,
    setSelectedWeekId,
  ]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0f17]">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-xl font-bold text-black dark:text-gray-100 mb-4">{cleanTitle(section.title)}</h1>

        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Courses", href: "/courses" },
            { label: course.name, href: `/courses/${course.slug}` },
            { label: cleanTitle(section.title) },
          ]}
          className="mb-6"
        />

        {/* 🟢 Pass both enrollment and userProgress */}
        <ModuleWrapper enrollment={enrollment} userProgress={userProgress} />
      </div>
    </div>
  );
}