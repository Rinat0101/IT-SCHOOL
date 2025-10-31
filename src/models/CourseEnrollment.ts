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

  // 🟣 NEW: Access control
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

    // 🔒 New access level control
    accessLevel: {
      type: String,
      enum: ["limited", "full"],
      default: "limited",
    },
    accessUpgradedAt: { type: Date },
  },
  { timestamps: true }
);

// ⚠️ Avoid recompilation errors in Next.js
export default mongoose.models.Enrollment ||
  mongoose.model<IEnrollment>("Enrollment", EnrollmentSchema);