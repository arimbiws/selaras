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
import {
  CHART_COLORS,
  COVERAGE,
  DATA_YEARS,
  JENIS,
  JENIS_COLORS,
  JENIS_MEDIAN_NAS,
  JENIS_RANK,
  JENIS_TOTALS,
  NATIONAL_PAGU,
  NATIONAL_REALISASI,
  TOTAL,
  bidangsBySize,
  fmt1,
  pct,
  rupiahMiliar,
  rupiahTriliun,
  signed,
  slugify,
  statusOf,
} from "@/lib/demo-data";

type BidangPoint = { short: string; full: string; total: number; porsi: number };

type NationalPoint = { year: string; pagu: number | null; realisasi: number | null };

function NationalTip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: NationalPoint }>;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="tip">
      <b>APBD {point.year}</b>
      {point.pagu ? <span>Pagu: Rp{fmt1(point.pagu)} triliun</span> : <span>Pagu: belum tersedia</span>}
      {point.realisasi ? (
        <span>Realisasi: Rp{fmt1(point.realisasi)} triliun</span>
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

export function DashboardData() {
  const total = rupiahTriliun(TOTAL);
  const top = bidangsBySize[0];
  const chart: BidangPoint[] = bidangsBySize.map((b) => ({
    short: b.short,
    full: b.name,
    total: b.total,
    porsi: b.share,
  }));

  const pegawaiShare = pct(JENIS_TOTALS[0]);
  const modalShare = pct(JENIS_TOTALS[2]);
  const top5 = bidangsBySize.slice(0, 5);

  const national: NationalPoint[] = DATA_YEARS.map((year) => ({
    year: String(year),
    pagu: NATIONAL_PAGU[year] ?? null,
    realisasi: NATIONAL_REALISASI[year] ?? null,
  }));

  const jenis = JENIS.map((name, j) => ({
    name,
    color: JENIS_COLORS[j],
    share: pct(JENIS_TOTALS[j]),
    total: JENIS_TOTALS[j],
    median: JENIS_MEDIAN_NAS[j],
    rank: JENIS_RANK[j],
    status: statusOf(JENIS_RANK[j]),
  }));

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <h1>Dashboard Anggaran</h1>
          <p className="page-sub">
            Contoh tampilan: Kabupaten Pacitan, Jawa Timur · APBD 2023. SELARAS dirancang untuk
            seluruh kabupaten/kota di Indonesia.
          </p>
        </div>
        <div className="page-actions">
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
          <div className="kpi-f">Seluruh bidang, APBD 2023</div>
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
            <b>{signed(pegawaiShare - JENIS_MEDIAN_NAS[0])}</b> terhadap nilai tengah kabupaten (
            {fmt1(JENIS_MEDIAN_NAS[0])}%)
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
            <b>{signed(modalShare - JENIS_MEDIAN_NAS[2])}</b> terhadap nilai tengah kabupaten (
            {fmt1(JENIS_MEDIAN_NAS[2])}%)
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
            <div className="kpi-v muted">Belum tersedia</div>
          </div>
          <div className="kpi-f">Menunggu data realisasi DJPK</div>
        </article>
      </section>

      <section className="section-split">
        <div className="pn" style={{ flex: "2 1 560px", minWidth: 0 }}>
          <div className="pn-h">
            <div>
              <h2 className="pn-t">Komposisi Belanja menurut Bidang</h2>
              <span className="pn-s">
                Porsi terhadap total belanja, diurutkan dari yang terbesar. Pilih satu batang untuk
                rincian bidang.
              </span>
            </div>
            <span className="chip c-hi">{top.name}</span>
          </div>
          <div className="pn-b">
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={chart} margin={{ top: 16, right: 8, left: -16, bottom: 4 }}>
                  <CartesianGrid vertical={false} stroke="#eaf1f8" />
                  <XAxis
                    dataKey="short"
                    interval={0}
                    tick={{ fill: "#5c7590", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                  />
                  <YAxis
                    tick={{ fill: "#7c93a9", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    unit="%"
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(151,215,255,0.18)" }}
                    content={<BidangTip />}
                  />
                  <Bar
                    dataKey="porsi"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={52}
                    animationDuration={900}
                  >
                    {chart.map((point, index) => (
                      <Cell key={point.full} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="legend" style={{ marginTop: 10 }}>
              <span>
                <i style={{ background: CHART_COLORS[0] }} /> Bidang terbesar: {top.short} (
                {fmt1(top.share)}%)
              </span>
              <span>
                <i style={{ background: CHART_COLORS[2] }} /> Kesehatan (
                {fmt1(chart[2]?.porsi ?? 0)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="pn" style={{ flex: "1 1 320px", minWidth: 0 }}>
          <div className="pn-h">
            <div>
              <h2 className="pn-t">Jenis Belanja</h2>
              <span className="pn-s">Dibandingkan dengan {COVERAGE.kabupaten} kabupaten</span>
            </div>
          </div>
          <div className="pn-b" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <span style={{ fontSize: 13, color: "var(--ink2)" }}>Total belanja dianggarkan</span>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>
                {rupiahMiliar(TOTAL)}
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
                      <span className={`chip ${item.status.cls}`}>{item.status.label}</span>
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
                    {rupiahMiliar(item.total)} · nilai tengah {fmt1(item.median)}% · peringkat{" "}
                    {item.rank} dari {COVERAGE.kabupaten}
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
              <h2 className="pn-t">Belanja Nasional 2020–2025</h2>
              <span className="pn-s">
                Total pagu APBD seluruh daerah. Tahun 2023–2024 belum tersedia dalam sumber.
              </span>
            </div>
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
                2023–2024 belum tersedia
              </span>
            </div>
          </div>
        </div>

        <div className="pn" style={{ flex: "2 1 520px", minWidth: 0 }}>
          <div className="pn-h">
            <div>
              <h2 className="pn-t">Lima Bidang dengan Anggaran Terbesar</h2>
              <span className="pn-s">
                Status dihitung dari peringkat porsi di antara {COVERAGE.kabupaten} kabupaten
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
                  const status = statusOf(row.rank);
                  return (
                    <div className="tr tr-5" key={row.name}>
                      <Link href={`/anggaran/${slugify(row.name)}`}>{row.name}</Link>
                      <span className="r">{fmt1(row.total)}</span>
                      <span className="r">{fmt1(row.share)}%</span>
                      <span className="r">{row.rank} / {COVERAGE.kabupaten}</span>
                      <span>
                        <span className={`chip ${status.cls}`}>{status.label}</span>
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
            Analisis kebutuhan menempatkan porsi setiap bidang pada urutan {COVERAGE.kabupaten}{" "}
            kabupaten, beserta pertanyaan yang dapat diajukan kepada pemerintah daerah.
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
        , Belanja Fungsi per Jenis APBD. Data contoh memakai APBD 2023 Kabupaten Pacitan; angka
        merupakan pagu, belum realisasi. Nilai tengah dan peringkat dihitung dari{" "}
        {COVERAGE.kabupaten} kabupaten di seluruh Indonesia; kota dan provinsi tidak diikutsertakan.
      </p>
    </main>
  );
}
