"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { BudgetBundle, Region } from "@backend/types";
import { JENIS, JENIS_COLORS, fmt1, rupiahMiliar, slugify } from "@/lib/demo-data";

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

export function AnggaranView({
  initialBundle,
  regions,
}: {
  initialBundle: BudgetBundle;
  regions: Region[];
}) {
  const [bundle, setBundle] = useState(initialBundle);
  const [regionCode, setRegionCode] = useState(initialBundle.region.kodeDjpk);
  const [year, setYear] = useState(initialBundle.tahun);
  const [selectedKode, setSelectedKode] = useState("");
  const [mode, setMode] = useState<Mode>("persen");
  const [chartMode, setChartMode] = useState<ChartMode>("bar");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [regionQuery, setRegionQuery] = useState("");
  const [flash, setFlash] = useState(false);
  const cacheRef = useRef(new Map<string, BudgetBundle>());
  const requestRef = useRef(0);

  useEffect(() => {
    if (!flash) return;
    const timer = window.setTimeout(() => setFlash(false), 1000);
    return () => window.clearTimeout(timer);
  }, [flash]);

  const frame = bundle.pagu;
  const realisasiFrame = bundle.realisasi;
  const functions = frame?.functions ?? [];
  const realisasiByKode = new Map(
    (realisasiFrame?.functions ?? []).map((item) => [item.kode, item.totalMiliar]),
  );

  const selectedIndex = selectedKode ? functions.findIndex((item) => item.kode === selectedKode) : -1;
  const indices =
    selectedIndex >= 0 ? [selectedIndex] : functions.map((_, index) => index);
  const sorted = [...indices].sort(
    (a, b) => functions[b]?.totalMiliar - functions[a]?.totalMiliar,
  );
  const grand = indices.reduce((sum, index) => sum + (functions[index]?.totalMiliar ?? 0), 0);
  const maxTotal = Math.max(...functions.map((item) => item.totalMiliar), 0);
  const hasRealisasi = Boolean(realisasiFrame?.available);
  const canOpenDetail = Boolean(frame?.available);
  const normalizedQuery = regionQuery.trim().toLocaleLowerCase("id-ID");
  const currentRegion =
    regions.find((region) => region.kodeDjpk === regionCode) ?? bundle.region;
  const filteredRegions = normalizedQuery
    ? regions.filter((region) => region.nama.toLocaleLowerCase("id-ID").includes(normalizedQuery))
    : regions;
  const regionOptions = filteredRegions.some((region) => region.kodeDjpk === regionCode)
    ? filteredRegions
    : [currentRegion, ...filteredRegions];
  const yearOptions = bundle.years.length
    ? bundle.years
    : [{ tahun: year, pagu: Boolean(frame?.available), realisasi: false }];

  const slices: Slice[] = JENIS.map((name, jenisIndex) => {
    const value = indices.reduce(
      (sum, index) => sum + (functions[index]?.values[jenisIndex] ?? 0),
      0,
    );
    return {
      name,
      value,
      share: grand > 0 ? (value / grand) * 100 : 0,
      color: JENIS_COLORS[jenisIndex],
    };
  });

  const rows = sorted.map((index) => {
    const item = functions[index];
    return {
      index,
      kode: item.kode,
      name: item.nama,
      total: item.totalMiliar,
      values: item.values,
      realisasi: realisasiByKode.get(item.kode) ?? null,
      width: mode === "persen" ? "100%" : `${(item.totalMiliar / maxTotal) * 100}%`,
      parts: item.values.map((value, jenisIndex) => ({
        color: JENIS_COLORS[jenisIndex],
        label: JENIS[jenisIndex],
        value,
        text:
          value === 0
            ? "—"
            : mode === "persen"
              ? `${fmt1((value / item.totalMiliar) * 100)}%`
              : rupiahMiliar(value),
      })),
    };
  });

  const pairs = sorted.slice(0, 6).map((index) => {
    const item = functions[index];
    const realisasi = realisasiByKode.get(item.kode) ?? null;
    return {
      name: item.nama,
      total: item.totalMiliar,
      realisasi,
      serapan: realisasi !== null && item.totalMiliar > 0 ? (realisasi / item.totalMiliar) * 100 : null,
      width: (item.totalMiliar / maxTotal) * 100,
      realisasiWidth:
        realisasi !== null && maxTotal > 0 ? Math.min(100, (realisasi / maxTotal) * 100) : 0,
    };
  });

  const realisasiGrand = indices.reduce(
    (sum, index) => sum + (realisasiByKode.get(functions[index]?.kode ?? "") ?? 0),
    0,
  );

  async function load(nextRegion: string, nextYear: number) {
    const key = `${nextRegion}:${nextYear}`;
    const previousKode = bundle.region.kodeDjpk;
    const previousYear = bundle.tahun;
    const cached = cacheRef.current.get(key);
    setError("");

    if (cached) {
      requestRef.current += 1;
      setLoading(false);
      setBundle(cached);
      setSelectedKode("");
      setFlash(true);
      return;
    }

    const requestId = ++requestRef.current;
    setLoading(true);
    try {
      const response = await fetch(
        `/api/budget?kode=${encodeURIComponent(nextRegion)}&tahun=${nextYear}`,
        { cache: "no-store" },
      );
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Data tidak dapat dimuat.");
      }
      const next = (await response.json()) as BudgetBundle;
      if (requestId !== requestRef.current) return;
      cacheRef.current.set(key, next);
      setBundle(next);
      setSelectedKode("");
      setFlash(true);
    } catch (caught) {
      if (requestId !== requestRef.current) return;
      setError(caught instanceof Error ? caught.message : "Data tidak dapat dimuat.");
      setRegionCode(previousKode);
      setYear(previousYear);
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  }

  const filterBar = (
    <section aria-label="Filter" className="filter-bar">
      <div className="fld">
        <label className="lb" htmlFor="f-cari-daerah">
          Cari daerah
        </label>
        <input
          className="sel"
          id="f-cari-daerah"
          value={regionQuery}
          onChange={(event) => setRegionQuery(event.target.value)}
          placeholder="Nama kabupaten/kota"
          style={{ minWidth: 220 }}
        />
      </div>

      <div className="fld">
        <label className="lb" htmlFor="f-daerah">
          Daerah
        </label>
        <select
          className="sel"
          id="f-daerah"
          value={regionCode}
          onChange={(event) => {
            const next = event.target.value;
            setRegionCode(next);
            void load(next, year);
          }}
          style={{ minWidth: 250 }}
        >
          {regionOptions.map((region) => (
            <option value={region.kodeDjpk} key={region.kodeDjpk}>
              {region.nama}
            </option>
          ))}
        </select>
      </div>

      <div className="fld">
        <label className="lb" htmlFor="f-tahun">
          Tahun
        </label>
        <select
          className="sel"
          id="f-tahun"
          value={String(year)}
          onChange={(event) => {
            const next = Number(event.target.value);
            setYear(next);
            void load(regionCode, next);
          }}
          style={{ minWidth: 110 }}
        >
          {yearOptions.map((item) => (
            <option value={item.tahun} key={item.tahun} disabled={!item.pagu}>
              {item.tahun}
              {item.pagu ? "" : " · belum tersedia"}
            </option>
          ))}
        </select>
      </div>

      <div className="fld">
        <label className="lb" htmlFor="f-bidang">
          Bidang
        </label>
        <select
          className="sel"
          id="f-bidang"
          value={selectedKode}
          onChange={(event) => setSelectedKode(event.target.value)}
          style={{ minWidth: 240 }}
        >
          <option value="">Semua bidang</option>
          {functions.map((item) => (
            <option value={item.kode} key={item.kode}>
              {item.nama}
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
  );

  function downloadCsv() {
    const header = ["Bidang", ...JENIS, "Total", "Realisasi", "Serapan"];
    const lines = rows.map((row) => {
      const serapan =
        row.realisasi !== null && row.total > 0 ? (row.realisasi / row.total) * 100 : null;
      return [
        row.name,
        ...row.values.map((value) => String(value).replace(".", ",")),
        String(row.total).replace(".", ","),
        row.realisasi === null ? "" : String(row.realisasi).replace(".", ","),
        serapan === null ? "" : `${fmt1(serapan).replace(".", ",")}%`,
      ];
    });
    const csv = [header, ...lines]
      .map((line) => line.map((value) => `"${value}"`).join(","))
      .join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `selaras-anggaran-${regionCode.replace(".", "-")}-${year}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const pageClass = `page${loading ? " is-updating" : ""}${flash ? " data-flash" : ""}`;

  if (!frame?.available) {
    return (
      <main className={pageClass} aria-busy={loading}>
        <section className="page-head">
          <div>
            <h1>Telusuri Anggaran</h1>
            <p className="page-sub">
              Data anggaran {frame?.region.nama ?? "daerah"} tahun {year} belum tersedia.
            </p>
          </div>
        </section>

        {filterBar}

        {loading ? (
          <div className="loading-strip" role="status" aria-live="polite">
            <span className="spinner" aria-hidden="true" />
            <span>
              Memuat anggaran {currentRegion.nama} tahun {year}…
            </span>
            <span className="skeleton loading-strip-bar" aria-hidden="true" />
          </div>
        ) : null}
        {error ? <span className="chip c-lo">{error}</span> : null}

        <section className="callout">
          <div>
            <b>Pilih daerah atau tahun lain.</b>
            <span>
              Tahun tanpa berkas sumber tidak ditampilkan sebagai angka nol. Periksa halaman
              sumber data untuk melihat ketersediaan.
            </span>
          </div>
          <Link className="btn btn-p" href="/sumber-data">
            Lihat sumber data
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className={pageClass} aria-busy={loading}>
      <section className="page-head">
        <h1 className="page-title">Telusuri Anggaran</h1>
        <p className="page-sub">
          Setiap bidang dirinci menurut jenis belanja. {frame.region.nama} · APBD {frame.tahun}.
          Pilih daerah dan tahun untuk memuat data lain.
        </p>
      </section>

      {filterBar}

      {loading ? (
        <div className="loading-strip" role="status" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          <span>
            Memuat anggaran {currentRegion.nama} tahun {year}…
          </span>
          <span className="skeleton loading-strip-bar" aria-hidden="true" />
        </div>
      ) : null}

      <div className="status-row">
        <span className={`chip ${bundle.source === "supabase" ? "c-ok" : "c-mid"}`}>
          {bundle.source === "supabase" ? "Supabase" : "Data contoh"}
        </span>
        {!loading && hasRealisasi ? <span className="chip c-ok">Realisasi tersedia</span> : null}
        {!loading && !hasRealisasi ? (
          <span className="chip c-wait">Realisasi belum tersedia</span>
        ) : null}
        {error ? <span className="chip c-lo">{error}</span> : null}
      </div>

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
            {JENIS.map((name, index) => (
              <span key={name}>
                <i style={{ background: JENIS_COLORS[index] }} />
                {name}
              </span>
            ))}
          </div>
        </div>

        <div className="pn-b">
          {chartMode === "bar" ? (
            <div>
              {rows.map((row) => (
                <div className="comp-row" key={row.kode}>
                  <div className="comp-head">
                    {canOpenDetail ? (
                      <Link
                        href={`/anggaran/${slugify(row.name)}?kode=${encodeURIComponent(
                          regionCode,
                        )}&tahun=${year}`}
                      >
                        {row.name}
                      </Link>
                    ) : (
                      <b>{row.name}</b>
                    )}
                    <span style={{ fontSize: 13.5, color: "var(--ink2)" }}>
                      {rupiahMiliar(row.total)}
                    </span>
                  </div>
                  <div style={{ width: row.width, minWidth: 40 }}>
                    <div className="comp-bar">
                      {row.values.map((value, index) =>
                        value > 0 ? (
                          <span
                            key={JENIS[index]}
                            style={{ flex: value, background: JENIS_COLORS[index] }}
                            title={`${JENIS[index]} ${rupiahMiliar(value)}`}
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
                      cx="50%"
                      cy="50%"
                      innerRadius={78}
                      outerRadius={112}
                      paddingAngle={2}
                      stroke="#fff"
                      strokeWidth={2}
                      animationDuration={900}
                    >
                      {slices.map((slice) => (
                        <Cell key={slice.name} fill={slice.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<SliceTip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="donut-center" aria-hidden="true">
                  <div className="donut-center-inner">
                    <span>
                      {selectedIndex < 0 ? "Seluruh bidang" : functions[selectedIndex]?.nama}
                    </span>
                    <b>{rupiahMiliar(grand)}</b>
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
              {hasRealisasi
                ? `Pagu dan realisasi ${frame.region.nama} tahun ${frame.tahun}.`
                : "Realisasi belum dimuat untuk tahun ini, sehingga tidak dihitung sebagai nol."}
            </span>
          </div>
          <span className={`chip ${hasRealisasi ? "c-ok" : "c-wait"}`}>
            {hasRealisasi ? "Realisasi tersedia" : "Realisasi belum tersedia"}
          </span>
        </div>
        <div className="pn-b" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div className="legend" style={{ paddingBottom: 8 }}>
            <span>
              <i style={{ background: "var(--brand)" }} />
              Anggaran (pagu)
            </span>
            <span>
              <i
                style={{
                  border: "1.5px dashed #8e9fb0",
                  background: hasRealisasi ? "#12B3A6" : "transparent",
                }}
              />
              Realisasi {hasRealisasi ? "" : "(belum tersedia)"}
            </span>
          </div>

          {pairs.map((pair) => (
            <div
              key={pair.name}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,190px) minmax(0,1fr) minmax(0,150px)",
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
                    width: hasRealisasi ? `${pair.realisasiWidth}%` : `${pair.width}%`,
                    minWidth: 6,
                    border: hasRealisasi ? 0 : "1.5px dashed #b9c9d8",
                    background: hasRealisasi ? "#12B3A6" : "transparent",
                    borderRadius: 4,
                  }}
                />
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700 }}>{rupiahMiliar(pair.total)}</div>
                <div style={{ fontSize: 12, color: "var(--ink2)" }}>
                  {pair.realisasi === null
                    ? "realisasi: belum ada"
                    : `realisasi ${rupiahMiliar(pair.realisasi)} · ${fmt1(pair.serapan ?? 0)}%`}
                </div>
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
          <button type="button" className="btn btn-s btn-sm" onClick={downloadCsv}>
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

              {rows.map((row) => {
                const serapan =
                  row.realisasi !== null && row.total > 0
                    ? (row.realisasi / row.total) * 100
                    : null;
                return (
                  <div className="tr tr-8" role="row" key={row.kode}>
                    {canOpenDetail ? (
                      <Link
                        role="cell"
                        href={`/anggaran/${slugify(row.name)}?kode=${encodeURIComponent(
                          regionCode,
                        )}&tahun=${year}`}
                      >
                        {row.name}
                      </Link>
                    ) : (
                      <span role="cell">{row.name}</span>
                    )}
                    {row.values.map((value, index) => (
                      <span role="cell" className="r" key={JENIS[index]}>
                        {cell(value)}
                      </span>
                    ))}
                    <b role="cell" className="r">
                      {fmt1(row.total)}
                    </b>
                    <span role="cell" className="r" style={{ color: "var(--ink2)" }}>
                      {row.realisasi === null ? "belum ada" : fmt1(row.realisasi)}
                    </span>
                    <span role="cell" className="r" style={{ color: "var(--ink2)" }}>
                      {serapan === null ? "belum ada" : `${fmt1(serapan)}%`}
                    </span>
                  </div>
                );
              })}

              {selectedIndex < 0 && (
                <div className="tr tr-8 tr-total" role="row">
                  <span role="cell">Seluruh bidang</span>
                  {JENIS.map((name, index) => (
                    <span className="r" role="cell" key={name}>
                      {fmt1(slices[index].value)}
                    </span>
                  ))}
                  <span className="r" role="cell">
                    {fmt1(grand)}
                  </span>
                  <span className="r" role="cell" style={{ color: "var(--ink2)", fontWeight: 500 }}>
                    {hasRealisasi ? fmt1(realisasiGrand) : "belum ada"}
                  </span>
                  <span className="r" role="cell" style={{ color: "var(--ink2)", fontWeight: 500 }}>
                    {hasRealisasi && grand > 0 ? `${fmt1((realisasiGrand / grand) * 100)}%` : "belum ada"}
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
          , Belanja Fungsi per Jenis APBD. {frame.region.nama}, APBD {frame.tahun}. Nilai kosong
          tidak diubah menjadi nol; tahun tanpa realisasi ditandai belum tersedia.
        </p>
        <Link className="btn btn-p" href="/analisis">
          Bandingkan dengan kabupaten lain
        </Link>
      </section>
    </main>
  );
}
