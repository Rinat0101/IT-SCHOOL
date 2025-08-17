"use client";
import React from "react";
import { Week } from "@/types";

export interface WeekTabsProps {
  weeks: Week[];
  selectedWeekId: string | null;
  onSelectWeek: (id: string) => void;
}

const WeekTabs: React.FC<WeekTabsProps> = ({
  weeks,
  selectedWeekId,
  onSelectWeek,
}) => {
  if (!weeks?.length) return null;

  return (
    <div className="flex justify-end gap-3 overflow-x-auto">
      {weeks.map((week) => (
        <button
          key={week.id}
          type="button"
          onClick={() => onSelectWeek(week.id)}
          className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200
            ${
              selectedWeekId === week.id
                ? "bg-[#B923AE] text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
        >
          {week.title}
        </button>
      ))}
    </div>
  );
};

export default WeekTabs;