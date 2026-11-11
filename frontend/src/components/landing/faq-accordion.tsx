"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

const items = [
  {
    q: "Apakah data SELARAS berasal dari sumber resmi?",
    a: "Ya. Data utama bersumber dari publikasi APBD Direktorat Jenderal Perimbangan Keuangan (DJPK) Kementerian Keuangan dan dilengkapi data wilayah dari BPS serta Kemendagri. Setiap halaman mencantumkan sumber dan catatan pengolahannya.",
  },
  {
    q: "Tahun anggaran apa saja yang tersedia?",
    a: "Halaman contoh menampilkan APBD Kabupaten Pacitan tahun 2023. Dataset mencakup pagu 2022–2026 dan realisasi 2022–2024; tahun yang belum tersedia ditandai secara eksplisit, bukan diisi dengan angka nol.",
  },
  {
    q: "Mengapa angka realisasi belum selalu tampil?",
    a: "Realisasi hanya ditampilkan jika tersedia dalam berkas resmi. Kami memisahkan pagu dan realisasi agar pengguna tidak membandingkan dua besaran yang berbeda tanpa konteks.",
  },
  {
    q: "Bagaimana peringkat dan nilai tengah dihitung?",
    a: "Peringkat disusun dari porsi belanja setiap kabupaten/kota terhadap total belanja daerahnya. Nilai tengah digunakan sebagai pembanding agar hasil tidak mudah terpengaruh oleh daerah dengan anggaran sangat besar.",
  },
  {
    q: "Apakah data dapat diunduh dan digunakan kembali?",
    a: "Tabel pada halaman anggaran dapat diunduh dalam format CSV. Data tetap mengikuti ketentuan penggunaan sumber aslinya; cantumkan tautan SELARAS dan sumber resmi ketika menggunakan kembali datanya.",
  },
  {
    q: "Apakah SELARAS memerlukan akun atau instalasi?",
    a: "Tidak. SELARAS dapat langsung dibuka melalui peramban, tanpa pendaftaran maupun pemasangan aplikasi. Fokus kami adalah membuat data anggaran cepat ditemukan dan mudah dipahami.",
  },
];

export function FaqAccordion() {
  const [open, setOpen] = useState(0);

  return (
    <div className="faq-list">
      {items.map((item, index) => {
        const isOpen = open === index;
        return (
          <div className={`faq-item ${isOpen ? "is-open" : ""}`} key={item.q}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
                id={`faq-question-${index}`}
                onClick={() => setOpen(isOpen ? -1 : index)}
              >
                <span>{item.q}</span>
                <span className="faq-icon" aria-hidden="true">
                  <Plus size={18} />
                </span>
              </button>
            </h3>
            <div
              className="faq-answer"
              id={`faq-answer-${index}`}
              role="region"
              aria-labelledby={`faq-question-${index}`}
            >
              <div className="faq-answer-inner">
                <p>{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
