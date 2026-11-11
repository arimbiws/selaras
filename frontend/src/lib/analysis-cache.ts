import { unstable_cache } from "next/cache";
import { getAnalysisData, getRegions } from "@backend/repository";

export const getCachedRegions = unstable_cache(getRegions, ["analysis-regions"], {
  revalidate: 3600,
});

export const getCachedAnalysis = unstable_cache(
  async (kodeDjpk: string, tahun: number) =>
    getAnalysisData({ kodeDjpk, tahun: tahun || undefined }),
  ["analysis-snapshot-v3"],
  { revalidate: 300 },
);
