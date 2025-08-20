// app/layout.tsx (RootLayout)
import "./globals.css";
import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Navbar from "@/app/navbar";
import AuthProvider from "@/components/AuthProvider";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className="h-full">
      <body className="m-0 min-h-screen bg-white text-[#212B36] flex flex-col antialiased">
        <AuthProvider session={session}>
          <Navbar />
          <main className="flex-1 p-0 m-0 bg-white">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}