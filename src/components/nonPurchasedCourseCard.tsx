type Props = {
  title: string;
  description: string;
  buttonText: string;
  url: string;
};

export default function NonPurchasedCourseCard({
  title,
  description,
  buttonText,
  url,
}: Props) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between gap-4 rounded-xl px-5 py-4 bg-gradient-to-br from-[#FCF2FF] to-[#F4B8FF]/40 dark:from-[#2a1830] dark:to-[#1f1428] border border-[#F4B8FF]/60 dark:border-[#F4B8FF]/30 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-[#212B36] dark:text-gray-100 truncate">{title}</h3>
        <p className="text-xs text-[#6B778C] dark:text-gray-400 mt-1 line-clamp-2 leading-snug">
          {description}
        </p>
      </div>
      <span className="text-[#B923AE] dark:text-[#F4B8FF] font-semibold text-sm whitespace-nowrap inline-flex items-center gap-1 group-hover:gap-2 transition-all">
        {buttonText}
        <span aria-hidden>→</span>
      </span>
    </a>
  );
}
