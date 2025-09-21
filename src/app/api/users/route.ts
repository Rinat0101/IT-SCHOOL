import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";

export async function POST(req: NextRequest) {
    try {
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
      console.log("📥 Incoming payload:", { name, lastName, email, password });
  
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
  
      // ✅ Use pre-save hook by calling `.save()`
      const user = new User({
        name,
        lastName,
        email,
        password, // plain text, will be hashed by hook
        role: role || "student",
        github,
        linkedin,
        personalWebsite,
        profilePicture,
      });
  
      await user.save();
  
      // ✅ Exclude password in response
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
      console.log("📦 Saved user:", user);
      return NextResponse.json({ success: true, user: safeUser }, { status: 201 });
    } catch (error) {
      console.error("❌ Error creating user:", error);
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }
  }

export async function GET() {
  try {
    await connectDB();

    // ✅ Exclude password in query itself
    const users = await User.find().select("-__v -password");

    return NextResponse.json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}