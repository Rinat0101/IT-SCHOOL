// app/courses/CoursesClient.tsx
"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useCourseStore } from "@/stores/useCourseStore";
import PurchasedCourseCard from "@/components/purchasedCourseCard";
import NonPurchasedCourseCard from "@/components/nonPurchasedCourseCard";
import type { Course } from "@/types";

type GroupedCourses = { purchased: Course[]; nonPurchased: Course[] };

export default function CoursesClient({ courses }: { courses: GroupedCourses }) {
  const {
    setPurchasedCourses,
    setNonPurchasedCourses,
    setSelectedCourse,
    purchasedCourses,
    nonPurchasedCourses,
  } = useCourseStore();

  // hydrate store from server data
  useEffect(() => {
    setPurchasedCourses(courses.purchased || []);
    setNonPurchasedCourses(courses.nonPurchased || []);
  }, [courses, setPurchasedCourses, setNonPurchasedCourses]);

  // simple alphabetical sort for a stable UI (optional)
  const purchasedSorted = useMemo(
    () => [...(purchasedCourses || [])].sort((a, b) => a.name.localeCompare(b.name)),
    [purchasedCourses]
  );
  const nonPurchasedSorted = useMemo(
    () => [...(nonPurchasedCourses || [])].sort((a, b) => a.name.localeCompare(b.name)),
    [nonPurchasedCourses]
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto">
        <h1 className="text-xl text-[#000000] font-bold mb-6">Courses</h1>

        {/* Purchased */}
        <section className="mb-8">
          <h2 className="text-2xl text-gray-2 font-semibold mb-6">Current courses</h2>

          {purchasedSorted.length === 0 ? (
            <div className="text-[#6B778C]">No purchased courses yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {purchasedSorted.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  className="block"
                  onClick={() => setSelectedCourse(course)}
                  aria-label={`Open ${course.name}`}
                >
                  <PurchasedCourseCard
                    title={course.name}
                    // keep placeholders – replace with real DB dates later
                    startDate={course.startDate ?? "N/A"}
                    endDate={course.endDate ?? "N/A"}
                    completionPercentage={60}
                  />
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Non-Purchased */}
        {nonPurchasedSorted.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl text-gray-2 font-semibold mb-4">
              Courses that will help you become a better person
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {nonPurchasedSorted.map((course) => (
                <NonPurchasedCourseCard
                  key={course.id}
                  title={course.name}
                  description="Unlock to learn more"
                  buttonText="Preview"
                  imageUrl="/images/nonpurchased.png"
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}