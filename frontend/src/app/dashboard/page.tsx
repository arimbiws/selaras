import { PageShell } from "@/components/page-shell";
import { DashboardData } from "@/components/dashboard-data";

export default function DashboardPage() {
  return (
    <PageShell active="/dashboard" title="Dashboard">
      <DashboardData />
    </PageShell>
  );
}
