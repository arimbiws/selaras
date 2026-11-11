"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, ChartNoAxesCombined, Database, FlaskConical, Landmark } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AnalysisSnapshot, BudgetBundle, NationalPoint as NationalDataPoint } from "@backend/types";
import { BIDANG_SHORT, CHART_COLORS, COVERAGE, JENIS, JENIS_COLORS, fmt1, rupiahMiliar, slugify } from "@/lib/demo-data";

type BidangPoint = {
  kode: string;
  short: string;
  full: string;
  total: number;
  porsi: number;
};

type NationalSeriesPoint = {
  year: string;
  pagu: number | null;
  realisasi: number | null;
  partial: boolean;
};

const FUNGSI_CODES = ["01", "03", "04", "05", "06", "07", "08", "10", "11"];

const shortName = (kode: string, fallback: string) => {
  const index = FUNGSI_CODES.indexOf(kode);
  return index >= 0 ? BIDANG_SHORT[index] : fallback;
};

function NationalTip({ active, payload }: { active?: boolean; payload?: Array<{ payload: NationalSeriesPoint }> }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="tip">
      <b>APBD {point.year}</b>
      {point.pagu !== null ? <span>Pagu: Rp{fmt1(point.pagu)} triliun</span> : <span>Pagu: belum tersedia</span>}
      {point.realisasi !== null ? (
        <span>
          Realisasi: Rp{fmt1(point.realisasi)} triliun{point.partial ? " (parsial)" : ""}
        </span>
      ) : (
        <span>Realisasi: belum tersedia</span>
      )}
    </div>
  );
}

function BidangTip({ active, payload }: { active?: boolean; payload?: Array<{ payload: BidangPoint }> }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="tip">
      <b>{point.full}</b>
      <span>{rupiahMiliar(point.total)}</span>
      <span>{fmt1(point.porsi)}% dari total belanja</span>
    </div>
  );
}

const quickActions = [
  {
    href: "/anggaran",
    icon: Landmark,
    label: "Telusuri anggaran",
    copy: "Lihat rincian setiap bidang dan jenis belanja.",
    tone: "blue",
  },
  {
    href: "/analisis",
    icon: ChartNoAxesCombined,
    label: "Bandingkan posisi",
    copy: "Tempatkan porsi belanja di antara daerah sejenis.",
    tone: "teal",
  },
  {
    href: "/simulasi",
    icon: FlaskConical,
    label: "Coba skenario",
    copy: "Ubah porsi alokasi dan lihat dampaknya.",
    tone: "violet",
  },
  {
    href: "/sumber-data",
    icon: Database,
    label: "Periksa sumber",
    copy: "Cek asal, cakupan, dan tahun data yang tersedia.",
    tone: "amber",
  },
] as const;

function NationalPanel({ national, nationalRange, paguYears, realisasiYears }: { national: NationalSeriesPoint[]; nationalRange: string; paguYears: number[]; realisasiYears: number[] }) {
  const [nationalChart, setNationalChart] = useState<"bar" | "line" | "area">("bar");
  const formatYears = (years: number[]) => (years.length ? years.join(", ") : "belum tersedia");

  return (
    <section className="pn national-panel">
      <div className="pn-h">
        <div>
          <h2 className="pn-t">Belanja Nasional {nationalRange}</h2>
          <span className="pn-s">
            Pagu tersedia untuk {formatYears(paguYears)}. Realisasi tersedia untuk {formatYears(realisasiYears)}. Tahun tanpa data tidak dihitung sebagai nol.
          </span>
        </div>
        <div className="seg" role="group" aria-label="Jenis grafik nasional">
          <button type="button" aria-pressed={nationalChart === "bar"} onClick={() => setNationalChart("bar")}>
            Batang
          </button>
          <button type="button" aria-pressed={nationalChart === "line"} onClick={() => setNationalChart("line")}>
            Garis
          </button>
          <button type="button" aria-pressed={nationalChart === "area"} onClick={() => setNationalChart("area")}>
            Area
          </button>
        </div>
      </div>
      <div className="pn-b">
        <div style={{ width: "100%", height: 250 }}>
          <ResponsiveContainer>
            {nationalChart === "bar" ? (
              <BarChart data={national} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#eaf1f8" />
                <XAxis dataKey="year" tick={{ fill: "#5c7590", fontSize: 11 }} axisLine={false} tickLine={false} tickMargin={8} />
                <YAxis tick={{ fill: "#7c93a9", fontSize: 11 }} axisLine={false} tickLine={false} unit=" T" width={52} />
                <Tooltip cursor={{ fill: "rgba(47,107,255,0.08)" }} content={<NationalTip />} />
                <Bar dataKey="pagu" name="Pagu" fill="#2F6BFF" radius={[6, 6, 0, 0]} maxBarSize={28} animationDuration={900} />
                <Bar dataKey="realisasi" name="Realisasi" fill="#12B3A6" radius={[6, 6, 0, 0]} maxBarSize={28} animationDuration={900} />
              </BarChart>
            ) : nationalChart === "line" ? (
              <LineChart data={national} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#eaf1f8" />
                <XAxis dataKey="year" tick={{ fill: "#5c7590", fontSize: 11 }} axisLine={false} tickLine={false} tickMargin={8} />
                <YAxis tick={{ fill: "#7c93a9", fontSize: 11 }} axisLine={false} tickLine={false} unit=" T" width={52} />
                <Tooltip content={<NationalTip />} />
                <Line type="monotone" dataKey="pagu" name="Pagu" stroke="#2F6BFF" strokeWidth={2.5} dot={{ r: 3 }} connectNulls={false} animationDuration={900} />
                <Line type="monotone" dataKey="realisasi" name="Realisasi" stroke="#12B3A6" strokeWidth={2.5} dot={{ r: 3 }} connectNulls={false} animationDuration={900} />
              </LineChart>
            ) : (
              <AreaChart data={national} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashPagu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2F6BFF" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#2F6BFF" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="dashRealisasi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#12B3A6" stopOpacity={0.24} />
                    <stop offset="100%" stopColor="#12B3A6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#eaf1f8" />
                <XAxis dataKey="year" tick={{ fill: "#5c7590", fontSize: 11 }} axisLine={false} tickLine={false} tickMargin={8} />
                <YAxis tick={{ fill: "#7c93a9", fontSize: 11 }} axisLine={false} tickLine={false} unit=" T" width={52} />
                <Tooltip content={<NationalTip />} />
                <Area type="monotone" dataKey="pagu" name="Pagu" stroke="#2F6BFF" strokeWidth={2.5} fill="url(#dashPagu)" connectNulls={false} animationDuration={900} />
                <Area type="monotone" dataKey="realisasi" name="Realisasi" stroke="#12B3A6" strokeWidth={2.5} fill="url(#dashRealisasi)" connectNulls={false} animationDuration={900} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
        <div className="legend" style={{ marginTop: 10 }}>
          <span>
            <i style={{ background: "#2F6BFF" }} /> Pagu APBD
          </span>
          <span>
            <i style={{ background: "#12B3A6" }} /> Realisasi
          </span>
          <span>
            <i style={{ border: "1.5px dashed #b9c9d8", background: "transparent" }} />
            Realisasi parsial atau belum tersedia tidak digambarkan sebagai nol
          </span>
        </div>
      </div>
    </section>
  );
}

export function DashboardData({ bundle, national: nationalPoints, analysis }: { bundle: BudgetBundle; national: NationalDataPoint[]; analysis: AnalysisSnapshot }) {
  const frame = bundle.pagu;

  if (!frame?.available) {
    return (
      <main className="page">
        <section className="page-head">
          <div>
            <h1>Dashboard Anggaran</h1>
            <p className="page-sub">
              Data {frame?.region.nama ?? "daerah"} tahun {frame?.tahun ?? bundle.tahun} belum tersedia. Pilih sumber data untuk melihat status pemuatan.
            </p>
          </div>
          <div className="page-actions">
            <Link className="btn btn-p" href="/sumber-data">
              Buka sumber data
            </Link>
          </div>
        </section>
        <section className="callout">
          <div>
            <b>Data anggaran belum dapat dimuat.</b>
            <span>Periksa koneksi basis data dan ketersediaan berkas sumber. Tahun tanpa data tidak ditampilkan sebagai nol.</span>
          </div>
        </section>
      </main>
    );
  }

  const comparisonCount = analysis.comparisonCountNasional || COVERAGE.kabupaten;
  const showBenchmark = analysis.available && comparisonCount > 0;
  const analysisFunctions = new Map(analysis.functions.map((item) => [item.kode, item]));
  const analysisJenis = new Map(analysis.jenis.map((item) => [item.kode, item]));
  const statusChip = (status: "high" | "mid" | "low" | null | undefined) => (status === "high" ? { label: "Tinggi", cls: "c-hi" } : status === "low" ? { label: "Rendah", cls: "c-lo" } : { label: "Sebanding", cls: "c-mid" });
  const top = frame.functions[0] ?? {
    kode: "",
    nama: "Belum tersedia",
    totalMiliar: 0,
    share: 0,
    values: [],
  };
  const chart: BidangPoint[] = frame.functions.map((item) => ({
    kode: item.kode,
    short: shortName(item.kode, item.nama),
    full: item.nama,
    total: item.totalMiliar,
    porsi: item.share,
  }));

  const top5 = frame.functions.slice(0, 5);

  const national: NationalSeriesPoint[] = nationalPoints.map((point) => ({
    year: String(point.tahun),
    pagu: point.pagu,
    realisasi: point.realisasi,
    partial: point.partial,
  }));

  const paguYears = nationalPoints.filter((point) => point.pagu !== null).map((point) => point.tahun);
  const realisasiYears = nationalPoints.filter((point) => point.realisasi !== null).map((point) => point.tahun);
  const nationalRange = national.length ? `${national[0].year}-${national[national.length - 1].year}` : "yang tersedia";

  const jenis = frame.jenis.map((item, index) => {
    const metric = analysisJenis.get(item.kode);
    return {
      name: JENIS[index] ?? item.nama,
      color: JENIS_COLORS[index],
      share: item.share,
      total: item.totalMiliar,
      median: metric?.medianNasional ?? 0,
      rank: metric?.rankNasional ?? 0,
      status: statusChip(metric?.statusNasional),
    };
  });

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <h1>Dashboard Anggaran</h1>
          <p className="page-sub">Gambaran umum pagu, komposisi bidang, dan tren belanja nasional. Gunakan ringkasan di bawah untuk mulai menelusuri data sesuai kebutuhan.</p>
        </div>
      </section>

      <section className="dash-start" aria-label="Mulai menjelajah">
        <div className="dash-start-copy">
          <span className="eyebrow">
            <BookOpen size={15} aria-hidden="true" />
            Mulai dari sini
          </span>
          <h2>Pahami anggaran daerah tanpa harus membaca seluruh tabel.</h2>
          <p>Mulai dari ringkasan di bawah, lalu pilih langkah yang paling sesuai. Setiap angka memiliki konteks tahun, satuan, dan sumber yang dapat diperiksa.</p>
        </div>
        <div className="dash-actions">
          {quickActions.map(({ href, icon: Icon, label, copy, tone }) => (
            <Link className={`quick-card ${tone}`} href={href} key={href}>
              <span className="quick-ico">
                <Icon aria-hidden="true" />
              </span>
              <b>{label}</b>
              <span>{copy}</span>
              <ArrowUpRight className="quick-arrow" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <NationalPanel national={national} nationalRange={nationalRange} paguYears={paguYears} realisasiYears={realisasiYears} />

      <section className="section-split">
        <div className="pn" style={{ flex: "2 1 560px", minWidth: 0 }}>
          <div className="pn-h">
            <div>
              <h2 className="pn-t">Komposisi Belanja menurut Bidang</h2>
              <span className="pn-s">Porsi terhadap total belanja, diurutkan dari yang terbesar.</span>
            </div>
            <span className="chip c-hi">{top.nama}</span>
          </div>
          <div className="pn-b">
            <div style={{ width: "100%", height: 340 }}>
              <ResponsiveContainer>
                <BarChart data={chart} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 4 }} barCategoryGap={9}>
                  <CartesianGrid horizontal={false} stroke="#eaf1f8" />
                  <XAxis type="number" tick={{ fill: "#5c7590", fontSize: 11 }} axisLine={false} tickLine={false} tickMargin={8} unit="%" />
                  <YAxis type="category" dataKey="short" width={132} tick={{ fill: "#5c7590", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "rgba(151,215,255,0.18)" }} content={<BidangTip />} />
                  <Bar dataKey="porsi" radius={[0, 8, 8, 0]} maxBarSize={26} animationDuration={900}>
                    {chart.map((point, index) => (
                      <Cell key={point.full} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="legend" style={{ marginTop: 10 }}>
              <span>
                <i style={{ background: CHART_COLORS[0] }} /> Bidang terbesar: {top.nama} ({fmt1(top.share)}%)
              </span>
              <span>
                <i style={{ background: CHART_COLORS[2] }} /> Kesehatan ({fmt1(chart.find((point) => point.kode === "07")?.porsi ?? 0)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="pn" style={{ flex: "1 1 320px", minWidth: 0 }}>
          <div className="pn-h">
            <div>
              <h2 className="pn-t">Jenis Belanja</h2>
              <span className="pn-s">{showBenchmark ? `Dibandingkan dengan ${comparisonCount} daerah sejenis` : "Porsi jenis belanja pada APBD terpilih"}</span>
            </div>
          </div>
          <div className="pn-b" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {jenis.map((item) => (
                <div key={item.name} style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <span style={{ fontWeight: 700 }}>{item.name}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <b className="tabular">{fmt1(item.share)}%</b>
                      {showBenchmark ? <span className={`chip ${item.status.cls}`}>{item.status.label}</span> : null}
                    </span>
                  </div>
                  <div className="trk">
                    <i
                      style={{
                        width: `${Math.min(100, (item.share / 50) * 100)}%`,
                        background: item.color,
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 12, color: "var(--ink2)" }}>
                    {rupiahMiliar(item.total)}
                    {showBenchmark ? ` · nilai tengah ${fmt1(item.median)}% · peringkat ${item.rank} dari ${comparisonCount}` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pn top5-panel">
        <div className="pn-h">
          <div>
            <h2 className="pn-t">Lima Bidang dengan Anggaran Terbesar</h2>
            <span className="pn-s">{showBenchmark ? `Status dihitung dari peringkat porsi di antara ${comparisonCount} daerah sejenis` : "Peringkat dinamis dapat dilihat di halaman analisis"}</span>
          </div>
          <Link className="pn-link" href="/anggaran">
            Lihat seluruh bidang
          </Link>
        </div>
        <div className="pn-b" style={{ paddingTop: 6 }}>
          <div className="table-wrap">
            <div style={{ minWidth: 620 }}>
              <div className="tr tr-5 th">
                <span>Bidang</span>
                <span className="r">Anggaran (Rp miliar)</span>
                <span className="r">Porsi</span>
                <span className="r">Peringkat</span>
                <span>Status</span>
              </div>
              {top5.map((row) => {
                const metric = analysisFunctions.get(row.kode);
                const rank = metric?.rankNasional ?? null;
                const status = metric ? statusChip(metric.statusNasional) : null;
                return (
                  <div className="tr tr-5" key={row.kode}>
                    <Link href={`/anggaran/${slugify(row.nama)}?kode=${encodeURIComponent(frame.region.kodeDjpk)}&tahun=${frame.tahun}`}>{row.nama}</Link>
                    <span className="r">{fmt1(row.totalMiliar)}</span>
                    <span className="r">{fmt1(row.share)}%</span>
                    <span className="r">{rank === null ? "—" : `${rank} / ${comparisonCount}`}</span>
                    <span>{status ? <span className={`chip ${status.cls}`}>{status.label}</span> : <span className="chip c-mid">—</span>}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="callout">
        <div>
          <b>Bagaimana posisi anggaran ini dibandingkan kabupaten lain?</b>
          <span>Analisis kebutuhan menempatkan porsi setiap bidang pada urutan daerah pembanding, beserta pertanyaan yang dapat diajukan kepada pemerintah daerah.</span>
        </div>
        <Link className="btn btn-p" href="/analisis">
          Buka analisis kebutuhan
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>

      <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink2)" }}>
        Sumber:{" "}
        <a href="https://djpk.kemenkeu.go.id/?p=5412" style={{ fontWeight: 600, color: "var(--brandink)", textDecoration: "underline" }}>
          DJPK Kementerian Keuangan
        </a>
        , Belanja Fungsi per Jenis APBD.{" "}
        {frame.source === "fallback" ? "Data contoh memakai APBD 2023 Kabupaten Pacitan; angka merupakan pagu, bukan realisasi." : `${frame.region.nama}, APBD ${frame.tahun}. Tahun tanpa data ditandai belum tersedia, bukan nol.`} Nilai
        tengah dan peringkat dihitung dari daerah dengan jenis yang sama.
      </p>
    </main>
  );
}
