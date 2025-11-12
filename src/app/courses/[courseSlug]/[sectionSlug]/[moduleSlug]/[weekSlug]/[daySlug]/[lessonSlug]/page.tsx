import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

import connectDB from "@/lib/mongoose";
import Enrollment from "@/models/CourseEnrollment";
import Course from "@/models/Course";
import type { ICourse } from "@/models/Course";
import type { IEnrollment } from "@/models/CourseEnrollment";
import UserProgress from "@/models/UserProgress";
import type { IUserProgress } from "@/models/UserProgress";
import { getLessonBySlug } from "@/lib/datocms";

import LessonPage from "./LessonPage";

export default async function Page(
  props: Promise<{
    params: {
      lessonSlug: string;
      courseSlug: string;
      sectionSlug: string;
      moduleSlug: string;
      weekSlug: string;
      daySlug: string;
    };
  }>
) {
  const { params } = await props;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const {
    lessonSlug,
    courseSlug,
    sectionSlug,
    moduleSlug,
    weekSlug,
    daySlug,
  } = params;

  // 🔌 Connect to MongoDB
  await connectDB();

  // 1️⃣ Fetch lesson data from DatoCMS
  const data = await getLessonBySlug(lessonSlug);
  if (!data?.lesson || !data.day) notFound();

  // 2️⃣ Find matching course in MongoDB (by datoCmsId)
  const courseDoc = await Course.findOne({ datoCmsId: data.courseId }).lean<ICourse>();
  if (!courseDoc) {
    console.warn("⚠️ No matching Course found for datoCmsId:", data.courseId);
    redirect("/courses");
  }

  // 3️⃣ Check if user is enrolled
  const enrollment = await Enrollment.findOne({
    userId: session.user.id,
    courseId: courseDoc._id,
  }).lean<IEnrollment>();

  if (!enrollment) {
    console.warn("⚠️ No enrollment found for user:", session.user.id);
    redirect("/courses");
  }

  // 4️⃣ Get progress (completed lessons)
  const progress = await UserProgress.findOne({
    userId: session.user.id,
    courseId: courseDoc._id,
  }).lean<IUserProgress>();

  const completedLessons: string[] = progress?.completedLessons ?? [];

  // 5️⃣ Build baseHref
  const baseHref = `/courses/${courseSlug}/${sectionSlug}/${moduleSlug}/${weekSlug}/${daySlug}`;

  // 6️⃣ Render LessonPage
  return (
    <LessonPage
      lesson={data.lesson}
      day={data.day}
      courseId={courseDoc._id.toString()}
      courseSlug={courseSlug}
      courseTitle={data.courseTitle ?? ""}
      sectionSlug={sectionSlug}
      sectionTitle={data.sectionTitle ?? ""}
      baseHref={baseHref}
      enrollmentId={enrollment._id.toString()}
      completedLessons={completedLessons}
    />
  );
}