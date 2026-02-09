import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ORBIT — Open Research Breakthrough Intelligence Tool",
  description:
    "AI-powered scientific research assistant that analyzes papers, discovers connections, and generates hypotheses using Google Gemini 3.",
  keywords: ["AI", "research", "science", "Gemini 3", "paper analysis", "knowledge graph"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-dark-950 text-dark-50 antialiased">{children}</body>
    </html>
  );
}
