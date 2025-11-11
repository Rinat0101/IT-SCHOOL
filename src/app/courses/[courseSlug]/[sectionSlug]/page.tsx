import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongoose";
import Enrollment from "@/models/CourseEnrollment";
import UserProgress from "@/models/UserProgress";
import { getSectionDeep } from "@/lib/datocms";
import SectionClientPage from "./components/SectionClientPage";

export default async function SectionPage({
  params,
}: {
  params: any;
}) {
  const { courseSlug, sectionSlug } = params;

  // 1️⃣ Fetch data
  const data = await getSectionDeep(courseSlug, sectionSlug);
  if (!data) return notFound();

  // 2️⃣ Session
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return notFound();

  // 3️⃣ DB
  await connectDB();

  // 4️⃣ Enrollment
  const enrollment = await Enrollment.findOne({ userId: session.user.id })
    .populate("courseId")
    .lean();

  if (!enrollment || !enrollment.courseId) return notFound();

  // 5️⃣ Progress
  const userProgress = await UserProgress.findOne({
    userId: session.user.id,
    courseId: enrollment.courseId._id,
  }).lean();

  // 6️⃣ Render
  return (
    <SectionClientPage
      course={data.course}
      section={data.section}
      enrollment={JSON.parse(JSON.stringify(enrollment))}
      userProgress={userProgress ? JSON.parse(JSON.stringify(userProgress)) : null}
    />
  );
}