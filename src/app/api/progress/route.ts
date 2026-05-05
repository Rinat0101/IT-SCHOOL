import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongoose";
import UserProgress from "@/models/UserProgress";
import User from "@/models/User";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId, lessonId, markAsCompleted } = await req.json();

    if (!courseId || !lessonId) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json({ error: "Invalid courseId" }, { status: 400 });
    }

    await connectDB();

    const userObjectId = new mongoose.Types.ObjectId(session.user.id);
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
    console.error("[/api/progress] error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        error: "Failed to update progress",
        // surface details in dev so we can debug without trawling server logs
        ...(process.env.NODE_ENV !== "production" && { detail: message }),
      },
      { status: 500 }
    );
  }
}