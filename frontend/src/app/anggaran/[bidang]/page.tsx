import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import {
  BIDANG,
  BIDANG_RANK,
  BIDANG_TOTALS,
  JENIS,
  JENIS_COLORS,
  VALUES,
  fmt1,
  pct,
  rupiahMiliar,
  slugify,
  statusOf,
} from "@/lib/demo-data";

export function generateStaticParams() {
  return BIDANG.map((name) => ({ bidang: slugify(name) }));
}

export default async function DetailAnggaran({
  params,
}: {
  params: Promise<{ bidang: string }>;
}) {
  const { bidang } = await params;
  const index = BIDANG.findIndex((name) => slugify(name) === decodeURIComponent(bidang));

  if (index < 0) {
    notFound();
  }

  const name = BIDANG[index];
  const values = VALUES[index];
  const total = BIDANG_TOTALS[index];
  const share = pct(total);
  const rank = BIDANG_RANK[index];
  const status = statusOf(rank);
  const topIndex = values.indexOf(Math.max(...values));

  return (
    <PageShell active="/anggaran" title="Detail Bidang">
      <main className="page">
        <section className="page-head">
          <div>
            <h1>{name}</h1>
            <p className="page-sub">
              Rincian alokasi menurut jenis belanja · Kabupaten Pacitan · APBD 2023
            </p>
          </div>
          <div className="page-actions">
            <Link className="btn btn-s" href="/anggaran">
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
            Angka contoh APBD 2023 per 12 Mei 2023. Realisasi belum tersedia sehingga tidak
            ditampilkan sebagai nol.
          </span>
        </section>

        <section aria-label="Indikator bidang" className="grid-kpi">
          <article className="kpi">
            <div className="kpi-b">
              <div className="kpi-h">Total alokasi</div>
              <div className="kpi-v">{rupiahMiliar(total)}</div>
            </div>
            <div className="kpi-f">Dalam miliar rupiah</div>
          </article>

          <article className="kpi">
            <div className="kpi-b">
              <div className="kpi-h">Porsi dari total belanja</div>
              <div className="kpi-v">{fmt1(share)}%</div>
            </div>
            <div className="kpi-f">Kabupaten Pacitan, 2023</div>
          </article>

          <article className="kpi">
            <div className="kpi-b">
              <div className="kpi-h">
                Peringkat porsi
                <span className={`chip ${status.cls}`}>{status.label}</span>
              </div>
              <div className="kpi-v">{rank} / 415</div>
            </div>
            <div className="kpi-f">Di antara kabupaten di Indonesia</div>
          </article>

          <article className="kpi">
            <div className="kpi-b">
              <div className="kpi-h">Komponen terbesar</div>
              <div className="kpi-v" style={{ fontSize: 24 }}>
                {JENIS[topIndex]}
              </div>
            </div>
            <div className="kpi-f">
              {fmt1(pct(values[topIndex], total))}% dari anggaran bidang
            </div>
          </article>
        </section>

        <section className="pn">
          <div className="pn-h">
            <div>
              <h2 className="pn-t">Komponen Belanja</h2>
              <span className="pn-s">Nominal dan porsi dari total bidang</span>
            </div>
          </div>
          <div className="pn-b" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {JENIS.map((jenis, j) => {
              const value = values[j];
              const width = pct(value, total);
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
                    </span>
                  </div>
                  <div className="trk">
                    <i
                      style={{
                        width: `${Math.max(width, value > 0 ? 2 : 0)}%`,
                        background: JENIS_COLORS[j],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="section-split">
          <div className="pn" style={{ flex: "1 1 420px", minWidth: 0 }}>
            <div className="pn-h">
              <div>
                <h2 className="pn-t">Ringkasan Cepat</h2>
                <span className="pn-s">Perbandingan komponen dalam bidang ini</span>
              </div>
            </div>
            <div className="pn-b" style={{ padding: "8px 14px" }}>
              {JENIS.map((jenis, j) => (
                <div
                  key={jenis}
                  className="tr"
                  style={{ gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)" }}
                >
                  <span style={{ fontWeight: 600 }}>{jenis}</span>
                  <b className="r">{fmt1(values[j])} miliar</b>
                </div>
              ))}
              <div
                className="tr tr-total"
                style={{ gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)" }}
              >
                <span>Total bidang</span>
                <b className="r">{fmt1(total)} miliar</b>
              </div>
            </div>
          </div>

          <div className="pn" style={{ flex: "1 1 360px", minWidth: 0 }}>
            <div className="pn-h">
              <div>
                <h2 className="pn-t">Catatan</h2>
                <span className="pn-s">Batasan data pada tingkat ini</span>
              </div>
            </div>
            <div
              className="pn-b"
              style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13.5, color: "var(--ink2)" }}
            >
              <p style={{ margin: 0 }}>
                Tidak ada rincian program, kegiatan, atau subkegiatan dalam data contoh yang
                diberikan.
              </p>
              <p style={{ margin: 0 }}>
                Porsi yang tinggi atau rendah belum menunjukkan kualitas layanan tanpa indikator
                kebutuhan wilayah.
              </p>
              <Link
                href="/analisis"
                style={{ fontWeight: 700, color: "var(--brandink)" }}
              >
                Bandingkan dengan kabupaten lain
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
