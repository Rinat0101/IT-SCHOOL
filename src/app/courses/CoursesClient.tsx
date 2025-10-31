"use client";

import Link from "next/link";
import PurchasedCourseCard from "@/components/purchasedCourseCard";
import NonPurchasedCourseCard from "@/components/nonPurchasedCourseCard";
import type { Course } from "@/types";

type GroupedCourses = { purchased: Course[]; nonPurchased: Course[] };

export default function CoursesClient({ courses }: { courses: GroupedCourses }) {
  const purchasedSorted = [...courses.purchased].sort((a, b) => a.name.localeCompare(b.name));
  const nonPurchasedSorted = [...courses.nonPurchased].sort((a, b) => a.name.localeCompare(b.name));

  // 🧩 Helper to format ISO date strings
  const formatDate = (date: string | null | undefined) => {
    if (!date || date === "N/A") return "—";
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return "—";
    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto">
        <h1 className="text-xl text-[#000000] font-bold my-6">Courses</h1>

        {/* Purchased */}
        <section className="mb-8">
          <h2 className="text-2xl text-gray-2 font-semibold mb-6">Current courses</h2>
          {purchasedSorted.length === 0 ? (
            <div className="text-[#6B778C]">No purchased courses yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {purchasedSorted.map((course) => (
                <Link key={course.id} href={`/courses/${course.slug}`} className="block">
                  <PurchasedCourseCard
                    title={course.name}
                    startDate={formatDate(course.startDate)}
                    endDate={formatDate(course.endDate)}
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
            <h2 className="text-2xl text-gray-2 font-semibold mb-4">Other Courses</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {nonPurchasedSorted.map((course) => (
                <NonPurchasedCourseCard
                  key={course.id}
                  title={course.name}
                  description="Master test automation under the guidance of experts"
                  buttonText="Learn More"
                  imageUrl={course.coverImage?.url ?? "/images/AQA.webp"}
                  url={course.url}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}