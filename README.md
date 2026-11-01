# SELARAS 🏛️📊

**Sistem Evaluasi Layanan dan Realisasi Anggaran Sosial**

SELARAS adalah platform publik berbasis web yang dirancang untuk mewujudkan transparansi anggaran daerah. Platform ini tidak hanya menampilkan metrik anggaran mentah, tetapi menjembatani **angka realisasi belanja** dengan **konteks kebutuhan layanan masyarakat** (seperti rasio fasilitas kesehatan/pendidikan terhadap jumlah penduduk), serta menyediakan **Alat Simulasi Alokasi** yang transparan.

Proyek ini dibangun untuk kompetisi web development **MIA Competition** dengan tema _"Designing Digital Futures – Powering Public Transparency"_.

---

#### Fitur utama:

- **Dashboard**: ringkasan total belanja, komposisi belanja menurut bidang, dan jenis belanja.
- **Anggaran**: penelusuran anggaran menurut bidang dan jenis belanja (pegawai, barang dan jasa, modal, lainnya), perbandingan anggaran dengan realisasi, serta tabel rincian.
- **Detail Bidang**: rincian satu bidang, posisinya di antara kabupaten lain, dan sumber angkanya.
- **Analisis Kebutuhan**: perbandingan porsi anggaran daerah dengan nilai tengah (median) kabupaten lain, disertai indikator kebutuhan wilayah.
- **Simulasi Alokasi**: alat mandiri untuk menyusun skenario pembagian anggaran berdasarkan total anggaran, jumlah penduduk, dan luas wilayah.
- **Sumber Data**: daftar sumber data, rumus, dan batasan data.

### Cara kerja

1. Data APBD diambil dari berkas resmi Direktorat Jenderal Perimbangan Keuangan (DJPK), Kementerian Keuangan. Satu berkas memuat seluruh pemerintah daerah untuk satu tahun.
2. Skrip pengolahan menyeragamkan berkas tersebut dan menyimpannya ke basis data PostgreSQL (Supabase).
3. Basis data menghitung porsi tiap bidang, nilai tengah, dan peringkat di antara kabupaten.
4. Aplikasi web membaca hasilnya dan menampilkan satu daerah yang dipilih, lengkap dengan sumber dan batasan data.

Prinsip penyajian: angka yang belum tersedia (misalnya realisasi) ditampilkan sebagai "belum dimuat", bukan nol. Perbedaan porsi anggaran bersifat informasi awal untuk bertanya, bukan penilaian baik atau buruk.

## Flow Aplikasi

```
Pengguna membuka situs
  -> Landing page (navbar hanya tombol "Mulai")
  -> Klik "Mulai"
  -> Dashboard (navbar berubah: Dashboard, Anggaran, Analisis, Simulasi, Sumber Data, pencarian)
  -> Anggaran: telusuri bidang dan jenis belanja
       -> Detail Bidang: rincian, posisi terhadap kabupaten lain, sumber angka
  -> Analisis: bandingkan dengan nilai tengah kabupaten lain
  -> Simulasi: susun skenario alokasi sendiri
  -> Sumber Data: periksa asal data, rumus, dan batasan
```

## Tech Stack

| Bagian          | Teknologi                                                      |
| --------------- | -------------------------------------------------------------- |
| Framework       | Next.js (App Router)                                           |
| Bahasa          | TypeScript                                                     |
| Basis data      | Supabase (PostgreSQL), dengan Row Level Security (baca publik) |
| Antarmuka       | Tailwind CSS, shadcn/ui (rencana)                              |
| Grafik          | Recharts (rencana)                                             |
| Pengolahan data | Python (`openpyxl` atau `pandas`) (rencana)                    |
| Hosting         | Vercel (rencana)                                               |
| Sumber data     | DJPK Kemenkeu, BPS (rencana)                                   |

Sesuaikan tabel ini dengan isi `package.json` bila ada perbedaan.

## Cara Menjalankan

### Prasyarat

- Node.js 18.18 atau lebih baru
- npm
- Proyek Supabase

### Langkah

1. Clone repositori dan masuk ke folder aplikasi.

   ```bash
   git clone <url-repositori>
   cd <nama-repositori>/frontend
   ```

2. Pasang dependensi.

   ```bash
   npm install
   ```

3. Siapkan basis data. Buka SQL Editor di Supabase, lalu jalankan isi `schema.sql`.

4. Isi data DJPK ke basis data memakai skrip di folder `etl/` (menggunakan `service_role` key dari proyek Supabase kamu).

5. Buat berkas `.env.local` di folder `frontend/`.

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://<id-proyek>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
   ```

   Jangan menaruh `service_role` key di berkas ini atau di variabel berawalan `NEXT_PUBLIC_`.

6. Jalankan server pengembangan.

   ```bash
   npm run dev
   ```

   Buka http://localhost:3000.

Untuk versi produksi:

```bash
npm run build
npm start
```

## Progress Saat Ini

- [x] Penentuan konsep, cakupan (kabupaten dan kota), dan sumber data (DJPK)
- [x] Mockup tujuh halaman: Landing, Dashboard, Anggaran, Analisis, Detail Bidang, Simulasi, Sumber Data
- [x] Skema basis data (`schema.sql`) dan pengaturan Supabase
- [x] Struktur proyek Next.js

## Tim

Dikembangkan oleh Daun Leaf untuk Multimedia In Action 2026🧧
