import mongoose, { Schema, Document, Types } from "mongoose";
import "@/models/Course";

// ✅ Explicitly define _id type and clean interface
export interface IEnrollment extends Document {
  _id: Types.ObjectId; // <-- Fix: make _id explicitly typed
  userId: Types.ObjectId;   // reference to User
  courseId: Types.ObjectId; // reference to Course
  startDate: Date;
  endDate: Date;
  status: "active" | "completed" | "cancelled";

  goals?: {
    choices: string[];
    location?: string;
    deadline?: Date;
  };

  // 🟣 Access control
  accessLevel: "limited" | "full";

  // Optional: to track when it was upgraded
  accessUpgradedAt?: Date;
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
    accessLevel: {
      type: String,
      enum: ["limited", "full"],
      default: "limited",
    },
    accessUpgradedAt: { type: Date },
  },
  { timestamps: true }
);

// ✅ Fix Next.js hot-reload issue
const Enrollment =
  mongoose.models.Enrollment ||
  mongoose.model<IEnrollment>("Enrollment", EnrollmentSchema);

export default Enrollment;