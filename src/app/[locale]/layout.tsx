import { notFound } from "next/navigation";
import NavBar from "@/app/navbar";

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;

  if (!["en", "ru"].includes(locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body>
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  );
}