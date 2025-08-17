import { notFound } from "next/navigation";
import { getCourse } from "@/lib/datocms";
import Breadcrumbs, { Crumb } from "@/app/path";
import CourseProgress from "@/app/courseProgress";

export default async function CoursePage({
  params,
}: { params: { courseSlug: string } }) {
  const course = await getCourse(params.courseSlug);
  if (!course) return notFound();

  const items: Crumb[] = [
    { label: "Courses", href: "/courses" },
    { label: course.name }, // current page (no href)
  ];

  return (
    <div className="min-h-screen w-full">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-8 bg-white">
        <h1 className="text-xl font-bold text-black mb-4">{course.name}</h1>

        <Breadcrumbs items={items} className="mb-6" />

        <CourseProgress courseSlug={params.courseSlug} sections={course.sections} />
      </div>
    </div>
  );
}