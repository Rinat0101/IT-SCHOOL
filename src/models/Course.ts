import mongoose, { Schema, Document } from "mongoose";

export interface ICourse extends Document {
  datoCmsId: string;   
  slug: string;    
  name: string;
  enabled: boolean;
  language?: string;
}

const CourseSchema = new Schema<ICourse>(
  {
    datoCmsId: { type: String, required: true },
    slug: { type: String, required: true },
    name: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    language: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Course ||
  mongoose.model<ICourse>("Course", CourseSchema);