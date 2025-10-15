"use client";
import { useState } from "react";

type Props = {
  title: string;
  color?: string; // green, blue, orange, etc.
  text: string;
};

export default function HiddenTextBlock({ title, color = "green", text }: Props) {
  const [open, setOpen] = useState(false);

  // Tailwind color styles based on the type
  const colorClasses: Record<string, string> = {
    green: "text-green-600 border-green-300",
    blue: "text-blue-600 border-blue-300",
    orange: "text-orange-600 border-orange-300",
    gray: "text-gray-600 border-gray-300",
  };

  return (
    <div className={`border-l-4 pl-3 my-3 py-2 bg-white rounded transition-all ${colorClasses[color] || colorClasses.gray}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="font-semibold text-[15px] cursor-pointer select-none focus:outline-none"
      >
        {title}
      </button>

      {open && (
        <div className="mt-2 text-[15px] leading-relaxed text-[#1B2633] whitespace-pre-wrap">
          {text}
        </div>
      )}
    </div>
  );
}