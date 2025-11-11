import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongoose";
import Goal from "@/models/Goals";

export async function PATCH(
  req: NextRequest,
  { params }: any
) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const updatedGoal = await Goal.findOneAndUpdate(
    { _id: params.id, userId: session.user.id },
    body,
    { new: true }
  );

  if (!updatedGoal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updatedGoal);
}

export async function DELETE(
  req: NextRequest,
  { params }: any
) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await Goal.findOneAndDelete({ _id: params.id, userId: session.user.id });
  return NextResponse.json({ success: true });
}