import mongoose, { Schema, Document } from "mongoose";

export interface IGoal extends Document {
  userId: mongoose.Types.ObjectId;
  goalType: "Find a job in IT" | "Get a promotion" | "Get an internship";
  location: string; // e.g. "remote" or state name
  deadline: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    goalType: {
      type: String,
      enum: ["Find a job in IT", "Get a promotion", "Get an internship"],
      required: true,
    },
    location: { type: String, required: true },
    deadline: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Goal ||
  mongoose.model<IGoal>("Goal", GoalSchema);