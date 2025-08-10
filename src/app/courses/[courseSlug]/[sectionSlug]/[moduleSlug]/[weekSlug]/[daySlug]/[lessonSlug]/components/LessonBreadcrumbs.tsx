"use client";

import { useState } from "react";
import type { DatoCmsLessonBlock } from "@/types";

interface LessonBreadcrumbsProps {
  blocks: DatoCmsLessonBlock[];
}

export default function LessonBreadcrumbs({ blocks }: LessonBreadcrumbsProps) {
  const sections = blocks.filter(
    (
      block
    ): block is Extract<
      DatoCmsLessonBlock,
      {
        __typename: "TextBlock";
        id: string;
        title?: string;
        subsections?: { id: string; text: string }[];
      }
    > =>
      block.__typename === "TextBlock" &&
      typeof block.id === "string" &&
      typeof block.title === "string"
  );

  const [openSection, setOpenSection] = useState<string | null>(null);

  return (
    <aside className="w-full max-w-xs px-4 py-6 border-l border-gray-200">
      <h2 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wide">
        Lesson Topics
      </h2>
      <nav className="space-y-2 text-sm">
        {sections.map((section) => (
          <div key={section.id}>
            <button
              onClick={() => setOpenSection((prev) => (prev === section.id ? null : section.id))}
              className={`flex items-center justify-between w-full px-2 py-1 rounded ${
                openSection === section.id
                  ? "bg-green-50 text-green-700 font-semibold"
                  : "hover:bg-gray-100"
              }`}
            >
              {section.title}
              {Array.isArray(section.subsections) && section.subsections.length > 0 && (
                <span className="text-xs ml-2">{openSection === section.id ? "▾" : "▸"}</span>
              )}
            </button>

            {openSection === section.id &&
              Array.isArray(section.subsections) &&
              section.subsections.length > 0 && (
                <ul className="ml-4 mt-1 space-y-1">
                  {section.subsections.map((sub) => (
                    <li key={sub.id} className="flex items-center gap-2">
                      <span className="text-green-500 text-xs">•</span>
                      <span>{sub.text}</span>
                    </li>
                  ))}
                </ul>
              )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
