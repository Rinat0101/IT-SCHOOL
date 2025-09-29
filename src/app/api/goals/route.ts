import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongoose";
import Goal from "@/models/Goal";

export async function GET() {
  await connectDB();
  const session = await getServerSession(authOptions);

  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const goals = await Goal.find({ userId: session.user.id });
  return NextResponse.json(goals);
}

export async function POST(req: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { goalType, location, deadline } = await req.json();

  const goal = await Goal.create({
    userId: session.user.id,
    goalType,
    location,
    deadline,
  });

  return NextResponse.json(goal, { status: 201 });
}