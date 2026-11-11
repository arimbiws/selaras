import Image from "next/image";
import Link from "next/link";
import { Instagram, Linkedin, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="l-foot">
      <div className="foot-main">
        <div className="foot-brand">
          <Link href="/" className="logo foot-logo" aria-label="SELARAS, beranda">
            <span className="logo-badge">
              <Image
                src="/logo.png"
                alt=""
                width={150}
                height={40}
                className="logo-img"
              />
            </span>
            <span className="brand-word">SELARAS</span>
          </Link>
          <p className="foot-desc">
            Menyajikan data anggaran daerah dari seluruh Indonesia secara terbuka, terbanding, dan
            mudah ditelusuri oleh masyarakat.
          </p>
        </div>

        <div className="foot-cols">
          <div className="foot-col">
            <b>Navigasi</b>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/anggaran">Anggaran</Link>
            <Link href="/analisis">Analisis</Link>
            <Link href="/simulasi">Simulasi</Link>
          </div>

          <div className="foot-col">
            <b>Sumber Data</b>
            <a href="https://djpk.kemenkeu.go.id/?p=5412" target="_blank" rel="noreferrer">
              DJPK Kementerian Keuangan
            </a>
            <a href="https://www.bps.go.id" target="_blank" rel="noreferrer">
              Badan Pusat Statistik
            </a>
            <a href="https://kemendagri.go.id" target="_blank" rel="noreferrer">
              Kemendagri
            </a>
            <Link href="/sumber-data">Catatan pengolahan</Link>
          </div>

          <div className="foot-col">
            <b>Media Sosial</b>
            <div className="foot-social">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram SELARAS"
              >
                <Instagram size={17} aria-hidden="true" />
              </a>
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn SELARAS"
              >
                <Linkedin size={17} aria-hidden="true" />
              </a>
              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube SELARAS"
              >
                <Youtube size={17} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="foot-bottom">
        <span>© 2026 SELARAS. Hak cipta dilindungi.</span>
        <span>Data anggaran terbuka untuk seluruh Indonesia.</span>
      </div>
    </footer>
  );
}
