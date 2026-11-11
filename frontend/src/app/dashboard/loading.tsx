import { PageShell } from "@/components/page-shell";
import { DashboardSkeleton } from "@/components/page-skeletons";

export default function DashboardLoading() {
  return (
    <PageShell active="/dashboard">
      <DashboardSkeleton />
    </PageShell>
  );
}
