import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";

const isMockMode = process.env.MOCK_DB === "true";

export const authOptions: NextAuthOptions = {
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
          // ────────────────────────────────
          // 🧪 MOCK MODE (no MongoDB)
          // ────────────────────────────────
          if (isMockMode) {
            console.log("🧪 Mock auth active — fetching DatoCMS courses and skipping MongoDB");

            // Fetch all courses from DatoCMS (so the mock user can see everything)
            const res = await fetch("https://graphql.datocms.com/", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.DATOCMS_API_KEY}`,
              },
              body: JSON.stringify({
                query: `
                  query {
                    allCourses {
                      id
                      name
                      slug
                    }
                  }
                `,
              }),
            });

            const data = await res.json();
            const courses = data?.data?.allCourses || [];

            // Create "fake" enrollments
            const enrollments = courses.map((course: any) => ({
              courseId: {
                datoCmsId: course.id,
                name: course.name,
                slug: course.slug,
              },
            }));

            // Return mock user with access to everything
            return {
              id: "mock-user",
              email: "methodologist@procoding.com",
              name: "Methodologist Tester",
              role: "student",
              language: "en",
              enrollments, // ✅ all courses visible
            };
          }

          // ────────────────────────────────
          // 🌐 REAL MODE (MongoDB enabled)
          // ────────────────────────────────
          await connectDB();

          // Find user by email
          const user = await User.findOne({ email: credentials.email })
            .populate({
              path: "enrollments",
              populate: { path: "courseId" },
            });

          if (!user) return null;

          const isValid = await user.comparePassword(credentials.password);
          if (!isValid) return null;

          return {
            id: user._id.toString(),
            email: user.email,
            name: `${user.name} ${user.lastName}`,
            role: user.role,
            enrollments: user.enrollments || [],
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],

  // ────────────────────────────────
  // ⚙️ Callbacks
  // ────────────────────────────────
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.enrollments = (user as any).enrollments || [];
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "student" | "admin";
        session.user.enrollments = token.enrollments || [];
      }

      // Add mock mode indicator
      if (isMockMode) {
        session.mockMode = true;
      }

      return session;
    },
  },

  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };