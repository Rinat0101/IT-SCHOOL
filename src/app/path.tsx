"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface BreadcrumbProps {
  courseSlug: string;
  courseName: string;
  currentPage?: string; // optional now
}

const Breadcrumbs: React.FC<BreadcrumbProps> = ({
  courseSlug,
  courseName,
  currentPage,
}) => {
  const router = useRouter();

  return (
    <nav className="text-sm text-gray-600 mb-4">
      <ul className="flex items-center space-x-2">
        {/* Courses root */}
        <li
          className="cursor-pointer hover:text-blue-500"
          onClick={() => router.push("/courses")}
        >
          Courses
        </li>
        <li>&gt;</li>

        {/* Course page */}
        <li
          className="cursor-pointer hover:text-blue-500"
          onClick={() => router.push(`/courses/${courseSlug}`)}
        >
          {courseName}
        </li>

        {/* Optional current page */}
        {currentPage && (
          <>
            <li>&gt;</li>
            <li className="text-gray-500">{currentPage}</li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Breadcrumbs;