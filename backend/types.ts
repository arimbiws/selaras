export type BudgetStatus = "pagu" | "realisasi";

export type DataSource = "supabase" | "fallback";

export type Region = {
  kodeDjpk: string;
  nama: string;
  jenisDaerah: string;
  kodeProvinsi: string | null;
};

export type BudgetValue = {
  kode: string;
  nama: string;
  totalMiliar: number;
  share: number;
  values: number[];
};

export type BudgetJenis = {
  kode: string;
  nama: string;
  totalMiliar: number;
  share: number;
};

export type BudgetFrame = {
  region: Region;
  tahun: number;
  status: BudgetStatus;
  available: boolean;
  totalMiliar: number;
  functions: BudgetValue[];
  jenis: BudgetJenis[];
  source: DataSource;
};

export type YearAvailability = {
  tahun: number;
  pagu: boolean;
  realisasi: boolean;
  catatan?: string;
};

export type BudgetBundle = {
  region: Region;
  tahun: number;
  pagu: BudgetFrame | null;
  realisasi: BudgetFrame | null;
  years: YearAvailability[];
  source: DataSource;
};

export type NationalPoint = {
  tahun: number;
  pagu: number | null;
  realisasi: number | null;
  partial: boolean;
  jumlahDaerah?: number;
  source: DataSource;
};

export type SourceMetadata = {
  sumberFile: string;
  tahun: number;
  status: BudgetStatus;
  sheetDigunakan: string | null;
  tanggalPublikasi: string | null;
  catatan: string | null;
};

export type DatasetSummary = {
  totalBaris: number;
  totalDaerah: number;
  tahun: YearAvailability[];
  national: NationalPoint[];
  sources: SourceMetadata[];
  source: DataSource;
};

export type ComparisonStatus = "high" | "mid" | "low";

export type AnalysisMetric = {
  kode: string;
  nama: string;
  totalMiliar: number;
  share: number;
  medianNasional: number;
  medianProvinsi: number | null;
  rankNasional: number;
  rankProvinsi: number | null;
  percentileNasional: number;
  percentileProvinsi: number | null;
  statusNasional: ComparisonStatus;
  statusProvinsi: ComparisonStatus | null;
};

export type AnalysisSnapshot = {
  region: Region;
  tahun: number;
  available: boolean;
  totalMiliar: number;
  source: DataSource;
  years: YearAvailability[];
  provinceName: string | null;
  comparisonCountNasional: number;
  comparisonCountProvinsi: number | null;
  functions: AnalysisMetric[];
  jenis: AnalysisMetric[];
  note?: string;
};
