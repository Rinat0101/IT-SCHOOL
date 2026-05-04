"use client";

import Link from "next/link";
import PurchasedCourseCard from "@/components/purchasedCourseCard";
import NonPurchasedCourseCard from "@/components/nonPurchasedCourseCard";
import type { Course } from "@/types";

type PurchasedCourse = Course & {
  completedLessons?: number;
  totalLessons?: number;
  accessLevel?: "limited" | "full";
};

type ExternalCourse = {
  name: string;
  description: string;
  url: string;
};

type GroupedCourses = { purchased: PurchasedCourse[]; nonPurchased: ExternalCourse[] };

type Props = {
  courses: GroupedCourses;
  userName?: string;
};

export default function CoursesClient({ courses, userName }: Props) {
  const purchasedSorted = [...courses.purchased].sort((a, b) => a.name.localeCompare(b.name));
  const nonPurchasedSorted = [...courses.nonPurchased].sort((a, b) => a.name.localeCompare(b.name));

  const totalCompleted = purchasedSorted.reduce(
    (sum, c) => sum + (c.completedLessons ?? 0),
    0
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0f17]">
      <div className="container mx-auto">
        {/* Greeting */}
        <header className="my-6">
          <h1 className="text-2xl font-bold text-[#212B36] dark:text-gray-100">
            Hi{userName ? `, ${userName}` : ""} 👋
          </h1>
          <p className="text-sm text-[#6B778C] dark:text-gray-400 mt-1">
            {purchasedSorted.length === 0
              ? "Browse courses below to get started."
              : `${purchasedSorted.length} course${purchasedSorted.length === 1 ? "" : "s"} · ${totalCompleted} lesson${totalCompleted === 1 ? "" : "s"} completed`}
          </p>
        </header>

        {/* Purchased */}
        <section className="mb-8">
          <h2 className="text-2xl text-gray-2 dark:text-gray-100 font-semibold mb-6">Current courses</h2>
          {purchasedSorted.length === 0 ? (
            <div className="text-[#6B778C] dark:text-gray-400">No purchased courses yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {purchasedSorted.map((course) => (
                <Link key={course.id} href={`/courses/${course.slug}`} className="block">
                  <PurchasedCourseCard
                    title={course.name}
                    completedLessons={course.completedLessons ?? 0}
                    totalLessons={course.totalLessons ?? 0}
                    accessLevel={course.accessLevel ?? "limited"}
                  />
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Non-Purchased */}
        {nonPurchasedSorted.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl text-gray-2 dark:text-gray-100 font-semibold mb-4">Other Courses</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {nonPurchasedSorted.map((course) => (
                <NonPurchasedCourseCard
                  key={course.url}
                  title={course.name}
                  description={course.description}
                  buttonText="Learn More"
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