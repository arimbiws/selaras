import { PageShell } from "@/components/page-shell";
import { AnalysisView } from "@/components/analysis-view";
import { DEMO_REGION } from "@backend/constants";
import { getCachedAnalysis, getCachedRegions } from "@/lib/analysis-cache";

export const dynamic = "force-dynamic";

export default async function AnalisisPage({
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

  const [snapshot, regions] = await Promise.all([
    getCachedAnalysis(kodeDjpk, tahun ?? 0),
    getCachedRegions(),
  ]);

  return (
    <PageShell active="/analisis">
      <AnalysisView snapshot={snapshot} regions={regions} />
    </PageShell>
  );
}
