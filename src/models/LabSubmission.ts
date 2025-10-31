// models/LabSubmission.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ILabSubmission extends Document {
  userId: mongoose.Types.ObjectId;      
  courseId: mongoose.Types.ObjectId;    
  enrollmentId: mongoose.Types.ObjectId;
  lessonId: string;                     
  repoUrl: string;                      
  status: "submitted" | "resubmitted" | "graded" | "deleted";
  grade?: number;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LabSubmissionSchema = new Schema<ILabSubmission>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    enrollmentId: { type: Schema.Types.ObjectId, ref: "Enrollment", required: true },
    lessonId: { type: String, required: true },
    repoUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ["submitted", "resubmitted", "graded", "deleted"],
      default: "submitted",
    },
    grade: { type: Number, default: null },
    feedback: { type: String, default: "" },
  },
  { timestamps: true }
);

// ✅ Prevent duplicates (1 submission per enrollment per lesson)
LabSubmissionSchema.index({ enrollmentId: 1, lessonId: 1 }, { unique: true });

export default mongoose.models.LabSubmission ||
  mongoose.model<ILabSubmission>("LabSubmission", LabSubmissionSchema);