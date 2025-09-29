"use client";

import { useState, useEffect } from "react";
import MarkdownRenderer from "./MarkdownRenderer";

interface LabLessonProps {
  labDescription?: string | null;
  lessonId: string;       // identifies the lab lesson
  enrollmentId: string;   // identifies the student’s enrollment
}

export default function LabLesson({ labDescription, lessonId, enrollmentId }: LabLessonProps) {
  const [link, setLink] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔹 Load existing submission
  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const res = await fetch(`/api/enrollments/${enrollmentId}/labs?lessonId=${lessonId}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.repoLink) {
            setLink(data.repoLink);
            setSubmitted(true);
          }
        }
      } catch (err) {
        console.error("❌ Failed to load submission:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [lessonId, enrollmentId]);

  // 🔹 Submit or update link
  const handleSend = async () => {
    if (!link) return;
    try {
      const res = await fetch(`/api/enrollments/${enrollmentId}/labs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, repoLink: link }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        console.error("❌ Failed to submit lab link");
      }
    } catch (err) {
      console.error("❌ Error submitting lab link:", err);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Loading lab...</p>;
  }

  return (
    <div className="space-y-6">
      {/* ✅ Markdown description */}
      {labDescription && (
        <MarkdownRenderer content={labDescription} className="text-[15px]" />
      )}

      {/* ✅ Submission input */}
      <div>
        <input
          type="url"
          placeholder="Insert a link to your work"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          disabled={submitted}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm 
                     focus:outline-none focus:ring-2 focus:ring-purple-500 
                     disabled:bg-gray-100"
        />
        <div className="mt-2 flex justify-end">
          <button
            onClick={handleSend}
            disabled={!link || submitted}
            className="px-4 py-2 rounded-md bg-purple-600 text-white text-sm 
                       hover:bg-purple-700 disabled:opacity-50"
          >
            {submitted ? "Submitted" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}