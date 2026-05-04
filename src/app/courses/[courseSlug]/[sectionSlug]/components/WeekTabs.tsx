"use client";
import React from "react";
import { Week } from "@/types";
import { cleanTitle } from "@/app/utils/cleanTitles";

export interface WeekTabsProps {
  weeks: Week[];
  selectedWeekId: string | null;
  onSelectWeek: (id: string) => void;
  completedLessons?: string[];
}

const WeekTabs: React.FC<WeekTabsProps> = ({
  weeks,
  selectedWeekId,
  onSelectWeek,
  completedLessons = [],
}) => {
  if (!weeks?.length) return null;

  return (
    <div className="flex justify-end gap-3 overflow-x-auto">
      {weeks.map((week) => {
        // check how many lessons are in this week
        const allLessons = week.days.flatMap((d) => d.lessons || []);
        const total = allLessons.length;
        const done = allLessons.filter((l) => completedLessons.includes(l.id)).length;
        const completed = total > 0 && done === total;

        return (
          <button
            key={week.id}
            type="button"
            onClick={() => onSelectWeek(week.id)}
            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200
              ${
                selectedWeekId === week.id
                  ? "bg-[#B923AE] text-white"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700"
              }`}
          >
            {cleanTitle(week.title)}
            {completed && <span className="ml-2">✅</span>}
          </button>
        );
      })}
    </div>
  );
};

export default WeekTabs;