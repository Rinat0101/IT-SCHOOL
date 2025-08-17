"use client";

import { useEffect } from "react";
import { useCourseStore } from "@/stores/useCourseStore";
import Breadcrumbs from "@/app/path"
import ModuleWrapper from "./ModuleWrapper";
import type { Course, Section } from "@/types";

interface SectionClientPageProps {
  course: Course;
  section: Section;
}

export default function SectionClientPage({ course, section }: SectionClientPageProps) {
  const setSelectedCourse = useCourseStore((s) => s.setSelectedCourse);
  const setSelectedSection = useCourseStore((s) => s.setSelectedSection);

  useEffect(() => {
    if (course) setSelectedCourse(course);
    if (section) setSelectedSection(section);
  }, [course, section, setSelectedCourse, setSelectedSection]);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-xl font-bold !text-black mb-4">{section.title}</h1>

        <Breadcrumbs
          items={[
            { label: "Courses", href: "/courses" },
            { label: course.name, href: `/courses/${course.slug}` },
            { label: section.title }, 
          ]}
          className="mb-6"
        />

        <ModuleWrapper />
      </div>
    </div>
  );
}