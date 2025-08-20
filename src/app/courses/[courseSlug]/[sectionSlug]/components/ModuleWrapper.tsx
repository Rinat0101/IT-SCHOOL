"use client";

import { useEffect, useMemo } from "react";
import { useCourseStore } from "@/stores/useCourseStore";
import type { Week, Module, Day, Lesson } from "@/types";
import WeekTabs from "./WeekTabs";
import DayView from "./DayView";
import Link from "next/link";
import { sortBy } from "@/app/utils/sort";

const ModuleWrapper = () => {
  const selectedWeekId = useCourseStore((s) => s.selectedWeekId);
  const setSelectedWeekId = useCourseStore((s) => s.setSelectedWeekId);
  const selectedCourse = useCourseStore((s) => s.selectedCourse);
  const selectedSection = useCourseStore((s) => s.selectedSection);
  const selectedModule = useCourseStore((s) => s.selectedModule);
  const setSelectedModule = useCourseStore((s) => s.setSelectedModule);

  // Ensure Module 1 is active by default (and set its first week)
  useEffect(() => {
    if (!selectedSection) return;
    if (!selectedModule) {
      const firstMod = selectedSection.modules?.[0];
      if (firstMod) {
        setSelectedModule(firstMod);
        setSelectedWeekId(firstMod.weeks?.[0]?.id ?? null);
      }
    }
  }, [selectedSection, selectedModule, setSelectedModule, setSelectedWeekId]);

  // Weeks sorted by their own order
  const weeksSorted: Week[] = useMemo(
    () => sortBy(selectedModule?.weeks, (w) => (w as any).order), // Week has order
    [selectedModule]
  );

  // Keep selectedWeekId valid among sorted weeks
  useEffect(() => {
    if (!selectedModule) return;
    if (weeksSorted.length === 0) {
      if (selectedWeekId !== null) setSelectedWeekId(null);
      return;
    }
    const stillValid = weeksSorted.some((w) => w.id === selectedWeekId);
    if (!stillValid) setSelectedWeekId(weeksSorted[0].id);
  }, [selectedModule, weeksSorted, selectedWeekId, setSelectedWeekId]);

  // Current week
  const currentWeek: Week | undefined = useMemo(
    () => weeksSorted.find((w) => w.id === selectedWeekId),
    [weeksSorted, selectedWeekId]
  );

  // Days sorted by their own order
  const daysSorted: Day[] = useMemo(
    () => sortBy(currentWeek?.days, (d) => (d as any).order), // Day has order
    [currentWeek]
  );

  const courseSlug = selectedCourse?.slug;
  const sectionSlug = selectedSection?.slug;
  const moduleSlug = selectedModule?.slug;
  const weekSlug = currentWeek?.slug;

  return (
    <div className="bg-[#F9FAFB] pt-2 rounded-b-lg shadow-md">
      {/* Header row */}
      <div className="grid grid-cols-3 items-center m-4">
        <div className="justify-self-start">
          <Link
            href={courseSlug ? `/courses/${courseSlug}` : "#"}
            className="text-[#B923AE] text-sm font-bold hover:underline inline-flex items-center h-8"
          >
            ← Back
          </Link>
        </div>

        <nav className="justify-self-center">
          <div className="flex items-center h-8 gap-4 text-sm font-bold overflow-x-auto">
            {selectedSection?.modules?.map((mod: Module, idx: number) => (
              <div key={mod.id} className="flex items-center">
                <button
                  onClick={() => {
                    setSelectedModule(mod);
                    setSelectedWeekId(mod.weeks?.[0]?.id ?? null);
                  }}
                  className={`pb-[2px] transition-colors whitespace-nowrap border-b-2 ${
                    mod.id === selectedModule?.id
                      ? "text-[#B923AE] border-[#B923AE]"
                      : "text-gray-600 hover:text-gray-900 border-transparent"
                  }`}
                >
                  {mod.title}
                </button>
                {idx < (selectedSection?.modules?.length ?? 0) - 1 && (
                  <span className="mx-4 text-gray-300 select-none">•</span>
                )}
              </div>
            ))}
          </div>
        </nav>

        <div className="justify-self-end h-8" />
      </div>

      {/* Week content */}
      <div className="rounded-xl bg-white px-6 py-4 md:px-8 shadow-sm">
        <div className="rounded-lg p-0">
          <WeekTabs
            weeks={weeksSorted}
            selectedWeekId={selectedWeekId}
            onSelectWeek={(id) => setSelectedWeekId(id)}
          />
        </div>

        {/* Days grid */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6" style={{ minHeight: "calc(100vh - 260px)" }}>
          {Array.from({ length: 3 }).map((_, idx) => {
            const day = daysSorted[idx];

            // Sort lessons by (optional) order; fallback to original index
            const lessonsSorted: Lesson[] = (() => {
              const list = day?.lessons ?? [];
              return [...list]
                .map((l, i) => ({ l, i, o: (l as any).order ?? i })) // (l as any).order if present
                .sort((a, b) => a.o - b.o)
                .map((x) => x.l);
            })();

            return (
              <div
                key={day?.id ?? `day-skeleton-${idx}`}
                className="bg-gray-50 rounded-lg p-4 h-full flex flex-col border border-gray-200"
              >
                {day && courseSlug && sectionSlug && moduleSlug && weekSlug ? (
                  <DayView
                    className="flex-1"
                    dayTitle={day.title}
                    lessons={lessonsSorted}
                    courseSlug={courseSlug}
                    sectionSlug={sectionSlug}
                    moduleSlug={moduleSlug}
                    weekSlug={weekSlug}
                    daySlug={day.slug}
                  />
                ) : (
                  <div className="flex-1 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm italic">
                    No Day
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ModuleWrapper;