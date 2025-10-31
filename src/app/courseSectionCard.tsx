import React from "react";

interface CourseSectionCardProps {
  title: string;
  completionPercentage: number;
  iconUrl?: string;
}

const CourseSectionCard: React.FC<CourseSectionCardProps> = ({
  title,
  completionPercentage,
  iconUrl,
}) => {
  const radius = 45;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (completionPercentage / 100) * circumference;

  return (
    <div
      className="rounded-2xl bg-white p-6 shadow-sm flex flex-col items-center text-center transition-transform duration-200 hover:scale-[1.02]"
      style={{
        border: "1px solid rgba(145, 158, 171, 0.24)",
      }}
    >
      {/* 🟣 Circular progress */}
      <div className="relative w-[100px] h-[100px] mb-4">
        <svg width="100%" height="100%" viewBox="0 0 100 100">
          {/* Base circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#B923AE" />
              <stop offset="100%" stopColor="#FBA14F" />
            </linearGradient>
          </defs>
        </svg>

        {/* Text inside the circle */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-gray-500 leading-none mb-[2px]">
            Completed
          </span>
          <span className="text-[22px] font-bold text-gray-900">
            {completionPercentage}%
          </span>
        </div>
      </div>

      {/* 📘 Section title */}
      <div className="flex flex-col items-center mt-2">
        {iconUrl && (
          <img
            src={iconUrl}
            alt=""
            className="w-10 h-10 mb-2 object-contain"
          />
        )}
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      </div>
    </div>
  );
};

export default CourseSectionCard;