import Link from "next/link";
import {
  ArrowRight,
  ChartNoAxesCombined,
  Database,
  FlaskConical,
  Landmark,
  LayoutDashboard,
  TrendingUp,
} from "lucide-react";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import {
  BIDANG,
  BIDANG_TOTALS,
  COVERAGE,
  JENIS,
  JENIS_COLORS,
  JENIS_TOTALS,
  TOTAL,
  fmt1,
  pct,
  rupiahMiliar,
  rupiahTriliun,
} from "@/lib/demo-data";

const features = [
  {
    icon: LayoutDashboard,
    href: "/dashboard",
    title: "Dashboard",
    desc: "Ringkasan indikator utama: total belanja, komposisi menurut bidang, dan ketersediaan data antartahun.",
    color: "#2F6BFF",
  },
  {
    icon: Landmark,
    href: "/anggaran",
    title: "Anggaran",
    desc: "Telusuri anggaran menurut bidang dan jenis belanja, dilengkapi tabel rincian yang dapat diunduh.",
    color: "#12B3A6",
  },
  {
    icon: ChartNoAxesCombined,
    href: "/analisis",
    title: "Analisis Kebutuhan",
    desc: "Bandingkan porsi anggaran dengan nilai tengah kabupaten lain, disertai indikator kebutuhan wilayah.",
    color: "#8B5CF6",
  },
  {
    icon: FlaskConical,
    href: "/simulasi",
    title: "Simulasi Alokasi",
    desc: "Susun skenario pembagian anggaran dan lihat dampaknya terhadap belanja per penduduk.",
    color: "#FFA50A",
  },
];

const stats = [
  {
    value: String(COVERAGE.kabupatenKota),
    label: "kabupaten dan kota di seluruh Indonesia dalam satu standar klasifikasi anggaran",
  },
  {
    value: String(COVERAGE.provinsi),
    label: "provinsi, dari Aceh hingga Papua, dengan kode wilayah yang seragam",
  },
  {
    value: "9",
    label: "bidang belanja, antara lain pendidikan, kesehatan, dan perlindungan sosial",
  },
  {
    value: COVERAGE.barisBelanja.toLocaleString("id-ID"),
    label: "baris data belanja yang sudah divalidasi dari berkas resmi DJPK",
  },
];

export default function LandingPage() {
  const total = rupiahTriliun(TOTAL);
  const education = BIDANG_TOTALS[BIDANG.indexOf("Pendidikan")];
  const educationShare = fmt1(pct(education));

  return (
    <div className="shell">
      <Navbar />

      <main className="l-main">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">Transparansi anggaran daerah</span>
            <h1>
              Ketahui untuk apa anggaran daerah <span>dibelanjakan.</span>
            </h1>
            <p className="hero-lead">
              SELARAS menyajikan data Anggaran Pendapatan dan Belanja Daerah (APBD) dari seluruh
              Indonesia secara ringkas, lalu membandingkannya dengan kabupaten lain agar pola
              belanja suatu daerah dapat dinilai secara objektif.
            </p>
            <p className="hero-sub">
              Ditujukan bagi masyarakat, mahasiswa, peneliti, dan jurnalis yang memerlukan data
              anggaran yang mudah ditelusuri.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-p" href="/anggaran" style={{ minHeight: 54, fontSize: 16 }}>
                Telusuri anggaran
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link className="btn btn-s" href="/sumber-data" style={{ minHeight: 54 }}>
                Lihat sumber data
              </Link>
            </div>
            <span className="hero-note">
              Data contoh: anggaran APBD Kabupaten Pacitan 2023. Cakupan rancangan: 514 kabupaten/kota
              di 38 provinsi.
            </span>
          </div>

          <div className="stage">
            <div className="card stage-card">
              <div className="stage-head">
                <span className="ico" style={{ background: "#2F6BFF" }}>
                  <Database aria-hidden="true" />
                </span>
                <div>
                  <b>Komposisi belanja</b>
                  <span>Contoh daerah · Kab. Pacitan · APBD 2023</span>
                </div>
              </div>

              <div className="stage-body">
                <div className="stage-total">
                  <span>Total belanja dianggarkan</span>
                  <b>{total}</b>
                </div>

                <div className="segbar" role="img" aria-label="Komposisi belanja menurut jenis">
                  {JENIS.map((name, j) => (
                    <span
                      key={name}
                      style={{ flex: JENIS_TOTALS[j], background: JENIS_COLORS[j] }}
                      title={`${name} ${fmt1(pct(JENIS_TOTALS[j]))}%`}
                    />
                  ))}
                </div>

                <div className="jenis-list">
                  {JENIS.map((name, j) => (
                    <div className="jenis-row" key={name}>
                      <i style={{ background: JENIS_COLORS[j] }} aria-hidden="true" />
                      <strong>{name}</strong>
                      <span>{rupiahMiliar(JENIS_TOTALS[j])}</span>
                      <b>{fmt1(pct(JENIS_TOTALS[j]))}%</b>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card overlay">
              <span className="ico" style={{ background: "#8B5CF6" }}>
                <TrendingUp aria-hidden="true" />
              </span>
              <div>
                <span>Porsi bidang pendidikan</span>
                <b>
                  {educationShare}% · peringkat 20 dari {COVERAGE.kabupaten}
                </b>
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Cakupan data" className="stats">
          {stats.map((stat) => (
            <div className="stat" key={stat.label}>
              <b>{stat.value}</b>
              <span>{stat.label}</span>
            </div>
          ))}
        </section>

        <section style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div className="section-head">
            <h2>Empat cara menelaah anggaran daerah</h2>
            <p>
              Setiap fitur menjawab pertanyaan yang berbeda, dan seluruhnya bersumber dari data yang
              sama.
            </p>
          </div>

          <div className="features">
            {features.map(({ icon: Icon, href, title, desc, color }) => (
              <Link key={href} href={href} className="card feat">
                <span className="ico" style={{ background: color }}>
                  <Icon aria-hidden="true" />
                </span>
                <b>{title}</b>
                <span>{desc}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="card process">
          <div className="section-head">
            <h2>Dari data resmi menjadi informasi yang dapat dibandingkan</h2>
          </div>
          <div className="process-grid">
            <div className="process-step">
              <span className="num">1</span>
              <b>Data resmi</b>
              <span>
                Berkas APBD dari Direktorat Jenderal Perimbangan Keuangan (DJPK), Kementerian
                Keuangan, yang mencakup seluruh pemerintah daerah.
              </span>
            </div>
            <div className="process-step">
              <span className="num">2</span>
              <b>Pengolahan</b>
              <span>
                Data diseragamkan, kemudian dihitung porsi, nilai tengah, dan peringkat untuk setiap
                kabupaten di seluruh Indonesia.
              </span>
            </div>
            <div className="process-step">
              <span className="num">3</span>
              <b>Penyajian</b>
              <span>
                Hasil ditampilkan untuk daerah yang dipilih, disertai sumber dan batasan data yang
                dinyatakan secara terbuka.
              </span>
            </div>
          </div>
        </section>

        <section className="cta">
          <div>
            <h2>Telusuri anggaran daerah di seluruh Indonesia</h2>
            <p>
              Mulai dari bidang yang menerima anggaran terbesar, lalu bandingkan posisinya dengan
              kabupaten lain di seluruh Indonesia.
            </p>
          </div>
          <Link className="btn btn-w" href="/anggaran" style={{ minHeight: 54, fontSize: 16 }}>
            Mulai telusuri
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
