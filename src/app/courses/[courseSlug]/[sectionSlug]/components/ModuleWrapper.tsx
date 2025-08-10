"use client";

import { useCourseStore } from "@/stores/useCourseStore";
import type { Week, Day, Module } from "@/types";
import WeekTabs from "./WeekTabs";
import DayView from "./DayView";
import Link from "next/link";

const ModuleWrapper = () => {
  const selectedWeekId = useCourseStore((state) => state.selectedWeekId);
  const setSelectedWeekId = useCourseStore((state) => state.setSelectedWeekId);
  const selectedCourse = useCourseStore((state) => state.selectedCourse);
  const selectedSection = useCourseStore((state) => state.selectedSection);
  const selectedModule = useCourseStore((state) => state.selectedModule);
  const setSelectedModule = useCourseStore((state) => state.setSelectedModule);

  const currentWeek = selectedModule?.weeks?.find((week: Week) => week.id === selectedWeekId);

  // 🔍 Debug logs
  console.log("📚 selectedCourse:", selectedCourse);
  console.log("📦 selectedSection:", selectedSection);
  console.log("📘 selectedModule:", selectedModule);
  console.log("📐 selectedWeekId:", selectedWeekId);
  console.log("🧱 selectedModule.weeks:", selectedModule?.weeks);
  console.log("🗓️ currentWeek:", currentWeek);

  return (
    <div className="bg-[#F9FAFB] p-4 rounded-lg shadow-md">
      {/* Top: Back button + Module Tabs */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <Link
          href={`/courses/${selectedCourse?.slug}`}
          className="text-[#7E22CE] text-sm font-bold hover:underline"
        >
          ← Back
        </Link>

        {/* Module Tabs */}
        <div className="flex gap-4 text-sm font-medium overflow-x-auto">
          {selectedSection?.modules?.map((mod: Module) => (
            <button
              key={mod.id}
              onClick={() => {
                console.log("🔁 Module clicked:", mod);
                setSelectedModule(mod);
                if (mod.weeks.length > 0) {
                  setSelectedWeekId(mod.weeks[0].id);
                } else {
                  setSelectedWeekId(null);
                }
              }}
              className={`pb-1 transition-all ${
                mod.id === selectedModule?.id
                  ? "text-[#7E22CE] border-b-2 border-[#C084FC]"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              {mod.title}
            </button>
          ))}
        </div>
      </div>

      {/* Week content (light/white) */}
      <div className="mt-4 rounded-xl bg-white p-4 shadow-sm">
        {/* Week Tabs (grey) */}
        <div className="rounded-lg p-3 mt-4">
          <WeekTabs
            weeks={selectedModule?.weeks || []}
            selectedWeekId={selectedWeekId}
            onSelectWeek={(id) => setSelectedWeekId(id)}
          />
        </div>
        {/* The grid itself has a fixed min height based on viewport */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          style={{ minHeight: "calc(100vh - 260px)" }} 
        >
          {Array.from({ length: 3 }).map((_, idx) => {
            const day = currentWeek?.days?.[idx];

            return (
              <div key={idx} className="bg-gray-50 rounded-lg p-4 h-full flex flex-col">
                {day ? (
                  <DayView dayTitle={day.title} lessons={day.lessons} className="flex-1" />
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
