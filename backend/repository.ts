import {
  DEMO_REGION,
  EXPECTED_YEARS,
  FUNGSI_KODE,
  FUNGSI_LABEL,
  JENIS_KODE,
  JENIS_LABEL,
} from "./constants";
import {
  FALLBACK_REGION,
  emptyFrame,
  fallbackAvailability,
  fallbackBundle,
  fallbackNational,
  fallbackRegions,
} from "./fallback";
import { supabaseConfigured, supabaseServer } from "./supabase";
import type {
  AnalysisMetric,
  AnalysisSnapshot,
  BudgetBundle,
  BudgetFrame,
  BudgetJenis,
  BudgetStatus,
  BudgetValue,
  ComparisonStatus,
  DatasetSummary,
  NationalPoint,
  Region,
  SourceMetadata,
  YearAvailability,
} from "./types";

type DaerahRow = {
  kode_djpk?: string | null;
  nama?: string | null;
  jenis_daerah?: string | null;
  kode_djpk_provinsi?: string | null;
  nama_provinsi_kemendagri?: string | null;
};

type YearRow = {
  tahun?: number | string | null;
  pagu?: number | string | null;
  realisasi?: number | string | null;
};

type BelanjaRow = {
  kode_djpk?: string | null;
  tahun?: number | string | null;
  status?: string | null;
  fungsi_kode?: string | null;
  fungsi?: string | null;
  jenis_kode?: string | null;
  jenis?: string | null;
  nilai?: number | string | null;
  pagu?: number | string | null;
  realisasi?: number | string | null;
};

type NationalRow = {
  tahun?: number | string | null;
  status?: string | null;
  total_belanja?: number | string | null;
  jumlah_daerah?: number | string | null;
};

type SourceRow = {
  sumber_file?: string | null;
  tahun?: number | string | null;
  status?: string | null;
  sheet_digunakan?: string | null;
  tanggal_publikasi?: string | null;
  catatan?: string | null;
};

type RegionAggregate = {
  total: number;
  functions: Map<string, number>;
  jenis: Map<string, number>;
};

const PAGE_SIZE = 1000;

const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toText = (value: unknown): string => String(value ?? "").trim();

const mapRegion = (row: DaerahRow, fallbackKode = ""): Region | null => {
  const kodeDjpk = toText(row.kode_djpk ?? fallbackKode);
  if (!kodeDjpk) return null;
  return {
    kodeDjpk,
    nama: toText(row.nama) || kodeDjpk,
    jenisDaerah: toText(row.jenis_daerah) || "kabupaten",
    kodeProvinsi: toText(row.kode_djpk_provinsi) || null,
  };
};

const rowsForStatus = (rows: BelanjaRow[], status: BudgetStatus): BelanjaRow[] =>
  rows.flatMap((row) => {
    const value = status === "pagu" ? row.pagu : row.realisasi;
    return toNumber(value) === null ? [] : [{ ...row, nilai: value }];
  });

const aggregate = (
  rows: BelanjaRow[],
  region: Region,
  tahun: number,
  status: BudgetStatus,
  source: "supabase" | "fallback",
): BudgetFrame => {
  if (!rows.length) {
    return { ...emptyFrame(region, tahun, status), source };
  }

  const fungsi = new Map<string, { nama: string; values: Record<string, number> }>();
  const jenisTotals = new Map<string, number>();
  let total = 0;

  for (const row of rows) {
    const fungsiKode = toText(row.fungsi_kode);
    const jenisKode = toText(row.jenis_kode);
    const value = toNumber(row.nilai);
    if (!fungsiKode || !jenisKode || value === null) continue;

    const miliar = value / 1_000_000_000;
    total += miliar;

    const canonicalIndex = FUNGSI_KODE.findIndex((kode) => kode === fungsiKode);
    const entry = fungsi.get(fungsiKode) ?? {
      nama: canonicalIndex >= 0 ? FUNGSI_LABEL[canonicalIndex] : toText(row.fungsi) || fungsiKode,
      values: {},
    };
    entry.values[jenisKode] = (entry.values[jenisKode] ?? 0) + miliar;
    fungsi.set(fungsiKode, entry);
    jenisTotals.set(jenisKode, (jenisTotals.get(jenisKode) ?? 0) + miliar);
  }

  const functions: BudgetValue[] = Array.from(fungsi.entries())
    .map(([kode, entry]) => {
      const values = JENIS_KODE.map((jenisKode) => entry.values[jenisKode] ?? 0);
      const rowTotal = values.reduce((sum, value) => sum + value, 0);
      return {
        kode,
        nama: entry.nama,
        totalMiliar: rowTotal,
        share: total > 0 ? (rowTotal / total) * 100 : 0,
        values,
      };
    })
    .sort((a, b) => b.totalMiliar - a.totalMiliar);

  const jenis: BudgetJenis[] = JENIS_KODE.map((kode, index) => {
    const jenisTotal = jenisTotals.get(kode) ?? 0;
    return {
      kode,
      nama: JENIS_LABEL[index],
      totalMiliar: jenisTotal,
      share: total > 0 ? (jenisTotal / total) * 100 : 0,
    };
  });

  return {
    region,
    tahun,
    status,
    available: rows.length > 0,
    totalMiliar: total,
    functions,
    jenis,
    source,
  };
};

const getRegion = async (kodeDjpk: string): Promise<Region> => {
  if (!supabaseServer) return { ...FALLBACK_REGION, kodeDjpk };

  const { data, error } = await supabaseServer
    .from("daerah")
    .select("kode_djpk,nama,jenis_daerah,kode_djpk_provinsi,nama_provinsi_kemendagri")
    .eq("kode_djpk", kodeDjpk)
    .maybeSingle();

  if (error || !data) return { ...FALLBACK_REGION, kodeDjpk, nama: kodeDjpk };
  return mapRegion(data as DaerahRow, kodeDjpk) ?? { ...FALLBACK_REGION, kodeDjpk, nama: kodeDjpk };
};

const getRegionYears = async (kodeDjpk: string): Promise<YearAvailability[]> => {
  if (!supabaseServer) return fallbackAvailability(kodeDjpk);

  const { data, error } = await supabaseServer
    .from("budget_vs_actual")
    .select("tahun,pagu,realisasi")
    .eq("kode_djpk", kodeDjpk)
    .limit(5000);

  if (error || !data?.length) return [];

  const available = new Map<number, { pagu: boolean; realisasi: boolean }>();

  for (const row of data as YearRow[]) {
    const tahun = toNumber(row.tahun);
    if (tahun === null) continue;
    const entry = available.get(tahun) ?? { pagu: false, realisasi: false };
    if (toNumber(row.pagu) !== null) entry.pagu = true;
    if (toNumber(row.realisasi) !== null) entry.realisasi = true;
    available.set(tahun, entry);
  }

  return Array.from(available.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([tahun, value]) => ({ tahun, ...value }));
};

const withSelectedYear = (
  years: YearAvailability[],
  tahun: number,
  catatan?: string,
): YearAvailability[] => {
  if (years.some((row) => row.tahun === tahun)) return years;
  return [...years, { tahun, pagu: false, realisasi: false, catatan }].sort(
    (a, b) => b.tahun - a.tahun,
  );
};

export async function getRegions(): Promise<Region[]> {
  if (!supabaseConfigured || !supabaseServer) return fallbackRegions();

  const { data, error } = await supabaseServer
    .from("daerah")
    .select("kode_djpk,nama,jenis_daerah,kode_djpk_provinsi,nama_provinsi_kemendagri")
    .order("nama", { ascending: true })
    .limit(1000);

  if (error || !data?.length) return fallbackRegions();

  const regions = (data as DaerahRow[])
    .map((row) => mapRegion(row))
    .filter((region): region is Region => Boolean(region))
    .sort((a, b) => a.nama.localeCompare(b.nama, "id"));

  return regions.length ? regions : fallbackRegions();
}

export async function getLatestPaguYear(): Promise<number> {
  if (!supabaseServer) return 2023;

  const { data, error } = await supabaseServer
    .from("dashboard_apbd_tahunan")
    .select("tahun")
    .eq("status", "pagu")
    .order("tahun", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!error && data) {
    const tahun = toNumber((data as { tahun?: unknown }).tahun);
    if (tahun !== null) return tahun;
  }

  const fallback = await supabaseServer
    .from("belanja")
    .select("tahun")
    .eq("status", "pagu")
    .order("tahun", { ascending: false })
    .limit(1)
    .maybeSingle();

  const tahun = toNumber((fallback.data as { tahun?: unknown } | null)?.tahun);
  return tahun ?? 2023;
}

export async function getBudgetBundle({
  kodeDjpk = DEMO_REGION.kodeDjpk,
  tahun,
}: {
  kodeDjpk?: string;
  tahun?: number;
} = {}): Promise<BudgetBundle> {
  if (!supabaseConfigured || !supabaseServer) {
    return fallbackBundle(kodeDjpk, tahun ?? 2023);
  }

  const targetYear = tahun ?? (await getLatestPaguYear());
  const [region, years, query] = await Promise.all([
    getRegion(kodeDjpk),
    getRegionYears(kodeDjpk),
    supabaseServer
      .from("budget_vs_actual")
      .select("kode_djpk,tahun,fungsi_kode,fungsi,jenis_kode,jenis,pagu,realisasi")
      .eq("kode_djpk", kodeDjpk)
      .eq("tahun", targetYear)
      .limit(1000),
  ]);

  const safeYears = withSelectedYear(years, targetYear);

  if (query.error || !query.data?.length) {
    const fallback = fallbackBundle(kodeDjpk, targetYear);
    const mergedYears = safeYears.map((row) =>
      row.tahun === targetYear && fallback.pagu?.available
        ? {
            ...row,
            pagu: true,
            realisasi: Boolean(fallback.realisasi?.available),
            catatan: "Data contoh Kab. Pacitan 2023",
          }
        : row,
    );
    return {
      ...fallback,
      region,
      years: mergedYears.some((row) => row.pagu || row.realisasi)
        ? mergedYears
        : fallback.years,
    };
  }

  const rows = query.data as BelanjaRow[];
  const paguRows = rowsForStatus(rows, "pagu");
  const realisasiRows = rowsForStatus(rows, "realisasi");

  return {
    region,
    tahun: targetYear,
    pagu: aggregate(paguRows, region, targetYear, "pagu", "supabase"),
    realisasi: aggregate(realisasiRows, region, targetYear, "realisasi", "supabase"),
    years: safeYears,
    source: "supabase",
  };
}

export async function getNationalSeries(): Promise<{
  points: NationalPoint[];
  source: "supabase" | "fallback";
}> {
  if (!supabaseConfigured || !supabaseServer) {
    return { points: fallbackNational(), source: "fallback" };
  }

  const { data, error } = await supabaseServer
    .from("dashboard_apbd_tahunan")
    .select("tahun,status,total_belanja,jumlah_daerah")
    .order("tahun", { ascending: true });

  if (error || !data?.length) {
    return { points: fallbackNational(), source: "fallback" };
  }

  const byYear = new Map<number, NationalPoint>();
  for (const tahun of EXPECTED_YEARS) {
    byYear.set(tahun, {
      tahun,
      pagu: null,
      realisasi: null,
      partial: tahun === 2024,
      source: "supabase",
    });
  }

  for (const row of data as NationalRow[]) {
    const tahun = toNumber(row.tahun);
    if (tahun === null) continue;
    const point = byYear.get(tahun) ?? {
      tahun,
      pagu: null,
      realisasi: null,
      partial: tahun === 2024,
      source: "supabase" as const,
    };
    const value = toNumber(row.total_belanja);
    if (row.status === "pagu" && value !== null) point.pagu = value / 1_000_000_000_000;
    if (row.status === "realisasi" && value !== null) {
      point.realisasi = value / 1_000_000_000_000;
      point.jumlahDaerah = toNumber(row.jumlah_daerah) ?? undefined;
    }
    byYear.set(tahun, point);
  }

  const points = Array.from(byYear.values()).sort((a, b) => a.tahun - b.tahun);
  const hasData = points.some((point) => point.pagu !== null || point.realisasi !== null);
  return hasData
    ? { points, source: "supabase" }
    : { points: fallbackNational(), source: "fallback" };
}

export async function getSourceData(): Promise<SourceMetadata[]> {
  if (!supabaseConfigured || !supabaseServer) return [];

  const { data, error } = await supabaseServer
    .from("sumber_data")
    .select("sumber_file,tahun,status,sheet_digunakan,tanggal_publikasi,catatan")
    .order("tahun", { ascending: true })
    .order("status", { ascending: true });

  if (error || !data?.length) return [];

  return (data as SourceRow[]).flatMap((row) => {
    const tahun = toNumber(row.tahun);
    const status = toText(row.status);
    if (tahun === null || (status !== "pagu" && status !== "realisasi")) return [];
    return [
      {
        sumberFile: toText(row.sumber_file),
        tahun,
        status,
        sheetDigunakan: toText(row.sheet_digunakan) || null,
        tanggalPublikasi: toText(row.tanggal_publikasi) || null,
        catatan: toText(row.catatan) || null,
      },
    ];
  });
}

const datasetNotes: Record<number, string | undefined> = {
  2022: "Realisasi sementara per 8 Jan 2024",
  2023: "Pagu dan realisasi tersedia di paket CSV; belum diimpor ke Supabase",
  2024: "Pagu dan realisasi parsial tersedia di paket CSV; belum diimpor ke Supabase",
  2025: "Pagu per 18 Sep 2025; realisasi belum tersedia",
  2026: "Pagu tersedia di paket CSV; belum diimpor ke Supabase",
};

export async function getDatasetSummary(): Promise<DatasetSummary> {
  const [national, sources] = await Promise.all([getNationalSeries(), getSourceData()]);
  let totalBaris = 0;
  let totalDaerah = 0;
  let countSource: "supabase" | "fallback" = sources.length ? "supabase" : "fallback";

  if (supabaseConfigured && supabaseServer) {
    const [belanjaCount, daerahCount] = await Promise.all([
      supabaseServer.from("belanja").select("kode_djpk", { count: "exact", head: true }),
      supabaseServer.from("daerah").select("kode_djpk", { count: "exact", head: true }),
    ]);

    if (!belanjaCount.error && typeof belanjaCount.count === "number") {
      totalBaris = belanjaCount.count;
    }
    if (!daerahCount.error && typeof daerahCount.count === "number") {
      totalDaerah = daerahCount.count;
      countSource = "supabase";
    }
  }

  const pointByYear = new Map(national.points.map((point) => [point.tahun, point]));
  const allYears = Array.from(
    new Set([...EXPECTED_YEARS, ...national.points.map((point) => point.tahun)]),
  ).sort((a, b) => a - b);

  const years: YearAvailability[] = allYears.map((tahun) => {
    const point = pointByYear.get(tahun);
    const pagu = point?.pagu !== null && point?.pagu !== undefined;
    const realisasi = point?.realisasi !== null && point?.realisasi !== undefined;
    return {
      tahun,
      pagu,
      realisasi,
      catatan: datasetNotes[tahun] ?? (!pagu ? "Belum ada di Supabase" : undefined),
    };
  });

  return {
    totalBaris,
    totalDaerah,
    tahun: years,
    national: national.points,
    sources,
    source:
      countSource === "supabase" || national.source === "supabase" ? "supabase" : "fallback",
  };
}

const median = (values: number[]): number => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
};

const rankOf = (value: number, peers: number[]): number =>
  1 + peers.filter((peer) => peer > value + 1e-9).length;

const percentileOf = (rank: number, count: number): number =>
  count <= 1 ? 100 : ((count - rank) / (count - 1)) * 100;

const statusOf = (rank: number, count: number): ComparisonStatus => {
  const highLimit = Math.max(1, Math.round(count * 0.25));
  const lowLimit = Math.max(highLimit + 1, Math.round(count * 0.75));
  if (rank <= highLimit) return "high";
  if (rank >= lowLimit) return "low";
  return "mid";
};

const fetchViewRows = async (tahun: number): Promise<BelanjaRow[]> => {
  const db = supabaseServer;
  if (!db) return [];

  const countQuery = await db
    .from("budget_vs_actual")
    .select("kode_djpk", { count: "exact", head: true })
    .eq("tahun", tahun);

  if (countQuery.error) throw new Error(countQuery.error.message);

  const total = countQuery.count ?? 0;
  if (!total) return [];

  const pages = Math.ceil(total / PAGE_SIZE);
  const results = await Promise.all(
    Array.from({ length: pages }, async (_, page) => {
      const from = page * PAGE_SIZE;
      const { data, error } = await db
        .from("budget_vs_actual")
        .select("kode_djpk,tahun,fungsi_kode,jenis_kode,pagu")
        .eq("tahun", tahun)
        .order("kode_djpk", { ascending: true })
        .order("fungsi_kode", { ascending: true })
        .order("jenis_kode", { ascending: true })
        .range(from, from + PAGE_SIZE - 1);

      if (error) throw new Error(error.message);
      return (data ?? []) as BelanjaRow[];
    }),
  );

  return results.flat();
};

const aggregateByRegion = (rows: BelanjaRow[]): Map<string, RegionAggregate> => {
  const result = new Map<string, RegionAggregate>();

  for (const row of rows) {
    const kode = toText(row.kode_djpk);
    const pagu = toNumber(row.pagu);
    if (!kode || pagu === null) continue;

    const fungsiKode = toText(row.fungsi_kode);
    const jenisKode = toText(row.jenis_kode);
    const entry = result.get(kode) ?? {
      total: 0,
      functions: new Map<string, number>(),
      jenis: new Map<string, number>(),
    };

    entry.total += pagu;
    if (fungsiKode) {
      entry.functions.set(fungsiKode, (entry.functions.get(fungsiKode) ?? 0) + pagu);
    }
    if (jenisKode) {
      entry.jenis.set(jenisKode, (entry.jenis.get(jenisKode) ?? 0) + pagu);
    }
    result.set(kode, entry);
  }

  return result;
};

const buildMetric = ({
  kode,
  nama,
  selectedShare,
  selectedTotal,
  dimension,
  nationalPeers,
  provincePeers,
}: {
  kode: string;
  nama: string;
  selectedShare: number;
  selectedTotal: number;
  dimension: "functions" | "jenis";
  nationalPeers: RegionAggregate[];
  provincePeers: RegionAggregate[];
}): AnalysisMetric => {
  const nationalShares = nationalPeers.map((peer) =>
    peer.total > 0 ? ((peer[dimension].get(kode) ?? 0) / peer.total) * 100 : 0,
  );
  const provinceShares = provincePeers.map((peer) =>
    peer.total > 0 ? ((peer[dimension].get(kode) ?? 0) / peer.total) * 100 : 0,
  );

  const nationalCount = nationalShares.length + 1;
  const provinceCount = provinceShares.length ? provinceShares.length + 1 : null;
  const nationalRank = rankOf(selectedShare, nationalShares);
  const provinceRank = provinceCount === null ? null : rankOf(selectedShare, provinceShares);

  return {
    kode,
    nama,
    totalMiliar: selectedTotal,
    share: selectedShare,
    medianNasional: median(nationalShares),
    medianProvinsi: provinceCount === null ? null : median(provinceShares),
    rankNasional: nationalRank,
    rankProvinsi: provinceRank,
    percentileNasional: percentileOf(nationalRank, nationalCount),
    percentileProvinsi:
      provinceRank === null || provinceCount === null
        ? null
        : percentileOf(provinceRank, provinceCount),
    statusNasional: statusOf(nationalRank, nationalCount),
    statusProvinsi:
      provinceRank === null || provinceCount === null
        ? null
        : statusOf(provinceRank, provinceCount),
  };
};

export async function getAnalysisData({
  kodeDjpk = DEMO_REGION.kodeDjpk,
  tahun,
}: {
  kodeDjpk?: string;
  tahun?: number;
} = {}): Promise<AnalysisSnapshot> {
  const bundle = await getBudgetBundle({ kodeDjpk, tahun });
  const frame = bundle.pagu;

  if (!frame?.available || bundle.source !== "supabase") {
    return {
      region: bundle.region,
      tahun: bundle.tahun,
      available: false,
      totalMiliar: frame?.totalMiliar ?? 0,
      source: bundle.source,
      years: bundle.years,
      provinceName: null,
      comparisonCountNasional: 0,
      comparisonCountProvinsi: null,
      functions: [],
      jenis: [],
      note: "Data pembanding belum tersedia untuk daerah dan tahun ini.",
    };
  }

  const [regions, rows] = await Promise.all([
    getRegions(),
    fetchViewRows(bundle.tahun).catch(() => []),
  ]);

  const selected = regions.find((region) => region.kodeDjpk === bundle.region.kodeDjpk);
  const provinceCode = selected?.kodeProvinsi ?? bundle.region.kodeProvinsi;
  const provinceName = provinceCode
    ? regions.find((region) => region.kodeDjpk === provinceCode)?.nama ?? provinceCode
    : null;
  const regionType = selected?.jenisDaerah ?? bundle.region.jenisDaerah;

  const nationalPeers = regions
    .filter(
      (region) =>
        region.kodeDjpk !== bundle.region.kodeDjpk &&
        region.jenisDaerah === regionType,
    )
    .map((region) => region.kodeDjpk);
  const provincePeerCodes = provinceCode
    ? regions
        .filter(
          (region) =>
            region.kodeDjpk !== bundle.region.kodeDjpk &&
            region.jenisDaerah === regionType &&
            region.kodeProvinsi === provinceCode,
        )
        .map((region) => region.kodeDjpk)
    : [];

  const aggregates = aggregateByRegion(rows);
  const nationalAggregates = nationalPeers
    .map((kode) => aggregates.get(kode))
    .filter((aggregate): aggregate is RegionAggregate => Boolean(aggregate && aggregate.total > 0));
  const provinceAggregates = provincePeerCodes
    .map((kode) => aggregates.get(kode))
    .filter((aggregate): aggregate is RegionAggregate => Boolean(aggregate && aggregate.total > 0));

  const selectedFunctions = new Map(
    frame.functions.map((item) => [item.kode, item.totalMiliar]),
  );
  const selectedJenis = new Map(frame.jenis.map((item) => [item.kode, item.totalMiliar]));
  const total = frame.totalMiliar;
  const shareOf = (value: number) => (total > 0 ? (value / total) * 100 : 0);

  const functions = FUNGSI_KODE.map((kode, index) =>
    buildMetric({
      kode,
      nama: FUNGSI_LABEL[index],
      selectedShare: shareOf(selectedFunctions.get(kode) ?? 0),
      selectedTotal: selectedFunctions.get(kode) ?? 0,
      dimension: "functions",
      nationalPeers: nationalAggregates,
      provincePeers: provinceAggregates,
    }),
  ).sort((a, b) => b.totalMiliar - a.totalMiliar);

  const jenis = JENIS_KODE.map((kode, index) =>
    buildMetric({
      kode,
      nama: JENIS_LABEL[index],
      selectedShare: shareOf(selectedJenis.get(kode) ?? 0),
      selectedTotal: selectedJenis.get(kode) ?? 0,
      dimension: "jenis",
      nationalPeers: nationalAggregates,
      provincePeers: provinceAggregates,
    }),
  );

  const comparisonCountNasional = nationalAggregates.length + 1;
  const comparisonCountProvinsi = provinceAggregates.length
    ? provinceAggregates.length + 1
    : null;

  return {
    region: bundle.region,
    tahun: bundle.tahun,
    available: true,
    totalMiliar: total,
    source: "supabase",
    years: bundle.years,
    provinceName,
    comparisonCountNasional,
    comparisonCountProvinsi,
    functions,
    jenis,
    note: nationalAggregates.length
      ? undefined
      : "Data pembanding daerah lain belum dapat dimuat.",
  };
}

export const backendMeta = {
  configured: supabaseConfigured,
  functions: FUNGSI_KODE,
};
