-- SELARAS | Migrasi aman untuk paket APBD 2022-2026
-- Tujuan:
--   1. Menyediakan tabel staging untuk impor CSV.
--   2. Menambahkan metadata sumber data yang belum ada.
--   3. Melakukan UPSERT tanpa menghapus data lama.
--
-- JANGAN jalankan migrasi_supabase.sql dari paket lama. File itu membuat
-- tabel/kolom yang tidak cocok dengan skema live (ref_fungsi/ref_jenis_belanja
-- vs dimensi_fungsi/dimensi_jenis_belanja dan kode_provinsi vs
-- kode_djpk_provinsi).
--
-- Urutan pakai:
--   1. Jalankan file ini di SQL Editor Supabase.
--   2. Impor daerah.csv ke public.daerah_import.
--   3. Impor file belanja_YYYY_status.csv yang diperlukan ke public.belanja_import.
--      Jika 2022 dan 2025 sudah ada di database, cukup impor 2023, 2024, dan 2026.
--   4. Jalankan ulang file ini untuk mengeksekusi blok UPSERT dan verifikasi.
--   5. Kosongkan staging secara manual setelah verifikasi bila diperlukan:
--      truncate table public.daerah_import;
--      truncate table public.belanja_import;
--
-- File ini tidak melakukan DROP TABLE, DROP VIEW, TRUNCATE, atau DELETE.

begin;

create table if not exists public.daerah_import (
  kode_djpk text,
  nama text,
  jenis_daerah text,
  kode_provinsi text
);

create table if not exists public.belanja_import (
  kode_djpk text,
  tahun int,
  status text,
  fungsi_kode text,
  fungsi text,
  jenis_kode text,
  jenis text,
  nilai numeric(24,2),
  sumber_file text
);

insert into public.sumber_data
  (sumber_file, tahun, status, sheet_digunakan, tanggal_publikasi, catatan)
values
  ('05062023_Anggaran_Belanja_per_Fungsi_2023_rev.xlsx', 2023, 'pagu', null, '2023-06-05', 'APBD 2023.'),
  ('18112024_Data_Realisasi_Belanja_Fungsi_2023.xlsx', 2023, 'realisasi', null, '2024-11-18', 'Realisasi APBD 2023.'),
  ('Anggaran_Belanja_Fungsi_2024_08072024.xlsx', 2024, 'pagu', null, '2024-07-08', 'APBD 2024.'),
  ('31102025_Realisasi_Belanja_Daerah_2024.xlsx', 2024, 'realisasi', null, '2025-10-31', 'File realisasi 2024 mencakup 545 daerah; tidak dipaksa menjadi 546.'),
  ('Anggaran_Belanja_Fungsi_2026_06082026.xlsx', 2026, 'pagu', null, '2026-08-06', 'APBD 2026.')
on conflict (sumber_file) do update set
  tahun = excluded.tahun,
  status = excluded.status,
  sheet_digunakan = excluded.sheet_digunakan,
  tanggal_publikasi = excluded.tanggal_publikasi,
  catatan = excluded.catatan;

-- Daftar daerah. Baris baru dibuat dengan provinsi kosong terlebih dahulu agar
-- foreign key diri sendiri (kode_djpk_provinsi -> daerah.kode_djpk) tidak gagal.
insert into public.daerah
  (kode_djpk, nama, jenis_daerah, kode_djpk_provinsi, status_pemetaan)
select distinct on (kode_djpk)
  kode_djpk,
  nama,
  jenis_daerah,
  null::text,
  'perlu_verifikasi'
from public.daerah_import
where kode_djpk is not null
  and kode_djpk <> ''
  and nama is not null
  and nama <> ''
  and jenis_daerah in ('provinsi', 'kabupaten', 'kota')
order by kode_djpk, nama
on conflict (kode_djpk) do update set
  nama = excluded.nama,
  jenis_daerah = excluded.jenis_daerah;

-- Isi kode provinsi setelah semua daerah ada.
update public.daerah as d
set kode_djpk_provinsi = nullif(di.kode_provinsi, '')
from (
  select distinct on (kode_djpk)
    kode_djpk,
    kode_provinsi
  from public.daerah_import
  where kode_djpk is not null
    and kode_djpk <> ''
  order by kode_djpk, kode_provinsi
) as di
where d.kode_djpk = di.kode_djpk
  and di.kode_provinsi is not null
  and di.kode_provinsi <> ''
  and d.kode_djpk_provinsi is distinct from nullif(di.kode_provinsi, '')
  and exists (
    select 1
    from public.daerah as p
    where p.kode_djpk = di.kode_provinsi
  );

-- Lengkapi nama provinsi untuk baris yang masih kosong.
update public.daerah as d
set nama_provinsi_kemendagri = p.nama
from public.daerah as p
where p.kode_djpk = d.kode_djpk_provinsi
  and d.nama_provinsi_kemendagri is null;

-- Normalisasi nama file yang memiliki sufiks "(1)" agar cocok dengan metadata
-- sumber_data yang sudah ada. Pemetaan ini hanya untuk file yang sudah terbukti
-- identik dengan sumber live.
update public.belanja_import
set sumber_file = case sumber_file
  when 'Anggaran-Belanja-per-Fungsi-2022_22082022(1).xlsx'
    then 'Anggaran-Belanja-per-Fungsi-2022_22082022.xlsx'
  when '12012024_Data_Realisasi_Belanja_Fungsi_2022(1).xlsx'
    then '12012024_Data_Realisasi_Belanja_Fungsi_2022.xlsx'
  when 'Anggaran_Belanja_Fungsi_2025_18092025(1).xlsx'
    then 'Anggaran_Belanja_Fungsi_2025_18092025.xlsx'
  else sumber_file
end
where sumber_file in (
  'Anggaran-Belanja-per-Fungsi-2022_22082022(1).xlsx',
  '12012024_Data_Realisasi_Belanja_Fungsi_2022(1).xlsx',
  'Anggaran_Belanja_Fungsi_2025_18092025(1).xlsx'
);

insert into public.belanja
  (kode_djpk, tahun, status, fungsi_kode, fungsi, jenis_kode, jenis, nilai, sumber_file)
select
  kode_djpk,
  tahun,
  status,
  fungsi_kode,
  max(fungsi),
  jenis_kode,
  max(jenis),
  sum(nilai),
  max(sumber_file)
from public.belanja_import
where kode_djpk is not null
  and kode_djpk <> ''
  and tahun between 2000 and 2100
  and status in ('pagu', 'realisasi')
  and fungsi_kode is not null
  and jenis_kode is not null
  and nilai is not null
group by kode_djpk, tahun, status, fungsi_kode, jenis_kode
on conflict (kode_djpk, tahun, status, fungsi_kode, jenis_kode) do update set
  fungsi = excluded.fungsi,
  jenis = excluded.jenis,
  nilai = excluded.nilai,
  sumber_file = excluded.sumber_file;

commit;

-- Verifikasi 1: ringkasan per tahun/status.
select
  tahun,
  status,
  count(*) as jumlah_baris,
  count(distinct kode_djpk) as jumlah_daerah,
  sum(nilai) as total_nilai
from public.belanja
group by tahun, status
order by tahun, status;

-- Verifikasi 2: baris staging yang daerahnya belum ada.
select distinct bi.kode_djpk
from public.belanja_import as bi
left join public.daerah as d using (kode_djpk)
where d.kode_djpk is null;

-- Verifikasi 3: baris staging yang sumber filenya belum terdaftar.
select distinct bi.sumber_file
from public.belanja_import as bi
left join public.sumber_data as sd using (sumber_file)
where bi.sumber_file is not null
  and sd.sumber_file is null;

-- Verifikasi 4: duplikat kunci di staging.
select kode_djpk, tahun, status, fungsi_kode, jenis_kode, count(*) as jumlah
from public.belanja_import
group by kode_djpk, tahun, status, fungsi_kode, jenis_kode
having count(*) > 1;
