"use client";

import { useEffect, useMemo } from "react";
import { useCourseStore } from "@/stores/useCourseStore";
import Breadcrumbs from "@/app/path";
import LessonBlockRenderer from "./components/LessonBlockRenderer";
import LessonTopicsSidebar from "./components/LessonTopicsSidebar";
import DaySideBar from "./components/DaySideBar";
import ExtraResources from "./components/ExtraResources";
import LessonNavButtons from "./components/LessonNavButtons";
import LabLesson from "./components/LabLesson";
import CompletedButton from "./components/CompletedButton";
import { cleanTitle } from "@/app/utils/cleanTitles";

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
  labDescription?: string | null;
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

  baseHref: string;
  enrollmentId: string;
  completedLessons: string[];
}

export default function LessonPage({
  lesson,
  day,
  courseId,
  courseSlug,
  courseTitle,
  sectionSlug,
  sectionTitle,
  baseHref,
  enrollmentId,
  completedLessons: initialCompletedLessons,
}: LessonPageProps) {
  // ✅ Zustand global progress
  const completedLessons = useCourseStore((s) => s.completedLessons);
  const setCompletedLessons = useCourseStore((s) => s.setCompletedLessons);

  // ✅ Initialize store when page mounts or data changes
  useEffect(() => {
    if (initialCompletedLessons?.length) {
      setCompletedLessons(initialCompletedLessons);
    }
  }, [initialCompletedLessons, setCompletedLessons]);

  // ✅ Handler for toggling lesson completion (syncs sidebar + button)
  const handleToggleLesson = (lessonId: string, isNowCompleted: boolean) => {
    setCompletedLessons((prev) =>
      isNowCompleted
        ? [...new Set([...prev, lessonId])]
        : prev.filter((id) => id !== lessonId)
    );
  };

  const blocks = lesson?.content ?? [];
  const lessonsSorted = useMemo(
    () =>
      [...(day.lessons ?? [])]
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((l) => ({ ...l, title: cleanTitle(l.title) })),
    [day.lessons]
  );

  const cleanedLessonTitle = cleanTitle(lesson.title);
  const cleanedDayTitle = cleanTitle(day.title);

  return (
    <div className="w-full bg-white min-h-screen px-4 md:px-6 lg:px-8 py-6">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT: Day sidebar */}
          <aside className="lg:w-[260px] flex-shrink-0">
            <DaySideBar
              key={day.id}
              baseHref={baseHref}
              lessons={lessonsSorted}
              currentLessonSlug={lesson.slug}
              currentDayTitle={cleanedDayTitle}
              sectionHref={`/courses/${courseSlug}/${sectionSlug}`}
              completedLessons={completedLessons}
            />
          </aside>

          {/* MIDDLE: Main lesson content */}
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-[800px]">
              <div className="rounded-2xl shadow-md p-6 md:p-8 bg-white">
                <h1 className="text-3xl font-bold text-[#212B36] mb-4">
                  {cleanedLessonTitle}
                </h1>

                <Breadcrumbs
                  items={[
                    { label: "Courses", href: "/courses" },
                    { label: cleanTitle(courseTitle), href: `/courses/${courseSlug}` },
                    {
                      label: cleanTitle(sectionTitle),
                      href: `/courses/${courseSlug}/${sectionSlug}`,
                    },
                    { label: cleanedLessonTitle },
                  ]}
                  className="mb-6"
                />

                {lesson.lessonType === "Lab" ? (
                  <LabLesson
                    labDescription={lesson.labDescription}
                    lessonId={lesson.id}
                    enrollmentId={enrollmentId}
                    autoCompleteCourseId={courseId}
                  />
                ) : (
                  <>
                    <LessonBlockRenderer blocks={blocks} />
                    <div className="mt-6 flex justify-center">
                      <CompletedButton
                        lessonId={lesson.id}
                        courseId={courseId}
                        isCompleted={completedLessons.includes(lesson.id)}
                        onToggle={handleToggleLesson}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Extra Resources */}
              <section id="extra-resources" className="mt-8">
                <ExtraResources resources={lesson.extraResources ?? []} />
              </section>

              {/* Prev/Next navigation */}
              <div className="mt-8">
                <LessonNavButtons
                  currentLesson={{
                    id: lesson.id,
                    slug: lesson.slug,
                    title: cleanedLessonTitle,
                  }}
                  lessons={lessonsSorted.map(({ slug, title }) => ({
                    slug,
                    title,
                  }))}
                />
              </div>
            </div>
          </div>

          {/* RIGHT: Topics Sidebar */}
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