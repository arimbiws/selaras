import { PageShell } from "@/components/page-shell";
import { DashboardData } from "@/components/dashboard-data";
import { getNationalSeries } from "@backend/repository";
import { getCachedAnalysis } from "@/lib/analysis-cache";
import { getCachedBudget } from "@/lib/budget-cache";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [bundle, national, analysis] = await Promise.all([
    getCachedBudget("13.18", 0),
    getNationalSeries(),
    getCachedAnalysis("13.18", 0),
  ]);

  return (
    <PageShell active="/dashboard">
      <DashboardData
        bundle={bundle}
        national={national.points}
        nationalSource={national.source}
        analysis={analysis}
      />
    </PageShell>
  );
}
