import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";
import "@/models/CourseEnrollment";
import type { IUser } from "@/models/User";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", required: true },
        password: { label: "Password", type: "password", required: true },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await connectDB();

        const user = await User.findOne({ email: credentials.email }).populate({
          path: "enrollments",
          populate: { path: "courseId" },
        }) as IUser | null;

        if (!user) return null;

        const isValid = await user.comparePassword(credentials.password);
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: `${user.name} ${user.lastName}`.trim(),
          role: user.role,
          enrollments: Array.isArray(user.enrollments) ? user.enrollments : [],
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.enrollments = (user as any).enrollments ?? [];
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "student" | "admin";
        session.user.enrollments = token.enrollments ?? [];
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};