// app/api/enrollments/[enrollmentId]/labs/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Enrollment from "@/models/CourseEnrollment";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
  req: NextRequest,
  { params }: { params: { enrollmentId: string } }
) {
  await connectDB();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { lessonId, repoLink } = await req.json();

  if (!lessonId || !repoLink) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const enrollment = await Enrollment.findById(params.enrollmentId);

  if (!enrollment) {
    return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
  }

  // ✅ Either update or push new lab submission
  const existing = enrollment.labs?.find((lab) => lab.lessonId.toString() === lessonId);
  if (existing) {
    existing.repoLink = repoLink;
    existing.submittedAt = new Date();
  } else {
    enrollment.labs?.push({ lessonId, repoLink, submittedAt: new Date() });
  }

  await enrollment.save();

  return NextResponse.json({ success: true, labs: enrollment.labs });
}