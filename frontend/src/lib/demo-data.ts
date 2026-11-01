export const BIDANG = [
  "Pelayanan Umum",
  "Ketertiban dan Keamanan",
  "Ekonomi",
  "Lingkungan Hidup",
  "Perumahan dan Fasilitas Umum",
  "Kesehatan",
  "Pariwisata",
  "Pendidikan",
  "Perlindungan Sosial",
];

export const BIDANG_SHORT = [
  "Pelayanan Umum",
  "Ketertiban",
  "Ekonomi",
  "Lingkungan",
  "Perumahan",
  "Kesehatan",
  "Pariwisata",
  "Pendidikan",
  "Perlindungan Sosial",
];

export const JENIS = ["Pegawai", "Barang dan jasa", "Modal", "Lainnya"];

export const JENIS_COLORS = ["#2F6BFF", "#12B3A6", "#FFA50A", "#8B5CF6"];

export const CHART_COLORS = [
  "#2F6BFF",
  "#12B3A6",
  "#FFA50A",
  "#8B5CF6",
  "#E4572E",
  "#0EA5E9",
  "#D12346",
  "#10B981",
  "#6366F1",
];

export const COVERAGE = {
  provinsi: 38,
  kabupatenKota: 514,
  kabupaten: 415,
  kecamatan: 7285,
  desa: 83762,
  kodeDaerah: 572,
  barisBelanja: 125757,
};

export const NATIONAL_PAGU: Record<number, number> = {
  2020: 1300.35,
  2021: 1228.93,
  2022: 1200.87,
  2025: 1399.99,
};

export const NATIONAL_REALISASI: Record<number, number> = {
  2020: 1119.62,
  2021: 1145.09,
  2022: 1187.4,
};

export const DATA_YEARS = [2020, 2021, 2022, 2023, 2024, 2025];

export const VALUES: number[][] = [
  [86.284, 65.852, 5.529, 294.181],
  [5.422, 6.169, 0.297, 0.0],
  [30.373, 32.989, 65.752, 1.236],
  [5.327, 6.283, 6.164, 10.214],
  [8.164, 31.019, 1.448, 1.02],
  [135.444, 161.159, 54.024, 0.2],
  [4.35, 6.902, 7.444, 0.0],
  [476.425, 69.569, 44.665, 15.807],
  [2.646, 9.802, 0.031, 0.569],
];

export const BIDANG_RANK = [363, 369, 396, 133, 218, 62, 30, 20, 200];

export const MEDIAN_NAS = [32.7308, 1.0994, 14.0793, 1.3648, 2.613, 17.4959, 0.3529, 26.7446, 0.7621];
export const MEDIAN_JT = [30.2132, 0.8802, 12.1295, 1.5355, 2.4112, 19.3239, 0.2239, 29.8935, 0.8616];

export const JENIS_RANK = [35, 312, 324, 208];
export const JENIS_MEDIAN_NAS = [37.8953, 26.3879, 15.1727, 19.5568];
export const JENIS_MEDIAN_JT = [36.9818, 25.4602, 12.471, 22.103];

export const slugify = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const sum = (row: number[]) => row.reduce((a, b) => a + b, 0);

export const BIDANG_TOTALS = VALUES.map(sum);

export const TOTAL = sum(BIDANG_TOTALS);

export const JENIS_TOTALS = JENIS.map((_, j) => VALUES.reduce((a, row) => a + row[j], 0));

export const pct = (value: number, base: number = TOTAL) => (value / base) * 100;

export const fmt1 = (n: number) =>
  n.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const rupiahMiliar = (n: number) => `Rp${fmt1(n)} miliar`;

export const rupiahTriliun = (n: number) =>
  `Rp${(n / 1000).toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} triliun`;

export const statusOf = (rank: number) =>
  rank <= 103
    ? { label: "Tinggi", cls: "c-hi" }
    : rank >= 312
      ? { label: "Rendah", cls: "c-lo" }
      : { label: "Sebanding", cls: "c-mid" };

export const percentileOf = (rank: number) =>
  ((COVERAGE.kabupaten - rank) / (COVERAGE.kabupaten - 1)) * 100;

export const signed = (value: number) =>
  `${value >= 0 ? "+" : "\u2212"}${fmt1(Math.abs(value))} poin`;

export const orderedBidang = [...BIDANG_TOTALS.keys()].sort(
  (a, b) => BIDANG_TOTALS[b] - BIDANG_TOTALS[a],
);

export const bidangsBySize = orderedBidang.map((i) => ({
  index: i,
  name: BIDANG[i],
  short: BIDANG_SHORT[i],
  total: BIDANG_TOTALS[i],
  share: pct(BIDANG_TOTALS[i]),
  rank: BIDANG_RANK[i],
  values: VALUES[i],
}));
