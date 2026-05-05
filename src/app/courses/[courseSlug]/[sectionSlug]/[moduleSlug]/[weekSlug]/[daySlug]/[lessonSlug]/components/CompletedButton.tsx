"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useCourseStore } from "@/stores/useCourseStore";

interface CompletedButtonProps {
  lessonId: string;
  courseId: string;
}

export default function CompletedButton({
  lessonId,
  courseId,
}: CompletedButtonProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const completedLessons = useCourseStore((s) => s.completedLessons);
  const setCompletedLessons = useCourseStore((s) => s.setCompletedLessons);

  const isCompleted = completedLessons.includes(lessonId);

  const toggleComplete = async () => {
    if (!session?.user?.id || !courseId) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/progress", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          courseId,
          lessonId,
          markAsCompleted: !isCompleted,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && Array.isArray(data.completedLessons)) {
        setCompletedLessons(data.completedLessons);
      } else {
        console.error("Failed to update progress:", data.error || res.statusText);
      }
    } catch (err) {
      console.error("Toggle error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleComplete}
      disabled={isLoading}
      className={`font-semibold py-3 px-6 rounded-xl shadow-md transition-all duration-300
        ${
          isCompleted
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-[#B923AE] hover:bg-opacity-90 text-white"
        }
        ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      {isLoading
        ? "Saving..."
        : isCompleted
        ? "Mark as Incomplete"
        : "Mark as Completed"}
    </button>
  );
}