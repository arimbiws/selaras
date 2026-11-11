import { PageShell } from "@/components/page-shell";
import { BudgetSkeleton } from "@/components/page-skeletons";

export default function DetailAnggaranLoading() {
  return (
    <PageShell active="/anggaran">
      <BudgetSkeleton />
    </PageShell>
  );
}
