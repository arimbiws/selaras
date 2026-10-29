import type { Metadata } from "next";
import { Cormorant_Upright, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const headingFont = Cormorant_Upright({
  variable: "--font-cormorant-upright",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const bodyFont = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SELARAS — Transparansi Anggaran Publik",
  description: "Jelajahi data anggaran publik, indikator layanan, dan sumber bukti.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${headingFont.variable} ${bodyFont.variable} antialiased`}>{children}</body>
    </html>
  );
}
