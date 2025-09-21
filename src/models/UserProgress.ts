// models/UserProgress.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IUserProgress extends Document {
  userId: Schema.Types.ObjectId;
  courseId: Schema.Types.ObjectId;
  completedLessons: string[]; 
  updatedAt: Date;
}

const UserProgressSchema = new Schema<IUserProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    completedLessons: [{ type: String }],
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.UserProgress ||
  mongoose.model<IUserProgress>("UserProgress", UserProgressSchema);