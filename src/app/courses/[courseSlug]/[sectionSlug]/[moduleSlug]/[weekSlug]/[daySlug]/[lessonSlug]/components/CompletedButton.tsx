"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface CompletedButtonProps {
  lessonId: string;
  courseId: string;
}

export default function CompletedButton({ lessonId, courseId }: CompletedButtonProps) {
  const { data: session } = useSession();
  const userEmail = session?.user?.email;

  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!userEmail) return;
      try {
        const res = await fetch(`/api/progress?userEmail=${userEmail}&courseId=${courseId}`);
        const data = await res.json();
        if (Array.isArray(data.completedLessons)) {
          setIsCompleted(data.completedLessons.includes(lessonId));
        }
      } catch (err) {
        console.error("Failed to load user progress", err);
      }
    };
    fetchProgress();
  }, [userEmail, courseId, lessonId]);

  const toggleComplete = async () => {
    if (!userEmail) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, courseId, lessonId }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsCompleted(data.isCompleted);
      } else {
        console.error("Error updating progress:", data.error);
      }
    } catch (err) {
      console.error("Failed to update progress", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleComplete}
      disabled={isLoading}
      className={`bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold py-2 px-6 rounded-xl shadow-md transition ${
        isLoading ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {isCompleted ? "Mark as Incomplete" : "Mark as Completed"}
    </button>
  );
}