import { getCourse } from "@/lib/datocms";
import { notFound } from "next/navigation";
import SectionClientPage from "./components/SectionClientPage";
import { Course, Section } from "@/types";

interface SectionPageProps {
  params: {
    courseSlug: string;
    sectionSlug: string;
  };
}

export default async function SectionPage({
  params: { courseSlug, sectionSlug },
}: SectionPageProps) {
  try {
    const course: Course | null = await getCourse(courseSlug);
    if (!course) return notFound();

    const section: Section | undefined = course.sections.find(
      (s) => s.slug === sectionSlug
    );
    if (!section) return notFound();

    return (
      <SectionClientPage
        course={course}
        section={section}
      />
    );
  } catch (error) {
    console.error("❌ Failed to load course section:", error);
    return notFound();
  }
}