import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Enrollment from "@/models/CourseEnrollment";

type Params = { params: { id: string } };

// ✅ PATCH /api/enrollments/[id]
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();

    // Only update allowed fields
    const updateData: Record<string, any> = {};
    if (body.accessLevel) updateData.accessLevel = body.accessLevel;
    if (body.status) updateData.status = body.status;

    const updated = await Enrollment.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("courseId", "name");

    if (!updated) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    console.error("❌ Error updating enrollment:", err);
    return NextResponse.json({ error: "Failed to update enrollment" }, { status: 500 });
  }
}