// app/courses/[courseSlug]/[sectionSlug]/[moduleSlug]/[weekSlug]/[daySlug]/[lessonSlug]/page.tsx
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getLessonBySlug } from "@/lib/datocms";
import LessonPage from "./LessonPage";

// Import Mongo models only when needed
import connectDB from "@/lib/mongoose";
import Enrollment from "@/models/CourseEnrollment";
import Course from "@/models/Course";

export default async function Page({ params }) {
  const session = await getServerSession(authOptions);
  const isMockMode = process.env.MOCK_DB === "true";

  if (!session) redirect("/login");

  const { lessonSlug, courseSlug, sectionSlug, moduleSlug, weekSlug, daySlug } = params;

  // 1️⃣ Fetch lesson from DatoCMS
  const data = await getLessonBySlug(lessonSlug);
  if (!data?.lesson || !data.day) return notFound();

  console.log("Server data.courseId (DatoCMS ID):", data.courseId);

  // 2️⃣ Mock mode: skip all Mongo checks
  if (isMockMode) {
    console.log("🧪 Mock mode active — skipping course/enrollment validation");
    const baseHref = `/courses/${courseSlug}/${sectionSlug}/${moduleSlug}/${weekSlug}/${daySlug}`;

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
        enrollmentId={"mock-enrollment"}
        completedLessons={[]} // no DB tracking
      />
    );
  }

  // 3️⃣ Real Mongo mode — only run if MOCK_DB=false
  await connectDB();

  const courseDoc = await Course.findOne({ datoCmsId: data.courseId });
  if (!courseDoc) {
    console.warn("⚠️ No matching Course found in Mongo for datoCmsId:", data.courseId);
    redirect("/courses");
  }

  const enrollment = await Enrollment.findOne({
    userId: session.user.id,
    courseId: courseDoc._id,
  });

  console.log("Server enrollment result:", enrollment);

  if (!enrollment) {
    console.warn("⚠️ Enrollment not found or mismatched course");
    redirect("/courses");
  }

  // 4️⃣ Build baseHref
  const baseHref = `/courses/${courseSlug}/${sectionSlug}/${moduleSlug}/${weekSlug}/${daySlug}`;

  // 5️⃣ Render LessonPage
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