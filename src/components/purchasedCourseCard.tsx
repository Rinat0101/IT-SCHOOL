interface CourseSectionCardProps {
  title: string;
  startDate: string;
  endDate: string;
  completionPercentage: number;
}

const CourseSectionCard = ({
  title,
  startDate,
  endDate,
  completionPercentage,
}: CourseSectionCardProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg text-gray-2 font-semibold mb-2">{title}</h3>
      <p className="text-xs text-gray-1 mb-4">
        {startDate} - {endDate}
      </p>

      <div className="flex items-center gap-2">
        {/* Progress bar */}
        <div className="flex-1 h-1 bg-gray-200 rounded-full">
          <div
            className="h-full rounded-full"
            style={{
              width: `${completionPercentage}%`,
              background: "linear-gradient(to right, #4B99D7, #ED9733)"
            }}
          ></div>
        </div>

        {/* Percentage */}
        <span className="text-sm font-medium text-gray-1">
          {completionPercentage}%
        </span>
      </div>
    </div>
  );
};

export default CourseSectionCard;