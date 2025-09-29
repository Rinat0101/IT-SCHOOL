import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import CoursesClient from "./CoursesClient";
import { getAllCourses } from "@/lib/datocms";

export default async function CoursesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // All courses from DatoCMS
  const allCourses = await getAllCourses();

  // Extract purchased IDs from enrollments
  const enrolledDatoIds =
    session.user.enrollments?.map((e: any) => e.courseId?.datoCmsId).filter(Boolean) ?? [];

  // Split into purchased / non-purchased
  const purchased = allCourses.filter((c) => enrolledDatoIds.includes(c.id));
  const nonPurchased = allCourses.filter((c) => !enrolledDatoIds.includes(c.id));

  return <CoursesClient courses={{ purchased, nonPurchased }} />;
}