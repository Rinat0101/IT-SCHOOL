import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";

function getIdFromRequest(req: NextRequest): string | null {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();
  return id || null;
}

// ✅ GET a single user
export async function GET(req: NextRequest) {
  const id = getIdFromRequest(req);
  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "admin" && session.user.id !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = await User.findById(id).select("-password -__v");
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

// ✅ PATCH
export async function PATCH(req: NextRequest) {
  const id = getIdFromRequest(req);
  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "admin" && session.user.id !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const updateData: Record<string, any> = {};

  const allowedFields = [
    "name", "lastName", "email", "password", "role", "access",
    "github", "linkedin", "personalWebsite", "profilePicture",
  ];

  for (const key of allowedFields) {
    if (body[key] !== undefined && body[key] !== "") {
      updateData[key] = body[key];
    }
  }

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

// ✅ DELETE
export async function DELETE(req: NextRequest) {
  const id = getIdFromRequest(req);
  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

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