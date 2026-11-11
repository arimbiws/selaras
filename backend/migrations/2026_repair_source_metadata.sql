-- SELARAS | Perbaikan metadata sumber setelah impor 2020-2026
-- Jalankan manual di Supabase SQL Editor. File ini tidak mengubah tabel public.belanja.
-- Sheet tidak diisi karena tidak diketahui dari paket impor; tanggal mengikuti nama berkas.

begin;

update public.sumber_data
set tanggal_publikasi = '2023-06-05',
    catatan = coalesce(catatan, 'APBD 2023.')
where sumber_file = '05062023_Anggaran_Belanja_per_Fungsi_2023_rev.xlsx';

update public.sumber_data
set tanggal_publikasi = '2024-11-18',
    catatan = coalesce(catatan, 'Realisasi APBD 2023.')
where sumber_file = '18112024_Data_Realisasi_Belanja_Fungsi_2023.xlsx';

update public.sumber_data
set tanggal_publikasi = '2024-07-08',
    catatan = coalesce(catatan, 'APBD 2024.')
where sumber_file = 'Anggaran_Belanja_Fungsi_2024_08072024.xlsx';

update public.sumber_data
set tanggal_publikasi = '2025-10-31',
    catatan = coalesce(catatan, 'File realisasi 2024 mencakup 545 daerah; tidak dipaksa menjadi 546.')
where sumber_file = '31102025_Realisasi_Belanja_Daerah_2024.xlsx';

update public.sumber_data
set tanggal_publikasi = '2026-08-06',
    catatan = coalesce(catatan, 'APBD 2026.')
where sumber_file = 'Anggaran_Belanja_Fungsi_2026_06082026.xlsx';

-- Hapus metadata duplikat hanya jika tidak ada baris belanja yang memakainya.
delete from public.sumber_data
where sumber_file = 'Anggaran_Belanja_Fungsi_2025_18092025(1).xlsx'
  and not exists (
    select 1
    from public.belanja
    where belanja.sumber_file = sumber_data.sumber_file
  );

commit;
