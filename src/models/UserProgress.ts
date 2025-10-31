// models/UserProgress.ts
import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IUserProgress extends Document {
  userId: Schema.Types.ObjectId;
  courseId: Schema.Types.ObjectId;
  completedLessons: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserProgressSchema = new Schema<IUserProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    completedLessons: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

// ✅ Prevent duplicate (user + course) entries
UserProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default models.UserProgress ||
  model<IUserProgress>("UserProgress", UserProgressSchema);