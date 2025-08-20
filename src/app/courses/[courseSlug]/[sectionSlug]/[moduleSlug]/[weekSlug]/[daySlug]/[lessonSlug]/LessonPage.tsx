// app/courses/[courseSlug]/[sectionSlug]/[moduleSlug]/[weekSlug]/[daySlug]/[lessonSlug]/LessonPage.tsx
"use client";

import { useMemo } from "react";
import Breadcrumbs from "@/app/path";
import LessonBlockRenderer from "./components/LessonBlockRenderer";
import LessonTopicsSidebar from "./components/LessonTopicsSidebar";
import DaySideBar from "./components/DaySideBar";
import ExtraResources from "./components/ExtraResources";
import LessonNavButtons from "./components/LessonNavButtons";

import type {
  Lesson as LessonType,
  DatoCmsLessonBlock,
  ExtraResourceBlock,
} from "@/types";

type MinimalLesson = {
  id: string;
  title: string;
  slug: string;
  lessonType: LessonType["lessonType"];
  isMandatory: boolean;
  order?: number | null;
  content: DatoCmsLessonBlock[];
  extraResources?: ExtraResourceBlock[];
};

type DayLiteForPage = {
  id: string;
  title: string;
  slug: string;
  order: number;
  lessons: {
    id: string;
    title: string;
    slug: string;
    lessonType: LessonType["lessonType"];
    isMandatory: boolean;
    order?: number | null;
  }[];
};

export interface LessonPageProps {
  lesson: MinimalLesson;
  day: DayLiteForPage;
  courseId: string;

  courseSlug: string;
  courseTitle: string;
  sectionSlug: string;
  sectionTitle: string;

  /** Provided by server page.tsx so DaySidebar never guesses from URL */
  baseHref: string;
}

export default function LessonPage({
  lesson,
  day,
  courseSlug,
  courseTitle,
  sectionSlug,
  sectionTitle,
  baseHref,
}: LessonPageProps) {
  const blocks = lesson?.content ?? [];

  // Keep ordering consistent (sidebar + nav buttons)
  const lessonsSorted = useMemo(
    () => [...(day.lessons ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [day.lessons]
  );

  return (
    <div className="w-full bg-white min-h-screen px-4 md:px-6 lg:px-8 py-6">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT: Day sidebar */}
          <aside className="lg:w-[260px] flex-shrink-0">
            <DaySideBar
              key={day.id}                       // ensures reset when switching day
              baseHref={baseHref}                 // server-built, always correct
              lessons={lessonsSorted}
              currentLessonSlug={lesson.slug}
              currentDayTitle={day.title}
              sectionHref={`/courses/${courseSlug}/${sectionSlug}`}
            />
          </aside>

          {/* MIDDLE: Content */}
          <div className="flex-1">
            <div className="rounded-2xl shadow-md p-6 md:p-8 bg-white">
              <h1 className="text-3xl font-bold text-[#212B36] mb-4">{lesson.title}</h1>

              <Breadcrumbs
                items={[
                  { label: "Courses", href: "/courses" },
                  { label: courseTitle, href: `/courses/${courseSlug}` },
                  { label: sectionTitle, href: `/courses/${courseSlug}/${sectionSlug}` },
                  { label: lesson.title },
                ]}
                className="mb-6"
              />

              <LessonBlockRenderer blocks={blocks} />
            </div>

            {/* Extra Resources */}
            <section id="extra-resources" className="mt-8">
              <ExtraResources resources={lesson.extraResources ?? []} />
            </section>

            {/* Prev/Next navigation */}
            <div className="mt-8">
              <LessonNavButtons
                currentLesson={{ id: lesson.id, slug: lesson.slug, title: lesson.title }}
                lessons={lessonsSorted.map(({ slug, title }) => ({ slug, title }))}
              />
            </div>
          </div>

          {/* RIGHT: Topics */}
          <aside className="lg:w-[320px] flex-shrink-0">
            <div className="lg:sticky lg:top-24 self-start">
              <LessonTopicsSidebar
                blocks={blocks}
                extraResources={lesson.extraResources ?? []}
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}