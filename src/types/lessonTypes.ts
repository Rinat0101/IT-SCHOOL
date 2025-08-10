export type LessonType =
  | "Lesson"
  | "Lab"
  | "Assessment"
  | "Extra"
  | "Class Recording"


export const LESSON_TYPE_STYLES: Record<LessonType, { bg: string; text: string }> = {
  Lesson: { bg: "#1FD6C3", text: "white" },
  Lab: { bg: "#FDE047", text: "#000000" },
  Assessment: { bg: "#FF5630", text: "white" },
  Extra: { bg: "#5BE49B", text: "#000000" },
  "Class Recording": { bg: "#4C9EF1", text: "white" },
};