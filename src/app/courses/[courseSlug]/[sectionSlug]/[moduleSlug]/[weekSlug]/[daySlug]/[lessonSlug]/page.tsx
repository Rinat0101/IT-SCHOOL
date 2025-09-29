// app/courses/[courseSlug]/[sectionSlug]/[moduleSlug]/[weekSlug]/[daySlug]/[lessonSlug]/page.tsx
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Enrollment from "@/models/CourseEnrollment";
import Course from "@/models/Course";   // ✅ import Course model
import { getLessonBySlug } from "@/lib/datocms";
import LessonPage from "./LessonPage";

export default async function Page({ params }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { lessonSlug, courseSlug, sectionSlug, moduleSlug, weekSlug, daySlug } = params;

  // 1) Fetch lesson from DatoCMS
  const data = await getLessonBySlug(lessonSlug);
  if (!data?.lesson || !data.day) return notFound();

  console.log("Server data.courseId", data.courseId); // DatoCMS course ID

  // 2) Resolve Mongo course by datoCmsId
  const courseDoc = await Course.findOne({ datoCmsId: data.courseId });
  if (!courseDoc) {
    console.warn("No matching Course found in Mongo for datoCmsId:", data.courseId);
    redirect("/courses");
  }

  // 3) Verify enrollment in Mongo
  const enrollment = await Enrollment.findOne({
    userId: session.user.id,
    courseId: courseDoc._id, // ✅ match by ObjectId
  });

  console.log("Server enrollment result:", enrollment);

  if (!enrollment) {
    // Not enrolled → block
    redirect("/courses");
  }

  // 4) Build baseHref
  const baseHref = `/courses/${courseSlug}/${sectionSlug}/${moduleSlug}/${weekSlug}/${daySlug}`;

  // 5) Render LessonPage
  return (
    <LessonPage
      lesson={data.lesson}
      day={data.day}
      courseId={data.courseId}
      courseSlug={courseSlug}
      courseTitle={data.courseTitle}
      sectionSlug={sectionSlug}
      sectionTitle={data.sectionTitle}
      baseHref={baseHref}
      enrollmentId={enrollment._id.toString()}
      completedLessons={enrollment.completedLessons ?? []}
    />
  );
}