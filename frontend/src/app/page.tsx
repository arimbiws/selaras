import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Database,
  Download,
  Eye,
  FileSpreadsheet,
  Layers3,
  Map,
  MonitorSmartphone,
  Scale,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { FaqAccordion } from "@/components/landing/faq-accordion";
import { FeatureTabs } from "@/components/landing/feature-tabs";
import { CountUp } from "@/components/landing/count-up";
import { Reveal } from "@/components/landing/reveal";
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

const stats = [
  {
    icon: Building2,
    value: COVERAGE.kabupatenKota,
    label: "Kabupaten & kota",
    desc: "Satu standar klasifikasi anggaran",
    color: "#2F6BFF",
  },
  {
    icon: Map,
    value: COVERAGE.provinsi,
    label: "Provinsi",
    desc: "Dari Aceh hingga Papua",
    color: "#12B3A6",
  },
  {
    icon: Layers3,
    value: BIDANG.length,
    label: "Bidang belanja",
    desc: "Pendidikan, kesehatan, dan lainnya",
    color: "#8B5CF6",
  },
  {
    icon: Database,
    value: COVERAGE.barisBelanja,
    label: "Baris data",
    desc: "Tervalidasi dari berkas resmi",
    color: "#FFA50A",
  },
];

const steps = [
  {
    icon: FileSpreadsheet,
    title: "Data resmi dikumpulkan",
    desc: "APBD dari DJPK Kementerian Keuangan, dilengkapi data wilayah dari BPS dan Kemendagri.",
    color: "#2F6BFF",
  },
  {
    icon: ShieldCheck,
    title: "Diselaraskan & divalidasi",
    desc: "Kode wilayah, nama bidang, dan tahun diseragamkan; nilai yang belum tersedia ditandai jelas.",
    color: "#12B3A6",
  },
  {
    icon: MonitorSmartphone,
    title: "Disajikan untuk publik",
    desc: "Porsi, nilai tengah, dan peringkat ditampilkan dalam tampilan yang ringkas dan mudah ditelusuri.",
    color: "#8B5CF6",
  },
];

const benefits = [
  {
    icon: ShieldCheck,
    title: "Berbasis data resmi",
    desc: "Setiap angka dapat dilacak ke sumber DJPK, BPS, atau Kemendagri.",
    color: "#2F6BFF",
  },
  {
    icon: Scale,
    title: "Perbandingan setara",
    desc: "Porsi dan nilai tengah membuat prioritas daerah dapat dinilai objektif.",
    color: "#12B3A6",
  },
  {
    icon: Eye,
    title: "Batasan transparan",
    desc: "Tahun yang belum tersedia tidak diisi nol; konteks selalu disertakan.",
    color: "#8B5CF6",
  },
  {
    icon: Download,
    title: "Siap digunakan",
    desc: "Tanpa akun, tanpa instalasi. Tabel anggaran dapat diunduh sebagai CSV.",
    color: "#FFA50A",
  },
];

export default function LandingPage() {
  const total = rupiahTriliun(TOTAL);
  const education = BIDANG_TOTALS[BIDANG.indexOf("Pendidikan")];
  const educationShare = fmt1(pct(education));

  return (
    <div className="shell landing">
      <Navbar />

      <main className="l-main">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">Transparansi anggaran daerah</span>
            <h1>
              Ke mana anggaran daerah <span>dibelanjakan?</span>
            </h1>
            <p className="hero-lead">
              Data APBD dari seluruh Indonesia, disusun agar porsi, prioritas, dan posisinya mudah
              dibandingkan.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-p" href="/anggaran" style={{ minHeight: 54, fontSize: 16 }}>
                Telusuri anggaran
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link className="btn btn-s" href="/sumber-data" style={{ minHeight: 54 }}>
                Pelajari sumber data
              </Link>
            </div>
            <span className="hero-note">
              Data contoh: APBD Kab. Pacitan 2023 · Cakupan {COVERAGE.kabupatenKota} kabupaten/kota
              di {COVERAGE.provinsi} provinsi.
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
                  {JENIS.map((name, index) => (
                    <span
                      key={name}
                      style={{ flex: JENIS_TOTALS[index], background: JENIS_COLORS[index] }}
                      title={`${name} ${fmt1(pct(JENIS_TOTALS[index]))}%`}
                    />
                  ))}
                </div>

                <div className="jenis-list">
                  {JENIS.map((name, index) => (
                    <div className="jenis-row" key={name}>
                      <i style={{ background: JENIS_COLORS[index] }} aria-hidden="true" />
                      <strong>{name}</strong>
                      <span>{rupiahMiliar(JENIS_TOTALS[index])}</span>
                      <b>{fmt1(pct(JENIS_TOTALS[index]))}%</b>
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

        <Reveal>
          <section className="stats-section" aria-labelledby="coverage-title">
            <div className="stats-head">
              <div>
                <span className="eyebrow">Cakupan nasional</span>
                <h2 id="coverage-title">Satu standar untuk seluruh Indonesia</h2>
              </div>
              <p>Data daerah yang seragam, sehingga perbandingan tetap adil dan kontekstual.</p>
            </div>

            <div className="stats">
              {stats.map(({ icon: Icon, value, label, desc, color }, index) => (
                <Reveal key={label} className="stat-card-wrap" delay={index * 80}>
                  <div className="stat-card">
                    <span className="stat-icon" style={{ background: color }}>
                      <Icon aria-hidden="true" />
                    </span>
                    <CountUp to={value} className="stat-value" />
                    <b>{label}</b>
                    <span>{desc}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="features-section" id="fitur">
            <div className="section-head">
              <span className="eyebrow">Fitur utama</span>
              <h2>Empat cara menelaah anggaran daerah</h2>
              <p>Pilih fitur untuk melihat pratinjau, lalu buka halaman lengkapnya.</p>
            </div>
            <FeatureTabs />
          </section>
        </Reveal>

        <Reveal>
          <section className="how" aria-labelledby="how-title">
            <div className="section-head section-head-center">
              <span className="eyebrow">Cara kerja</span>
              <h2 id="how-title">Dari data resmi menjadi informasi yang dapat dibandingkan</h2>
              <p>Tiga tahap yang sama untuk setiap daerah, dari berkas mentah hingga siap dibaca.</p>
            </div>

            <div className="how-track">
              <span className="how-line" aria-hidden="true" />
              <span className="how-flow" aria-hidden="true" />
              {steps.map(({ icon: Icon, title, desc, color }, index) => (
                <article className="how-step" key={title}>
                  <span className="how-node" style={{ background: color }}>
                    <Icon aria-hidden="true" />
                  </span>
                  <span className="how-index">0{index + 1}</span>
                  <b>{title}</b>
                  <p>{desc}</p>
                </article>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="why" aria-labelledby="why-title">
            <div className="why-copy">
              <span className="eyebrow">Mengapa SELARAS</span>
              <h2 id="why-title">Data yang rapi, konteks yang jujur.</h2>
              <p>
                Kami tidak hanya menampilkan angka. Setiap tampilan membantu Anda memahami apa yang
                dianggarkan, bagaimana posisinya, dan sejauh mana data dapat dipercaya.
              </p>
              <Link className="text-link" href="/sumber-data">
                Lihat catatan sumber data
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>

            <div className="why-grid">
              {benefits.map(({ icon: Icon, title, desc, color }) => (
                <div className="card why-card" key={title}>
                  <span className="why-icon" style={{ background: color }}>
                    <Icon aria-hidden="true" />
                  </span>
                  <b>{title}</b>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="faq-section" id="faq" aria-labelledby="faq-title">
            <div className="faq-copy">
              <span className="eyebrow">Pertanyaan umum</span>
              <h2 id="faq-title">Hal yang sering ditanyakan</h2>
              <p>
                Belum menemukan jawabannya? Catatan sumber dan pengolahan data menjelaskan batasan
                setiap angka secara lebih rinci.
              </p>
              <Link className="text-link" href="/sumber-data">
                Baca catatan data
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
            <FaqAccordion />
          </section>
        </Reveal>

        <Reveal>
          <section className="cta final-cta">
            <div className="cta-copy">
              <span className="cta-eyebrow">Mulai sekarang</span>
              <h2>Pahami anggaran daerah dalam hitungan menit.</h2>
              <p>
                Telusuri prioritas belanja {COVERAGE.kabupatenKota} kabupaten/kota dan bandingkan
                posisinya dengan daerah lain.
              </p>
              <div className="cta-actions">
                <Link className="btn btn-w" href="/anggaran" style={{ minHeight: 52, fontSize: 15 }}>
                  Telusuri anggaran
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link className="btn btn-ghost" href="/sumber-data">
                  Lihat sumber data
                </Link>
              </div>
              <span className="cta-note">
                <CheckCircle2 size={16} aria-hidden="true" />
                Gratis, tanpa registrasi.
              </span>
            </div>

            <div className="cta-art" aria-hidden="true">
              <span className="cta-ring" />
              <span className="cta-orb">
                <TrendingUp />
              </span>
              <div className="cta-float">
                <b>{COVERAGE.kabupatenKota}</b>
                <span>kabupaten/kota</span>
              </div>
              <div className="cta-float cta-float-alt">
                <b>{COVERAGE.barisBelanja.toLocaleString("id-ID")}</b>
                <span>baris data</span>
              </div>
            </div>
          </section>
        </Reveal>
      </main>

      <Footer />
    </div>
  );
}
