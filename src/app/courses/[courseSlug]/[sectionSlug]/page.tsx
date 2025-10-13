import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongoose";
import Enrollment from "@/models/CourseEnrollment";
import { getSectionDeep } from "@/lib/datocms";
import SectionClientPage from "./components/SectionClientPage";

interface SectionPageProps {
  params: { courseSlug: string; sectionSlug: string };
}

export default async function SectionPage({ params }: SectionPageProps) {
  const { courseSlug, sectionSlug } = params;
  const session = await getServerSession(authOptions);
  const isMockMode = process.env.MOCK_DB === "true";

  // 1️⃣ Fetch DatoCMS structure
  const data = await getSectionDeep(courseSlug, sectionSlug);
  if (!data) return notFound();

  // 2️⃣ Skip DB in mock mode
  let enrollment = null;
  if (!isMockMode && session?.user?.id) {
    await connectDB();
    enrollment = await Enrollment.findOne({ userId: session.user.id })
      .populate("courseId")
      .lean();
  }

  // 3️⃣ Always render page
  return (
    <SectionClientPage
      course={data.course}
      section={data.section}
      enrollment={enrollment ? JSON.parse(JSON.stringify(enrollment)) : {}}
    />
  );
}