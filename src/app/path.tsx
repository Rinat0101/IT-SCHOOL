"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface BreadcrumbProps {
  courseName: string;
  currentPage: string;
}

const Breadcrumbs: React.FC<BreadcrumbProps> = ({ courseName, currentPage }) => {
  const router = useRouter();

  return (
    <nav className="text-sm text-gray-600 mb-4">
      <ul className="flex items-center space-x-2">
        {/* Home link */}
        <li
          className="cursor-pointer hover:text-blue-500"
          onClick={() => router.push("/courses")}
        >
          Courses
        </li>
        <li>&gt;</li>

        {/* Course name link */}
        <li
          className="cursor-pointer hover:text-blue-500"
          onClick={() => router.push(`/courses/${courseName.toLowerCase().replace(/\s/g, "-")}`)}
        >
          {courseName}
        </li>
        <li>&gt;</li>

        {/* Current page */}
        <li className="text-gray-500">{currentPage}</li>
      </ul>
    </nav>
  );
};

export default Breadcrumbs;