import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";
import "@/models/CourseEnrollment";
import type { IUser } from "@/models/User";

// ✅ ADD THIS EXPORT
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", required: true },
        password: { label: "Password", type: "password", required: true },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
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
        } catch (error) {
          console.error("❌ Authorization error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user && typeof user === "object") {
        const u = user as {
          id: string;
          role: "student" | "admin";
          enrollments?: any[];
        };

        token.id = u.id;
        token.role = u.role;
        token.enrollments = Array.isArray(u.enrollments) ? u.enrollments : [];
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "student" | "admin";
        session.user.enrollments = Array.isArray(token.enrollments)
          ? token.enrollments
          : [];
      }
      return session;
    },
  },

  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};

// ✅ CREATE THE HANDLER USING authOptions
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };