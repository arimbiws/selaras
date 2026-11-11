import {
  DEMO_REGION,
  FUNGSI_KODE,
  FUNGSI_LABEL,
  JENIS_KODE,
  JENIS_LABEL,
} from "./constants";
import type {
  BudgetBundle,
  BudgetFrame,
  BudgetJenis,
  BudgetValue,
  NationalPoint,
  Region,
  YearAvailability,
} from "./types";

export const FALLBACK_REGION: Region = { ...DEMO_REGION };

const PAGU_VALUES = [
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

const REALISASI_VALUES = [
  [131.92, 223.1, 55.953, 337.953],
  [5.057, 8.59, 0.537, 0],
  [24.714, 47.928, 94.785, 1.394],
  [5.005, 9.505, 5.463, 10.214],
  [7.722, 47.39, 4.607, 0.905],
  [80.481, 57.371, 43.642, 0.2],
  [3.633, 8.561, 5.957, 0],
  [450.177, 34.915, 32.967, 13.99],
  [2.618, 12.43, 0.197, 0.538],
];

const total = (rows: number[][]) =>
  rows.reduce((sum, row) => sum + row.reduce((rowSum, value) => rowSum + value, 0), 0);

const share = (value: number, base: number) => (base > 0 ? (value / base) * 100 : 0);

function buildFrame(
  rows: number[][],
  region: Region,
  tahun: number,
  status: "pagu" | "realisasi",
): BudgetFrame {
  const frameTotal = total(rows);
  const functions: BudgetValue[] = rows
    .map((values, index) => {
      const rowTotal = values.reduce((sum, value) => sum + value, 0);
      return {
        kode: FUNGSI_KODE[index],
        nama: FUNGSI_LABEL[index],
        totalMiliar: rowTotal,
        share: share(rowTotal, frameTotal),
        values,
      };
    })
    .sort((a, b) => b.totalMiliar - a.totalMiliar);

  const jenis: BudgetJenis[] = JENIS_KODE.map((kode, index) => {
    const jenisTotal = rows.reduce((sum, row) => sum + row[index], 0);
    return {
      kode,
      nama: JENIS_LABEL[index],
      totalMiliar: jenisTotal,
      share: share(jenisTotal, frameTotal),
    };
  });

  return {
    region,
    tahun,
    status,
    available: true,
    totalMiliar: frameTotal,
    functions,
    jenis,
    source: "fallback",
  };
}

export function emptyFrame(
  region: Region,
  tahun: number,
  status: "pagu" | "realisasi",
): BudgetFrame {
  return {
    region,
    tahun,
    status,
    available: false,
    totalMiliar: 0,
    functions: [],
    jenis: JENIS_KODE.map((kode, index) => ({
      kode,
      nama: JENIS_LABEL[index],
      totalMiliar: 0,
      share: 0,
    })),
    source: "fallback",
  };
}

export function fallbackFrame(
  region: Region,
  tahun: number,
  status: "pagu" | "realisasi",
): BudgetFrame {
  if (region.kodeDjpk !== FALLBACK_REGION.kodeDjpk || tahun !== 2023) {
    return emptyFrame(region, tahun, status);
  }
  return buildFrame(
    status === "realisasi" ? REALISASI_VALUES : PAGU_VALUES,
    region,
    tahun,
    status,
  );
}

export function fallbackBundle(kodeDjpk: string, tahun: number): BudgetBundle {
  const region =
    kodeDjpk === FALLBACK_REGION.kodeDjpk
      ? FALLBACK_REGION
      : { ...FALLBACK_REGION, kodeDjpk, nama: kodeDjpk };
  return {
    region,
    tahun,
    pagu: fallbackFrame(region, tahun, "pagu"),
    realisasi: fallbackFrame(region, tahun, "realisasi"),
    years: fallbackAvailability(kodeDjpk),
    source: "fallback",
  };
}

export function fallbackAvailability(kodeDjpk: string): YearAvailability[] {
  const isDemo = kodeDjpk === FALLBACK_REGION.kodeDjpk;
  const rows: YearAvailability[] = [
    { tahun: 2022, pagu: false, realisasi: false },
    { tahun: 2023, pagu: false, realisasi: false },
    { tahun: 2024, pagu: false, realisasi: false },
    { tahun: 2025, pagu: false, realisasi: false },
    { tahun: 2026, pagu: false, realisasi: false },
  ];

  return rows.map((row) => ({
    ...row,
    pagu: isDemo && row.tahun === 2023,
    realisasi: isDemo && row.tahun === 2023,
    catatan: isDemo
      ? row.tahun === 2023
        ? "Data contoh Kab. Pacitan 2023"
        : "Data contoh tidak mencakup tahun ini"
      : "Data contoh hanya tersedia untuk Kab. Pacitan 2023",
  }));
}

export function availabilityYears(): YearAvailability[] {
  return fallbackAvailability(FALLBACK_REGION.kodeDjpk);
}

export function fallbackRegions(): Region[] {
  return [FALLBACK_REGION];
}

export function fallbackNational(): NationalPoint[] {
  const pagu: Record<number, number> = {
    2022: 1200.87,
    2023: 1278.15,
    2024: 1382.33,
    2025: 1399.99,
    2026: 1249.31,
  };
  const realisasi: Record<number, number> = {
    2022: 1187.4,
    2023: 1319.63,
    2024: 854.86,
  };

  return [2022, 2023, 2024, 2025, 2026].map((tahun) => ({
    tahun,
    pagu: pagu[tahun] ?? null,
    realisasi: realisasi[tahun] ?? null,
    partial: tahun === 2024,
    source: "fallback" as const,
  }));
}
