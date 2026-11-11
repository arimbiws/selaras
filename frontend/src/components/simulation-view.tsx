"use client";

import { useMemo, useState } from "react";
import { FlaskConical, Plus, RefreshCcw, Users, Wallet, X } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageShell } from "@/components/page-shell";
import type { BudgetBundle, BudgetFrame, Region } from "@backend/types";
import { CHART_COLORS, JENIS, JENIS_COLORS } from "@/lib/demo-data";

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

const formatThousands = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits).toLocaleString("id-ID") : "";
};

const parseDigits = (value: string) => Number(value.replace(/\D/g, "")) || 0;

type ChartMode = "donut" | "bar" | "line" | "area";
type Slice = { name: string; value: number; share: number; color: string };
type CustomParameter = { id: string; name: string; share: number };

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

export function SimulationView({
  initialBundle,
  regions,
}: {
  initialBundle: BudgetBundle;
  regions: Region[];
}) {
  const [bundle, setBundle] = useState<BudgetBundle | null>(null);
  const [regionCode, setRegionCode] = useState("");
  const [year, setYear] = useState(initialBundle.tahun);
  const [baseline, setBaseline] = useState<BudgetFrame | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [budget, setBudget] = useState("");
  const [population, setPopulation] = useState("");
  const [employee, setEmployee] = useState(0);
  const [goods, setGoods] = useState(0);
  const [capital, setCapital] = useState(0);
  const [customs, setCustoms] = useState<CustomParameter[]>([]);
  const [chartMode, setChartMode] = useState<ChartMode>("donut");

  const customTotal = customs.reduce((sum, item) => sum + item.share, 0);
  const other = 100 - employee - goods - capital - customTotal;
  const total = parseDigits(budget);
  const pop = parseDigits(population);
  const valid = other >= -0.001;
  const perCapita = pop > 0 ? total / pop : 0;

  const slices: Slice[] = useMemo(() => {
    const rows: Array<{ name: string; share: number; color: string }> = [
      { name: JENIS[0], share: employee, color: JENIS_COLORS[0] },
      { name: JENIS[1], share: goods, color: JENIS_COLORS[1] },
      { name: JENIS[2], share: capital, color: JENIS_COLORS[2] },
      ...customs.map((item, index) => ({
        name: item.name.trim() || `Parameter ${index + 1}`,
        share: item.share,
        color: CHART_COLORS[(4 + index) % CHART_COLORS.length],
      })),
      { name: JENIS[3], share: Math.max(0, other), color: JENIS_COLORS[3] },
    ];
    return rows.map((row) => ({
      ...row,
      value: (total * row.share) / 100,
    }));
  }, [capital, customs, employee, goods, other, total]);

  const years = bundle?.years.length ? bundle.years : initialBundle.years;
  const yearOptions = years.some((item) => item.tahun === year)
    ? years
    : [{ tahun: year, pagu: Boolean(baseline), realisasi: false }, ...years];

  function applyBaseline(frame: BudgetFrame) {
    setBaseline(frame);
    setBudget(formatThousands(String(Math.round(frame.totalMiliar * 1_000_000_000))));
    setEmployee(Math.round(frame.jenis[0]?.share ?? 0));
    setGoods(Math.round(frame.jenis[1]?.share ?? 0));
    setCapital(Math.round(frame.jenis[2]?.share ?? 0));
    setCustoms([]);
  }

  async function loadBaseline(nextRegion: string, nextYear = 0) {
    if (!nextRegion) {
      setBundle(null);
      setBaseline(null);
      setRegionCode("");
      setBudget("");
      return;
    }

    setRegionCode(nextRegion);
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/budget?kode=${encodeURIComponent(nextRegion)}&tahun=${nextYear}`,
        { cache: "no-store" },
      );
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Baseline tidak dapat dimuat.");
      }
      const next = (await response.json()) as BudgetBundle;
      setBundle(next);
      setYear(next.tahun);
      if (next.pagu?.available) {
        applyBaseline(next.pagu);
      } else {
        setBaseline(null);
        setBudget("");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Baseline tidak dapat dimuat.");
      setBaseline(null);
    } finally {
      setLoading(false);
    }
  }

  function chooseYear(nextYear: number) {
    setYear(nextYear);
    if (regionCode) void loadBaseline(regionCode, nextYear);
  }

  function reset() {
    setBudget("");
    setPopulation("");
    setEmployee(0);
    setGoods(0);
    setCapital(0);
    setCustoms([]);
    setBaseline(null);
    setBundle(null);
    setRegionCode("");
    setError("");
  }

  function addCustom() {
    if (customs.length >= 3) return;
    setCustoms((items) => [
      ...items,
      {
        id: `custom-${Date.now()}`,
        name: `Parameter ${items.length + 1}`,
        share: 0,
      },
    ]);
  }

  function updateCustom(id: string, patch: Partial<CustomParameter>) {
    setCustoms((items) =>
      items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function removeCustom(id: string) {
    setCustoms((items) => items.filter((item) => item.id !== id));
  }

  const controls: Array<{
    label: string;
    value: number;
    color: string;
    setValue: (value: number) => void;
  }> = [
    { label: "Pegawai", value: employee, color: JENIS_COLORS[0], setValue: setEmployee },
    { label: "Barang dan jasa", value: goods, color: JENIS_COLORS[1], setValue: setGoods },
    { label: "Modal", value: capital, color: JENIS_COLORS[2], setValue: setCapital },
  ];

  return (
    <PageShell active="/simulasi">
      <main className="page">
        <section className="page-head">
          <div>
            <h1>Simulasi Alokasi</h1>
            <p className="page-sub">
              Ubah porsi jenis belanja dan lihat dampaknya terhadap nominal alokasi serta belanja
              per penduduk. Pilih baseline atau masukkan anggaran secara manual.
            </p>
          </div>
          <div className="page-actions">
            <span className={`chip ${baseline ? "c-ok" : "c-mid"}`}>
              {baseline ? "Baseline dipilih" : "Input manual"}
            </span>
          </div>
        </section>

        <section className="pn sim-baseline">
          <div className="pn-h">
            <div>
              <h2 className="pn-t">Baseline Simulasi</h2>
              <span className="pn-s">
                Baseline tidak dipilih otomatis. Data baru dimuat setelah Anda memilih daerah dan
                tahun.
              </span>
            </div>
            <button type="button" className="btn btn-s btn-sm" onClick={reset}>
              <RefreshCcw size={14} aria-hidden="true" />
              Reset
            </button>
          </div>
          <div className="pn-b sim-baseline-body">
            <div className="sim-baseline-controls">
              <label className="fld">
                <span className="lb">Pilih kabupaten/kota</span>
                <select
                  className="sel"
                  value={regionCode}
                  onChange={(event) => void loadBaseline(event.target.value)}
                  style={{ minWidth: 240 }}
                >
                  <option value="">Pilih baseline (opsional)</option>
                  {regions.map((region) => (
                    <option value={region.kodeDjpk} key={region.kodeDjpk}>
                      {region.nama}
                    </option>
                  ))}
                </select>
              </label>
              <label className="fld">
                <span className="lb">Tahun baseline</span>
                <select
                  className="sel"
                  value={String(year)}
                  disabled={!regionCode}
                  onChange={(event) => chooseYear(Number(event.target.value))}
                  style={{ minWidth: 120 }}
                >
                  {yearOptions.map((item) => (
                    <option value={item.tahun} key={item.tahun} disabled={!item.pagu}>
                      {item.tahun}
                      {item.pagu ? "" : " — belum tersedia"}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className={`sim-baseline-note${baseline ? " ready" : ""}`}>
              <b>{baseline ? baseline.region.nama : "Belum ada baseline"}</b>
              <span>
                {loading
                  ? "Memuat data baseline…"
                  : baseline
                    ? `APBD ${baseline.tahun}. Total dan porsi awal diisi dari baseline ini. Anda tetap dapat mengubah semuanya.`
                    : "Isi total anggaran secara manual atau pilih daerah untuk mengambil pagu APBD terbaru."}
              </span>
            </div>
            {error ? <span className="chip c-lo">{error}</span> : null}
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
              <label className="fld">
                <span className="lb">Total anggaran (rupiah)</span>
                <input
                  className="sel"
                  inputMode="numeric"
                  value={formatThousands(budget)}
                  onChange={(event) => setBudget(event.target.value.replace(/\D/g, ""))}
                  placeholder="Contoh: 1.540.000.000.000"
                  style={{ minWidth: 0, width: "100%", height: 44 }}
                />
              </label>

              <label className="fld">
                <span className="lb">Jumlah penduduk</span>
                <input
                  className="sel"
                  inputMode="numeric"
                  value={formatThousands(population)}
                  onChange={(event) => setPopulation(event.target.value.replace(/\D/g, ""))}
                  placeholder="Contoh: 600.000"
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
                      style={{ width: "100%", accentColor: control.color }}
                    />
                  </label>
                ))}
              </div>

              <div className="sim-custom-head">
                <div>
                  <b>Parameter tambahan</b>
                  <span>Tambahkan kategori alokasi lain sesuai skenario Anda.</span>
                </div>
                <button
                  type="button"
                  className="btn btn-s btn-sm"
                  onClick={addCustom}
                  disabled={customs.length >= 3}
                >
                  <Plus size={14} aria-hidden="true" />
                  Tambah
                </button>
              </div>

              {customs.length ? (
                <div className="sim-custom-list">
                  {customs.map((item) => (
                    <div className="sim-custom-item" key={item.id}>
                      <input
                        className="sel sim-custom-name"
                        value={item.name}
                        onChange={(event) => updateCustom(item.id, { name: event.target.value })}
                        aria-label="Nama parameter tambahan"
                      />
                      <input
                        className="sel sim-custom-share"
                        type="number"
                        min={0}
                        max={100}
                        value={item.share}
                        onChange={(event) =>
                          updateCustom(item.id, {
                            share: Math.max(0, Math.min(100, Number(event.target.value) || 0)),
                          })
                        }
                        aria-label="Porsi parameter tambahan"
                      />
                      <span>%</span>
                      <button
                        type="button"
                        className="sim-custom-remove"
                        onClick={() => removeCustom(item.id)}
                        aria-label={`Hapus ${item.name}`}
                      >
                        <X size={15} aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}

              <div
                className="note"
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
              <div className="seg" role="group" aria-label="Jenis grafik simulasi">
                <button
                  type="button"
                  aria-pressed={chartMode === "donut"}
                  onClick={() => setChartMode("donut")}
                >
                  Donat
                </button>
                <button
                  type="button"
                  aria-pressed={chartMode === "bar"}
                  onClick={() => setChartMode("bar")}
                >
                  Batang
                </button>
                <button
                  type="button"
                  aria-pressed={chartMode === "line"}
                  onClick={() => setChartMode("line")}
                >
                  Garis
                </button>
                <button
                  type="button"
                  aria-pressed={chartMode === "area"}
                  onClick={() => setChartMode("area")}
                >
                  Area
                </button>
              </div>
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

              {total > 0 ? (
                <div className="sim-chart">
                  {chartMode === "donut" ? (
                    <div
                      className="sim-donut"
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
                  ) : chartMode === "bar" ? (
                    <div style={{ width: "100%", height: 260 }}>
                      <ResponsiveContainer>
                        <BarChart
                          data={slices}
                          layout="vertical"
                          margin={{ top: 6, right: 22, left: 6, bottom: 6 }}
                        >
                          <CartesianGrid horizontal={false} stroke="#eaf1f8" />
                          <XAxis
                            type="number"
                            tick={{ fill: "#5c7590", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `${value}%`}
                          />
                          <YAxis
                            type="category"
                            dataKey="name"
                            width={110}
                            tick={{ fill: "#5c7590", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip content={<SliceTip />} />
                          <Bar dataKey="share" radius={[0, 7, 7, 0]} maxBarSize={24}>
                            {slices.map((slice) => (
                              <Cell key={slice.name} fill={slice.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div style={{ width: "100%", height: 260 }} role="img" aria-label="Tren porsi simulasi">
                      <ResponsiveContainer>
                        {chartMode === "line" ? (
                          <LineChart
                            data={slices}
                            margin={{ top: 8, right: 16, left: -14, bottom: 6 }}
                          >
                            <CartesianGrid vertical={false} stroke="#eaf1f8" />
                            <XAxis
                              dataKey="name"
                              tick={{ fill: "#5c7590", fontSize: 10.5 }}
                              axisLine={false}
                              tickLine={false}
                              interval={0}
                            />
                            <YAxis
                              tick={{ fill: "#7c93a9", fontSize: 11 }}
                              axisLine={false}
                              tickLine={false}
                              unit="%"
                              width={44}
                            />
                            <Tooltip content={<SliceTip />} />
                            <Line
                              type="monotone"
                              dataKey="share"
                              name="Porsi"
                              stroke="#2F6BFF"
                              strokeWidth={2.6}
                              dot={{ r: 4 }}
                              animationDuration={700}
                            />
                          </LineChart>
                        ) : (
                          <AreaChart
                            data={slices}
                            margin={{ top: 8, right: 16, left: -14, bottom: 6 }}
                          >
                            <defs>
                              <linearGradient id="simArea" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#2F6BFF" stopOpacity={0.32} />
                                <stop offset="100%" stopColor="#2F6BFF" stopOpacity={0.02} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} stroke="#eaf1f8" />
                            <XAxis
                              dataKey="name"
                              tick={{ fill: "#5c7590", fontSize: 10.5 }}
                              axisLine={false}
                              tickLine={false}
                              interval={0}
                            />
                            <YAxis
                              tick={{ fill: "#7c93a9", fontSize: 11 }}
                              axisLine={false}
                              tickLine={false}
                              unit="%"
                              width={44}
                            />
                            <Tooltip content={<SliceTip />} />
                            <Area
                              type="monotone"
                              dataKey="share"
                              name="Porsi"
                              stroke="#2F6BFF"
                              strokeWidth={2.6}
                              fill="url(#simArea)"
                              animationDuration={700}
                            />
                          </AreaChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              ) : (
                <div className="sim-empty">
                  <FlaskConical aria-hidden="true" />
                  <div>
                    <b>Belum ada angka untuk dihitung.</b>
                    <span>
                      Masukkan total anggaran atau pilih baseline. Grafik dan belanja per penduduk
                      akan muncul setelah ada nilai.
                    </span>
                  </div>
                </div>
              )}

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
                      <span>
                        {rupiah(slice.value)} · {slice.share}%
                      </span>
                    </div>
                    <div className="trk">
                      <i
                        style={{
                          width: `${Math.min(100, Math.max(0, slice.share))}%`,
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
          penduduk dihitung dari total anggaran dibagi jumlah penduduk yang diisi. Perubahan tidak
          disimpan dan tidak mengubah data resmi.
        </p>
      </main>
    </PageShell>
  );
}
