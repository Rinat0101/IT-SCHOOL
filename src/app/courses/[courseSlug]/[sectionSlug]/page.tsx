// app/courses/[courseSlug]/[sectionSlug]/page.tsx
import { notFound } from "next/navigation";
import { getSectionDeep } from "@/lib/datocms";
import SectionClientPage from "./components/SectionClientPage";

interface SectionPageProps {
  params: { courseSlug: string; sectionSlug: string };
}

export default async function SectionPage({ params }: SectionPageProps) {
  const data = await getSectionDeep(params.courseSlug, params.sectionSlug);
  if (!data) return notFound();

  // Pass the exact shapes your client needs (breadcrumb + full structure)
  return (
    <SectionClientPage
      course={data.course}
      section={data.section}
    />
  );
}