import PurchasedCourseCard from "@/components/purchasedCourseCard";
import NonPurchasedCourseCard from "@/components/nonPurchasedCourseCard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getCourses } from "@/lib/datocms";
import Link from "next/link";
import { loadTranslations } from "@/lib/i18n";

export default async function DashboardPage({ params }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const courses = await getCourses(session.user.id);
  const t = await loadTranslations(params.locale, 'dashboard');

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto">
        <h1 className="text-xl text-[#000000] font-bold mb-6">{t.pageTitle}</h1>

        <section className="mb-8">
          <h2 className="text-2xl text-gray-2 font-semibold mb-6">{t.currentCourses}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <Link href={`/courses/${course.id}`} key={`current-${course.id}`}>
                <PurchasedCourseCard
                  title={course.name}
                  startDate="12.12.2024"
                  endDate="10.06.2025"
                  completionPercentage={60}
                />
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl text-gray-2 font-semibold mb-4">{t.suggestedCourses}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <NonPurchasedCourseCard
              title={t.suggested.title}
              description={t.suggested.description}
              buttonText={t.suggested.buttonText}
              imageUrl="/images/plain-logo.png"
            />
            <NonPurchasedCourseCard
              title={t.suggested.title}
              description={t.suggested.description}
              buttonText={t.suggested.buttonText}
              imageUrl="/images/plain-logo.png"
            />
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl text-gray-2 font-semibold mb-6">{t.purchasedCourses}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <Link href={`/courses/${course.id}`} key={`purchased-${course.id}`}>
                <PurchasedCourseCard
                  title={course.name}
                  startDate="06.01.2025"
                  endDate="14.05.2025"
                  completionPercentage={60}
                />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}