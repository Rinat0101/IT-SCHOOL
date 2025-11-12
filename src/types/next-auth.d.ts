import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: "student" | "admin";
      enrollments: IEnrollment[];
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: "student" | "admin";
    enrollments: IEnrollment[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "student" | "admin";
    enrollments: IEnrollment[];
  }
}