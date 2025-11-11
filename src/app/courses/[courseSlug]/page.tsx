import { notFound, redirect } from "next/navigation";
import { getCourse } from "@/lib/datocms";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Breadcrumbs, { Crumb } from "@/app/path";
import CourseProgress from "@/app/courseProgress";
import connectDB from "@/lib/mongoose";
import UserProgress from "@/models/UserProgress";

export default async function CoursePage({
  params,
}: {
  params: any;
}) {
  // ✅ Ensure user is logged in
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // ✅ Fetch the DatoCMS course
  const course = await getCourse(params.courseSlug);
  if (!course) return notFound();

  // ✅ Find enrollment from session (if available)
  const enrollment = session.user.enrollments?.find(
    (e: any) => e.courseId?.datoCmsId === course.id
  );

  // ✅ Get user progress from MongoDB for this course
  await connectDB();

  let userProgress = null;
  if (session.user?.id && enrollment?.courseId?._id) {
    userProgress = await UserProgress.findOne({
      userId: session.user.id,
      courseId: enrollment.courseId._id,
    })
      .select("courseId completedLessons")
      .lean();
  }
console.log(userProgress)
  const items: Crumb[] = [
    { label: "Courses", href: "/courses" },
    { label: course.name }, // current page (no href)
  ];

  return (
    <div className="min-h-screen w-full">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-8 bg-white">
        <h1 className="text-xl font-bold text-black mb-4">{course.name}</h1>

        <Breadcrumbs items={items} className="mb-6" />

        {/* 🔹 Pass enrollment + userProgress into CourseProgress */}
        <CourseProgress
          courseSlug={params.courseSlug}
          sections={course.sections}
          enrollment={enrollment}
          userProgress={
            userProgress
              ? JSON.parse(JSON.stringify(userProgress))
              : { courseId: "", completedLessons: [] }
          }
        />
      </div>
    </div>
  );
}