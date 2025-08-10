"use client";

import LessonBlockRenderer from "./components/LessonBlockRenderer";
import DaySideBar from "./components/DaySideBar";
import LessonBreadcrumbs from "./components/LessonBreadcrumbs";
import ExtraResources from "./components/ExtraResources";
import LessonNavButtons from "./components/LessonNavButtons";
import CompletedButton from "./components/CompletedButton";

import type { Lesson, DayLite, DatoCmsLessonBlock, ExtraResourceBlock } from "@/types";

interface LessonPageProps {
  lesson: {
    id: string;
    title: string;
    slug: string;
    lessonType: Lesson["lessonType"];
    isMandatory: boolean;
    content: DatoCmsLessonBlock[];
    extraResources?: ExtraResourceBlock[];
  };
  day: DayLite | null;
  courseId: string;
}

const LessonPage: React.FC<LessonPageProps> = ({ lesson, day, courseId }) => {
  return (
    <div className="flex min-h-screen">
      {/* Left Sidebar */}
      <aside className="w-1/5 p-4 border-r border-gray-200">
        {day && <DaySideBar lessons={day.lessons} currentLessonSlug={lesson.slug} />}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-4xl mx-auto">
        {/* ✅ Pass only lesson.content to breadcrumbs */}
        <LessonBreadcrumbs blocks={lesson.content} />

        <h1 className="text-3xl font-bold mb-6">{lesson.title}</h1>

        <LessonBlockRenderer blocks={lesson.content} />

        <CompletedButton lessonId={lesson.id} courseId={courseId} />

        <ExtraResources resources={lesson.extraResources || []} />

        <LessonNavButtons
          currentLesson={{ id: lesson.id, slug: lesson.slug, title: lesson.title }}
          lessons={day?.lessons.map(({ slug, title }) => ({ slug, title })) || []}
        />
      </main>
    </div>
  );
};

export default LessonPage;
