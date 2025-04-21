import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getCourse,
  getModules,
  getWeeks,
  getDays,
  getLessons,
} from "@/lib/datocms";

export default async function CoursePage({ params }: { params: { id: string } }) {
  const course = await getCourse(params.id);

  if (!course) {
    return notFound();
  }

  const modules = await getModules(params.id);

  const modulesWithHierarchy = await Promise.all(
    modules.map(async (mod) => {
      const weeks = await getWeeks(mod.id);
      const weeksWithDays = await Promise.all(
        weeks.map(async (week) => {
          const days = await getDays(week.id);
          const daysWithLessons = await Promise.all(
            days.map(async (day) => {
              const lessons = await getLessons(day.id);
              return { ...day, lessons };
            })
          );
          return { ...week, days: daysWithLessons };
        })
      );
      return { ...mod, weeks: weeksWithDays };
    })
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">{course.name}</h1>
      <p className="text-lg mb-6">{course.url}</p>

      <div className="w-full max-w-4xl bg-white rounded shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Модули курса</h2>
        {modulesWithHierarchy.length > 0 ? (
          <ul className="space-y-4">
            {modulesWithHierarchy.map((mod) => (
              <li key={mod.id} className="border-t pt-4">
                <h3 className="text-xl font-bold">{mod.name}</h3>
                {mod.weeks.length > 0 ? (
                  <ul className="pl-4 mt-2 space-y-2">
                    {mod.weeks.map((week) => (
                      <li key={week.id} className="border-l-2 border-gray-300 pl-4 ml-2">
                        <h4 className="font-semibold">{week.name}</h4>
                        {week.days.length > 0 ? (
                          <ul className="pl-4 list-disc">
                            {week.days.map((day) => (
                              <li key={day.id} className="border-l border-gray-200 pl-3 ml-2 mt-2">
                                <strong>{day.name}</strong>
                                {day.lessons.length > 0 ? (
                                  <ul className="pl-4 list-[circle]">
                                    {day.lessons.map((lesson) => (
                                      <li key={lesson.id}>
                                      <Link href={`/lessons/${lesson.id}`} className="text-blue-600 hover:underline">
                                        {lesson.name}
                                      </Link>
                                    </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="pl-4 italic text-sm">Нет уроков</p>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="pl-4 italic text-sm">Нет дней</p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="italic text-sm">Нет недель</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>Нет доступных модулей.</p>
        )}
      </div>
    </div>
  );
}