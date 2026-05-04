import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Course from "@/models/Course";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// ✅ Create course
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  try {
    const body = await req.json();
    const { datoCmsId, slug, name, enabled, language } = body;

    if (!datoCmsId || !slug || !name) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const course = await Course.create({
      datoCmsId,
      slug,
      name,
      enabled: enabled ?? true,
      language,
    });

    return NextResponse.json(course, { status: 201 });
  } catch (err) {
    console.error("❌ Error creating course:", err);
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}

// ✅ Get all courses
export async function GET() {
  await connectDB();
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    return NextResponse.json(courses);
  } catch (err) {
    console.error("❌ Error fetching courses:", err);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}