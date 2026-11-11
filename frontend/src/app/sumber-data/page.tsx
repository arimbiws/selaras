import Link from "next/link";
import { AlertCircle, CheckCircle2, Database } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { getDatasetSummary } from "@backend/repository";
import { COVERAGE } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

const steps = [
  "Pagu dan realisasi dipisahkan; tahun tanpa berkas sumber tidak dianggap nol.",
  "Data fakta memakai kunci daerah-tahun-status-fungsi-jenis; nilai ganda digabung dengan SUM.",
  "Kode daerah disimpan sebagai teks agar format seperti 01.00 dan 01.01 tetap utuh.",
  "Nilai kosong tidak diubah menjadi nol; hanya sel bernilai yang dimasukkan.",
  "Porsi anggaran tinggi atau rendah bukan ukuran kualitas layanan tanpa indikator kebutuhan.",
];

export default async function SumberDataPage() {
  const summary = await getDatasetSummary();
  const live = summary.source === "supabase";
  const paguYears = summary.tahun.filter((row) => row.pagu).map((row) => row.tahun);
  const realisasiYears = summary.tahun
    .filter((row) => row.realisasi)
    .map((row) => row.tahun);
  const formatYears = (years: number[]) => (years.length ? years.join(", ") : "belum tersedia");
  const metadataYears = new Set(summary.sources.map((source) => source.tahun));
  const yearsWithoutMetadata = summary.tahun
    .filter((row) => !metadataYears.has(row.tahun))
    .map((row) => row.tahun);

  const sources = [
    {
      name: "Anggaran belanja per fungsi dan jenis",
      org: "DJPK Kementerian Keuangan",
      status: live ? "Dimuat" : "Data contoh",
      ok: live,
      detail: `Pagu tersedia: ${formatYears(paguYears)}. ${summary.totalBaris.toLocaleString(
        "id-ID",
      )} baris untuk ${summary.totalDaerah} kode daerah DJPK.`,
      url: "https://djpk.kemenkeu.go.id/?p=5412",
    },
    {
      name: "Realisasi belanja per fungsi",
      org: "DJPK Kementerian Keuangan",
      status: realisasiYears.length ? "Sebagian" : "Belum dimuat",
      ok: false,
      detail: `Realisasi tersedia: ${formatYears(
        realisasiYears,
      )}. Tahun tanpa realisasi tidak diisi sebagai nol.`,
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
    { value: summary.totalBaris.toLocaleString("id-ID"), label: "baris belanja" },
    { value: String(summary.totalDaerah), label: "kode daerah" },
  ];

  return (
    <PageShell active="/sumber-data">
      <main className="page">
        <section className="page-head">
          <div>
            <h1>Sumber Data</h1>
            <p className="page-sub">
              Asal dataset, cakupan nasional, dan status ketersediaan data SELARAS.
            </p>
          </div>
          <div className="page-actions">
            <span className={`chip ${live ? "c-ok" : "c-mid"}`}>
              {live ? "Supabase" : "Data contoh"}
            </span>
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
            {live
              ? "Angka pada halaman ini dibaca dari Supabase. Tahun tanpa data ditandai belum tersedia; nilai kosong tidak diubah menjadi nol."
              : "Kredensial Supabase belum aktif, sehingga tampilan memakai data contoh Kabupaten Pacitan. Isi URL dan publishable key di .env untuk membaca data dinamis."}
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
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>
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
                Buka sumber
              </a>
            </article>
          ))}
        </section>

        <section className="pn">
          <div className="pn-h">
            <div>
              <h2 className="pn-t">Metadata Berkas Sumber</h2>
              <span className="pn-s">
                Nama berkas, tahun fiskal, status, sheet, dan tanggal publikasi dari tabel
                sumber_data.
              </span>
            </div>
            <span className={`chip ${summary.sources.length ? "c-ok" : "c-wait"}`}>
              {summary.sources.length ? `${summary.sources.length} berkas` : "Belum ada metadata"}
            </span>
          </div>
          <div className="pn-b" style={{ paddingTop: 8 }}>
            {summary.sources.length ? (
              <div className="table-wrap">
                <div style={{ minWidth: 1040 }}>
                  <div
                    className="tr"
                    style={{
                      gridTemplateColumns:
                        "minmax(0,2.2fr) minmax(0,0.55fr) minmax(0,0.7fr) minmax(0,1fr) minmax(0,0.9fr) minmax(0,1.5fr)",
                    }}
                  >
                    <span className="th">Berkas sumber</span>
                    <span className="th">Tahun</span>
                    <span className="th">Status</span>
                    <span className="th">Sheet</span>
                    <span className="th">Publikasi</span>
                    <span className="th">Catatan</span>
                  </div>
                  {summary.sources.map((source) => (
                    <div
                      className="tr"
                      key={`${source.sumberFile}-${source.status}`}
                      style={{
                        gridTemplateColumns:
                          "minmax(0,2.2fr) minmax(0,0.55fr) minmax(0,0.7fr) minmax(0,1fr) minmax(0,0.9fr) minmax(0,1.5fr)",
                      }}
                    >
                      <span style={{ fontWeight: 600, overflowWrap: "anywhere" }}>
                        {source.sumberFile}
                      </span>
                      <span>{source.tahun}</span>
                      <span>
                        <span className={`chip ${source.status === "pagu" ? "c-ok" : "c-mid"}`}>
                          {source.status}
                        </span>
                      </span>
                      <span style={{ color: "var(--ink2)" }}>{source.sheetDigunakan ?? "—"}</span>
                      <span style={{ color: "var(--ink2)" }}>
                        {source.tanggalPublikasi ?? "—"}
                      </span>
                      <span style={{ color: "var(--ink2)" }}>{source.catatan ?? "—"}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="callout">
                <div>
                  <b>Metadata sumber belum tersedia.</b>
                  <span>
                    Tabel sumber_data belum berisi baris yang dapat dibaca atau kredensial belum
                    aktif.
                  </span>
                </div>
              </div>
            )}

            {yearsWithoutMetadata.length ? (
              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  fontSize: 13,
                  color: "var(--ink2)",
                }}
              >
                <AlertCircle size={16} aria-hidden="true" style={{ flex: "0 0 16px", marginTop: 1 }} />
                <span>
                  Metadata untuk {formatYears(yearsWithoutMetadata)} belum tersedia di Supabase.
                  Paket CSV pembaruan sudah tersedia di repositori dan menunggu persetujuan impor.
                </span>
              </div>
            ) : null}
          </div>
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
              <div style={{ minWidth: 660 }}>
                <div
                  className="tr"
                  style={{
                    gridTemplateColumns:
                      "minmax(0,0.5fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1.6fr)",
                  }}
                >
                  <span className="th">Tahun</span>
                  <span className="th">Pagu</span>
                  <span className="th">Realisasi</span>
                  <span className="th">Catatan</span>
                </div>
                {summary.tahun.map((row) => (
                  <div
                    key={row.tahun}
                    className="tr"
                    style={{
                      gridTemplateColumns:
                        "minmax(0,0.5fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1.6fr)",
                    }}
                  >
                    <b>{row.tahun}</b>
                    <span style={{ color: "var(--ink2)" }}>
                      {row.pagu ? "Tersedia" : "Belum ada"}
                    </span>
                    <span style={{ color: "var(--ink2)" }}>
                      {row.realisasi ? "Tersedia" : "Belum ada"}
                    </span>
                    <span style={{ color: "var(--ink2)" }}>{row.catatan ?? "—"}</span>
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
              Halaman anggaran merinci setiap bidang menurut jenis belanja, disertai tabel yang
              dapat ditelusuri dan diunduh.
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
