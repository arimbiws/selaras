import { NextResponse } from "next/server";
import type { AnalysisMetric } from "@backend/types";
import { getCachedAnalysis, getCachedRegions } from "@/lib/analysis-cache";

export const dynamic = "force-dynamic";

type ChatRequest = {
  message?: string;
  kode?: string;
  tahun?: number;
};

const fmt1 = (value: number) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(value);

const money = (miliar: number) => {
  if (miliar >= 1000) {
    return `Rp${new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 2,
    }).format(miliar / 1000)} triliun`;
  }
  return `Rp${fmt1(miliar)} miliar`;
};

const topBy = (metrics: AnalysisMetric[]) =>
  [...metrics].sort((a, b) => b.share - a.share);

const listShare = (metrics: AnalysisMetric[], limit = 3) =>
  topBy(metrics)
    .slice(0, limit)
    .map((item, index) => `${index + 1}. ${item.nama}: ${fmt1(item.share)}% (${money(item.totalMiliar)})`)
    .join("\n");

const listRank = (metrics: AnalysisMetric[], limit = 3) =>
  topBy(metrics)
    .slice(0, limit)
    .map(
      (item) =>
        `${item.nama}: porsi ${fmt1(item.share)}%, peringkat ${item.rankNasional} pada perbandingan nasional`,
    )
    .join("\n");

const listBenchmark = (metrics: AnalysisMetric[], limit = 3) =>
  topBy(metrics)
    .slice(0, limit)
    .map(
      (item) =>
        `${item.nama}: ${fmt1(item.share)}% dibanding median nasional ${fmt1(
          item.medianNasional,
        )}% (${item.share >= item.medianNasional ? "di atas" : "di bawah"} median)`,
    )
    .join("\n");

const yearsText = (years: Array<{ tahun: number; pagu: boolean; realisasi: boolean }>) => {
  const pagu = years.filter((row) => row.pagu).map((row) => row.tahun);
  const realisasi = years.filter((row) => row.realisasi).map((row) => row.tahun);
  return [
    `Pagu tersedia: ${pagu.length ? pagu.join(", ") : "belum tersedia"}.`,
    `Realisasi tersedia: ${realisasi.length ? realisasi.join(", ") : "belum tersedia"}.`,
    "Tahun yang tidak tersedia tidak ditampilkan sebagai nilai nol.",
  ].join("\n");
};

export async function POST(request: Request) {
  let body: ChatRequest;
  try {
    body = (await request.json()) as ChatRequest;
  } catch {
    return NextResponse.json({ error: "Format permintaan tidak valid." }, { status: 400 });
  }

  const message = body.message?.trim().slice(0, 500) ?? "";
  if (message.length < 3) {
    return NextResponse.json({ error: "Pertanyaan terlalu pendek." }, { status: 400 });
  }

  const year = Number.isInteger(body.tahun) ? Number(body.tahun) : 0;
  if (year !== 0 && (year < 2020 || year > 2026)) {
    return NextResponse.json({ error: "Tahun tidak valid." }, { status: 400 });
  }

  const regions = await getCachedRegions();
  const normalized = message.toLowerCase();
  const mentioned = regions.find((region) => {
    const name = region.nama.replace(/^(Kabupaten|Kota)\s+/i, "").toLowerCase();
    return name.length >= 4 && normalized.includes(name);
  });
  const requestedCode = body.kode?.trim() ?? "";
  const kodeDjpk = /^\d{2}\.\d{2}$/.test(requestedCode)
    ? requestedCode
    : (mentioned?.kodeDjpk ?? "13.18");

  const snapshot = await getCachedAnalysis(kodeDjpk, year);
  const region = snapshot.region;
  const label = `${region.nama}${snapshot.provinceName ? `, ${snapshot.provinceName}` : ""}`;

  if (!snapshot.available) {
    return NextResponse.json({
      answer: `Data pagu untuk ${label} pada tahun ${snapshot.tahun} belum tersedia. Saya tidak mengisi nilai kosong dengan nol. Silakan pilih tahun lain atau lihat halaman Sumber Data untuk ketersediaan per tahun.`,
      region: label,
      tahun: snapshot.tahun,
      citations: [
        { label: "Ketersediaan data", url: "/sumber-data" },
        { label: "DJPK Kementerian Keuangan", url: "https://djpk.kemenkeu.go.id/?p=5412" },
      ],
    });
  }

  const topFunction = topBy(snapshot.functions)[0];
  const topJenis = topBy(snapshot.jenis)[0];
  let answer: string;

  if (/(total|berapa|ringkas|ringkasan)/i.test(message) && !/(fungsi|bidang|jenis)/i.test(message)) {
    answer = `Total pagu ${label} tahun ${snapshot.tahun} adalah ${money(snapshot.totalMiliar)}. Bidang terbesar adalah ${topFunction.nama} dengan porsi ${fmt1(topFunction.share)}%, diikuti jenis belanja terbesar ${topJenis.nama} sebesar ${fmt1(topJenis.share)}%.`;
  } else if (/(median|banding|provinsi|nasional|rata-rata)/i.test(message)) {
    answer = `Perbandingan porsi ${label} tahun ${snapshot.tahun} dengan median nasional:\n${listBenchmark(
      snapshot.functions,
    )}\n\nMedian adalah nilai tengah, bukan target. Selisih perlu dibaca bersama kebutuhan wilayah dan konteks kebijakan.`;
  } else if (/(peringkat|rank|posisi)/i.test(message)) {
    answer = `Peringkat bidang utama ${label} tahun ${snapshot.tahun}:\n${listRank(
      snapshot.functions,
    )}\n\nPeringkat dihitung dari porsi anggaran, bukan dari kualitas layanan.`;
  } else if (/(jenis|belanja)/i.test(message) && !/(fungsi|bidang)/i.test(message)) {
    answer = `Jenis belanja terbesar di ${label} tahun ${snapshot.tahun}:\n${listShare(
      snapshot.jenis,
    )}\n\nPorsi dihitung dari total pagu ${money(snapshot.totalMiliar)}.`;
  } else if (/(fungsi|bidang|prioritas|terbesar|tertinggi)/i.test(message)) {
    answer = `Bidang dengan porsi terbesar di ${label} tahun ${snapshot.tahun}:\n${listShare(
      snapshot.functions,
    )}\n\nGunakan angka ini sebagai awal penelusuran, bukan penilaian akhir atas kualitas layanan.`;
  } else if (/(tahun|pagu|realisasi|ketersediaan)/i.test(message)) {
    answer = `Ketersediaan data ${label}:\n${yearsText(snapshot.years)}\n\nHalaman Anggaran memakai pagu; realisasi hanya ditampilkan jika berkasnya tersedia.`;
  } else if (/(sumber|asal data|dari mana)/i.test(message)) {
    answer = `Data anggaran SELARAS berasal dari publikasi DJPK Kementerian Keuangan. Referensi wilayah memakai data Kemendagri, sedangkan indikator kebutuhan wilayah direncanakan dari BPS.\n\nUntuk ${label} tahun ${snapshot.tahun}, porsi bidang dihitung dari pagu APBD yang tersedia. Nilai kosong tidak diubah menjadi nol.`;
  } else if (/(penduduk|per kapita|per orang)/i.test(message)) {
    answer = `SELARAS belum memuat jumlah penduduk pada analisis anggaran, sehingga belanja per penduduk belum dapat dihitung dari data ini. Halaman Simulasi Alokasi menyediakan kolom jumlah penduduk untuk menghitung skenario secara manual.`;
  } else {
    answer = `Ringkasan ${label} tahun ${snapshot.tahun}:\nTotal pagu ${money(
      snapshot.totalMiliar,
    )}.\n\nBidang terbesar:\n${listShare(snapshot.functions, 2)}\n\nJenis belanja terbesar: ${
      topJenis.nama
    } (${fmt1(topJenis.share)}%).\n\nAnda dapat bertanya tentang peringkat, median nasional, jenis belanja, ketersediaan tahun, atau sumber data.`;
  }

  return NextResponse.json({
    answer,
    region: label,
    tahun: snapshot.tahun,
    citations: [
      { label: "DJPK Kementerian Keuangan", url: "https://djpk.kemenkeu.go.id/?p=5412" },
      { label: "Analisis daerah", url: `/analisis?kode=${region.kodeDjpk}` },
      { label: "Sumber Data SELARAS", url: "/sumber-data" },
    ],
  });
}
