'use client';

import { useEffect } from "react";
import Link from "next/link";
import { useCourseStore } from "@/stores/useCourseStore";
import PurchasedCourseCard from "@/components/purchasedCourseCard";
import NonPurchasedCourseCard from "@/components/nonPurchasedCourseCard";
import { Course } from "@/types"; // make sure this import exists

export default function DashboardClient({ courses }: { courses: { purchased: Course[]; nonPurchased: Course[] } }) {
  const {
    setPurchasedCourses,
    setNonPurchasedCourses,
    setSelectedCourse,
    purchasedCourses,
    nonPurchasedCourses
  } = useCourseStore();

  useEffect(() => {
    setPurchasedCourses(courses.purchased);
    setNonPurchasedCourses(courses.nonPurchased);
  }, [courses, setPurchasedCourses, setNonPurchasedCourses]);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto">
        <h1 className="text-xl text-[#000000] font-bold mb-6">Courses</h1>

        {/* Purchased */}
        <section className="mb-8">
          <h2 className="text-2xl text-gray-2 font-semibold mb-6">Current courses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {purchasedCourses.map((course) => (
              <Link
              key={course.id}
              href={`/courses/${course.slug}`}
              className="block"
              onClick={() => {
                setSelectedCourse(course);
                console.log("Selected course:", course);
              }}
            >
                <PurchasedCourseCard
                  title={course.name}
                  startDate={course.startDate ?? "N/A"}
                  endDate={course.endDate ?? "N/A"}
                  completionPercentage={60}
                />
              </Link>
            ))}
          </div>
        </section>

        {/* Non-Purchased */}
        {nonPurchasedCourses.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl text-gray-2 font-semibold mb-4">
              Courses that will help you become a better person
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {nonPurchasedCourses.map((course) => (
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