"use client";

import React from "react";
import Breadcrumbs from "@/app/path"
import CourseProgress from "@/app/courseProgress";

const CoursePage = () => {
  // You can fetch/derive these dynamically later
  const courseName = "Web Development Path";
  const courseSlug = "web-development"; // update if different
  const currentPage = "Overview";

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-xl font-bold text-black mb-4">Web Development</h1>

        <Breadcrumbs
          items={[
            { label: "Courses", href: "/courses" },
            { label: courseName, href: `/courses/${courseSlug}` },
            { label: currentPage }, // current page, no href
          ]}
          className="mb-6"
        />

        <CourseProgress />
      </div>
    </div>
  );
};

export default CoursePage;