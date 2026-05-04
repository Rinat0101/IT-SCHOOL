"use client";

type Props = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
};

const DangerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}: Props) {
  const isDanger = variant === "danger";

  const confirmClasses = isDanger
    ? "bg-red-600 hover:bg-red-700"
    : "bg-[#B923AE] hover:bg-[#A01F97]";

  const iconWrapperClasses = isDanger
    ? "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
    : "bg-[#F4B8FF]/20 text-[#B923AE] dark:bg-[#F4B8FF]/15 dark:text-[#F4B8FF]";

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-[#1a1f29] dark:border dark:border-gray-700 rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-start gap-4">
            <div
              className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${iconWrapperClasses}`}
            >
              {isDanger ? <DangerIcon /> : <InfoIcon />}
            </div>
            <div className="flex-1 min-w-0">
              <h3
                id="confirm-title"
                className="text-base font-semibold text-[#212B36] dark:text-gray-100"
              >
                {title}
              </h3>
              <p
                id="confirm-message"
                className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed"
              >
                {message}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-[#0f1420] border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-100 border border-gray-200 dark:border-gray-600 text-sm font-medium transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2 rounded-lg text-white text-sm font-semibold shadow-sm transition-colors ${confirmClasses}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
