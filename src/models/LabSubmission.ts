// models/LabSubmission.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ILabSubmission extends Document {
  userId: string;       // student’s id
  courseId: string;     // which course enrollment
  lessonId: string;     // which lab lesson in DatoCMS
  repoUrl: string;      // submitted repo link
  createdAt: Date;
  updatedAt: Date;
}

const LabSubmissionSchema = new Schema<ILabSubmission>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    lessonId: { type: String, required: true }, // store DatoCMS lesson ID or slug
    repoUrl: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.LabSubmission ||
  mongoose.model<ILabSubmission>("LabSubmission", LabSubmissionSchema);