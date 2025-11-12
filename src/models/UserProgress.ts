// models/UserProgress.ts

import mongoose, {
  Schema,
  Document,
  model,
  models,
  Types,
} from "mongoose";

// 🟢 Strong type for userId and courseId
export interface IUserProgress extends Document {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
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

// ✅ Prevent duplicate progress per user + course
UserProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const UserProgress =
  models.UserProgress || model<IUserProgress>("UserProgress", UserProgressSchema);

export default UserProgress;