import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import CoursesClient from "./CoursesClient";
import { getAllCourses } from "@/lib/datocms";

export default async function CoursesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const allCourses = await getAllCourses();

  const enrolledDatoIds =
    session.user.enrollments?.map((e: any) => e.courseId?.datoCmsId).filter(Boolean) ?? [];

  const purchased = allCourses
    .filter((c) => enrolledDatoIds.includes(c.id))
    .map((c) => {
      const enrollment = session.user.enrollments.find(
        (e: any) => e.courseId?.datoCmsId === c.id
      );
      return {
        ...c,
        startDate: enrollment?.startDate ?? null,
        endDate: enrollment?.endDate ?? null,
      };
    });

  const nonPurchased = allCourses.filter((c) => !enrolledDatoIds.includes(c.id));

  return <CoursesClient courses={{ purchased, nonPurchased }} />;
}