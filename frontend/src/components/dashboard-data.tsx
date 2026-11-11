"use client";

import Link from "next/link";
import { ArrowRight, Landmark, TrendingUp, Users, Wallet } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BudgetBundle, NationalPoint as NationalDataPoint } from "@backend/types";
import {
  BIDANG_RANK,
  BIDANG_SHORT,
  CHART_COLORS,
  COVERAGE,
  JENIS,
  JENIS_COLORS,
  JENIS_MEDIAN_NAS,
  JENIS_RANK,
  fmt1,
  rupiahMiliar,
  rupiahTriliun,
  signed,
  slugify,
  statusOf,
} from "@/lib/demo-data";

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

const rankFor = (kode: string) => {
  const index = FUNGSI_CODES.indexOf(kode);
  return index >= 0 ? BIDANG_RANK[index] : null;
};

function NationalTip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: NationalSeriesPoint }>;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="tip">
      <b>APBD {point.year}</b>
      {point.pagu !== null ? (
        <span>Pagu: Rp{fmt1(point.pagu)} triliun</span>
      ) : (
        <span>Pagu: belum tersedia</span>
      )}
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

function BidangTip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: BidangPoint }>;
}) {
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

export function DashboardData({
  bundle,
  national: nationalPoints,
  nationalSource,
}: {
  bundle: BudgetBundle;
  national: NationalDataPoint[];
  nationalSource: "supabase" | "fallback";
}) {
  const frame = bundle.pagu;
  const realisasi = bundle.realisasi;

  if (!frame?.available) {
    return (
      <main className="page">
        <section className="page-head">
          <div>
            <h1>Dashboard Anggaran</h1>
            <p className="page-sub">
              Data {frame?.region.nama ?? "daerah"} tahun {frame?.tahun ?? bundle.tahun} belum
              tersedia. Pilih sumber data untuk melihat status pemuatan.
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
            <b>Data Supabase belum dapat dimuat.</b>
            <span>
              Periksa koneksi, kredensial lingkungan, dan kebijakan baca tabel `belanja`.
            </span>
          </div>
        </section>
      </main>
    );
  }

  const showBenchmark = frame.source === "fallback" && frame.tahun === 2023;
  const total = rupiahTriliun(frame.totalMiliar);
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

  const pegawaiShare = frame.jenis[0]?.share ?? 0;
  const modalShare = frame.jenis[2]?.share ?? 0;
  const serapan =
    realisasi?.available && frame.totalMiliar > 0
      ? (realisasi.totalMiliar / frame.totalMiliar) * 100
      : null;
  const top5 = frame.functions.slice(0, 5);

  const national: NationalSeriesPoint[] = nationalPoints.map((point) => ({
    year: String(point.tahun),
    pagu: point.pagu,
    realisasi: point.realisasi,
    partial: point.partial,
  }));

  const paguYears = nationalPoints.filter((point) => point.pagu !== null).map((point) => point.tahun);
  const realisasiYears = nationalPoints
    .filter((point) => point.realisasi !== null)
    .map((point) => point.tahun);
  const nationalRange = national.length
    ? `${national[0].year}–${national[national.length - 1].year}`
    : "yang tersedia";
  const formatYears = (years: number[]) =>
    years.length ? years.join(", ") : "belum tersedia";

  const jenis = frame.jenis.map((item, index) => ({
    name: JENIS[index] ?? item.nama,
    color: JENIS_COLORS[index],
    share: item.share,
    total: item.totalMiliar,
    median: JENIS_MEDIAN_NAS[index],
    rank: JENIS_RANK[index],
    status: statusOf(JENIS_RANK[index]),
  }));

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <h1>Dashboard Anggaran</h1>
          <p className="page-sub">
            {frame.region.nama}, APBD {frame.tahun}. Ringkasan pagu, komposisi bidang, dan posisi
            belanja terhadap kabupaten lain.
          </p>
        </div>
        <div className="page-actions">
          <span className={`chip ${frame.source === "supabase" ? "c-ok" : "c-mid"}`}>
            {frame.source === "supabase" ? "Supabase" : "Data contoh"}
          </span>
          <Link className="btn btn-s" href="/sumber-data">
            Sumber data
          </Link>
          <Link className="btn btn-p" href="/anggaran">
            Telusuri anggaran
          </Link>
        </div>
      </section>

      <section aria-label="Indikator utama" className="grid-kpi">
        <article className="kpi">
          <div className="kpi-b">
            <div className="kpi-h">
              <span className="ico" style={{ background: "#2F6BFF" }}>
                <Wallet aria-hidden="true" />
              </span>
              Total belanja dianggarkan
            </div>
            <div className="kpi-v">{total}</div>
          </div>
          <div className="kpi-f">Seluruh bidang, APBD {frame.tahun}</div>
        </article>

        <article className="kpi">
          <div className="kpi-b">
            <div className="kpi-h">
              <span className="ico" style={{ background: "#12B3A6" }}>
                <Users aria-hidden="true" />
              </span>
              Porsi belanja pegawai
            </div>
            <div className="kpi-v">{fmt1(pegawaiShare)}%</div>
          </div>
          <div className="kpi-f">
            {showBenchmark ? (
              <>
                <b>{signed(pegawaiShare - JENIS_MEDIAN_NAS[0])}</b> terhadap nilai tengah kabupaten
                ({fmt1(JENIS_MEDIAN_NAS[0])}%)
              </>
            ) : (
              "Perbandingan dinamis tersedia di halaman analisis"
            )}
          </div>
        </article>

        <article className="kpi">
          <div className="kpi-b">
            <div className="kpi-h">
              <span className="ico" style={{ background: "#8B5CF6" }}>
                <Landmark aria-hidden="true" />
              </span>
              Porsi belanja modal
            </div>
            <div className="kpi-v">{fmt1(modalShare)}%</div>
          </div>
          <div className="kpi-f">
            {showBenchmark ? (
              <>
                <b>{signed(modalShare - JENIS_MEDIAN_NAS[2])}</b> terhadap nilai tengah kabupaten (
                {fmt1(JENIS_MEDIAN_NAS[2])}%)
              </>
            ) : (
              "Perbandingan dinamis tersedia di halaman analisis"
            )}
          </div>
        </article>

        <article className="kpi dash">
          <div className="kpi-b">
            <div className="kpi-h">
              <span className="ico" style={{ background: "#FFA50A" }}>
                <TrendingUp aria-hidden="true" />
              </span>
              Serapan anggaran
            </div>
            <div className={serapan === null ? "kpi-v muted" : "kpi-v"}>
              {serapan === null ? "Belum tersedia" : `${fmt1(serapan)}%`}
            </div>
          </div>
          <div className="kpi-f">
            {serapan === null
              ? `Realisasi ${frame.tahun} belum tersedia`
              : `Realisasi ${rupiahMiliar(realisasi?.totalMiliar ?? 0)}`}
          </div>
        </article>
      </section>

      <section className="section-split">
        <div className="pn" style={{ flex: "2 1 560px", minWidth: 0 }}>
          <div className="pn-h">
            <div>
              <h2 className="pn-t">Komposisi Belanja menurut Bidang</h2>
              <span className="pn-s">
                Porsi terhadap total belanja, diurutkan dari yang terbesar.
              </span>
            </div>
            <span className="chip c-hi">{top.nama}</span>
          </div>
          <div className="pn-b">
            <div style={{ width: "100%", height: 340 }}>
              <ResponsiveContainer>
                <BarChart
                  data={chart}
                  layout="vertical"
                  margin={{ top: 8, right: 24, left: 8, bottom: 4 }}
                  barCategoryGap={9}
                >
                  <CartesianGrid horizontal={false} stroke="#eaf1f8" />
                  <XAxis
                    type="number"
                    tick={{ fill: "#5c7590", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                    unit="%"
                  />
                  <YAxis
                    type="category"
                    dataKey="short"
                    width={132}
                    tick={{ fill: "#5c7590", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(151,215,255,0.18)" }}
                    content={<BidangTip />}
                  />
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
                <i style={{ background: CHART_COLORS[0] }} /> Bidang terbesar: {top.nama} (
                {fmt1(top.share)}%)
              </span>
              <span>
                <i style={{ background: CHART_COLORS[2] }} /> Kesehatan (
                {fmt1(chart.find((point) => point.kode === "07")?.porsi ?? 0)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="pn" style={{ flex: "1 1 320px", minWidth: 0 }}>
          <div className="pn-h">
            <div>
              <h2 className="pn-t">Jenis Belanja</h2>
              <span className="pn-s">
                {showBenchmark
                  ? `Dibandingkan dengan ${COVERAGE.kabupaten} kabupaten`
                  : "Porsi jenis belanja pada APBD terpilih"}
              </span>
            </div>
          </div>
          <div className="pn-b" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <span style={{ fontSize: 13, color: "var(--ink2)" }}>Total belanja dianggarkan</span>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>
                {rupiahMiliar(frame.totalMiliar)}
              </div>
            </div>

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
                      {showBenchmark ? (
                        <span className={`chip ${item.status.cls}`}>{item.status.label}</span>
                      ) : null}
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
                    {showBenchmark
                      ? ` · nilai tengah ${fmt1(item.median)}% · peringkat ${item.rank} dari ${COVERAGE.kabupaten}`
                      : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-split">
        <div className="pn" style={{ flex: "1 1 380px", minWidth: 0 }}>
          <div className="pn-h">
            <div>
              <h2 className="pn-t">Belanja Nasional {nationalRange}</h2>
              <span className="pn-s">
                Pagu tersedia untuk {formatYears(paguYears)}. Realisasi tersedia untuk{" "}
                {formatYears(realisasiYears)}. Tahun tanpa data tidak dihitung sebagai nol.
              </span>
            </div>
            <span className={`chip ${nationalSource === "supabase" ? "c-ok" : "c-mid"}`}>
              {nationalSource === "supabase" ? "Supabase" : "Data contoh"}
            </span>
          </div>
          <div className="pn-b">
            <div style={{ width: "100%", height: 210 }}>
              <ResponsiveContainer>
                <BarChart data={national} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#eaf1f8" />
                  <XAxis
                    dataKey="year"
                    tick={{ fill: "#5c7590", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tick={{ fill: "#7c93a9", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    unit=" T"
                    width={52}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(47,107,255,0.08)" }}
                    content={<NationalTip />}
                  />
                  <Bar
                    dataKey="pagu"
                    name="Pagu"
                    fill="#2F6BFF"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={26}
                    animationDuration={900}
                  />
                  <Bar
                    dataKey="realisasi"
                    name="Realisasi"
                    fill="#12B3A6"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={26}
                    animationDuration={900}
                  />
                </BarChart>
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
                <i
                  style={{
                    border: "1.5px dashed #b9c9d8",
                    background: "transparent",
                  }}
                />
                Realisasi parsial atau belum tersedia tidak digambarkan sebagai nol
              </span>
            </div>
          </div>
        </div>

        <div className="pn" style={{ flex: "2 1 520px", minWidth: 0 }}>
          <div className="pn-h">
            <div>
              <h2 className="pn-t">Lima Bidang dengan Anggaran Terbesar</h2>
              <span className="pn-s">
                {showBenchmark
                  ? `Status dihitung dari peringkat porsi di antara ${COVERAGE.kabupaten} kabupaten`
                  : "Peringkat dinamis dapat dilihat di halaman analisis"}
              </span>
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
                  const rank = rankFor(row.kode);
                  const status = rank === null ? null : statusOf(rank);
                  return (
                    <div className="tr tr-5" key={row.kode}>
                      <Link
                        href={`/anggaran/${slugify(row.nama)}?kode=${encodeURIComponent(
                          frame.region.kodeDjpk,
                        )}&tahun=${frame.tahun}`}
                      >
                        {row.nama}
                      </Link>
                      <span className="r">{fmt1(row.totalMiliar)}</span>
                      <span className="r">{fmt1(row.share)}%</span>
                      <span className="r">
                        {rank === null ? "—" : `${rank} / ${COVERAGE.kabupaten}`}
                      </span>
                      <span>
                        {status ? (
                          <span className={`chip ${status.cls}`}>{status.label}</span>
                        ) : (
                          <span className="chip c-mid">—</span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="callout">
        <div>
          <b>Bagaimana posisi anggaran ini dibandingkan kabupaten lain?</b>
          <span>
            Analisis kebutuhan menempatkan porsi setiap bidang pada urutan daerah pembanding,
            beserta pertanyaan yang dapat diajukan kepada pemerintah daerah.
          </span>
        </div>
        <Link className="btn btn-p" href="/analisis">
          Buka analisis kebutuhan
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>

      <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink2)" }}>
        Sumber:{" "}
        <a
          href="https://djpk.kemenkeu.go.id/?p=5412"
          style={{ fontWeight: 600, color: "var(--brandink)", textDecoration: "underline" }}
        >
          DJPK Kementerian Keuangan
        </a>
        , Belanja Fungsi per Jenis APBD.{" "}
        {frame.source === "fallback"
          ? "Data contoh memakai APBD 2023 Kabupaten Pacitan; angka merupakan pagu, bukan realisasi."
          : `${frame.region.nama}, APBD ${frame.tahun}, dibaca dari Supabase. Tahun tanpa data ditandai belum tersedia, bukan nol.`}{" "}
        Nilai tengah dan peringkat dinamis dihitung pada halaman analisis dari daerah dengan jenis
        yang sama.
      </p>
    </main>
  );
}
