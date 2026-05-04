interface CourseSectionCardProps {
  title: string;
  completedLessons?: number;
  totalLessons?: number;
  accessLevel?: "limited" | "full";
}

const CourseSectionCard = ({
  title,
  completedLessons = 0,
  totalLessons = 0,
  accessLevel = "limited",
}: CourseSectionCardProps) => {
  const lessonsLeft = Math.max(0, totalLessons - completedLessons);
  const finished = totalLessons > 0 && lessonsLeft === 0;

  const lessonsBadgeClasses = finished
    ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
    : "bg-[#F4B8FF]/20 dark:bg-[#F4B8FF]/15 text-[#7A1773] dark:text-[#F4B8FF] border-[#F4B8FF] dark:border-[#F4B8FF]/40";
  const lessonsBadgeLabel = finished
    ? "Completed 🎉"
    : totalLessons > 0
    ? `${lessonsLeft} lesson${lessonsLeft === 1 ? "" : "s"} left`
    : "—";

  const isFull = accessLevel === "full";
  const accessBadgeClasses = isFull
    ? "bg-[#F4B8FF]/30 dark:bg-[#F4B8FF]/15 text-[#7A1773] dark:text-[#F4B8FF] border-[#F4B8FF] dark:border-[#F4B8FF]/40"
    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700";
  const accessBadgeLabel = isFull ? "Full access" : "Limited access";

  const progress =
    totalLessons > 0
      ? Math.min(100, Math.round((completedLessons / totalLessons) * 100))
      : 0;

  return (
    <div className="bg-white dark:bg-[#1a1f29] p-6 rounded-lg shadow-lg dark:shadow-black/40 dark:border dark:border-gray-800 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="text-lg text-gray-2 dark:text-gray-100 font-semibold">{title}</h3>
        <span
          className={`text-[11px] font-medium border rounded-full px-2 py-0.5 whitespace-nowrap ${lessonsBadgeClasses}`}
        >
          {lessonsBadgeLabel}
        </span>
      </div>

      <div className="mb-3">
        <span
          className={`text-[10px] font-medium border rounded-full px-2 py-0.5 whitespace-nowrap ${accessBadgeClasses}`}
        >
          {accessBadgeLabel}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-[4px] rounded-full bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
          <div
            className="absolute left-0 top-0 h-[5px] bg-gradient-to-r from-[#B923AE] to-[#F4B8FF] transition-all duration-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm font-bold text-gray-600 dark:text-gray-300 whitespace-nowrap">
          {totalLessons > 0
            ? `${completedLessons} / ${totalLessons}`
            : `${completedLessons}`}
        </span>
      </div>
    </div>
  );
};

export default CourseSectionCard;