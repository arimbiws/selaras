"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

const items = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Anggaran", href: "/anggaran" },
  { label: "Analisis", href: "/analisis" },
  { label: "Simulasi", href: "/simulasi" },
  { label: "Sumber Data", href: "/sumber-data" },
];

export function WorkspaceNav() {
  const pathname = usePathname();

  return (
    <div className="ws-nav">
      <nav className="ws-nav-inner" aria-label="Navigasi utama">
        <Link href="/" className="ws-brand" aria-label="SELARAS, kembali ke beranda">
          <Image
            src="/logo.png"
            alt="SELARAS"
            width={120}
            height={32}
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>

        <div className="ws-menu">
          {items.map(({ label, href }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link key={href} href={href} className={`ws-link ${isActive ? "active" : ""}`}>
                {label}
              </Link>
            );
          })}
        </div>

        <label className="ws-search">
          <Search size={16} aria-hidden="true" />
          <span className="sr">Cari bidang atau istilah</span>
          <input type="search" placeholder="Cari bidang atau istilah" />
        </label>
      </nav>
    </div>
  );
}
