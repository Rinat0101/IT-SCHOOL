import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongoose";
import UserProgress from "@/models/UserProgress";
import User from "@/models/User";

export async function PATCH(req: NextRequest) {
  try {
    const { userId, courseId, lessonId, markAsCompleted } = await req.json();

    if (!userId || !courseId || !lessonId) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 });
    }

    await connectDB();

    // ✅ Convert IDs properly
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const courseObjectId = new mongoose.Types.ObjectId(courseId);

    // ✅ Find or create progress
    let progress = await UserProgress.findOne({ userId: userObjectId, courseId: courseObjectId });
    if (!progress) {
      progress = new UserProgress({ userId: userObjectId, courseId: courseObjectId, completedLessons: [] });
    }

    // ✅ Toggle completion
    if (markAsCompleted) {
      if (!progress.completedLessons.includes(lessonId)) {
        progress.completedLessons.push(lessonId);
      }
    } else {
      progress.completedLessons = progress.completedLessons.filter((id: string) => id !== lessonId);
    }

    await progress.save();

    return NextResponse.json({ success: true, completedLessons: progress.completedLessons });
  } catch (err) {
    console.error("Error updating progress:", err);
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }
}