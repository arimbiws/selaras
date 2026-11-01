"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Minus,
  Sparkles,
} from "lucide-react";
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
import { PageShell } from "@/components/page-shell";
import {
  BIDANG,
  BIDANG_RANK,
  BIDANG_SHORT,
  BIDANG_TOTALS,
  CHART_COLORS,
  JENIS,
  JENIS_MEDIAN_JT,
  JENIS_MEDIAN_NAS,
  JENIS_RANK,
  JENIS_TOTALS,
  MEDIAN_JT,
  MEDIAN_NAS,
  TOTAL,
  bidangsBySize,
  fmt1,
  pct,
  percentileOf,
  rupiahMiliar,
  rupiahTriliun,
  signed,
  slugify,
  statusOf,
} from "@/lib/demo-data";

type Comparison = "nas" | "jt";
type View = "fungsi" | "jenis";

type RadarPoint = { subject: string; full: string; value: number; median: number };
type Slice = { name: string; value: number; share: number; color: string };

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
      <span>Kab. Pacitan: persentil {Math.round(point.value)}</span>
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
    name: "Anggaran belanja per fungsi",
    status: "Dimuat",
    ok: true,
    detail:
      "DJPK Kementerian Keuangan. APBD 2023, per 12 Mei 2023, 546 pemerintah daerah.",
    url: "https://djpk.kemenkeu.go.id/?p=5412",
    cta: "Lihat dataset asli",
  },
  {
    name: "Realisasi belanja per fungsi",
    status: "Belum dimuat",
    ok: false,
    detail: "DJPK Kementerian Keuangan. Berkas terpisah untuk setiap tahun, tersedia hingga 2024.",
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

export default function AnalisisPage() {
  const [comparison, setComparison] = useState<Comparison>("nas");
  const [view, setView] = useState<View>("fungsi");

  const isFungsi = view === "fungsi";
  const names = isFungsi ? BIDANG : JENIS;
  const shares = isFungsi ? BIDANG_TOTALS.map((value) => pct(value)) : JENIS_TOTALS.map((value) => pct(value));
  const medians = isFungsi
    ? comparison === "nas"
      ? MEDIAN_NAS
      : MEDIAN_JT
    : comparison === "nas"
      ? JENIS_MEDIAN_NAS
      : JENIS_MEDIAN_JT;
  const ranks = isFungsi ? BIDANG_RANK : JENIS_RANK;
  const scale = isFungsi ? 40 : 50;

  const rows = names.map((name, i) => {
    const status = statusOf(ranks[i]);
    const barWidth = Math.min(100, (shares[i] / scale) * 100);
    const marker = Math.min(99, (medians[i] / scale) * 100);
    return { name, share: shares[i], median: medians[i], rank: ranks[i], status, barWidth, marker };
  });

  const highCount = ranks.filter((rank) => rank <= 103).length;
  const lowCount = ranks.filter((rank) => rank >= 312).length;
  const midCount = ranks.length - highCount - lowCount;

  const gaps = names
    .map((name, i) => ({ name, index: i, delta: shares[i] - medians[i] }))
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 3);

  const insights = gaps.map(
    (gap) =>
      `${gap.name}: ${fmt1(shares[gap.index])}% dari total belanja, ${signed(gap.delta)} terhadap nilai tengah (${fmt1(medians[gap.index])}%), peringkat ke-${ranks[gap.index]} dari 415 kabupaten.`,
  );

  const questions = gaps.map((gap, index) => ({
    index: String(index + 1),
    text:
      gap.delta >= 0
        ? `Porsi ${gap.name} sebesar ${fmt1(shares[gap.index])}% berada ${fmt1(Math.abs(gap.delta))} poin di atas nilai tengah. Apa kebijakan atau kebutuhan daerah yang mendasarinya, dan apakah hasilnya terukur?`
        : `Porsi ${gap.name} sebesar ${fmt1(shares[gap.index])}% berada ${fmt1(Math.abs(gap.delta))} poin di bawah nilai tengah. Apakah urusan ini ditangani pihak lain, atau terdapat kebutuhan yang belum terpenuhi?`,
  }));

  const radarData: RadarPoint[] = names.map((name, i) => ({
    subject: isFungsi ? BIDANG_SHORT[i] : JENIS[i],
    full: name,
    value: percentileOf(ranks[i]),
    median: 50,
  }));

  const top4 = bidangsBySize.slice(0, 4);
  const rest = TOTAL - top4.reduce((a, b) => a + b.total, 0);
  const composition: Slice[] = top4
    .map((b, i) => ({
      name: b.name,
      value: b.total,
      share: b.share,
      color: CHART_COLORS[i],
    }))
    .concat([
      {
        name: "Lima bidang lainnya",
        value: rest,
        share: pct(rest),
        color: CHART_COLORS[4],
      },
    ]);

  const donutTotal = `Rp${(TOTAL / 1000).toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} T`;

  return (
    <PageShell active="/analisis" title="Analisis Kebutuhan">
      <main className="page">
        <section className="page-head">
          <div style={{ maxWidth: 700 }}>
            <h1>Analisis Kebutuhan</h1>
            <p className="page-sub">
              Porsi anggaran Kabupaten Pacitan dibandingkan dengan kabupaten lain, sebagai dasar
              untuk menilai apakah alokasi sejalan dengan kebutuhan wilayah.
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "14px 20px" }}>
            <div className="fld">
              <span className="lb">Pembanding</span>
              <div className="seg" role="group" aria-label="Pembanding">
                <button
                  type="button"
                  aria-pressed={comparison === "nas"}
                  onClick={() => setComparison("nas")}
                >
                  Seluruh kabupaten (415)
                </button>
                <button
                  type="button"
                  aria-pressed={comparison === "jt"}
                  onClick={() => setComparison("jt")}
                >
                  Kabupaten Jawa Timur (29)
                </button>
              </div>
            </div>

            <div className="fld">
              <span className="lb">Tinjauan menurut</span>
              <div className="seg" role="group" aria-label="Tinjauan">
                <button
                  type="button"
                  aria-pressed={view === "fungsi"}
                  onClick={() => setView("fungsi")}
                >
                  Bidang
                </button>
                <button
                  type="button"
                  aria-pressed={view === "jenis"}
                  onClick={() => setView("jenis")}
                >
                  Jenis belanja
                </button>
              </div>
            </div>
          </div>
        </section>

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
          <article className="kpi">
            <div className="kpi-b">
              <div className="kpi-h">
                <span className="ico" style={{ background: "var(--accent)" }}>
                  <ArrowUp aria-hidden="true" />
                </span>
                Porsi tinggi
              </div>
              <div className="kpi-v">{highCount}</div>
            </div>
            <div className="kpi-f">peringkat 1 sampai 103 dari 415</div>
          </article>

          <article className="kpi">
            <div className="kpi-b">
              <div className="kpi-h">
                <span className="ico" style={{ background: "#6b7185" }}>
                  <Minus aria-hidden="true" />
                </span>
                Porsi sebanding
              </div>
              <div className="kpi-v">{midCount}</div>
            </div>
            <div className="kpi-f">peringkat 104 sampai 311</div>
          </article>

          <article className="kpi">
            <div className="kpi-b">
              <div className="kpi-h">
                <span className="ico" style={{ background: "#c26a00" }}>
                  <ArrowDown aria-hidden="true" />
                </span>
                Porsi rendah
              </div>
              <div className="kpi-v">{lowCount}</div>
            </div>
            <div className="kpi-f">peringkat 312 sampai 415</div>
          </article>

          <article className="kpi dash">
            <div className="kpi-b">
              <div className="kpi-h">
                <span className="ico" style={{ background: "#8a4a06" }}>
                  <AlertCircle aria-hidden="true" />
                </span>
                Perlu ditinjau
              </div>
              <div className="kpi-v muted">Belum dihitung</div>
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
                  {comparison === "nas"
                    ? "Pembanding: nilai tengah 415 kabupaten di seluruh Indonesia."
                    : "Pembanding: nilai tengah 29 kabupaten di Jawa Timur. Status tetap ditentukan dari peringkat di antara 415 kabupaten."}
                </span>
              </div>
              <div className="legend">
                <span>
                  <i style={{ width: 22, height: 10, borderRadius: 5, background: "var(--brand)" }} />
                  Kab. Pacitan
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
                  <Link href={`/anggaran/${slugify(row.name)}`} style={{ fontWeight: 700 }}>
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
                    <span className={`chip ${row.status.cls}`}>{row.status.label}</span>
                    <span style={{ fontSize: 12, color: "var(--ink2)" }}>
                      peringkat {row.rank} dari 415
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
                <span className="pn-s">Persentil porsi di antara 415 kabupaten</span>
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
                    />
                    <Radar
                      name="Kab. Pacitan"
                      dataKey="value"
                      stroke="#086288"
                      fill="#086288"
                      fillOpacity={0.18}
                      strokeWidth={2.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="legend" style={{ justifyContent: "center" }}>
                <span>
                  <i style={{ width: 18, height: 3, borderRadius: 2, background: "var(--brand)" }} />
                  Kab. Pacitan
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
                Semakin jauh dari pusat, semakin besar porsi dibandingkan kabupaten lain.
              </span>
            </div>
          </div>
        </section>

        <section className="section-split">
          <div className="pn" style={{ flex: "1 1 520px", minWidth: 0 }}>
            <div className="pn-h">
              <div>
                <h2 className="pn-t">Komposisi Anggaran</h2>
                <span className="pn-s">Porsi dan nominal setiap bidang, APBD 2023</span>
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
                      innerRadius={62}
                      outerRadius={92}
                      paddingAngle={2}
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      {composition.map((slice) => (
                        <Cell key={slice.name} fill={slice.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<SliceTip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "grid",
                    placeItems: "center",
                    pointerEvents: "none",
                  }}
                >
                  <div style={{ textAlign: "center", width: 112 }}>
                    <span style={{ fontSize: 11.5, color: "var(--ink2)" }}>Total belanja</span>
                    <b style={{ display: "block", fontSize: 16, lineHeight: 1.25 }}>
                      {donutTotal}
                    </b>
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
                porsi anggaran suatu bidang berada pada kelompok rendah dan indikator kebutuhan
                terkait berada pada kelompok tinggi. Aturan ini baru diterapkan setelah data BPS
                dimuat. Status bersifat indikatif, bukan penilaian akhir.
              </div>
            </div>
          </div>
        </section>

        <section className="pn">
          <div className="pn-h">
            <div>
              <h2 className="pn-t">Bahan Pertanyaan Tinjauan</h2>
              <span className="pn-s">
                Disusun dari selisih terbesar pada analisis di atas. Dapat diajukan kepada
                pemerintah daerah melalui forum perencanaan atau layanan informasi publik.
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
              Simulasi alokasi memungkinkan Anda menyusun skenario sendiri dan melihat hasilnya
              dalam rupiah per penduduk.
            </span>
          </div>
          <Link className="btn btn-p" href="/simulasi">
            Buka simulasi alokasi
          </Link>
        </section>

        <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink2)" }}>
          Nilai tengah dan peringkat dihitung dari 415 kabupaten; kota dan provinsi tidak
          diikutsertakan karena struktur anggarannya berbeda. Status ditentukan dari peringkat:
          tinggi (1 sampai 103), rendah (312 sampai 415), sebanding (di antaranya).{" "}
          {rupiahTriliun(TOTAL)} total belanja.
        </p>
      </main>
    </PageShell>
  );
}
