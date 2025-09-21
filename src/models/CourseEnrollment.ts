import mongoose, { Schema, Document } from "mongoose";

export interface IEnrollment extends Document {
  userId: mongoose.Types.ObjectId;   // reference to User
  courseId: mongoose.Types.ObjectId; // reference to Course
  startDate: Date;
  endDate: Date;
  status: "active" | "completed" | "cancelled";
  goals?: {
    choices: string[];   // multiple selected goals
    location?: string;   // e.g. remote, onsite, hybrid
    deadline?: Date;
  };
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["active", "completed", "cancelled"], default: "active" },
    goals: {
      choices: [String],
      location: String,
      deadline: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Enrollment ||
  mongoose.model<IEnrollment>("Enrollment", EnrollmentSchema);