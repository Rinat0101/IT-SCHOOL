"use client";

import { useState, useEffect } from "react";
import MarkdownRenderer from "./MarkdownRenderer";

interface LabLessonProps {
  labDescription?: string | null;
  lessonId: string;
  enrollmentId: string;
  autoCompleteCourseId?: string;
}

export default function LabLesson({
  labDescription,
  lessonId,
  enrollmentId,
  autoCompleteCourseId,
}: LabLessonProps) {
  const [link, setLink] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // 🔹 Load existing submission
  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const res = await fetch(`/api/labs?enrollmentId=${enrollmentId}&lessonId=${lessonId}`);
        if (res.ok) {
          const data = await res.json();
          const submission = data.submissions?.[0];
          if (submission?.repoUrl) {
            setLink(submission.repoUrl);
            setSubmitted(true);
          }
        }
      } catch (err) {
        console.error("❌ Failed to load lab submission:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [lessonId, enrollmentId]);

  // 🔹 Save, update, or delete submission
  const handleSave = async () => {
    if (!link.trim()) {
      // ❌ Empty link → delete existing submission
      await handleDeleteLink();
      return;
    }

    try {
      const res = await fetch("/api/labs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentId,
          lessonId,
          repoUrl: link,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit lab link");

      // ✅ Mark as completed
      if (autoCompleteCourseId) {
        await fetch("/api/progress", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId: autoCompleteCourseId,
            lessonId,
            markAsCompleted: true,
          }),
        });
      }

      setSubmitted(true);
      setIsEditing(false);
    } catch (err) {
      console.error("❌ Error submitting lab link:", err);
    }
  };

  // 🔹 Delete submission
  const handleDeleteLink = async () => {
    try {
      const res = await fetch(`/api/labs?enrollmentId=${enrollmentId}&lessonId=${lessonId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete lab link");

      if (autoCompleteCourseId) {
        await fetch("/api/progress", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId: autoCompleteCourseId,
            lessonId,
            markAsCompleted: false,
          }),
        });
      }

      setLink("");
      setSubmitted(false);
      setIsEditing(false);
    } catch (err) {
      console.error("❌ Error removing lab link:", err);
    }
  };

  if (loading) return <p className="text-gray-500">Loading lab...</p>;

  return (
    <div className="space-y-6">
      {/* ✅ Markdown description */}
      {labDescription && <MarkdownRenderer content={labDescription} className="text-[15px]" />}

      {/* ✅ Submission input */}
      <div className="space-y-2">
        <div className="flex gap-2 items-center">
          <input
            type="url"
            placeholder="Insert a link to your work"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            disabled={submitted && !isEditing}
            className={`flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm 
                       focus:outline-none focus:ring-2 ${
                         isEditing ? "focus:ring-[#B923AE]" : "focus:ring-gray-200"
                       } disabled:bg-gray-100`}
          />

          {/* 🟣 Main button logic */}
          {!submitted ? (
            <button
              onClick={handleSave}
              disabled={!link}
              className="px-4 py-2 rounded-md bg-[#B923AE] text-white text-sm 
                         hover:bg-opacity-90 disabled:opacity-50"
            >
              Send
            </button>
          ) : isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-md bg-[#B923AE] text-white text-sm 
                           hover:bg-opacity-90"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);

                  // 🔙 Reset to the saved link if user cancels editing
                  const fetchCurrent = async () => {
                    try {
                      const res = await fetch(
                        `/api/labs?enrollmentId=${enrollmentId}&lessonId=${lessonId}`
                      );
                      if (res.ok) {
                        const data = await res.json();
                        const submission = data.submissions?.[0];
                        if (submission?.repoUrl) {
                          setLink(submission.repoUrl);
                        } else {
                          setLink("");
                          setSubmitted(false);
                        }
                      }
                    } catch (err) {
                      console.error("❌ Failed to reload saved link on cancel:", err);
                    }
                  };

                  fetchCurrent();
                }}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 text-sm 
                           hover:bg-gray-100"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 text-sm 
                         hover:bg-gray-300"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}