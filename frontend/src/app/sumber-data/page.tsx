import Link from "next/link";
import { AlertCircle, CheckCircle2, Database } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { COVERAGE } from "@/lib/demo-data";

const sources = [
  {
    name: "Anggaran belanja per fungsi dan jenis",
    org: "DJPK Kementerian Keuangan",
    status: "Dimuat",
    ok: true,
    detail:
      "APBD 2020, 2021, 2022, dan pagu 2025. Total 125.757 baris untuk 572 kode daerah DJPK.",
    url: "https://djpk.kemenkeu.go.id/?p=5412",
  },
  {
    name: "Realisasi belanja per fungsi",
    org: "DJPK Kementerian Keuangan",
    status: "Sebagian",
    ok: false,
    detail:
      "Tersedia untuk 2020–2022. Sebagian nilai realisasi 2021 merupakan hasil olahan proporsional sesuai disclaimer DJPK.",
    url: "https://djpk.kemenkeu.go.id/?p=5412",
  },
  {
    name: "Referensi wilayah Kemendagri",
    org: "Kementerian Dalam Negeri",
    status: "Dimuat",
    ok: true,
    detail:
      "38 provinsi, 514 kabupaten/kota, 7.285 kecamatan, dan 83.762 desa/kelurahan. Kode BPS belum diisi.",
    url: "https://kemendagri.go.id",
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

const coverage = [
  { value: String(COVERAGE.kabupatenKota), label: "kabupaten/kota" },
  { value: String(COVERAGE.provinsi), label: "provinsi" },
  { value: String(COVERAGE.kecamatan.toLocaleString("id-ID")), label: "kecamatan" },
  { value: String(COVERAGE.desa.toLocaleString("id-ID")), label: "desa/kelurahan" },
];

const years = [
  { year: "2020", pagu: "Tersedia", realisasi: "Tersedia" },
  { year: "2021", pagu: "Tersedia", realisasi: "Tersedia (proporsional)" },
  { year: "2022", pagu: "Tersedia", realisasi: "Tersedia" },
  { year: "2023", pagu: "Belum ada", realisasi: "Belum ada" },
  { year: "2024", pagu: "Belum ada", realisasi: "Belum ada" },
  { year: "2025", pagu: "Tersedia (18 Sep 2025)", realisasi: "Belum ada" },
];

const steps = [
  "Anggaran (pagu) dan realisasi dipisahkan; tahun tanpa berkas sumber tidak dianggap nol.",
  "Data fakta memakai kunci daerah-tahun-status-fungsi-jenis; tidak ada duplikasi kunci.",
  "Kode wilayah diseragamkan dengan referensi Kemendagri; kode BPS belum diisi.",
  "Nilai kosong tidak diubah menjadi nol; hanya sel bernilai yang dimasukkan.",
  "Porsi anggaran tinggi atau rendah bukan ukuran kualitas layanan tanpa indikator kebutuhan.",
];

export default function SumberDataPage() {
  return (
    <PageShell active="/sumber-data" title="Sumber Data">
      <main className="page">
        <section className="page-head">
          <div>
            <h1>Sumber Data</h1>
            <p className="page-sub">
              Asal dataset, cakupan nasional, dan status ketersediaan data SELARAS.
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
            Status berikut menggambarkan kesiapan prototipe frontend. Tampilan contoh memakai
            anggaran Kabupaten Pacitan; model data mencakup seluruh Indonesia.
          </span>
        </section>

        <section
          aria-label="Cakupan wilayah"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 14,
          }}
        >
          {coverage.map((item) => (
            <div
              key={item.label}
              style={{
                background: "var(--soft)",
                borderRadius: 16,
                padding: "18px 20px",
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>
                {item.value}
              </div>
              <div style={{ fontSize: 13, color: "var(--ink2)" }}>{item.label}</div>
            </div>
          ))}
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
                  <Database size={15} aria-hidden="true" style={{ color: "var(--accent)" }} />
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
              <h2 className="pn-t">Ketersediaan Data per Tahun</h2>
              <span className="pn-s">
                Tahun tanpa berkas sumber tidak ditampilkan sebagai angka nol.
              </span>
            </div>
          </div>
          <div className="pn-b" style={{ paddingTop: 8 }}>
            <div className="table-wrap">
              <div style={{ minWidth: 560 }}>
                <div
                  className="tr"
                  style={{ gridTemplateColumns: "minmax(0,0.6fr) minmax(0,1fr) minmax(0,1.4fr)" }}
                >
                  <span className="th">Tahun</span>
                  <span className="th">Pagu</span>
                  <span className="th">Realisasi</span>
                </div>
                {years.map((row) => (
                  <div
                    key={row.year}
                    className="tr"
                    style={{ gridTemplateColumns: "minmax(0,0.6fr) minmax(0,1fr) minmax(0,1.4fr)" }}
                  >
                    <b>{row.year}</b>
                    <span style={{ color: "var(--ink2)" }}>{row.pagu}</span>
                    <span style={{ color: "var(--ink2)" }}>{row.realisasi}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
              ditelusuri dan diunduh.
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
