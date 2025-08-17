"use client";

import { useEffect, useMemo } from "react";
import { useCourseStore } from "@/stores/useCourseStore";
import type { Week, Module } from "@/types";
import WeekTabs from "./WeekTabs";
import DayView from "./DayView";
import Link from "next/link";

const ModuleWrapper = () => {
  const selectedWeekId = useCourseStore((s) => s.selectedWeekId);
  const setSelectedWeekId = useCourseStore((s) => s.setSelectedWeekId);
  const selectedCourse = useCourseStore((s) => s.selectedCourse);
  const selectedSection = useCourseStore((s) => s.selectedSection);
  const selectedModule = useCourseStore((s) => s.selectedModule);
  const setSelectedModule = useCourseStore((s) => s.setSelectedModule);

  // 1) Ensure Module 1 is active by default (and set its first week)
  useEffect(() => {
    if (!selectedSection) return;
    if (!selectedModule) {
      const firstMod = selectedSection.modules?.[0];
      if (firstMod) {
        setSelectedModule(firstMod);
        const firstWeekId = firstMod.weeks?.[0]?.id ?? null;
        setSelectedWeekId(firstWeekId);
      }
    }
  }, [selectedSection, selectedModule, setSelectedModule, setSelectedWeekId]);

  // 2) When module changes, ensure week selection is valid
  useEffect(() => {
    if (!selectedModule) return;
    const weeks = selectedModule.weeks || [];
    if (weeks.length === 0) {
      if (selectedWeekId !== null) setSelectedWeekId(null);
      return;
    }
    const stillValid = weeks.some((w) => w.id === selectedWeekId);
    if (!stillValid) {
      setSelectedWeekId(weeks[0].id);
    }
  }, [selectedModule, selectedWeekId, setSelectedWeekId]);

  const currentWeek: Week | undefined = useMemo(() => {
    if (!selectedModule || !selectedWeekId) return undefined;
    return selectedModule.weeks?.find((w) => w.id === selectedWeekId);
  }, [selectedModule, selectedWeekId]);

  const courseSlug = selectedCourse?.slug;
  const sectionSlug = selectedSection?.slug;
  const moduleSlug = selectedModule?.slug;
  const weekSlug = currentWeek?.slug;

  return (
    <div className="bg-[#F9FAFB] pt-2 rounded-b-lg shadow-md">
      {/* Header row: back on left, tabs centered, spacer on right */}
      <div className="grid grid-cols-3 items-center m-4">
        {/* Back (left) */}
        <div className="justify-self-start">
          <Link
            href={courseSlug ? `/courses/${courseSlug}` : "#"}
            className="text-[#B923AE] text-sm font-bold hover:underline inline-flex items-center h-8"
          >
            ← Back
          </Link>
        </div>

        {/* Module Tabs (center) */}
        <nav className="justify-self-center">
          <div className="flex items-center h-8 gap-4 text-sm font-bold overflow-x-auto">
            {selectedSection?.modules?.map((mod: Module, idx: number) => (
              <div key={mod.id} className="flex items-center">
                <button
                  onClick={() => {
                    setSelectedModule(mod);
                    setSelectedWeekId(mod.weeks[0]?.id ?? null);
                  }}
                  className={`pb-[2px] transition-colors whitespace-nowrap border-b-2 ${
                    mod.id === selectedModule?.id
                      ? "text-[#B923AE] border-[#B923AE]"
                      : "text-gray-600 hover:text-gray-900 border-transparent"
                  }`}
                >
                  {mod.title}
                </button>

                {/* dot separator (no dot after last) */}
                {idx < (selectedSection?.modules?.length ?? 0) - 1 && (
                  <span className="mx-4 text-gray-300 select-none">•</span>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Right spacer to keep center perfect */}
        <div className="justify-self-end h-8" />
      </div>

      {/* Week content (light/white) */}
      <div className="rounded-xl bg-white px-6 py-4 md:px-8 shadow-sm">
        {/* Week Tabs (grey) */}
        <div className="rounded-lg p-0">
          <WeekTabs
            weeks={selectedModule?.weeks || []}
            selectedWeekId={selectedWeekId}
            onSelectWeek={(id) => setSelectedWeekId(id)}
          />
        </div>

        {/* Days grid */}
        <div
          className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6"
          style={{ minHeight: "calc(100vh - 260px)" }}
        >
          {Array.from({ length: 3 }).map((_, idx) => {
            const day = currentWeek?.days?.[idx];

            return (
              <div
                key={idx}
                className="bg-gray-50 rounded-lg p-4 h-full flex flex-col border border-gray-200"
              >
                {day && courseSlug && sectionSlug && moduleSlug && weekSlug ? (
                  <DayView
                    className="flex-1"
                    dayTitle={day.title}
                    lessons={day.lessons}
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