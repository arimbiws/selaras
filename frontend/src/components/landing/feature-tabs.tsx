"use client";

import Link from "next/link";
import { useState, type KeyboardEvent, type ReactNode } from "react";
import {
  ArrowUpRight,
  ChartNoAxesCombined,
  FlaskConical,
  Landmark,
  LayoutDashboard,
} from "lucide-react";
import {
  BIDANG,
  BIDANG_TOTALS,
  COVERAGE,
  JENIS,
  JENIS_COLORS,
  JENIS_TOTALS,
  TOTAL,
  fmt1,
  pct,
  rupiahMiliar,
  rupiahTriliun,
} from "@/lib/demo-data";

function AppWindow({ url, children }: { url: string; children: ReactNode }) {
  return (
    <div className="app-window">
      <div className="app-bar">
        <span className="app-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="app-url">{url}</span>
        <span className="app-live">Data contoh</span>
      </div>
      {children}
    </div>
  );
}

function DashboardPreview() {
  const max = Math.max(...BIDANG_TOTALS);
  return (
    <AppWindow url="selaras.id/dashboard">
      <div className="app-body">
        <aside className="app-side" aria-hidden="true">
          <b className="app-side-brand">S</b>
          {[0, 1, 2, 3].map((item) => (
            <span key={item} className={item === 0 ? "on" : ""} />
          ))}
        </aside>
        <div className="app-canvas">
          <div className="app-top">
            <div>
              <span>Ringkasan</span>
              <b>Dashboard Anggaran</b>
            </div>
            <span className="app-chip">Kab. Pacitan · 2023</span>
          </div>
          <div className="app-kpis">
            <div>
              <span>Total belanja</span>
              <b>{rupiahTriliun(TOTAL)}</b>
            </div>
            <div>
              <span>Bidang terbesar</span>
              <b>Pendidikan</b>
            </div>
            <div>
              <span>Baris data</span>
              <b>{COVERAGE.barisBelanja.toLocaleString("id-ID")}</b>
            </div>
          </div>
          <div className="app-chart">
            <div className="app-chart-head">
              <span>Belanja menurut bidang</span>
              <b>5 teratas</b>
            </div>
            <div className="app-bars">
              {BIDANG.slice(0, 5).map((name, index) => (
                <div className="app-bar-row" key={name}>
                  <span>{name}</span>
                  <div>
                    <i
                      style={{
                        width: `${Math.max((BIDANG_TOTALS[index] / max) * 100, 10)}%`,
                        background: JENIS_COLORS[index % JENIS_COLORS.length],
                      }}
                    />
                  </div>
                  <b>{rupiahMiliar(BIDANG_TOTALS[index])}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppWindow>
  );
}

function AnggaranPreview() {
  return (
    <AppWindow url="selaras.id/anggaran">
      <div className="app-body">
        <div className="app-canvas app-canvas-full">
          <div className="app-top">
            <div>
              <span>Rincian</span>
              <b>Anggaran per jenis belanja</b>
            </div>
            <span className="app-chip">Unduh CSV</span>
          </div>
          <div className="app-segbar" aria-hidden="true">
            {JENIS.map((name, index) => (
              <span
                key={name}
                style={{
                  flex: JENIS_TOTALS[index],
                  background: JENIS_COLORS[index],
                }}
              />
            ))}
          </div>
          <div className="app-table">
            {JENIS.map((name, index) => (
              <div className="app-table-row" key={name}>
                <i style={{ background: JENIS_COLORS[index] }} aria-hidden="true" />
                <span>{name}</span>
                <b>{rupiahMiliar(JENIS_TOTALS[index])}</b>
                <em>{fmt1(pct(JENIS_TOTALS[index]))}%</em>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppWindow>
  );
}

function AnalisisPreview() {
  const top = BIDANG_TOTALS.slice(0, 4);
  const max = Math.max(...top);
  return (
    <AppWindow url="selaras.id/analisis">
      <div className="app-body">
        <div className="app-canvas app-canvas-full">
          <div className="app-top">
            <div>
              <span>Perbandingan</span>
              <b>Porsi terhadap kabupaten lain</b>
            </div>
            <span className="app-chip">Median nasional</span>
          </div>
          <div className="app-compare">
            {top.map((value, index) => (
              <div className="app-compare-row" key={BIDANG[index]}>
                <span>{BIDANG[index]}</span>
                <div className="app-track">
                  <i
                    style={{
                      width: `${Math.max((value / max) * 100, 12)}%`,
                      background: JENIS_COLORS[index % JENIS_COLORS.length],
                    }}
                  />
                  <em style={{ left: "48%" }} aria-hidden="true" />
                </div>
                <b>{fmt1(pct(value))}%</b>
              </div>
            ))}
          </div>
          <div className="app-note">
            <span className="app-note-dot" aria-hidden="true" />
            Posisi daerah dibandingkan dengan nilai tengah {COVERAGE.kabupaten} kabupaten/kota.
          </div>
        </div>
      </div>
    </AppWindow>
  );
}

function SimulationPreview() {
  let cursor = 0;
  const donut = JENIS.map((name, index) => {
    const start = cursor;
    cursor += pct(JENIS_TOTALS[index]);
    return `${JENIS_COLORS[index]} ${start}% ${cursor}%`;
  }).join(", ");

  return (
    <AppWindow url="selaras.id/simulasi">
      <div className="app-body">
        <div className="app-canvas app-canvas-full">
          <div className="app-top">
            <div>
              <span>Skenario</span>
              <b>Simulasi alokasi anggaran</b>
            </div>
            <span className="app-chip">Reset</span>
          </div>
          <div className="app-sim">
            <div className="app-donut" style={{ background: `conic-gradient(${donut})` }}>
              <span>
                <b>{rupiahTriliun(TOTAL)}</b>
                <small>Total</small>
              </span>
            </div>
            <div className="app-sim-list">
              {JENIS.map((name, index) => (
                <div key={name}>
                  <span>
                    <i style={{ background: JENIS_COLORS[index] }} aria-hidden="true" />
                    {name}
                  </span>
                  <div className="app-slider" aria-hidden="true">
                    <i style={{ width: `${Math.max(pct(JENIS_TOTALS[index]) * 3, 18)}%` }} />
                  </div>
                  <b>{fmt1(pct(JENIS_TOTALS[index]))}%</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppWindow>
  );
}

const tabs = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    color: "#2F6BFF",
    title: "Gambaran anggaran dalam satu layar",
    desc: "Indikator utama, komposisi belanja, dan ketersediaan data antartahun.",
    href: "/dashboard",
    preview: <DashboardPreview />,
  },
  {
    id: "anggaran",
    label: "Anggaran",
    icon: Landmark,
    color: "#12B3A6",
    title: "Rincian belanja yang mudah ditelusuri",
    desc: "Telusuri pos belanja menurut bidang dan jenis, lalu unduh tabelnya.",
    href: "/anggaran",
    preview: <AnggaranPreview />,
  },
  {
    id: "analisis",
    label: "Analisis",
    icon: ChartNoAxesCombined,
    color: "#8B5CF6",
    title: "Perbandingan yang objektif",
    desc: "Bandingkan porsi anggaran daerah dengan nilai tengah kabupaten lain.",
    href: "/analisis",
    preview: <AnalisisPreview />,
  },
  {
    id: "simulasi",
    label: "Simulasi",
    icon: FlaskConical,
    color: "#FFA50A",
    title: "Uji skenario sebelum memutuskan",
    desc: "Susun ulang alokasi dan lihat dampaknya terhadap belanja per penduduk.",
    href: "/simulasi",
    preview: <SimulationPreview />,
  },
] as const;

export function FeatureTabs() {
  const [active, setActive] = useState(0);
  const current = tabs[active];

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();

    let next = active;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      next = (active + 1) % tabs.length;
    } else {
      next = (active - 1 + tabs.length) % tabs.length;
    }

    setActive(next);
    document.getElementById(`feature-tab-${tabs[next].id}`)?.focus();
  };

  return (
    <div className="feat-tabs card">
      <div
        className="feat-tablist"
        role="tablist"
        aria-label="Fitur utama SELARAS"
        aria-orientation="vertical"
        onKeyDown={onKeyDown}
      >
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const selected = index === active;
          return (
            <button
              key={tab.id}
              id={`feature-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`feature-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              className={`feat-tab ${selected ? "is-active" : ""}`}
              onClick={() => setActive(index)}
            >
              <span className="tab-icon" style={{ background: tab.color }}>
                <Icon aria-hidden="true" />
              </span>
              <span className="tab-copy">
                <b>{tab.label}</b>
                <span>{tab.desc}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div
        className="feat-panel"
        id={`feature-panel-${current.id}`}
        role="tabpanel"
        aria-labelledby={`feature-tab-${current.id}`}
      >
        <div className="feat-panel-head">
          <span className="feat-eyebrow">Pratinjau fitur</span>
          <h3>{current.title}</h3>
        </div>
        <div key={current.id} className="feat-preview">
          {current.preview}
        </div>
        <Link className="feat-link" href={current.href}>
          Buka {current.label}
          <ArrowUpRight size={17} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
