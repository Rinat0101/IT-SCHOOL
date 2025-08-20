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
  const {
    courseSlug: urlCourseSlug,
    sectionSlug: urlSectionSlug,
    moduleSlug,
    weekSlug,
    daySlug,
    lessonSlug,
  } = params;

  // 1) Fetch everything for this lesson in one go
  const data = await getLessonBySlug(lessonSlug);
  if (!data?.lesson || !data.day) return notFound();

  const { lesson, day } = data;

  // 2) Ensure we have course/section labels and slugs
  const finalCourseSlug  = data.courseSlug  ?? urlCourseSlug;
  const finalCourseTitle = data.courseTitle ?? urlCourseSlug.replace(/-/g, " ");
  const finalSectionSlug = data.sectionSlug ?? urlSectionSlug;
  const finalSectionTitle= data.sectionTitle?? urlSectionSlug.replace(/-/g, " ");

  // 3) Build baseHref for the DaySidebar links (no trailing slash)
  const baseHref = `/courses/${finalCourseSlug}/${finalSectionSlug}/${moduleSlug}/${weekSlug}/${daySlug}`;

  // 4) Pass everything to the client page
  return (
    <LessonPage
      lesson={lesson}             // full content for LessonBlockRenderer
      day={day}                   // all lessons for current day (for DaySidebar + NavButtons)
      courseId={data.courseId ?? ""}

      courseSlug={finalCourseSlug}
      courseTitle={finalCourseTitle}
      sectionSlug={finalSectionSlug}
      sectionTitle={finalSectionTitle}

      baseHref={baseHref}
    />
  );
}