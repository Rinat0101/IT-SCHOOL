import mongoose, { Schema, Document } from "mongoose";
import "@/models/Course";
export interface IEnrollment extends Document {
  userId: mongoose.Types.ObjectId;   // reference to User
  courseId: mongoose.Types.ObjectId; // reference to Course
  startDate: Date;
  endDate: Date;
  status: "active" | "completed" | "cancelled";
  goals?: {
    choices: string[];
    location?: string;
    deadline?: Date;
  };

  // 🆕 Labs: store submissions per lesson
  labs?: {
    lessonId: string;                 // ⚠️ store lessonId from DatoCMS instead of Mongo ObjectId
    repoLink: string;                 // student's submitted repo link
    submittedAt: Date;
  }[];
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    goals: {
      choices: [String],
      location: String,
      deadline: Date,
    },
    labs: [
      {
        // ⚠️ lessonId from DatoCMS (string)
        lessonId: { type: String, required: true },
        repoLink: { type: String, required: true },
        submittedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// ⚠️ Avoid recompilation errors in Next.js
export default mongoose.models.Enrollment ||
  mongoose.model<IEnrollment>("Enrollment", EnrollmentSchema);