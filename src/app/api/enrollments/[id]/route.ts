import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongoose";
import Enrollment from "@/models/CourseEnrollment";
import User from "@/models/User";

// PATCH route for updating enrollment access level
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = params;

  try {
    await connectDB();

    const body = await request.json();
    const { accessLevel } = body;

    if (accessLevel !== "limited" && accessLevel !== "full") {
      return NextResponse.json(
        { error: "Invalid accessLevel" },
        { status: 400 }
      );
    }

    const updated = await Enrollment.findByIdAndUpdate(
      id,
      { accessLevel, accessUpgradedAt: new Date() },
      { new: true }
    ).populate("courseId", "name");

    if (!updated) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("❌ Error updating enrollment:", error);
    return NextResponse.json(
      { error: "Failed to update enrollment" },
      { status: 500 }
    );
  }
}

// DELETE route — admin-only; also detaches the ref from User.enrollments
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = params;

  try {
    await connectDB();

    const enrollment = await Enrollment.findByIdAndDelete(id);
    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    await User.findByIdAndUpdate(enrollment.userId, {
      $pull: { enrollments: enrollment._id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Error deleting enrollment:", error);
    return NextResponse.json(
      { error: "Failed to delete enrollment" },
      { status: 500 }
    );
  }
}