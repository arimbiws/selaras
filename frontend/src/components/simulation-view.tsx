"use client";

import { useMemo, useState } from "react";
import { FlaskConical, Users, Wallet } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PageShell } from "@/components/page-shell";
import type { BudgetBundle } from "@backend/types";
import { JENIS, JENIS_COLORS } from "@/lib/demo-data";

const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const compactRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

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
      <span>{rupiah(slice.value)}</span>
      <span>{slice.share.toFixed(1)}% dari total</span>
    </div>
  );
}

export function SimulationView({ bundle }: { bundle: BudgetBundle }) {
  const frame = bundle.pagu;
  const baselineTotal = frame?.available
    ? Math.round(frame.totalMiliar * 1_000_000_000)
    : 0;
  const baselineShares = frame?.jenis.map((item) => Math.round(item.share)) ?? [];
  const [budget, setBudget] = useState(baselineTotal ? String(baselineTotal) : "");
  const [population, setPopulation] = useState("600000");
  const [employee, setEmployee] = useState(baselineShares[0] ?? 45);
  const [goods, setGoods] = useState(baselineShares[1] ?? 24);
  const [capital, setCapital] = useState(baselineShares[2] ?? 12);

  const other = 100 - employee - goods - capital;
  const total = Number(budget) || 0;
  const pop = Number(population) || 0;
  const valid = other >= 0;

  const shares = useMemo(() => [employee, goods, capital, Math.max(0, other)], [
    employee,
    goods,
    capital,
    other,
  ]);

  const slices: Slice[] = JENIS.map((name, j) => ({
    name,
    value: (total * shares[j]) / 100,
    share: shares[j],
    color: JENIS_COLORS[j],
  }));

  const perCapita = pop > 0 ? total / pop : 0;

  const controls: Array<{
    label: string;
    value: number;
    setValue: (value: number) => void;
  }> = [
    { label: "Pegawai", value: employee, setValue: setEmployee },
    { label: "Barang dan jasa", value: goods, setValue: setGoods },
    { label: "Modal", value: capital, setValue: setCapital },
  ];

  return (
    <PageShell active="/simulasi">
      <main className="page">
        <section className="page-head">
          <div>
            <h1>Simulasi Alokasi</h1>
            <p className="page-sub">
              Ubah porsi jenis belanja dan lihat dampaknya terhadap nominal alokasi serta belanja
              per penduduk.{" "}
              {frame?.available
                ? `Nilai awal memakai ${frame.region.nama} APBD ${frame.tahun} dari ${
                    frame.source === "supabase" ? "Supabase" : "data contoh"
                  }.`
                : "Baseline daerah belum tersedia; masukkan total anggaran secara manual."}
            </p>
          </div>
          <div className="page-actions">
            <span className={`chip ${frame?.source === "supabase" ? "c-ok" : "c-mid"}`}>
              {frame?.source === "supabase" ? "Baseline Supabase" : "Simulasi mandiri"}
            </span>
          </div>
        </section>

        <section className="section-split">
          <div className="pn" style={{ flex: "1 1 420px", minWidth: 0 }}>
            <div className="pn-h">
              <div>
                <h2 className="pn-t">Parameter Skenario</h2>
                <span className="pn-s">
                  Perubahan tidak disimpan dan tidak mengubah APBD aktual.
                </span>
              </div>
              <span className="ico" style={{ background: "var(--brand)" }}>
                <FlaskConical aria-hidden="true" />
              </span>
            </div>

            <div className="pn-b" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div className="note" style={{ background: "var(--sub)" }}>
                <span>
                  Baseline:{" "}
                  <b>
                    {frame?.available
                      ? `${frame.region.nama}, APBD ${frame.tahun}`
                      : "belum tersedia"}
                  </b>
                  . Simulasi tidak menyimpan perubahan dan tidak mengubah data Supabase.
                </span>
              </div>

              <label className="fld">
                <span className="lb">Total anggaran (rupiah)</span>
                <input
                  className="sel"
                  inputMode="numeric"
                  value={budget}
                  onChange={(event) => setBudget(event.target.value.replace(/[^0-9]/g, ""))}
                  style={{ minWidth: 0, width: "100%", height: 44 }}
                />
              </label>

              <label className="fld">
                <span className="lb">Jumlah penduduk</span>
                <input
                  className="sel"
                  inputMode="numeric"
                  value={population}
                  onChange={(event) => setPopulation(event.target.value.replace(/[^0-9]/g, ""))}
                  style={{ minWidth: 0, width: "100%", height: 44 }}
                />
              </label>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {controls.map((control) => (
                  <label className="fld" key={control.label}>
                    <span
                      className="lb"
                      style={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <span>{control.label}</span>
                      <span style={{ color: "var(--brandink)", fontSize: 13 }}>
                        {control.value}%
                      </span>
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={control.value}
                      onChange={(event) => control.setValue(Number(event.target.value))}
                      style={{ width: "100%", accentColor: "#086288" }}
                    />
                  </label>
                ))}
              </div>

              <div
                className={valid ? "note" : "note"}
                style={{
                  background: valid ? "var(--sub)" : "#fdefdd",
                  color: valid ? "var(--ink2)" : "#8a4a06",
                }}
              >
                <span>
                  Porsi lainnya: <b>{Math.max(0, other)}%</b>.{" "}
                  {valid
                    ? "Total alokasi tidak melebihi 100%."
                    : "Total porsi melebihi 100%; kurangi salah satu komponen."}
                </span>
              </div>
            </div>
          </div>

          <div className="pn" style={{ flex: "1 1 480px", minWidth: 0 }}>
            <div className="pn-h">
              <div>
                <h2 className="pn-t">Hasil Simulasi</h2>
                <span className="pn-s">Nominal dan porsi hasil skenario Anda</span>
              </div>
              <span className="chip c-ok">Skenario aktif</span>
            </div>

            <div className="pn-b" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div className="grid-kpi" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div className="kpi">
                  <div className="kpi-b" style={{ padding: "14px 16px", gap: 6 }}>
                    <div className="kpi-h" style={{ fontSize: 12.5 }}>
                      <span className="ico" style={{ background: "var(--brand)", width: 28, height: 28 }}>
                        <Wallet aria-hidden="true" />
                      </span>
                      Total dialokasikan
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>{compactRupiah(total)}</div>
                  </div>
                </div>
                <div className="kpi">
                  <div className="kpi-b" style={{ padding: "14px 16px", gap: 6 }}>
                    <div className="kpi-h" style={{ fontSize: 12.5 }}>
                      <span className="ico" style={{ background: "var(--accent)", width: 28, height: 28 }}>
                        <Users aria-hidden="true" />
                      </span>
                      Belanja per penduduk
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>{rupiah(perCapita)}</div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "24px 32px",
                }}
              >
                <div
                  style={{ position: "relative", width: 210, height: 210, flex: "0 0 210px" }}
                  role="img"
                  aria-label={`Komposisi simulasi: ${slices
                    .map((slice) => `${slice.name} ${slice.share}%`)
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
                        innerRadius={64}
                        outerRadius={96}
                        paddingAngle={2}
                        stroke="#fff"
                        strokeWidth={2}
                        animationDuration={700}
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
                      <span>Total</span>
                      <b>{compactRupiah(total)}</b>
                    </div>
                  </div>
                </div>

                <div style={{ flex: "1 1 240px", minWidth: 0 }}>
                  {slices.map((slice) => (
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
                      <span style={{ color: "var(--ink2)" }}>{rupiah(slice.value)}</span>
                      <b style={{ minWidth: 44, textAlign: "right" }}>{slice.share}%</b>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {slices.map((slice) => (
                  <div key={slice.name} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12.5,
                        color: "var(--ink2)",
                      }}
                    >
                      <span>{slice.name}</span>
                      <span>{rupiah(slice.value)}</span>
                    </div>
                    <div className="trk">
                      <i
                        style={{
                          width: `${Math.min(100, slice.share)}%`,
                          background: slice.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink2)" }}>
          Simulasi ini menggunakan asumsi porsi jenis belanja dan bukan proyeksi resmi. Belanja per
          penduduk dihitung dari total anggaran dibagi jumlah penduduk yang diisi. Nilai awal
          mengikuti data APBD terbaru yang tersedia; jumlah penduduk tetap diisi manual karena
          indikator BPS belum dimuat.
        </p>
      </main>
    </PageShell>
  );
}
