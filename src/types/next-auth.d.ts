// src/types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: "student" | "admin";
      enrollments: any[];
    };
  }

  interface User {
    id: string;
    email: string;
    role: "student" | "admin";
    enrollments: any[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "student" | "admin";
  }
}