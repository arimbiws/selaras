import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SELARAS - Transparansi Anggaran Daerah Indonesia",
  description: "Eksplorasi dan analisis anggaran pemerintah daerah di seluruh Indonesia: bidang, jenis belanja, dan perbandingan antarkabupaten.",
  applicationName: "SELARAS",
  icons: { icon: "/icon.png", apple: "/icon.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
