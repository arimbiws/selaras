import Link from "next/link";
import { AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { CountUp } from "@/components/landing/count-up";
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
  const metadataByKey = new Map<string, string[]>();
  for (const source of summary.sources) {
    const key = `${source.tahun}:${source.status}`;
    metadataByKey.set(key, [...(metadataByKey.get(key) ?? []), source.sumberFile]);
  }

  const missingMetadata = summary.tahun.flatMap((row) => {
    const missing: Array<{ tahun: number; status: "pagu" | "realisasi" }> = [];
    if (row.pagu && !metadataByKey.has(`${row.tahun}:pagu`)) {
      missing.push({ tahun: row.tahun, status: "pagu" });
    }
    if (row.realisasi && !metadataByKey.has(`${row.tahun}:realisasi`)) {
      missing.push({ tahun: row.tahun, status: "realisasi" });
    }
    return missing;
  });

  const duplicateMetadata = Array.from(metadataByKey.entries())
    .filter(([, files]) => files.length > 1)
    .map(([key, files]) => {
      const [tahun, status] = key.split(":");
      return {
        tahun: Number(tahun),
        status: status as "pagu" | "realisasi",
        files,
      };
    });

  const formatMissingMetadata = () =>
    missingMetadata.map((item) => `${item.tahun} ${item.status}`).join(", ");
  const incompleteMetadata = summary.sources.filter(
    (source) => !source.sheetDigunakan || !source.tanggalPublikasi,
  );

  const sources = [
    {
      name: "Anggaran belanja per fungsi dan jenis",
      org: "DJPK Kementerian Keuangan",
      detail: `Pagu tersedia: ${formatYears(paguYears)}. ${summary.totalBaris.toLocaleString(
        "id-ID",
      )} baris untuk ${summary.totalDaerah} kode daerah DJPK.`,
      url: "https://djpk.kemenkeu.go.id/?p=5412",
      cta: "Buka portal DJPK",
    },
    {
      name: "Realisasi belanja per fungsi",
      org: "DJPK Kementerian Keuangan",
      detail: `Realisasi tersedia: ${formatYears(
        realisasiYears,
      )}. Tahun tanpa realisasi tidak diisi sebagai nol.`,
      url: "https://djpk.kemenkeu.go.id/?p=5412",
      cta: "Periksa data realisasi",
    },
    {
      name: "Referensi wilayah Kemendagri",
      org: "Kementerian Dalam Negeri",
      detail:
        "38 provinsi, 514 kabupaten/kota, 7.285 kecamatan, dan 83.762 desa/kelurahan. Kode BPS belum diisi.",
      url: "https://kemendagri.go.id",
      cta: "Buka portal Kemendagri",
    },
    {
      name: "Indikator kebutuhan wilayah",
      org: "Badan Pusat Statistik",
      detail:
        "Jumlah penduduk, kemiskinan, fasilitas pendidikan dan kesehatan perlu diimpor dan divalidasi.",
      url: "https://www.bps.go.id",
      cta: "Buka portal BPS",
    },
  ];

  const coverage = [
    { value: COVERAGE.kabupatenKota, label: "kabupaten/kota" },
    { value: COVERAGE.provinsi, label: "provinsi" },
    { value: COVERAGE.kecamatan, label: "kecamatan" },
    { value: COVERAGE.desa, label: "desa/kelurahan" },
    { value: summary.totalBaris, label: "baris belanja" },
    { value: summary.totalDaerah, label: "kode daerah" },
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
              {live ? "Data resmi" : "Data contoh"}
            </span>
          </div>
        </section>

        <section className="pn">
          <div className="pn-h">
            <div>
              <h2 className="pn-t">Ketersediaan Data per Tahun</h2>
              <span className="pn-s">
                Tahun tanpa berkas sumber ditandai belum tersedia, bukan angka nol.
              </span>
            </div>
            <span className={`chip ${paguYears.length ? "c-ok" : "c-mid"}`}>
              {paguYears.length ? `${paguYears.length} tahun pagu` : "Belum ada pagu"}
            </span>
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
                    <span>
                      <span className={`chip ${row.pagu ? "c-ok" : "c-wait"}`}>
                        {row.pagu ? "Tersedia" : "Belum ada"}
                      </span>
                    </span>
                    <span>
                      <span className={`chip ${row.realisasi ? "c-ok" : "c-wait"}`}>
                        {row.realisasi ? "Tersedia" : "Belum ada"}
                      </span>
                    </span>
                    <span style={{ color: "var(--ink2)" }}>{row.catatan ?? "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="coverage-section" aria-label="Cakupan wilayah">
          <div className="coverage-head">
            <div>
              <h2 className="section-title">Cakupan Data</h2>
              <p>
                Jumlah wilayah referensi dan baris belanja yang saat ini dapat dibaca SELARAS.
              </p>
            </div>
            <span className={`chip ${live ? "c-ok" : "c-mid"}`}>
              {live ? "Data resmi" : "Data contoh"}
            </span>
          </div>
          <div className="coverage-grid">
            {coverage.map((item) => (
              <div className="coverage-card" key={item.label}>
                <div className="coverage-value">
                  <CountUp to={item.value} />
                </div>
                <div className="coverage-label">{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="source-section">
          <div className="source-head">
            <div>
              <h2 className="section-title">Sumber Rujukan</h2>
              <p>
                Empat rujukan utama yang membentuk data SELARAS. Tautan mengarah ke portal resmi
                masing-masing lembaga.
              </p>
            </div>
          </div>
          <div className="source-grid">
            {sources.map((source) => (
              <article className="src source-card" key={source.name}>
                <span className="source-org">{source.org}</span>
                <b>{source.name}</b>
                <span>{source.detail}</span>
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.cta}
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
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

            {missingMetadata.length ? (
              <div className="data-warning">
                <AlertCircle size={16} aria-hidden="true" />
                <span>
                  Data belanja tersedia tanpa metadata sumber untuk: {formatMissingMetadata()}.
                </span>
              </div>
            ) : live && summary.tahun.length ? (
              <div className="data-warning ok">
                <CheckCircle2 size={16} aria-hidden="true" />
                <span>
                  Semua tahun dan status yang memiliki data belanja sudah memiliki metadata sumber.
                </span>
              </div>
            ) : null}

            {duplicateMetadata.length ? (
              <div className="data-warning">
                <AlertCircle size={16} aria-hidden="true" />
                <span>
                  Metadata ganda untuk{" "}
                  {duplicateMetadata
                    .map((item) => `${item.tahun} ${item.status} (${item.files.length} berkas)`)
                    .join(", ")}
                  . Data fakta tetap dibaca dari satu sumber; duplikat perlu dirapikan agar tidak
                  ambigu.
                </span>
              </div>
            ) : null}

            {incompleteMetadata.length ? (
              <div className="data-warning">
                <AlertCircle size={16} aria-hidden="true" />
                <span>
                  Sheet atau tanggal publikasi belum diisi untuk{" "}
                  {incompleteMetadata
                    .map((item) => `${item.tahun} ${item.status}`)
                    .join(", ")}
                  .
                </span>
              </div>
            ) : null}
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
            <ol className="process-list">
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
