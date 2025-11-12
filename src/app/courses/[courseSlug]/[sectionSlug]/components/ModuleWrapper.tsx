"use client";

import { useEffect, useMemo } from "react";
import { useCourseStore } from "@/stores/useCourseStore";
import type { Week, Module, Day, Lesson } from "@/types";
import WeekTabs from "./WeekTabs";
import DayView from "./DayView";
import Link from "next/link";
import { sortBy } from "@/app/utils/sort";

interface ModuleWrapperProps {
  enrollment?: any;
  userProgress?: {
    courseId: string;
    completedLessons: string[];
  };
}

const ModuleWrapper = ({ enrollment, userProgress }: ModuleWrapperProps) => {
  const selectedWeekId = useCourseStore((s) => s.selectedWeekId);
  const setSelectedWeekId = useCourseStore((s) => s.setSelectedWeekId);
  const selectedCourse = useCourseStore((s) => s.selectedCourse);
  const selectedSection = useCourseStore((s) => s.selectedSection);
  const selectedModule = useCourseStore((s) => s.selectedModule);
  const setSelectedModule = useCourseStore((s) => s.setSelectedModule);

  const accessLevel = enrollment?.accessLevel ?? "limited"; // 🟣 default limited

  // Default selection logic
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

  const weeksSorted: Week[] = useMemo(
    () => sortBy(selectedModule?.weeks, (w) => (w as any).order),
    [selectedModule]
  );

  const currentWeek: Week | undefined = useMemo(
    () => weeksSorted.find((w) => w.id === selectedWeekId),
    [weeksSorted, selectedWeekId]
  );

  const daysSorted: Day[] = useMemo(
    () => sortBy(currentWeek?.days, (d) => (d as any).order),
    [currentWeek]
  );

  const courseSlug = selectedCourse?.slug;
  const sectionSlug = selectedSection?.slug;
  const moduleSlug = selectedModule?.slug;
  const weekSlug = currentWeek?.slug;

  // 🟣 Progress bar calculation
  const allLessons = weeksSorted.flatMap((w) =>
    (w.days ?? []).flatMap((d) => d.lessons ?? [])
  );
  const mandatoryLessons = allLessons.filter((l) => l.isMandatory);
  const totalWeight = mandatoryLessons.reduce(
    (acc, l) => acc + (l.lessonType === "Lab" ? 2 : 1),
    0
  );
  const completedLessons = userProgress?.completedLessons ?? [];
  const completedWeight = mandatoryLessons.reduce((acc, l) => {
    if (completedLessons.includes(l.id)) {
      return acc + (l.lessonType === "Lab" ? 2 : 1);
    }
    return acc;
  }, 0);
  const moduleProgress =
    totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;

  // 🟣 Helper to check if a module is locked
  const isModuleLocked = (index: number) => {
    if (accessLevel === "full") return false; // everything open
    // allow module 0 (first section) and 0 of second section
    if (selectedSection?.order === 1 && index === 0) return false;
    if (selectedSection?.order === 2 && index === 0) return false;
    return true; // all others locked
  };

  return (
    <div className="bg-[#F9FAFB] pt-2 rounded-b-lg shadow-md">
      {/* Header */}
      <div className="grid grid-cols-3 items-center m-4">
        <div className="justify-self-start">
          <Link
            href={courseSlug ? `/courses/${courseSlug}` : "#"}
            className="text-[#B923AE] text-sm font-bold hover:underline inline-flex items-center h-8"
          >
            ← Back
          </Link>
        </div>

        {/* 🔒 Module Tabs */}
        <nav className="justify-self-center">
          <div className="flex items-center h-8 gap-4 text-sm font-bold overflow-x-auto">
            {selectedSection?.modules?.map((mod: Module, idx: number) => {
              const locked = isModuleLocked(idx);
              return (
                <div key={mod.id} className="flex items-center relative">
                  <button
                    disabled={locked}
                    onClick={() => {
                      if (!locked) {
                        setSelectedModule(mod);
                        setSelectedWeekId(mod.weeks?.[0]?.id ?? null);
                      }
                    }}
                    className={`pb-[2px] transition-colors whitespace-nowrap border-b-2 ${
                      locked
                        ? "text-gray-400 cursor-not-allowed border-transparent"
                        : mod.id === selectedModule?.id
                        ? "text-[#B923AE] border-[#B923AE]"
                        : "text-gray-600 hover:text-gray-900 border-transparent"
                    }`}
                  >
                    {mod.title}
                  </button>

                  {locked && (
                    <span className="ml-1 text-gray-400 text-xs">🔒</span>
                  )}

                  {idx < (selectedSection?.modules?.length ?? 0) - 1 && (
                    <span className="mx-4 text-gray-300 select-none">•</span>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        <div className="justify-self-end h-8" />
      </div>

      {/* Progress bar */}
      <div className="px-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-[4px] rounded-full bg-gray-200 relative overflow-hidden">
            <div
              className="absolute left-0 top-0 h-[5px] bg-gradient-to-r from-[#B923AE] to-[#F4B8FF] transition-all duration-500 rounded-full"
              style={{ width: `${moduleProgress}%` }}
            />
          </div>
          <span className="text-md font-bold text-gray-600">{moduleProgress}%</span>
        </div>
      </div>

      {/* Main content */}
      <div className="rounded-xl bg-white px-6 py-4 md:px-8 shadow-sm">
        {accessLevel === "limited" && isModuleLocked(
          selectedSection?.modules?.findIndex(
            (m) => m.id === selectedModule?.id
          ) ?? 999
        ) ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
            <p className="text-lg font-semibold">🔒 Module locked</p>
            <p className="text-sm">Upgrade access to view this content.</p>
          </div>
        ) : (
          <>
            <WeekTabs
              weeks={weeksSorted}
              selectedWeekId={selectedWeekId}
              onSelectWeek={(id) => setSelectedWeekId(id)}
            />
            <div
              className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6"
              style={{ minHeight: "calc(100vh - 260px)" }}
            >
              {daysSorted.map((day) => (
                <div
                  key={day.id}
                  className="bg-gray-50 rounded-lg p-4 h-full flex flex-col border border-gray-200"
                >
                  <DayView
                    className="flex-1"
                    dayTitle={day.title}
                    lessons={day.lessons ?? []}
                    courseSlug={courseSlug!}
                    sectionSlug={sectionSlug!}
                    moduleSlug={moduleSlug!}
                    weekSlug={weekSlug!}
                    daySlug={day.slug}
                    completedLessons={completedLessons}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ModuleWrapper;