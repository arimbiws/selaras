import { PageShell } from "@/components/page-shell";
import { DashboardData } from "@/components/dashboard-data";
import { getNationalSeries } from "@backend/repository";
import { getCachedBudget } from "@/lib/budget-cache";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [bundle, national] = await Promise.all([
    getCachedBudget("13.18", 0),
    getNationalSeries(),
  ]);

  return (
    <PageShell active="/dashboard">
      <DashboardData
        bundle={bundle}
        national={national.points}
        nationalSource={national.source}
      />
    </PageShell>
  );
}
