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

  // 1) Fetch deep section structure from DatoCMS
  const data = await getSectionDeep(courseSlug, sectionSlug);
  if (!data) return notFound();

  // 2) Get the current user session
  const session = await getServerSession(authOptions);

  // 3) Load enrollment for this user + course
  let enrollment = null;
  if (session?.user?.id) {
    await connectDB();
    enrollment = await Enrollment.findOne({
      userId: session.user.id,
    })
      .populate("courseId") // include course info
      .lean();
  }

  // 4) Render client component with enrollment
  return (
    <SectionClientPage
      course={data.course}
      section={data.section}
      enrollment={enrollment ? JSON.parse(JSON.stringify(enrollment)) : null}
    />
  );
}