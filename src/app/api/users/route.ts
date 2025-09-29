// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const {
      name,
      lastName,
      email,
      password,
      role,
      github,
      linkedin,
      personalWebsite,
      profilePicture,
    } = await req.json();

    if (!name || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields: name, lastName, email, password" },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    // ✅ use pre-save hook to hash password
    const user = new User({
      name,
      lastName,
      email,
      password,
      role: role || "student",
      github,
      linkedin,
      personalWebsite,
      profilePicture,
    });

    await user.save();

    const safeUser = {
      _id: user._id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      github: user.github,
      linkedin: user.linkedin,
      personalWebsite: user.personalWebsite,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json({ success: true, user: safeUser }, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role === "admin") {
      // Admin: return all users
      const users = await User.find().select("-password -__v");
      return NextResponse.json(users);
    } else {
      // Student: return only themselves
      const user = await User.findOne({ email: session.user.email }).select("-password -__v");
      return NextResponse.json(user);
    }
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}