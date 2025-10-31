import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// ✅ GET a single user
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // 🟣 await params for Next.js 15
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Allow admin OR same user
  if (
    session.user.role !== "admin" &&
    session.user.id.toString() !== id.toString()
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = await User.findById(id).select("-password -__v");
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

// ✅ PATCH (update user)
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only admin or self
  if (
    session.user.role !== "admin" &&
    session.user.id.toString() !== id.toString()
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const updateData: Record<string, any> = {};

  // Fields allowed to update
  const allowedFields = [
    "name",
    "lastName",
    "email",
    "password",
    "role",
    "access",
    "github",
    "linkedin",
    "personalWebsite",
    "profilePicture",
  ];

  for (const key of allowedFields) {
    if (body[key] !== undefined && body[key] !== "") {
      updateData[key] = body[key];
    }
  }

  // Hash password if changed
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  const updatedUser = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).select("-password -__v");

  if (!updatedUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(updatedUser);
}

// ✅ DELETE user (admin only)
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // 🟣 await params for Next.js 15
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const deletedUser = await User.findByIdAndDelete(id);
  if (!deletedUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}