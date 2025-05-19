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
    <div className="rounded-2xl border border-gray-300 bg-white p-6 shadow-sm flex flex-col items-center text-center">
      <div className="relative w-42 h-42 mb-4">
        <svg width="100%" height="100%" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#E5E7EB" 
            strokeWidth={strokeWidth}
          />
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
          />
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#C93AFC" />
              <stop offset="100%" stopColor="#FBA14F" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm text-gray-500">Completed</span>
          <span className="text-2xl font-bold text-gray-900">
            {completionPercentage}%
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 mt-2">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        {iconUrl && (
          <img src={iconUrl} alt="Icon" className="w-5 h-5 opacity-40" />
        )}
      </div>
    </div>
  );
};

export default CourseSectionCard;