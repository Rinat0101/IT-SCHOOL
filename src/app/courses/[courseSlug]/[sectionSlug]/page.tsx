import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongoose";
import Enrollment from "@/models/CourseEnrollment";
import UserProgress from "@/models/UserProgress";
import { getSectionDeep } from "@/lib/datocms";
import SectionClientPage from "./components/SectionClientPage";

interface SectionPageProps {
  params: { courseSlug: string; sectionSlug: string };
}

export default async function SectionPage({ params }: SectionPageProps) {
  const { courseSlug, sectionSlug } = await params;

  // 1️⃣ Fetch section & course data from DatoCMS
  const data = await getSectionDeep(courseSlug, sectionSlug);
  if (!data) return notFound();

  // 2️⃣ Get session
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return notFound();

  // 3️⃣ Connect to MongoDB
  await connectDB();

  // 4️⃣ Get enrollment by user ID and courseSlug (through populated Course model)
  const enrollment = await Enrollment.findOne({ userId: session.user.id })
    .populate("courseId") // will include full Course document
    .lean();

  if (!enrollment || !enrollment.courseId) {
    console.warn("⚠️ No enrollment or missing courseId for this user");
    return notFound();
  }

  // 5️⃣ Fetch UserProgress by courseId (from Mongo Course model)
  const userProgress = await UserProgress.findOne({
    userId: session.user.id,
    courseId: enrollment.courseId._id,
  }).lean();

  // 6️⃣ Render client page
  return (
    <SectionClientPage
      course={data.course}
      section={data.section}
      enrollment={JSON.parse(JSON.stringify(enrollment))}
      userProgress={userProgress ? JSON.parse(JSON.stringify(userProgress)) : null}
    />
  );
}