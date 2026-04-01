import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Providers } from "@/components/Provider"; // note correct path
import { Toaster } from "sonner";
import { Suspense } from "react"; // 1. Add this import
import Navbar from "@/components/navbar";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "EDUMO — Student Portal",
  description: "Your personal student dashboard for homework, grades, and schedules.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased flex flex-col min-h-screen bg-background`}>
        <Providers>
          {/* 2. Wrap Navbar in Suspense */}
          <Suspense fallback={<NavbarSkeleton />}>
            <Navbar />
          </Suspense>
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </Providers>
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}

// 3. Optional: A simple loading state so the layout doesn't "jump"
function NavbarSkeleton() {
  return <div className="w-full h-16 border-b bg-background" />;
}