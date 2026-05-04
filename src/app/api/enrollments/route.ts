// app/api/enrollments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongoose";
import Enrollment from "@/models/CourseEnrollment";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  try {
    const body = await req.json();
    const { userId, courseId, startDate, endDate, status, accessLevel, goals } = body;

    if (!userId || !courseId) {
      return NextResponse.json({ error: "Missing userId or courseId" }, { status: 400 });
    }

    const existing = await Enrollment.findOne({ userId, courseId });
    if (existing) {
      return NextResponse.json(
        { error: "User is already enrolled in this course" },
        { status: 409 }
      );
    }

    const enrollment = await Enrollment.create({
      userId,
      courseId,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(new Date().setMonth(new Date().getMonth() + 3)),
      status: status || "active",
      accessLevel: accessLevel || "limited",
      goals,
    });

    await User.findByIdAndUpdate(userId, {
      $push: { enrollments: enrollment._id },
    });

    const populated = await Enrollment.findById(enrollment._id).populate("courseId", "name");
    return NextResponse.json(populated, { status: 201 });
  } catch (err) {
    console.error("❌ Error creating enrollment:", err);
    return NextResponse.json({ error: "Failed to create enrollment" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const users = await User.find()
    .populate({
      path: "enrollments",
      populate: { path: "courseId", select: "name" },
    })
    .select("-password -__v");

  return NextResponse.json(users);
}