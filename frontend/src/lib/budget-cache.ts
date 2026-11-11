import { unstable_cache } from "next/cache";
import { getBudgetBundle } from "@backend/repository";

export const getCachedBudget = unstable_cache(
  async (kodeDjpk: string, tahun: number) =>
    getBudgetBundle({ kodeDjpk, tahun: tahun || undefined }),
  ["budget-bundle-v3"],
  { revalidate: 120 },
);
