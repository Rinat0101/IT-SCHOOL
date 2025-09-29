import { notFound, redirect } from "next/navigation";
import { getCourse } from "@/lib/datocms";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Breadcrumbs, { Crumb } from "@/app/path";
import CourseProgress from "@/app/courseProgress";

export default async function CoursePage({
  params,
}: { params: { courseSlug: string } }) {
  // ✅ Ensure user is logged in
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // ✅ Fetch the DatoCMS course
  const course = await getCourse(params.courseSlug);
  if (!course) return notFound();

  // ✅ Find matching enrollment from session
  const enrollment = session.user.enrollments?.find(
    (e: any) => e.courseId?.datoCmsId === course.id
  );

  const items: Crumb[] = [
    { label: "Courses", href: "/courses" },
    { label: course.name }, // current page (no href)
  ];

  return (
    <div className="min-h-screen w-full">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-8 bg-white">
        <h1 className="text-xl font-bold text-black mb-4">{course.name}</h1>

        <Breadcrumbs items={items} className="mb-6" />

        {/* 🔹 Pass enrollment into CourseProgress */}
        <CourseProgress
          courseSlug={params.courseSlug}
          sections={course.sections}
          enrollment={enrollment}
        />
      </div>
    </div>
  );
}