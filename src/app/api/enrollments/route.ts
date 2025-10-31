// app/api/enrollments/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Enrollment from "@/models/CourseEnrollment";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const body = await req.json();
    const { userId, courseId, startDate, endDate, status, goals } = body;

    if (!userId || !courseId) {
      return NextResponse.json({ error: "Missing userId or courseId" }, { status: 400 });
    }

    const enrollment = await Enrollment.create({
      userId,
      courseId,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(new Date().setMonth(new Date().getMonth() + 3)),
      status: status || "active",
      goals,
    });

    await User.findByIdAndUpdate(userId, {
        $push: { enrollments: enrollment._id },
      });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (err) {
    console.error("❌ Error creating enrollment:", err);
    return NextResponse.json({ error: "Failed to create enrollment" }, { status: 500 });
  }
}

export async function GET() {
  await connectDB();
  const users = await User.find()
    .populate({
      path: "enrollments",
      populate: { path: "courseId", select: "name" },
    })
    .select("-password -__v");

  return NextResponse.json(users);
}