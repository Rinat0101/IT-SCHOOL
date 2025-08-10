export async function toggleLessonCompletion({
    userEmail,
    courseId,
    lessonId,
    markAsCompleted,
  }: {
    userEmail: string;
    courseId: string;
    lessonId: string;
    markAsCompleted: boolean;
  }) {
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, courseId, lessonId, markAsCompleted }),
      });
  
      if (!res.ok) {
        throw new Error("Failed to update lesson progress");
      }
  
      return await res.json();
    } catch (error) {
      console.error("❌ Error updating progress:", error);
      throw error;
    }
  }

  export async function getUserProgress(userEmail: string, courseId: string) {
    const res = await fetch(
      `/api/progress?userEmail=${userEmail}&courseId=${courseId}`
    );
  
    if (!res.ok) throw new Error("Failed to fetch user progress");
  
    const data = await res.json();
    return data.completedLessons as string[];
  }