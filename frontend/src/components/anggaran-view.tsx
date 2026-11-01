"use client";

import { useState } from "react";
import Link from "next/link";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  BIDANG,
  BIDANG_TOTALS,
  JENIS,
  JENIS_COLORS,
  TOTAL,
  VALUES,
  fmt1,
  rupiahMiliar,
  slugify,
} from "@/lib/demo-data";

type Mode = "persen" | "rupiah";
type ChartMode = "bar" | "donut";

type Slice = { name: string; value: number; share: number; color: string };

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

const cell = (value: number) => (value === 0 ? "—" : value < 0.05 ? "<0,1" : fmt1(value));

export function AnggaranView() {
  const [selected, setSelected] = useState(-1);
  const [mode, setMode] = useState<Mode>("persen");
  const [chartMode, setChartMode] = useState<ChartMode>("bar");

  const indices = selected < 0 ? BIDANG.map((_, i) => i) : [selected];
  const sorted = [...indices].sort((a, b) => BIDANG_TOTALS[b] - BIDANG_TOTALS[a]);
  const grand = indices.reduce((a, i) => a + BIDANG_TOTALS[i], 0);
  const maxTotal = Math.max(...BIDANG_TOTALS);

  const slices: Slice[] = JENIS.map((name, j) => {
    const value = indices.reduce((a, i) => a + VALUES[i][j], 0);
    return { name, value, share: (value / grand) * 100, color: JENIS_COLORS[j] };
  });

  const rows = sorted.map((i) => ({
    index: i,
    name: BIDANG[i],
    total: BIDANG_TOTALS[i],
    values: VALUES[i],
    width: mode === "persen" ? "100%" : `${(BIDANG_TOTALS[i] / maxTotal) * 100}%`,
    parts: VALUES[i].map((value, j) => ({
      color: JENIS_COLORS[j],
      label: JENIS[j],
      value,
      text:
        value === 0
          ? "—"
          : mode === "persen"
            ? `${fmt1((value / BIDANG_TOTALS[i]) * 100)}%`
            : rupiahMiliar(value),
    })),
  }));

  const pairs = sorted
    .slice(0, 6)
    .map((i) => ({ name: BIDANG[i], width: (BIDANG_TOTALS[i] / maxTotal) * 100, total: BIDANG_TOTALS[i] }));

  return (
    <main className="page">
      <section>
        <h1 className="page-title">Telusuri Anggaran</h1>
        <p className="page-sub">
          Setiap bidang dirinci menurut jenis belanjanya, sehingga terlihat berapa bagian yang
          digunakan untuk gaji pegawai, kebutuhan operasional, atau pembangunan aset.
        </p>
      </section>

      <section aria-label="Filter" className="filter-bar">
        <div className="fld">
          <label className="lb" htmlFor="f-daerah">
            Daerah
          </label>
          <select className="sel" id="f-daerah" defaultValue="pacitan" style={{ minWidth: 220 }}>
            <option value="pacitan">Kab. Pacitan, Jawa Timur</option>
          </select>
        </div>

        <div className="fld">
          <label className="lb" htmlFor="f-tahun">
            Tahun
          </label>
          <select className="sel" id="f-tahun" defaultValue="2023" style={{ minWidth: 100 }}>
            <option value="2023">2023</option>
          </select>
        </div>

        <div className="fld">
          <label className="lb" htmlFor="f-bidang">
            Bidang
          </label>
          <select
            className="sel"
            id="f-bidang"
            value={String(selected)}
            onChange={(event) => setSelected(Number(event.target.value))}
            style={{ minWidth: 240 }}
          >
            <option value="-1">Semua bidang</option>
            {BIDANG.map((name, index) => (
              <option value={String(index)} key={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="fld">
          <span className="lb">Satuan</span>
          <div className="seg" role="group" aria-label="Satuan angka">
            <button type="button" aria-pressed={mode === "persen"} onClick={() => setMode("persen")}>
              Persen
            </button>
            <button type="button" aria-pressed={mode === "rupiah"} onClick={() => setMode("rupiah")}>
              Rupiah
            </button>
          </div>
        </div>

        <div className="fld">
          <span className="lb">Jenis grafik</span>
          <div className="seg" role="group" aria-label="Jenis grafik">
            <button
              type="button"
              aria-pressed={chartMode === "bar"}
              onClick={() => setChartMode("bar")}
            >
              Batang
            </button>
            <button
              type="button"
              aria-pressed={chartMode === "donut"}
              onClick={() => setChartMode("donut")}
            >
              Donat
            </button>
          </div>
        </div>
      </section>

      <section className="pn">
        <div className="pn-h">
          <div>
            <h2 className="pn-t">Komposisi Anggaran menurut Jenis Belanja</h2>
            <span className="pn-s">
              {chartMode === "donut"
                ? "Gabungan jenis belanja pada bidang yang dipilih."
                : mode === "persen"
                  ? "Setiap batang mewakili 100% anggaran bidangnya."
                  : "Panjang batang menunjukkan besar anggaran bidang dibandingkan bidang terbesar."}
            </span>
          </div>
          <div className="legend">
            {JENIS.map((name, j) => (
              <span key={name}>
                <i style={{ background: JENIS_COLORS[j] }} />
                {name}
              </span>
            ))}
          </div>
        </div>

        <div className="pn-b">
          {chartMode === "bar" ? (
            <div>
              {rows.map((row) => (
                <div className="comp-row" key={row.name}>
                  <div className="comp-head">
                    <Link href={`/anggaran/${slugify(row.name)}`}>{row.name}</Link>
                    <span style={{ fontSize: 13.5, color: "var(--ink2)" }}>
                      {rupiahMiliar(row.total)}
                    </span>
                  </div>
                  <div style={{ width: row.width, minWidth: 40 }}>
                    <div className="comp-bar">
                      {row.values.map((value, j) =>
                        value > 0 ? (
                          <span
                            key={JENIS[j]}
                            style={{ flex: value, background: JENIS_COLORS[j] }}
                            title={`${JENIS[j]} ${rupiahMiliar(value)}`}
                          />
                        ) : null,
                      )}
                    </div>
                  </div>
                  <div className="comp-parts">
                    {row.parts.map((part) => (
                      <span key={part.label}>
                        <i style={{ background: part.color }} />
                        {part.label} {part.text}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "28px 48px",
                padding: "8px 4px",
              }}
            >
              <div
                style={{ position: "relative", width: 250, height: 250, flex: "0 0 250px" }}
                role="img"
                aria-label={`Komposisi jenis belanja: ${slices
                  .map((slice) => `${slice.name} ${fmt1(slice.share)}%`)
                  .join(", ")}`}
              >
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={slices}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={78}
                      outerRadius={112}
                      paddingAngle={2}
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      {slices.map((slice) => (
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
                  <div style={{ textAlign: "center", width: 140 }}>
                    <span style={{ fontSize: 12, color: "var(--ink2)" }}>
                      {selected < 0 ? "Seluruh bidang" : BIDANG[selected]}
                    </span>
                    <b style={{ display: "block", fontSize: 17, lineHeight: 1.25 }}>
                      {rupiahMiliar(grand)}
                    </b>
                  </div>
                </div>
              </div>

              <div style={{ flex: "1 1 300px", minWidth: 0 }}>
                {slices.map((slice) => (
                  <div
                    key={slice.name}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "14px minmax(0,1fr) auto auto",
                      gap: 14,
                      alignItems: "center",
                      padding: "12px 0",
                      borderBottom: "1px solid var(--line)",
                      fontSize: 14,
                    }}
                  >
                    <span
                      style={{ width: 14, height: 14, borderRadius: 4, background: slice.color }}
                    />
                    <b>{slice.name}</b>
                    <span style={{ color: "var(--ink2)" }}>{rupiahMiliar(slice.value)}</span>
                    <b style={{ minWidth: 56, textAlign: "right" }}>{fmt1(slice.share)}%</b>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="pn">
        <div className="pn-h">
          <div>
            <h2 className="pn-t">Anggaran dan Realisasi</h2>
            <span className="pn-s">
              Pratinjau tata letak. Realisasi belum dimuat, sehingga tidak dihitung sebagai nol.
            </span>
          </div>
          <span className="chip c-wait">Realisasi belum dimuat</span>
        </div>
        <div className="pn-b" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div className="legend" style={{ paddingBottom: 8 }}>
            <span>
              <i style={{ background: "var(--brand)" }} />
              Anggaran (pagu)
            </span>
            <span>
              <i style={{ border: "1.5px dashed #8e9fb0", background: "transparent" }} />
              Realisasi (menunggu berkas DJPK)
            </span>
          </div>

          {pairs.map((pair) => (
            <div
              key={pair.name}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,190px) minmax(0,1fr) minmax(0,120px)",
                gap: "6px 16px",
                alignItems: "center",
                padding: "10px 4px",
                borderTop: "1px solid var(--line)",
              }}
            >
              <b>{pair.name}</b>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div
                  style={{
                    height: 14,
                    width: `${pair.width}%`,
                    minWidth: 6,
                    background: "var(--brand)",
                    borderRadius: 4,
                  }}
                />
                <div
                  style={{
                    height: 14,
                    width: `${pair.width}%`,
                    minWidth: 6,
                    border: "1.5px dashed #b9c9d8",
                    borderRadius: 4,
                  }}
                />
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700 }}>{rupiahMiliar(pair.total)}</div>
                <div style={{ fontSize: 12, color: "var(--ink2)" }}>realisasi: belum ada</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pn">
        <div className="pn-h">
          <div>
            <h2 className="pn-t">Tabel Rincian</h2>
            <span className="pn-s">Dalam miliar rupiah</span>
          </div>
          <button type="button" className="btn btn-s btn-sm">
            Unduh CSV
          </button>
        </div>
        <div className="pn-b" style={{ padding: "8px 14px 14px" }}>
          <div className="table-wrap">
            <div style={{ minWidth: 980 }} role="table" aria-label="Anggaran menurut bidang">
              <div className="tr tr-8 th" role="row">
                <span role="columnheader">Bidang</span>
                {JENIS.map((name) => (
                  <span className="r" role="columnheader" key={name}>
                    {name}
                  </span>
                ))}
                <span className="r" role="columnheader">
                  Total
                </span>
                <span className="r" role="columnheader">
                  Realisasi
                </span>
                <span className="r" role="columnheader">
                  Serapan
                </span>
              </div>

              {rows.map((row) => (
                <div className="tr tr-8" role="row" key={row.name}>
                  <Link role="cell" href={`/anggaran/${slugify(row.name)}`}>
                    {row.name}
                  </Link>
                  {row.values.map((value, j) => (
                    <span role="cell" className="r" key={JENIS[j]}>
                      {cell(value)}
                    </span>
                  ))}
                  <b role="cell" className="r">
                    {fmt1(row.total)}
                  </b>
                  <span role="cell" className="r" style={{ color: "var(--ink2)" }}>
                    belum ada
                  </span>
                  <span role="cell" className="r" style={{ color: "var(--ink2)" }}>
                    belum ada
                  </span>
                </div>
              ))}

              {selected < 0 && (
                <div className="tr tr-8 tr-total" role="row">
                  <span role="cell">Seluruh bidang</span>
                  {JENIS.map((name, j) => (
                    <span className="r" role="cell" key={name}>
                      {fmt1(slices[j].value)}
                    </span>
                  ))}
                  <span className="r" role="cell">
                    {fmt1(TOTAL)}
                  </span>
                  <span className="r" role="cell" style={{ color: "var(--ink2)", fontWeight: 500 }}>
                    belum ada
                  </span>
                  <span className="r" role="cell" style={{ color: "var(--ink2)", fontWeight: 500 }}>
                    belum ada
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px 24px",
        }}
      >
        <p style={{ margin: 0, maxWidth: 820, fontSize: 12.5, color: "var(--ink2)" }}>
          Sumber:{" "}
          <a
            href="https://djpk.kemenkeu.go.id/?p=5412"
            style={{ fontWeight: 600, color: "var(--brandink)", textDecoration: "underline" }}
          >
            DJPK Kementerian Keuangan
          </a>
          , Belanja Fungsi per Jenis APBD 2023, per 12 Mei 2023. Angka anggaran, belum realisasi.
        </p>
        <Link className="btn btn-p" href="/analisis">
          Bandingkan dengan kabupaten lain
        </Link>
      </section>
    </main>
  );
}
