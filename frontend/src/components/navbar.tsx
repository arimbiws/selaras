import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Navbar() {
  return (
    <header className="l-nav">
      <Link href="/" className="l-brand" aria-label="SELARAS, beranda">
        <span className="logo-badge">
          <Image
            src="/logo.png"
            alt=""
            width={150}
            height={40}
            className="logo-img"
            priority
          />
        </span>
        <span className="brand-word">SELARAS</span>
      </Link>

      <div className="l-links">
        <Link className="btn btn-p l-cta" href="/dashboard">
          Mulai Telusuri
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}
