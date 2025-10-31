import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import Enrollment from "@/models/CourseEnrollment";
import Course from "@/models/Course";
import UserProgress from "@/models/UserProgress";

import { getLessonBySlug } from "@/lib/datocms";
import LessonPage from "./LessonPage";

export default async function Page({ params }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { lessonSlug, courseSlug, sectionSlug, moduleSlug, weekSlug, daySlug } = params;

  // 1) Fetch lesson from DatoCMS
  const data = await getLessonBySlug(lessonSlug);
  if (!data?.lesson || !data.day) return notFound();

  // 2) Find matching course in MongoDB (linked via DatoCMS ID)
  const courseDoc = await Course.findOne({ datoCmsId: data.courseId });
  if (!courseDoc) {
    console.warn("⚠️ No matching Course found in Mongo for datoCmsId:", data.courseId);
    redirect("/courses");
  }

  // 3) Check enrollment
  const enrollment = await Enrollment.findOne({
    userId: session.user.id,
    courseId: courseDoc._id,
  });

  if (!enrollment) {
    console.warn("⚠️ No enrollment found for user in course");
    redirect("/courses");
  }

  // 4) Get completed lessons from UserProgress
  const progress = await UserProgress.findOne({
    userId: session.user.id,
    courseId: courseDoc._id,
  });

  const completedLessons = progress?.completedLessons ?? [];

  // 5) Build baseHref
  const baseHref = `/courses/${courseSlug}/${sectionSlug}/${moduleSlug}/${weekSlug}/${daySlug}`;

  // 6) Render LessonPage
  return (
    <LessonPage
      lesson={data.lesson}
      day={data.day}
      courseId={courseDoc._id.toString()}
      courseSlug={courseSlug}
      courseTitle={data.courseTitle}
      sectionSlug={sectionSlug}
      sectionTitle={data.sectionTitle}
      baseHref={baseHref}
      enrollmentId={enrollment._id.toString()}
      completedLessons={completedLessons}
    />
  );
}