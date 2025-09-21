// app/api/users/[email]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";

export async function GET(
  req: NextRequest,
  { params }: { params: { email: string } }
) {
  await connectDB();
  const user = await User.findOne({ email: params.email }).select("-password -__v");
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    await connectDB();
    const body = await req.json();

    const updatedUser = await User.findOneAndUpdate(
      { email: params.email },
      body,
      { new: true, runValidators: true }
    ).select("-password -__v");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("❌ Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}