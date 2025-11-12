import mongoose, { Types, Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import { IEnrollment } from "./CourseEnrollment";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  lastName: string;
  email: string;
  password: string;
  role: "student" | "admin";
  github?: string;
  linkedin?: string;
  personalWebsite?: string;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;

  // ✅ Changed this
  enrollments?: IEnrollment[];

  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // hashed
    role: { type: String, enum: ["student", "admin"], default: "student" },
    github: String,
    linkedin: String,
    personalWebsite: String,
    profilePicture: String,

    // 🔹 New field for enrollments
    enrollments: [{ type: Schema.Types.ObjectId, ref: "Enrollment" }],
  },
  { timestamps: true }
);

// 🔑 Pre-save middleware to hash password
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔑 Method for comparing passwords
UserSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ⚠️ Avoid model overwrite errors in dev
mongoose.models.User && delete mongoose.models.User;

const User = mongoose.model<IUser>("User", UserSchema);

export default User;