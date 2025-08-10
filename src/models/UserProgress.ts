import mongoose, { Schema, Document } from "mongoose";

export interface IUserProgress extends Document {
  userEmail: string;
  courseId: string;
  completedLessons: string[];
  updatedAt: Date;
}

const UserProgressSchema: Schema = new Schema({
  userEmail: { type: String, required: true },
  courseId: { type: String, required: true },
  completedLessons: [{ type: String }],
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.UserProgress ||
  mongoose.model<IUserProgress>("UserProgress", UserProgressSchema);