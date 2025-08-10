import { getLessonBySlugs } from "@/lib/datocms";
import LessonPage from "./LessonPage";
import { notFound } from "next/navigation";

interface LessonPageProps {
  params: {
    courseSlug: string;
    sectionSlug: string;
    moduleSlug: string;
    weekSlug: string;
    daySlug: string;
    lessonSlug: string;
  };
}

export default async function Page({ params }: LessonPageProps) {
  const {
    courseSlug,
    sectionSlug,
    moduleSlug,
    weekSlug,
    daySlug,
    lessonSlug,
  } = params;

  const data = await getLessonBySlugs(
    courseSlug,
    sectionSlug,
    moduleSlug,
    weekSlug,
    daySlug,
    lessonSlug
  );

  if (!data || !data.lesson || !data.day || !data.courseId) return notFound();

  return <LessonPage lesson={data.lesson} day={data.day} courseId={data.courseId} />;
}