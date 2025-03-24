"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Courses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const res = await fetch("/api/courses");
      const data = await res.json();
      setCourses(data.courses);
    };
    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">Все курсы</h1>
      <ul className="w-full max-w-md bg-white rounded-lg shadow-lg p-4">
        {courses.length > 0 ? (
          courses.map((course) => (
            <li key={course.id} className="p-2 border-b last:border-b-0">
              <Link href={`/courses/${course.id}`} className="text-blue-500 hover:underline">
                {course.title}
              </Link>
            </li>
          ))
        ) : (
          <p>Курсы не найдены.</p>
        )}
      </ul>
    </div>
  );
}
