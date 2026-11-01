import Link from "next/link";
import { AlertCircle, CheckCircle2, Database } from "lucide-react";
import { PageShell } from "@/components/page-shell";

const sources = [
  {
    name: "Anggaran belanja per fungsi dan jenis",
    org: "DJPK Kementerian Keuangan",
    status: "Dimuat",
    ok: true,
    detail:
      "APBD 2023 per 12 Mei 2023. Angka contoh pada halaman Anggaran berasal dari rancangan UI.",
    url: "https://djpk.kemenkeu.go.id/?p=5412",
  },
  {
    name: "Realisasi belanja",
    org: "DJPK Kementerian Keuangan",
    status: "Belum dimuat",
    ok: false,
    detail:
      "Data realisasi belum tersedia pada aplikasi. Nilai realisasi tidak ditampilkan sebagai nol.",
    url: "https://djpk.kemenkeu.go.id/?p=5412",
  },
  {
    name: "Indikator kebutuhan wilayah",
    org: "Badan Pusat Statistik",
    status: "Belum dimuat",
    ok: false,
    detail:
      "Jumlah penduduk, kemiskinan, fasilitas pendidikan dan kesehatan perlu diimpor dan divalidasi.",
    url: "https://www.bps.go.id",
  },
];

const steps = [
  "Anggaran dan realisasi harus dibedakan berdasarkan status data.",
  "Samakan kode wilayah dan tahun sebelum menggabungkan dataset.",
  "Indikator BPS perlu memiliki definisi, satuan, dan tahun rujukan yang jelas.",
  "Jangan menafsirkan porsi anggaran tinggi atau rendah sebagai kualitas layanan tanpa indikator kebutuhan.",
];

export default function SumberDataPage() {
  return (
    <PageShell active="/sumber-data" title="Sumber Data">
      <main className="page">
        <section className="page-head">
          <div>
            <h1>Sumber Data</h1>
            <p className="page-sub">
              Asal dataset, cakupan, dan status ketersediaan data SELARAS.
            </p>
          </div>
          <div className="page-actions">
            <span className="chip c-mid">Prototipe frontend</span>
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
          <AlertCircle size={18} aria-hidden="true" style={{ flex: "0 0 18px", marginTop: 1 }} />
          <span>
            Status berikut menggambarkan kesiapan prototipe frontend. Belum ada pemeriksaan otomatis
            atas kelengkapan setiap file sumber.
          </span>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 14,
          }}
        >
          {sources.map((source) => (
            <article className="src" key={source.name}>
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
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                {source.ok ? (
                  <CheckCircle2 size={15} aria-hidden="true" style={{ color: "#116a43" }} />
                ) : (
                  <Database size={15} aria-hidden="true" style={{ color: "var(--ink2)" }} />
                )}
                <span style={{ fontWeight: 600, color: "var(--ink)" }}>{source.org}</span>
              </div>
              <span>{source.detail}</span>
              <a href={source.url} target="_blank" rel="noreferrer">
                Buka sumber ↗
              </a>
            </article>
          ))}
        </section>

        <section className="pn">
          <div className="pn-h">
            <div>
              <h2 className="pn-t">Catatan Pengolahan</h2>
              <span className="pn-s">Prinsip yang dipakai sebelum data disajikan.</span>
            </div>
          </div>
          <div className="pn-b">
            <ol
              style={{
                margin: 0,
                paddingLeft: 22,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              {steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </section>

        <section className="callout">
          <div>
            <b>Lihat bagaimana data ini digunakan.</b>
            <span>
              Halaman anggaran merinci setiap bidang menurut jenis belanja, disertai tabel yang dapat
              ditelusuri.
            </span>
          </div>
          <Link className="btn btn-p" href="/anggaran">
            Lihat halaman anggaran
          </Link>
        </section>
      </main>
    </PageShell>
  );
}
