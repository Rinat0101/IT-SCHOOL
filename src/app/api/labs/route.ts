import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import LabSubmission from "@/models/LabSubmission";
import Enrollment from "@/models/CourseEnrollment";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// 🟢 CREATE or UPDATE lab submission
export async function POST(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
    const { enrollmentId, lessonId, repoUrl } = await req.json();
    if (!enrollmentId || !lessonId || !repoUrl) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
  
    try {
      const enrollment = await Enrollment.findById(enrollmentId);
      if (!enrollment) {
        return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
      }
  
      const submission = await LabSubmission.findOneAndUpdate(
        { enrollmentId, lessonId },
        {
          userId: session?.user?.id || enrollment.userId,
          courseId: enrollment.courseId,
          enrollmentId,
          lessonId,
          repoUrl,
          status: "submitted",
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      );
  
      return NextResponse.json({ success: true, submission });
    } catch (err) {
      console.error("Error creating lab submission:", err);
      return NextResponse.json({ error: "Failed to save lab" }, { status: 500 });
    }
  }

// 🟡 PATCH → edit or update repo URL / feedback / grade
export async function PATCH(req: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { enrollmentId, lessonId, repoUrl, feedback, grade } = await req.json();
  if (!enrollmentId || !lessonId)
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  try {
    const update: any = { updatedAt: new Date() };
    if (repoUrl !== undefined) {
      update.repoUrl = repoUrl;
      update.status = repoUrl ? "resubmitted" : "deleted";
    }
    if (feedback !== undefined) update.feedback = feedback;
    if (grade !== undefined) update.grade = grade;

    const submission = await LabSubmission.findOneAndUpdate(
      { enrollmentId, lessonId },
      { $set: update },
      { new: true }
    );

    if (!submission)
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });

    return NextResponse.json({ success: true, submission });
  } catch (err) {
    console.error("Error updating lab submission:", err);
    return NextResponse.json({ error: "Failed to update lab" }, { status: 500 });
  }
}

// 🔴 DELETE → remove submission
export async function DELETE(req: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const enrollmentId = searchParams.get("enrollmentId");
  const lessonId = searchParams.get("lessonId");

  if (!enrollmentId || !lessonId)
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

  try {
    await LabSubmission.findOneAndDelete({ enrollmentId, lessonId });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting lab submission:", err);
    return NextResponse.json({ error: "Failed to delete lab" }, { status: 500 });
  }
}

// 🔵 GET → fetch single or list of labs
export async function GET(req: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const enrollmentId = searchParams.get("enrollmentId");
  const lessonId = searchParams.get("lessonId");
  const courseId = searchParams.get("courseId");

  const query: any = {};
  if (enrollmentId) query.enrollmentId = enrollmentId;
  if (lessonId) query.lessonId = lessonId;
  if (courseId) query.courseId = courseId;
  query.userId = session.user.id;

  try {
    const submissions = await LabSubmission.find(query);
    return NextResponse.json({ submissions });
  } catch (err) {
    console.error("Error fetching labs:", err);
    return NextResponse.json({ error: "Failed to fetch labs" }, { status: 500 });
  }
}