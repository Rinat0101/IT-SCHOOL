import { notFound } from "next/navigation";

async function getCourse(id) {
  const res = await fetch(`https://your-api.com/courses/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export default async function CoursePage({ params }) {
  const course = await getCourse(params.id);

  if (!course) {
    return notFound();
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
      <p className="text-lg">{course.description}</p>
    </div>
  );
}
