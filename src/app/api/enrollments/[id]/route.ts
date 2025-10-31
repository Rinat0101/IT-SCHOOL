import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Enrollment from "@/models/CourseEnrollment";

type Params = { params: { id: string } };

// ✅ PATCH /api/enrollments/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      await connectDB();
      const { id } = params;
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