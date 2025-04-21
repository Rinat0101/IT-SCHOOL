import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCourses } from "@/lib/datocms";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  console.log(session);

  if (!session) {
    redirect("/login");
  }

  const courses = await getCourses(session.user.id);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">Ваши курсы</h1>
      <ul className="w-full max-w-md bg-white rounded-lg shadow-lg p-4">
      {courses.length > 0 ? (
        courses.map((course: { id: string; name: string }) => (
          <li key={course.id} className="p-2 border-b last:border-b-0">
            <Link href={`/courses/${course.id}`} className="text-blue-500 hover:underline">
              {course.name}
            </Link>
          </li>
        ))
      ) : (
        <p>Нет доступных курсов.</p>
      )}
      </ul>
    </div>
  );
}
