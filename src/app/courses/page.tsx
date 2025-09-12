import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import CoursesClient from "./CoursesClient";
import { getGroupedCourses } from "@/lib/datocms";

export default async function CoursesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const courses = await getGroupedCourses(session.user.id);
  return <CoursesClient courses={courses} />;
}