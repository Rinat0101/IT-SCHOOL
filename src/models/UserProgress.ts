import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserProgress extends Document {
  userEmail: string;
  courseId: string;
  completedLessons: string[];
  updatedAt: Date;
}

const UserProgressSchema = new Schema<IUserProgress>(
  {
    userEmail: { type: String, required: true },
    courseId: { type: String, required: true },
    completedLessons: [{ type: String }],
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // ✅ adds createdAt & updatedAt automatically
  }
);

// ✅ ensure (userEmail + courseId) is unique
UserProgressSchema.index({ userEmail: 1, courseId: 1 }, { unique: true });

// ✅ Avoid OverwriteModelError in Next.js (hot reload safe)
const UserProgress: Model<IUserProgress> =
  mongoose.models.UserProgress ||
  mongoose.model<IUserProgress>("UserProgress", UserProgressSchema);

export default UserProgress;