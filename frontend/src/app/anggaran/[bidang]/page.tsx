import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { DEMO_REGION } from "@backend/constants";
import { getCachedAnalysis } from "@/lib/analysis-cache";
import { getCachedBudget } from "@/lib/budget-cache";
import type { ComparisonStatus } from "@backend/types";
import { JENIS, JENIS_COLORS, fmt1, rupiahMiliar, slugify } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

const statusLabel: Record<ComparisonStatus, string> = {
  high: "Tinggi",
  mid: "Sebanding",
  low: "Rendah",
};

const statusClass: Record<ComparisonStatus, string> = {
  high: "c-hi",
  mid: "c-mid",
  low: "c-lo",
};

export default async function DetailAnggaran({
  params,
  searchParams,
}: {
  params: Promise<{ bidang: string }>;
  searchParams: Promise<{ kode?: string; tahun?: string }>;
}) {
  const { bidang } = await params;
  const query = await searchParams;
  const kodeDjpk = /^\d{2}\.\d{2}$/.test(query.kode ?? "")
    ? query.kode!
    : DEMO_REGION.kodeDjpk;
  const parsedYear = Number(query.tahun);
  const tahun =
    Number.isInteger(parsedYear) && parsedYear >= 2020 && parsedYear <= 2026
      ? parsedYear
      : undefined;

  const [bundle, analysis] = await Promise.all([
    getCachedBudget(kodeDjpk, tahun ?? 0),
    getCachedAnalysis(kodeDjpk, tahun ?? 0),
  ]);
  const frame = bundle.pagu;
  const realisasi = bundle.realisasi;

  if (!frame?.available) notFound();

  const item = frame.functions.find(
    (row) => slugify(row.nama) === decodeURIComponent(bidang),
  );
  if (!item) notFound();

  const metric = analysis.functions.find((row) => row.kode === item.kode);
  const rank = metric?.rankNasional ?? null;
  const comparisonCount = analysis.comparisonCountNasional;
  const status = metric?.statusNasional ?? null;
  const topIndex = item.values.indexOf(Math.max(...item.values));
  const realisasiItem = realisasi?.functions.find((row) => row.kode === item.kode);
  const serapan =
    realisasiItem && item.totalMiliar > 0
      ? (realisasiItem.totalMiliar / item.totalMiliar) * 100
      : null;
  const backHref = `/anggaran?kode=${encodeURIComponent(kodeDjpk)}&tahun=${frame.tahun}`;

  return (
    <PageShell active="/anggaran">
      <main className="page">
        <section className="page-head">
          <div>
            <h1>{item.nama}</h1>
            <p className="page-sub">
              Rincian alokasi menurut jenis belanja · {frame.region.nama} · APBD {frame.tahun}
            </p>
          </div>
          <div className="page-actions">
            <Link className="btn btn-s" href={backHref}>
              Kembali ke anggaran
            </Link>
          </div>
        </section>

        <section
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            background: "var(--sub)",
            border: "1px solid var(--line)",
            borderRadius: 14,
            padding: "14px 16px",
            fontSize: 13.5,
            color: "var(--ink2)",
          }}
        >
          <span>
            Angka berasal dari {frame.source === "supabase" ? "Supabase" : "data contoh"}.
            Realisasi {realisasiItem ? "tersedia" : "belum tersedia"} untuk bidang ini dan tidak
            ditampilkan sebagai nol.
          </span>
        </section>

        <section aria-label="Indikator bidang" className="grid-kpi">
          <article className="kpi">
            <div className="kpi-b">
              <div className="kpi-h">Total alokasi</div>
              <div className="kpi-v">{rupiahMiliar(item.totalMiliar)}</div>
            </div>
            <div className="kpi-f">Dalam miliar rupiah</div>
          </article>

          <article className="kpi">
            <div className="kpi-b">
              <div className="kpi-h">Porsi dari total belanja</div>
              <div className="kpi-v">{fmt1(item.share)}%</div>
            </div>
            <div className="kpi-f">
              {frame.region.nama}, {frame.tahun}
            </div>
          </article>

          <article className="kpi">
            <div className="kpi-b">
              <div className="kpi-h">
                Peringkat porsi
                {status ? <span className={`chip ${statusClass[status]}`}>{statusLabel[status]}</span> : null}
              </div>
              <div className="kpi-v">
                {rank === null ? "—" : `${rank} / ${comparisonCount}`}
              </div>
            </div>
            <div className="kpi-f">
              {analysis.available ? "Di antara daerah dengan jenis yang sama" : "Pembanding belum tersedia"}
            </div>
          </article>

          <article className="kpi">
            <div className="kpi-b">
              <div className="kpi-h">Komponen terbesar</div>
              <div className="kpi-v" style={{ fontSize: 24 }}>
                {JENIS[topIndex] ?? "—"}
              </div>
            </div>
            <div className="kpi-f">
              {item.totalMiliar > 0
                ? `${fmt1(((item.values[topIndex] ?? 0) / item.totalMiliar) * 100)}% dari anggaran bidang`
                : "Belum ada komponen bernilai"}
            </div>
          </article>
        </section>

        <section className="section-split">
          <div className="pn" style={{ flex: "1 1 520px", minWidth: 0 }}>
            <div className="pn-h">
              <div>
                <h2 className="pn-t">Komponen Belanja</h2>
                <span className="pn-s">Nominal, porsi, dan realisasi bidang</span>
              </div>
              <span className={`chip ${serapan === null ? "c-wait" : "c-ok"}`}>
                {serapan === null ? "Realisasi belum ada" : `Serapan ${fmt1(serapan)}%`}
              </span>
            </div>
            <div className="pn-b" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {JENIS.map((jenis, index) => {
                const value = item.values[index] ?? 0;
                const width = item.totalMiliar > 0 ? (value / item.totalMiliar) * 100 : 0;
                const actual = realisasiItem?.values[index] ?? null;
                return (
                  <div key={jenis} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                        gap: "4px 16px",
                      }}
                    >
                      <b>{jenis}</b>
                      <span style={{ color: "var(--ink2)", fontSize: 13.5 }}>
                        {rupiahMiliar(value)} · {fmt1(width)}%
                        {actual === null ? " · realisasi belum ada" : ` · realisasi ${rupiahMiliar(actual)}`}
                      </span>
                    </div>
                    <div className="trk">
                      <i
                        style={{
                          width: `${Math.max(width, value > 0 ? 2 : 0)}%`,
                          background: JENIS_COLORS[index],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pn" style={{ flex: "1 1 360px", minWidth: 0 }}>
            <div className="pn-h">
              <div>
                <h2 className="pn-t">Ringkasan Cepat</h2>
                <span className="pn-s">Perbandingan komponen dalam bidang ini</span>
              </div>
            </div>
            <div className="pn-b" style={{ padding: "8px 14px" }}>
              <div
                className="tr"
                style={{ gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)" }}
              >
                <span className="th">Jenis</span>
                <span className="th r">Pagu</span>
              </div>
              {JENIS.map((jenis, index) => (
                <div
                  key={jenis}
                  className="tr"
                  style={{ gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)" }}
                >
                  <span style={{ fontWeight: 600 }}>{jenis}</span>
                  <b className="r">{fmt1(item.values[index] ?? 0)} miliar</b>
                </div>
              ))}
              <div
                className="tr tr-total"
                style={{ gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)" }}
              >
                <span>Total bidang</span>
                <b className="r">{fmt1(item.totalMiliar)} miliar</b>
              </div>
            </div>
          </div>
        </section>

        <section className="callout">
          <div>
            <b>Bandingkan dengan daerah lain.</b>
            <span>
              Analisis kebutuhan menempatkan porsi bidang ini pada peringkat nasional dan menyusun
              pertanyaan tinjauan.
            </span>
          </div>
          <Link
            className="btn btn-p"
            href={`/analisis?kode=${encodeURIComponent(kodeDjpk)}&tahun=${frame.tahun}`}
          >
            Buka analisis kebutuhan
          </Link>
        </section>
      </main>
    </PageShell>
  );
}
