"use client";

import { useEffect } from "react";
import { useCourseStore } from "@/stores/useCourseStore";
import Breadcrumbs from "@/app/path";
import ModuleWrapper from "./ModuleWrapper";
import { Course, Section } from "@/types";

interface SectionClientPageProps {
  course: Course;
  section: Section;
}

export default function SectionClientPage({
  course,
  section,
}: SectionClientPageProps) {
  const setSelectedCourse = useCourseStore((state) => state.setSelectedCourse);
  const setSelectedSection = useCourseStore((state) => state.setSelectedSection);

  useEffect(() => {
    if (course && section) {
      setSelectedCourse(course);
      setSelectedSection(section);
    }
  }, [course, section, setSelectedCourse, setSelectedSection]);

  return (
    <div className="min-h-screen container mx-auto p-8 bg-white">
      <h1 className="text-xl text-[#000000] font-bold mb-6">{section.title}</h1>

      <Breadcrumbs
        courseName={course.name}
        courseSlug={course.slug}
        currentPage={section.title}
      />

      <ModuleWrapper />
    </div>
  );
}