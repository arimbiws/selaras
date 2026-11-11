"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowDown, ArrowUp, Minus, Sparkles } from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { AnalysisMetric, AnalysisSnapshot, ComparisonStatus, Region } from "@backend/types";
import {
  BIDANG_SHORT,
  CHART_COLORS,
  JENIS,
  fmt1,
  rupiahMiliar,
  rupiahTriliun,
  signed,
  slugify,
} from "@/lib/demo-data";

type Comparison = "nas" | "prov";
type View = "fungsi" | "jenis";

type RadarPoint = { subject: string; full: string; value: number; median: number };
type Slice = { name: string; value: number; share: number; color: string };

const FUNGSI_CODES = ["01", "03", "04", "05", "06", "07", "08", "10", "11"];

const statusInfo: Record<ComparisonStatus, { label: string; cls: string }> = {
  high: { label: "Tinggi", cls: "c-hi" },
  mid: { label: "Sebanding", cls: "c-mid" },
  low: { label: "Rendah", cls: "c-lo" },
};

const shortName = (kode: string, fallback: string) => {
  const index = FUNGSI_CODES.indexOf(kode);
  return index >= 0 ? BIDANG_SHORT[index] : fallback;
};

function RadarTip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: RadarPoint }>;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="tip">
      <b>{point.full}</b>
      <span>Daerah terpilih: persentil {Math.round(point.value)}</span>
      <span>Nilai tengah: persentil 50</span>
    </div>
  );
}

function SliceTip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: Slice }>;
}) {
  if (!active || !payload?.length) return null;
  const slice = payload[0].payload;
  return (
    <div className="tip">
      <b>{slice.name}</b>
      <span>{rupiahMiliar(slice.value)}</span>
      <span>{fmt1(slice.share)}% dari total</span>
    </div>
  );
}

const sources = [
  {
    name: "Anggaran belanja per fungsi dan jenis",
    status: "Sebagian tahun",
    ok: true,
    detail:
      "DJPK Kementerian Keuangan. Pagu per fungsi dan jenis dibaca dari Supabase; paket pembaruan 2022–2026 tersedia sebagai CSV.",
    url: "https://djpk.kemenkeu.go.id/?p=5412",
    cta: "Lihat dataset asli",
  },
  {
    name: "Realisasi belanja per fungsi",
    status: "Sebagian",
    ok: false,
    detail:
      "DJPK Kementerian Keuangan. Realisasi yang tersedia dibaca dari view budget_vs_actual; tahun tanpa realisasi tidak diisi nol.",
    url: "https://djpk.kemenkeu.go.id/?p=5412",
    cta: "Lihat dataset asli",
  },
  {
    name: "Jumlah penduduk",
    status: "Belum dimuat",
    ok: false,
    detail: "Badan Pusat Statistik (BPS), publikasi tingkat kabupaten.",
    url: "https://www.bps.go.id",
    cta: "Situs BPS",
  },
  {
    name: "Tingkat kemiskinan",
    status: "Belum dimuat",
    ok: false,
    detail: "Badan Pusat Statistik (BPS), data kemiskinan kabupaten dan kota.",
    url: "https://www.bps.go.id",
    cta: "Situs BPS",
  },
];

export function AnalysisView({
  snapshot: initialSnapshot,
  regions,
}: {
  snapshot: AnalysisSnapshot;
  regions: Region[];
}) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [regionCode, setRegionCode] = useState(initialSnapshot.region.kodeDjpk);
  const [year, setYear] = useState(initialSnapshot.tahun);
  const [comparison, setComparison] = useState<Comparison>("nas");
  const [view, setView] = useState<View>("fungsi");
  const [regionQuery, setRegionQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState(false);
  const cacheRef = useRef(new Map<string, AnalysisSnapshot>());
  const requestRef = useRef(0);

  useEffect(() => {
    setSnapshot(initialSnapshot);
    setRegionCode(initialSnapshot.region.kodeDjpk);
    setYear(initialSnapshot.tahun);
  }, [initialSnapshot]);

  useEffect(() => {
    if (!flash) return;
    const timer = window.setTimeout(() => setFlash(false), 1000);
    return () => window.clearTimeout(timer);
  }, [flash]);

  const navigate = (nextKode: string, nextTahun: number) => {
    setRegionCode(nextKode);
    setYear(nextTahun);

    const key = `${nextKode}:${nextTahun}`;
    const previousKode = snapshot.region.kodeDjpk;
    const previousTahun = snapshot.tahun;
    const cached = cacheRef.current.get(key);
    const url = `/analisis?kode=${encodeURIComponent(nextKode)}&tahun=${nextTahun}`;

    if (cached) {
      requestRef.current += 1;
      setLoading(false);
      setSnapshot(cached);
      setError("");
      setFlash(true);
      window.history.replaceState(null, "", url);
      return;
    }

    const requestId = ++requestRef.current;
    setLoading(true);
    setError("");

    void (async () => {
      try {
        const response = await fetch(
          `/api/analysis?kode=${encodeURIComponent(nextKode)}&tahun=${nextTahun}`,
          { cache: "no-store" },
        );
        if (!response.ok) {
          const payload = (await response.json()) as { error?: string };
          throw new Error(payload.error ?? "Data analisis tidak dapat dimuat.");
        }
        const next = (await response.json()) as AnalysisSnapshot;
        if (requestId !== requestRef.current) return;
        cacheRef.current.set(key, next);
        setSnapshot(next);
        setFlash(true);
        window.history.replaceState(null, "", url);
      } catch (caught) {
        if (requestId !== requestRef.current) return;
        setError(
          caught instanceof Error ? caught.message : "Data analisis tidak dapat dimuat.",
        );
        setRegionCode(previousKode);
        setYear(previousTahun);
      } finally {
        if (requestId === requestRef.current) setLoading(false);
      }
    })();
  };

  const normalizedQuery = regionQuery.trim().toLocaleLowerCase("id-ID");
  const currentRegion =
    regions.find((region) => region.kodeDjpk === regionCode) ?? snapshot.region;
  const filteredRegions = normalizedQuery
    ? regions.filter((region) => region.nama.toLocaleLowerCase("id-ID").includes(normalizedQuery))
    : regions;
  const regionOptions = filteredRegions.some(
    (region) => region.kodeDjpk === regionCode,
  )
    ? filteredRegions
    : [currentRegion, ...filteredRegions];
  const baseYears =
    snapshot.years.length > 0
      ? snapshot.years
      : [
          {
            tahun: snapshot.tahun,
            pagu: snapshot.available,
            realisasi: false,
          },
        ];
  const yearOptions = baseYears.some((item) => item.tahun === year)
    ? baseYears
    : [{ tahun: year, pagu: true, realisasi: false }, ...baseYears];
  const pageClass = `page${loading ? " is-updating" : ""}${flash ? " data-flash" : ""}`;

  const isFungsi = view === "fungsi";
  const metrics = isFungsi ? snapshot.functions : snapshot.jenis;
  const hasProvince =
    snapshot.comparisonCountProvinsi !== null && Boolean(snapshot.provinceName);
  const activeComparison: Comparison =
    comparison === "prov" && hasProvince ? "prov" : "nas";
  const comparisonCount =
    activeComparison === "nas"
      ? snapshot.comparisonCountNasional
      : snapshot.comparisonCountProvinsi ?? 0;
  const regionType =
    snapshot.region.jenisDaerah === "kota"
      ? "kota"
      : snapshot.region.jenisDaerah === "provinsi"
        ? "provinsi"
        : "kabupaten";
  const comparisonLabel =
    activeComparison === "nas"
      ? `${comparisonCount} ${regionType}`
      : `${comparisonCount} ${regionType} di ${snapshot.provinceName ?? "provinsi"}`;

  const baseRows = metrics.map((metric: AnalysisMetric) => {
    const median =
      activeComparison === "nas" ? metric.medianNasional : metric.medianProvinsi ?? 0;
    const rank =
      activeComparison === "nas" ? metric.rankNasional : metric.rankProvinsi ?? 0;
    const percentile =
      activeComparison === "nas"
        ? metric.percentileNasional
        : metric.percentileProvinsi ?? 0;
    const status =
      activeComparison === "nas" ? metric.statusNasional : metric.statusProvinsi ?? "mid";
    return {
      kode: metric.kode,
      name: metric.nama,
      total: metric.totalMiliar,
      share: metric.share,
      median,
      rank,
      percentile,
      status,
    };
  });
  const scale = Math.max(
    1,
    ...baseRows.flatMap((row) => [row.share, row.median]),
  ) * 1.1;
  const rows = baseRows.map((row) => ({
    ...row,
    barWidth: Math.min(100, (row.share / scale) * 100),
    marker: Math.min(99, (row.median / scale) * 100),
  }));

  const highCount = rows.filter((row) => row.status === "high").length;
  const lowCount = rows.filter((row) => row.status === "low").length;
  const midCount = rows.length - highCount - lowCount;

  const gaps = [...rows]
    .map((row) => ({ ...row, delta: row.share - row.median }))
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 3);

  const insights = gaps.map(
    (gap) =>
      `${gap.name}: ${fmt1(gap.share)}% dari total belanja, ${signed(gap.delta)} terhadap nilai tengah (${fmt1(gap.median)}%), peringkat ke-${gap.rank} dari ${comparisonCount}.`,
  );

  const questions = gaps.map((gap, index) => ({
    index: String(index + 1),
    text:
      gap.delta >= 0
        ? `Porsi ${gap.name} sebesar ${fmt1(gap.share)}% berada ${fmt1(Math.abs(gap.delta))} poin di atas nilai tengah. Apa kebijakan atau kebutuhan daerah yang mendasarinya, dan apakah hasilnya terukur?`
        : `Porsi ${gap.name} sebesar ${fmt1(gap.share)}% berada ${fmt1(Math.abs(gap.delta))} poin di bawah nilai tengah. Apakah urusan ini ditangani pihak lain, atau terdapat kebutuhan yang belum terpenuhi?`,
  }));

  const radarData: RadarPoint[] = rows.map((row) => ({
    subject: isFungsi ? shortName(row.kode, row.name) : JENIS[Number(row.kode) - 51] ?? row.name,
    full: row.name,
    value: row.percentile,
    median: 50,
  }));

  const sortedFunctions = [...snapshot.functions].sort((a, b) => b.totalMiliar - a.totalMiliar);
  const top4 = sortedFunctions.slice(0, 4);
  const rest = snapshot.totalMiliar - top4.reduce((sum, item) => sum + item.totalMiliar, 0);
  const composition: Slice[] = top4
    .map((item, index) => ({
      name: item.nama,
      value: item.totalMiliar,
      share: item.share,
      color: CHART_COLORS[index],
    }))
    .concat(
      sortedFunctions.length > 4
        ? [
            {
              name: "Bidang lainnya",
              value: Math.max(0, rest),
              share: snapshot.totalMiliar > 0 ? (Math.max(0, rest) / snapshot.totalMiliar) * 100 : 0,
              color: CHART_COLORS[4],
            },
          ]
        : [],
    );

  const head = (
    <section className="page-head">
      <div style={{ maxWidth: 720 }}>
        <h1>Analisis Kebutuhan</h1>
        <p className="page-sub">
          Porsi anggaran {snapshot.region.nama} tahun {snapshot.tahun} dibandingkan dengan{" "}
          {snapshot.available ? comparisonLabel : "daerah lain"} sebagai dasar untuk menilai apakah
          alokasi sejalan dengan kebutuhan wilayah.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "14px 20px" }}>
        <div className="fld">
          <label className="lb" htmlFor="a-cari-daerah">
            Cari daerah
          </label>
          <input
            className="sel"
            id="a-cari-daerah"
            value={regionQuery}
            onChange={(event) => setRegionQuery(event.target.value)}
            placeholder="Nama kabupaten/kota"
            style={{ minWidth: 200 }}
          />
        </div>

        <div className="fld">
          <label className="lb" htmlFor="a-daerah">
            Daerah
          </label>
          <select
            className="sel"
            id="a-daerah"
            value={regionCode}
            onChange={(event) => navigate(event.target.value, year)}
            style={{ minWidth: 220 }}
          >
            {regionOptions.map((region) => (
              <option value={region.kodeDjpk} key={region.kodeDjpk}>
                {region.nama}
              </option>
            ))}
          </select>
        </div>

        <div className="fld">
          <label className="lb" htmlFor="a-tahun">
            Tahun
          </label>
          <select
            className="sel"
            id="a-tahun"
            value={String(year)}
            onChange={(event) => navigate(regionCode, Number(event.target.value))}
            style={{ minWidth: 110 }}
          >
            {yearOptions.map((item) => (
              <option value={item.tahun} key={item.tahun}>
                {item.tahun}
                {item.pagu ? "" : " · belum tersedia"}
              </option>
            ))}
          </select>
        </div>

        <div className="fld">
          <span className="lb">Pembanding</span>
          <div className="seg" role="group" aria-label="Pembanding">
            <button
              type="button"
              aria-pressed={activeComparison === "nas"}
              onClick={() => setComparison("nas")}
            >
              Seluruh {regionType} ({snapshot.comparisonCountNasional})
            </button>
            <button
              type="button"
              aria-pressed={activeComparison === "prov"}
              disabled={!hasProvince}
              onClick={() => setComparison("prov")}
            >
              {snapshot.provinceName ?? "Provinsi"} ({snapshot.comparisonCountProvinsi ?? 0})
            </button>
          </div>
        </div>

        <div className="fld">
          <span className="lb">Tinjauan menurut</span>
          <div className="seg" role="group" aria-label="Tinjauan">
            <button
              type="button"
              aria-pressed={isFungsi}
              onClick={() => setView("fungsi")}
            >
              Bidang
            </button>
            <button
              type="button"
              aria-pressed={!isFungsi}
              onClick={() => setView("jenis")}
            >
              Jenis belanja
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  if (!snapshot.available) {
    return (
      <main className={pageClass} aria-busy={loading}>
        {head}
        {loading ? (
          <div className="loading-strip" role="status" aria-live="polite">
            <span className="spinner" aria-hidden="true" />
            <span>
              Memuat analisis {currentRegion.nama} tahun {year}…
            </span>
            <span className="skeleton loading-strip-bar" aria-hidden="true" />
          </div>
        ) : null}
        {error ? <span className="chip c-lo">{error}</span> : null}
        <section className="callout">
          <div>
            <b>Data pembanding belum tersedia.</b>
            <span>
              {snapshot.note ??
                "Tahun atau daerah ini belum memiliki data pagu yang dapat dibandingkan."}{" "}
              Pilih tahun lain atau buka halaman sumber data untuk melihat ketersediaan.
            </span>
          </div>
          <Link className="btn btn-p" href="/sumber-data">
            Lihat sumber data
          </Link>
        </section>
        <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink2)" }}>
          Nilai yang tidak tersedia tidak ditampilkan sebagai nol.
        </p>
      </main>
    );
  }

  return (
    <main className={pageClass} aria-busy={loading}>
      {head}

      {loading ? (
        <div className="loading-strip" role="status" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          <span>
            Memuat analisis {currentRegion.nama} tahun {year}…
          </span>
          <span className="skeleton loading-strip-bar" aria-hidden="true" />
        </div>
      ) : null}

      <div className="status-row">
        <span className={`chip ${snapshot.source === "supabase" ? "c-ok" : "c-mid"}`}>
          {snapshot.source === "supabase" ? "Supabase" : "Data contoh"}
        </span>
        {snapshot.note ? <span className="chip c-wait">{snapshot.note}</span> : null}
        {error ? <span className="chip c-lo">{error}</span> : null}
      </div>

      <section
        style={{
          background: "var(--soft)",
          borderRadius: 18,
          padding: "22px 26px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="ico" style={{ background: "var(--brand)" }}>
            <Sparkles aria-hidden="true" />
          </span>
          <b style={{ fontSize: 18 }}>Temuan utama</b>
        </div>
        <ul
          style={{
            margin: 0,
            paddingLeft: 22,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            maxWidth: 1000,
          }}
        >
          {insights.map((text) => (
            <li key={text} style={{ fontSize: 15 }}>
              {text}
            </li>
          ))}
        </ul>
        <span style={{ fontSize: 12.5, color: "var(--ink2)" }}>
          Selisih dihitung dalam poin persentase terhadap nilai tengah pembanding. Porsi yang
          berbeda belum tentu menunjukkan masalah.
        </span>
      </section>

      <section aria-label="Ringkasan status" className="grid-kpi">
        <article className="kpi kpi-metric">
          <div className="kpi-metric-body">
            <span className="ico kpi-metric-ico" style={{ background: "var(--accent)" }}>
              <ArrowUp aria-hidden="true" />
            </span>
            <div className="kpi-metric-copy">
              <span className="kpi-metric-label">Porsi tinggi</span>
              <div className="kpi-metric-value-row">
                <b className="kpi-metric-value">{highCount}</b>
                <span className="kpi-metric-unit">bidang</span>
              </div>
            </div>
          </div>
          <div className="kpi-f">kelompok 25% teratas dari {comparisonCount}</div>
        </article>

        <article className="kpi kpi-metric">
          <div className="kpi-metric-body">
            <span className="ico kpi-metric-ico" style={{ background: "#6b7185" }}>
              <Minus aria-hidden="true" />
            </span>
            <div className="kpi-metric-copy">
              <span className="kpi-metric-label">Porsi sebanding</span>
              <div className="kpi-metric-value-row">
                <b className="kpi-metric-value">{midCount}</b>
                <span className="kpi-metric-unit">bidang</span>
              </div>
            </div>
          </div>
          <div className="kpi-f">kelompok tengah dari {comparisonCount}</div>
        </article>

        <article className="kpi kpi-metric">
          <div className="kpi-metric-body">
            <span className="ico kpi-metric-ico" style={{ background: "#c26a00" }}>
              <ArrowDown aria-hidden="true" />
            </span>
            <div className="kpi-metric-copy">
              <span className="kpi-metric-label">Porsi rendah</span>
              <div className="kpi-metric-value-row">
                <b className="kpi-metric-value">{lowCount}</b>
                <span className="kpi-metric-unit">bidang</span>
              </div>
            </div>
          </div>
          <div className="kpi-f">kelompok 25% terbawah dari {comparisonCount}</div>
        </article>

        <article className="kpi kpi-metric dash">
          <div className="kpi-metric-body">
            <span className="ico kpi-metric-ico" style={{ background: "#8a4a06" }}>
              <AlertCircle aria-hidden="true" />
            </span>
            <div className="kpi-metric-copy">
              <span className="kpi-metric-label">Perlu ditinjau</span>
              <b className="kpi-metric-value is-text">Belum dihitung</b>
            </div>
          </div>
          <div className="kpi-f">Menunggu indikator kebutuhan BPS</div>
        </article>
      </section>

      <section className="section-split">
        <div className="pn" style={{ flex: "2 1 600px", minWidth: 0 }}>
          <div className="pn-h">
            <div>
              <h2 className="pn-t">
                {isFungsi
                  ? "Porsi Setiap Bidang dari Total Belanja"
                  : "Porsi Setiap Jenis Belanja dari Total Belanja"}
              </h2>
              <span className="pn-s">
                Pembanding: nilai tengah {comparisonLabel}. Status memakai kelompok 25% teratas dan
                25% terbawah.
              </span>
            </div>
            <div className="legend">
              <span>
                <i style={{ width: 22, height: 10, borderRadius: 5, background: "var(--brand)" }} />
                {snapshot.region.nama}
              </span>
              <span>
                <i style={{ width: 4, height: 16, borderRadius: 2, background: "var(--ink)" }} />
                Nilai tengah pembanding
              </span>
            </div>
          </div>
          <div className="pn-b" style={{ paddingTop: 6, paddingBottom: 6 }}>
            {rows.map((row) => (
              <div className="cmp" key={row.name}>
                <Link
                  href={`/anggaran/${slugify(row.name)}?kode=${encodeURIComponent(
                    snapshot.region.kodeDjpk,
                  )}&tahun=${snapshot.tahun}`}
                  style={{ fontWeight: 700 }}
                >
                  {row.name}
                </Link>
                <div className="trk u">
                  <i style={{ width: `${row.barWidth}%` }} />
                  <u style={{ left: `calc(${row.marker}% - 2px)` }} />
                </div>
                <div style={{ lineHeight: 1.3 }}>
                  <b className="tabular">{fmt1(row.share)}%</b>
                  <div style={{ fontSize: 12, color: "var(--ink2)" }}>
                    tengah {fmt1(row.median)}%
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 3,
                  }}
                >
                  <span className={`chip ${statusInfo[row.status].cls}`}>
                    {statusInfo[row.status].label}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--ink2)" }}>
                    peringkat {row.rank} dari {comparisonCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pn" style={{ flex: "1 1 360px", minWidth: 0 }}>
          <div className="pn-h">
            <div>
              <h2 className="pn-t">Posisi Relatif</h2>
              <span className="pn-s">Persentil porsi di antara {comparisonLabel}</span>
            </div>
          </div>
          <div
            className="pn-b"
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}
          >
            <div style={{ width: "100%", height: 340 }}>
              <ResponsiveContainer>
                <RadarChart data={radarData} outerRadius="66%">
                  <PolarGrid gridType="polygon" stroke="#e3e5ed" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "#5c7590", fontSize: 10 }}
                  />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Tooltip content={<RadarTip />} />
                  <Radar
                    name="Nilai tengah"
                    dataKey="median"
                    stroke="#8e9fb0"
                    fill="#8e9fb0"
                    fillOpacity={0}
                    strokeDasharray="5 4"
                    animationDuration={900}
                  />
                  <Radar
                    name={snapshot.region.nama}
                    dataKey="value"
                    stroke="#2F6BFF"
                    fill="#2F6BFF"
                    fillOpacity={0.18}
                    strokeWidth={2.5}
                    animationDuration={900}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="legend" style={{ justifyContent: "center" }}>
              <span>
                <i style={{ width: 18, height: 3, borderRadius: 2, background: "var(--brand)" }} />
                {snapshot.region.nama}
              </span>
              <span>
                <i
                  style={{
                    width: 18,
                    height: 0,
                    borderRadius: 0,
                    borderTop: "2px dashed #8e9fb0",
                  }}
                />
                Persentil 50 (nilai tengah)
              </span>
            </div>
            <span style={{ fontSize: 12, color: "var(--ink2)", textAlign: "center" }}>
              Semakin jauh dari pusat, semakin besar porsi dibandingkan daerah lain.
            </span>
          </div>
        </div>
      </section>

      <section className="section-split">
        <div className="pn" style={{ flex: "1 1 520px", minWidth: 0 }}>
          <div className="pn-h">
            <div>
              <h2 className="pn-t">Komposisi Anggaran</h2>
              <span className="pn-s">
                Porsi dan nominal setiap bidang · {snapshot.region.nama} · APBD {snapshot.tahun}
              </span>
            </div>
          </div>
          <div
            className="pn-b"
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "24px 36px",
            }}
          >
            <div
              style={{ position: "relative", width: 200, height: 200, flex: "0 0 200px" }}
              role="img"
              aria-label={`Komposisi anggaran: ${composition
                .map((slice) => `${slice.name} ${fmt1(slice.share)}%`)
                .join(", ")}`}
            >
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={composition}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={92}
                    paddingAngle={2}
                    stroke="#fff"
                    strokeWidth={2}
                    animationDuration={900}
                  >
                    {composition.map((slice) => (
                      <Cell key={slice.name} fill={slice.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<SliceTip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center" aria-hidden="true">
                <div className="donut-center-inner">
                  <span>Total belanja</span>
                  <b>{rupiahTriliun(snapshot.totalMiliar)}</b>
                </div>
              </div>
            </div>

            <div style={{ flex: "1 1 260px", minWidth: 0 }}>
              {composition.map((slice) => (
                <div
                  key={slice.name}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "14px minmax(0,1fr) auto auto",
                    gap: 12,
                    alignItems: "center",
                    padding: "10px 0",
                    borderBottom: "1px solid var(--line)",
                    fontSize: 13.5,
                  }}
                >
                  <span
                    style={{ width: 14, height: 14, borderRadius: 4, background: slice.color }}
                  />
                  <b>{slice.name}</b>
                  <span style={{ color: "var(--ink2)" }}>{rupiahMiliar(slice.value)}</span>
                  <b style={{ minWidth: 52, textAlign: "right" }}>{fmt1(slice.share)}%</b>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pn" style={{ flex: "1 1 420px", minWidth: 0 }}>
          <div className="pn-h">
            <div>
              <h2 className="pn-t">Kebutuhan Wilayah</h2>
              <span className="pn-s">Indikator pendamping dari BPS</span>
            </div>
            <span className="chip c-lo">Belum dimuat</span>
          </div>
          <div className="pn-b" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {[
                ["Jumlah penduduk", "untuk belanja per penduduk"],
                ["Tingkat kemiskinan", "untuk bidang perlindungan sosial"],
                ["Jumlah fasilitas", "sekolah dan fasilitas kesehatan"],
                ["Luas wilayah", "untuk belanja per kilometer persegi"],
              ].map(([label, note], index, all) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom: index === all.length - 1 ? "0" : "1px solid var(--line)",
                  }}
                >
                  <b>{label}</b>
                  <span style={{ color: "var(--ink2)", fontSize: 13.5 }}>{note}</span>
                </div>
              ))}
            </div>
            <div
              style={{
                background: "var(--sub)",
                borderRadius: 12,
                padding: "14px 16px",
                fontSize: 13.5,
                lineHeight: 1.55,
              }}
            >
              <b>Rancangan aturan status &quot;Perlu Ditinjau&quot;.</b> Status ditetapkan apabila
              porsi anggaran suatu bidang berada pada kelompok rendah dan indikator kebutuhan terkait
              berada pada kelompok tinggi. Aturan ini baru diterapkan setelah data BPS dimuat.
              Status bersifat indikatif, bukan penilaian akhir.
            </div>
          </div>
        </div>
      </section>

      <section className="pn">
        <div className="pn-h">
          <div>
            <h2 className="pn-t">Bahan Pertanyaan Tinjauan</h2>
            <span className="pn-s">
              Disusun dari selisih terbesar pada analisis di atas. Dapat diajukan kepada pemerintah
              daerah melalui forum perencanaan atau layanan informasi publik.
            </span>
          </div>
        </div>
        <div className="pn-b" style={{ display: "flex", flexDirection: "column" }}>
          {questions.map((question) => (
            <div
              key={question.index}
              style={{
                display: "grid",
                gridTemplateColumns: "36px minmax(0,1fr)",
                gap: 14,
                alignItems: "start",
                padding: "14px 0",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "var(--soft)",
                  color: "var(--brandink)",
                  fontWeight: 800,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {question.index}
              </span>
              <span style={{ fontSize: 15, lineHeight: 1.55 }}>{question.text}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Sumber Data</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 14,
          }}
        >
          {sources.map((source) => (
            <div className="src" key={source.name}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <b>{source.name}</b>
                <span className={`chip ${source.ok ? "c-ok" : "c-lo"}`}>{source.status}</span>
              </div>
              <span>{source.detail}</span>
              <a href={source.url} target="_blank" rel="noreferrer">
                {source.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="callout">
        <div>
          <b>Ingin menguji pembagian anggaran yang berbeda?</b>
          <span>
            Simulasi alokasi memungkinkan Anda menyusun skenario sendiri dan melihat hasilnya dalam
            rupiah per penduduk.
          </span>
        </div>
        <Link className="btn btn-p" href="/simulasi">
          Buka simulasi alokasi
        </Link>
      </section>

      <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink2)" }}>
        Nilai tengah dan peringkat dihitung dari {comparisonLabel}. Status ditentukan dari
        peringkat: 25% teratas tinggi, 25% terbawah rendah, sebanding di antaranya.{" "}
        {rupiahTriliun(snapshot.totalMiliar)} total belanja {snapshot.region.nama} tahun{" "}
        {snapshot.tahun}.
      </p>
    </main>
  );
}
