"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartNoAxesCombined,
  Database,
  FlaskConical,
  Landmark,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const items = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Anggaran", href: "/anggaran", icon: Landmark },
  { label: "Analisis", href: "/analisis", icon: ChartNoAxesCombined },
  { label: "Simulasi", href: "/simulasi", icon: FlaskConical },
  { label: "Sumber Data", href: "/sumber-data", icon: Database },
];

const STORAGE_KEY = "selaras-sidebar-collapsed";

export function AppSidebar({ active }: { active?: string }) {
  const pathname = usePathname();
  const current = active ?? pathname;
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  function toggle() {
    setCollapsed((value) => {
      const next = !value;
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <aside className={`side${collapsed ? " collapsed" : ""}`}>
      <div className="side-top">
        <Link className="logo" href="/" aria-label="SELARAS, kembali ke beranda">
          <Image
            src="/logo.png"
            alt=""
            width={150}
            height={40}
            className="h-9 w-auto object-contain"
            priority
          />
          <span className="brand-word">SELARAS</span>
        </Link>
        <button
          type="button"
          className="side-toggle"
          onClick={toggle}
          aria-label={collapsed ? "Lebarkan menu" : "Sematkan menu"}
          aria-expanded={!collapsed}
          title={collapsed ? "Lebarkan menu" : "Sematkan menu"}
        >
          {collapsed ? (
            <PanelLeftOpen size={17} aria-hidden="true" />
          ) : (
            <PanelLeftClose size={17} aria-hidden="true" />
          )}
        </button>
      </div>

      <div className="side-rule" aria-hidden="true" />

      <nav className="nav" aria-label="Menu utama">
        {items.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            title={collapsed ? label : undefined}
            aria-current={current === href ? "page" : undefined}
          >
            <Icon className="ic" strokeWidth={1.8} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className="note">
        <b>Cakupan data</b>
        <span>
          SELARAS dirancang untuk 514 kabupaten/kota di 38 provinsi. Tampilan contoh memakai
          anggaran Kabupaten Pacitan.
        </span>
        <Link className="btn btn-p btn-sm" href="/sumber-data">
          Lihat sumber data
        </Link>
      </div>
    </aside>
  );
}
