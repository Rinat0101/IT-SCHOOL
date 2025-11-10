import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Enrollment from "@/models/CourseEnrollment";

// ✅ PATCH /api/enrollments/[id]
export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = context.params;
    const { accessLevel } = await req.json();

    if (!accessLevel) {
      return NextResponse.json({ error: "Missing accessLevel" }, { status: 400 });
    }

    const enrollment = await Enrollment.findById(id);
    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    enrollment.accessLevel = accessLevel;
    enrollment.accessUpgradedAt = new Date();
    await enrollment.save();

    const updated = await Enrollment.findById(id).populate("courseId", "name");

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("❌ Error updating enrollment:", error);
    return NextResponse.json({ error: "Failed to update enrollment" }, { status: 500 });
  }
}