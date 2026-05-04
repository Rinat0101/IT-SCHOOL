// app/layout.tsx (RootLayout)
import "./globals.css";
import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Navbar from "@/app/navbar";
import AuthProvider from "@/components/AuthProvider";
import CodepenEmbed from "@/components/CodepenEmbed";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className="h-full">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){try{
  var t=localStorage.getItem('theme');
  if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}
  if(t==='dark'){document.documentElement.classList.add('dark');}
}catch(_){}})();`,
          }}
        />
      </head>
      <body className="m-0 min-h-screen bg-white dark:bg-[#0b0f17] text-[#212B36] dark:text-gray-100 flex flex-col antialiased transition-colors">
        <AuthProvider session={session}>
          <Navbar />
          <main className="flex-1 p-0 m-0 bg-white dark:bg-[#0b0f17]">{children}</main>
        </AuthProvider>

        <CodepenEmbed />
      </body>
    </html>
  );
}