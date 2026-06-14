import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "GrowthPilot AI",
  description: "AI Growth Operating System for consumer brands",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg-base text-text-primary min-h-screen flex">
        <Sidebar />
        <main className="flex-1 ml-56 min-h-screen overflow-x-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
