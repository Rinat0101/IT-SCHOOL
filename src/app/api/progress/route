import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import UserProgress from "@/models/UserProgress";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userEmail = searchParams.get("userEmail");
  const courseId = searchParams.get("courseId");

  if (!userEmail || !courseId) {
    return NextResponse.json(
      { error: "Missing userEmail or courseId" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const progress = await UserProgress.findOne({ userEmail, courseId });

    return NextResponse.json({
      completedLessons: progress?.completedLessons || [],
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch user progress" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { userEmail, courseId, lessonId, markAsCompleted } = await req.json();

  if (!userEmail || !courseId || !lessonId || typeof markAsCompleted !== "boolean") {
    return NextResponse.json(
      { error: "Missing or invalid data" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const update = markAsCompleted
      ? { $addToSet: { completedLessons: lessonId } }
      : { $pull: { completedLessons: lessonId } };

    const progress = await UserProgress.findOneAndUpdate(
      { userEmail, courseId },
      {
        ...update,
        $set: { updatedAt: new Date() },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, completedLessons: progress.completedLessons });
  } catch (error) {
    console.error("Error updating progress:", error);
    return NextResponse.json(
      { error: "Failed to update user progress" },
      { status: 500 }
    );
  }
}