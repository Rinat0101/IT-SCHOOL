import { notFound } from "next/navigation";
import { getCourse } from "@/lib/datocms";
import Breadcrumbs from "@/app/path";
import CourseProgress from "@/app/courseProgress";

export default async function CoursePage({
  params,
}: {
  params: { courseSlug: string };
}) {
  const course = await getCourse(params.courseSlug);

  if (!course) return notFound();

  const sections = course.sections;

  return (
    <div className="min-h-screen container mx-auto p-8 bg-white">
      <h1 className="text-xl text-[#000000] font-bold mb-6">{course.name}</h1>
      <Breadcrumbs
        courseSlug={params.courseSlug}
        courseName={course.name}
      />
      <CourseProgress courseSlug={params.courseSlug} sections={sections} />
    </div>
  );
}