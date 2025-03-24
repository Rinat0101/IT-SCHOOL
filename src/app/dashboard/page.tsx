import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses`, { cache: "no-store" });
  const data = await res.json();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">Ваши курсы</h1>
      <ul className="w-full max-w-md bg-white rounded-lg shadow-lg p-4">
        {data.courses.length > 0 ? (
          data.courses.map((course: { id: string; title: string }) => (
            <li key={course.id} className="p-2 border-b last:border-b-0">
              <Link href={`/courses/${course.id}`} className="text-blue-500 hover:underline">
                {course.title}
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
