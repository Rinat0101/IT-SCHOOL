import "./globals.css";
import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import LogoutButton from "@/components/LogoutButton";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen flex flex-col">
        <header className="w-full bg-gray-200 px-6 py-4 flex justify-end shadow">
          {session?.user && <LogoutButton />}
        </header>
        <main className="flex-1 p-6">{children}</main>
      </body>
    </html>
  );
}