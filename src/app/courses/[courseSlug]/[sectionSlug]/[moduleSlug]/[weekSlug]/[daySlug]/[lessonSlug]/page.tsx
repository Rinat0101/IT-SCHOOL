// app/courses/[courseSlug]/[sectionSlug]/[moduleSlug]/[weekSlug]/[daySlug]/[lessonSlug]/page.tsx
import { notFound } from "next/navigation";
import { getLessonBySlug } from "@/lib/datocms";
import LessonPage from "./LessonPage";

type RouteParams = {
  courseSlug: string;
  sectionSlug: string;
  moduleSlug: string;
  weekSlug: string;
  daySlug: string;
  lessonSlug: string;
};

export default async function Page({ params }: { params: RouteParams }) {
  const { courseSlug, sectionSlug, moduleSlug, weekSlug, daySlug, lessonSlug } = params;

  const data = await getLessonBySlug(lessonSlug);
  if (!data?.lesson) return notFound();

  const { lesson, day, courseId } = data;

  const finalCourseSlug = data.courseSlug ?? courseSlug;
  const finalCourseTitle = data.courseTitle ?? courseSlug.replace(/-/g, " ");
  const finalSectionSlug = data.sectionSlug ?? sectionSlug;
  const finalSectionTitle = data.sectionTitle ?? sectionSlug.replace(/-/g, " ");

  if (!day || !courseId) return notFound();

  return (
    <LessonPage
      lesson={lesson}
      day={day}
      courseId={courseId}
      courseSlug={finalCourseSlug}
      courseTitle={finalCourseTitle}
      sectionSlug={finalSectionSlug}
      sectionTitle={finalSectionTitle}
    />
  );
}