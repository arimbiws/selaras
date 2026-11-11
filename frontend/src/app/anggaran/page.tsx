import { PageShell } from "@/components/page-shell";
import { AnggaranView } from "@/components/anggaran-view";
import { DEMO_REGION } from "@backend/constants";
import { getCachedRegions } from "@/lib/analysis-cache";
import { getCachedBudget } from "@/lib/budget-cache";

export const dynamic = "force-dynamic";

export default async function AnggaranPage({
  searchParams,
}: {
  searchParams: Promise<{ kode?: string; tahun?: string }>;
}) {
  const query = await searchParams;
  const kodeDjpk = /^\d{2}\.\d{2}$/.test(query.kode ?? "")
    ? query.kode!
    : DEMO_REGION.kodeDjpk;
  const parsedYear = Number(query.tahun);
  const tahun =
    Number.isInteger(parsedYear) && parsedYear >= 2020 && parsedYear <= 2026
      ? parsedYear
      : undefined;

  const [bundle, regions] = await Promise.all([
    getCachedBudget(kodeDjpk, tahun ?? 0),
    getCachedRegions(),
  ]);

  return (
    <PageShell active="/anggaran">
      <AnggaranView initialBundle={bundle} regions={regions} />
    </PageShell>
  );
}
