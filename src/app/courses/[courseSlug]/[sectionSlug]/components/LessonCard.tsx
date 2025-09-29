import React from "react";

export interface LessonCardProps {
  title: string;
  type: "Lesson" | "Lab" | "Assessment" | "Extra" | "Class Recording";
  isMandatory?: boolean;
  isCompleted?: boolean;
}

const TYPE_STYLES: Record<LessonCardProps["type"], { bg: string; text: string }> = {
  Lesson: { bg: "#1FD6C3", text: "white" },
  Lab: { bg: "#FDE047", text: "#000000" },
  Assessment: { bg: "#FF5630", text: "white" },
  Extra: { bg: "#5BE49B", text: "#000000" },
  "Class Recording": { bg: "#4C9EF1", text: "white" },
};

const LessonCard: React.FC<LessonCardProps> = ({
  title,
  type,
  isMandatory,
  isCompleted = false,
}) => {
  const { bg, text } = TYPE_STYLES[type];

  return (
    <div
      className={`relative flex items-center justify-between w-full rounded-lg px-4 py-3 bg-white 
        transition hover:shadow-md`}
      style={{ boxShadow: "0px 1px 2px rgba(145, 158, 171, 0.24)" }}
    >
      {/* full-height colored bar on the left */}
      <span
        aria-hidden
        className="absolute left-0 top-0 h-full w-1 rounded-l-lg"
        style={{ backgroundColor: bg }}
      />

      {/* Left Side */}
      <div className="flex items-start gap-4">
        <div>
          {/* Type badge */}
          <div
            className="text-xs font-semibold px-2 py-1 rounded-md inline-block mb-1 leading-none"
            style={{ backgroundColor: bg, color: text }}
          >
            {type.toUpperCase()}
          </div>

          {/* Lesson title */}
          <p className="text-sm text-gray-700">{title}</p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {isMandatory && (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-md">
            Mandatory
          </span>
        )}

        {/* Completion circle */}
        <div
          role="img"
          aria-label={isCompleted ? "Lesson completed" : "Lesson not completed"}
          className={`w-5 h-5 rounded-full border flex items-center justify-center
            ${isCompleted ? "bg-green-600 border-green-600" : "border-gray-400"}
          `}
        >
          {isCompleted && (
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonCard;