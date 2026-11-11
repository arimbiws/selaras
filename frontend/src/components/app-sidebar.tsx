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
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
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
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function toggle() {
    setCollapsed((value) => {
      const next = !value;
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <aside
      className={`side${collapsed ? " collapsed" : ""}${mobileOpen ? " mobile-open" : ""}`}
    >
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
        <div className="side-actions">
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
          <button
            type="button"
            className="side-mobile-toggle"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={mobileOpen}
            aria-controls="selaras-mobile-nav"
          >
            {mobileOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div className="side-rule" aria-hidden="true" />

      <nav className="nav" id="selaras-mobile-nav" aria-label="Menu utama">
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
