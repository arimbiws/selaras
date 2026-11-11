import type { CSSProperties } from "react";

function Bar({
  width = "100%",
  height = 12,
  className = "",
  style,
}: {
  width?: string | number;
  height?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      aria-hidden="true"
      className={`skeleton ${className}`.trim()}
      style={{ display: "block", width, height, ...style }}
    />
  );
}

function HeadSkeleton({ filters = 4 }: { filters?: number }) {
  return (
    <section className="page-head">
      <div className="skeleton-stack" style={{ maxWidth: 620, flex: "1 1 420px" }}>
        <Bar width="min(320px, 80%)" height={34} />
        <Bar width="100%" height={14} />
        <Bar width="86%" height={14} />
      </div>
      <div className="skeleton-filter-row" aria-hidden="true">
        {Array.from({ length: filters }).map((_, index) => (
          <div className="skeleton-stack" key={index} style={{ gap: 8 }}>
            <Bar width={72} height={10} />
            <Bar width={index % 2 === 0 ? 190 : 124} height={40} />
          </div>
        ))}
      </div>
    </section>
  );
}

function KpiSkeleton({ count = 4 }: { count?: number }) {
  return (
    <section className="grid-kpi" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <article className="kpi kpi-metric" key={index}>
          <div className="kpi-metric-body">
            <Bar width={46} height={46} className="skeleton-round" />
            <div className="skeleton-stack">
              <Bar width={110} height={11} />
              <Bar width={64} height={30} />
            </div>
          </div>
          <div className="kpi-f">
            <Bar width="72%" height={10} />
          </div>
        </article>
      ))}
    </section>
  );
}

function PanelSkeleton({ rows = 6, height = 320 }: { rows?: number; height?: number }) {
  return (
    <section className="pn" aria-hidden="true">
      <div className="pn-h">
        <div className="skeleton-stack">
          <Bar width={220} height={19} />
          <Bar width={300} height={11} />
        </div>
        <Bar width={118} height={26} className="skeleton-round" />
      </div>
      <div className="pn-b skeleton-stack" style={{ minHeight: height, gap: 18 }}>
        {Array.from({ length: rows }).map((_, index) => (
          <div className="skeleton-row" key={index}>
            <Bar width={index % 3 === 0 ? "42%" : index % 3 === 1 ? "58%" : "34%"} height={13} />
            <Bar width="100%" height={12} className="skeleton-round" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function AnalysisSkeleton() {
  return (
    <main className="page" aria-busy="true" aria-label="Memuat analisis">
      <HeadSkeleton filters={5} />
      <KpiSkeleton />
      <section className="section-split">
        <div style={{ flex: "2 1 600px", minWidth: 0 }}>
          <PanelSkeleton rows={8} height={430} />
        </div>
        <div style={{ flex: "1 1 360px", minWidth: 0 }}>
          <PanelSkeleton rows={4} height={430} />
        </div>
      </section>
      <section className="section-split">
        <div style={{ flex: "1 1 520px", minWidth: 0 }}>
          <PanelSkeleton rows={5} height={300} />
        </div>
        <div style={{ flex: "1 1 420px", minWidth: 0 }}>
          <PanelSkeleton rows={4} height={300} />
        </div>
      </section>
    </main>
  );
}

export function BudgetSkeleton() {
  return (
    <main className="page" aria-busy="true" aria-label="Memuat anggaran">
      <HeadSkeleton filters={6} />
      <PanelSkeleton rows={7} height={440} />
      <PanelSkeleton rows={5} height={300} />
    </main>
  );
}

export function DashboardSkeleton() {
  return (
    <main className="page" aria-busy="true" aria-label="Memuat dashboard">
      <HeadSkeleton filters={2} />
      <KpiSkeleton />
      <section className="section-split">
        <div style={{ flex: "1 1 520px", minWidth: 0 }}>
          <PanelSkeleton rows={5} height={330} />
        </div>
        <div style={{ flex: "1 1 420px", minWidth: 0 }}>
          <PanelSkeleton rows={5} height={330} />
        </div>
      </section>
    </main>
  );
}

export function SimulationSkeleton() {
  return (
    <main className="page" aria-busy="true" aria-label="Memuat simulasi">
      <HeadSkeleton filters={1} />
      <section className="section-split">
        <div style={{ flex: "1 1 420px", minWidth: 0 }}>
          <PanelSkeleton rows={6} height={380} />
        </div>
        <div style={{ flex: "1 1 480px", minWidth: 0 }}>
          <PanelSkeleton rows={6} height={380} />
        </div>
      </section>
    </main>
  );
}

export function SourceSkeleton() {
  return (
    <main className="page" aria-busy="true" aria-label="Memuat sumber data">
      <HeadSkeleton filters={1} />
      <KpiSkeleton count={3} />
      <section className="skeleton-card-grid" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="src skeleton-stack" key={index} style={{ minHeight: 180 }}>
            <Bar width="44%" height={17} />
            <Bar width="100%" height={12} />
            <Bar width="92%" height={12} />
            <Bar width="70%" height={12} />
          </div>
        ))}
      </section>
    </main>
  );
}
