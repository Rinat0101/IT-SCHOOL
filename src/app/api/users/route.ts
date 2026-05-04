// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongoose";
import User, { IUser } from "@/models/User";
import bcrypt from "bcryptjs";
import type { HydratedDocument } from "mongoose";

// =======================
// 🚀 POST — Create User
// =======================
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  try {
    const { name, lastName, email, password, role, language } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Check for duplicates
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user — strongly typed
    const created = await User.create({
      name,
      lastName: lastName || "",
      email,
      password: hashedPassword,
      role: role || "student",
      language: language || "en",
    });

    // ✅ Fix: cast _id to ObjectId (or string) explicitly
    const userResponse = {
      id: created._id.toString(),
      name: created.name,
      email: created.email,
      role: created.role,
    };

    return NextResponse.json({ success: true, user: userResponse }, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// =======================
// 🚀 GET — Admin: Fetch users
// =======================
export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await User.find()
      .populate({
        path: "enrollments",
        populate: { path: "courseId", model: "Course", select: "name" },
      })
      .select("-password -__v");

    return NextResponse.json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}