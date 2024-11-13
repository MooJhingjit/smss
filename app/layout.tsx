import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SMSS",
  description: "SMSS PO Application",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  console.log("RootLayout", session)

  return (
    <html lang="en">
      <body className={cn(inter.className, "")}>

        <SessionProvider session={session}>
          {children}

        </SessionProvider>

      </body>
    </html>
  );
}
