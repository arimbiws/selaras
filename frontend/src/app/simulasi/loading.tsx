import { PageShell } from "@/components/page-shell";
import { SimulationSkeleton } from "@/components/page-skeletons";

export default function SimulasiLoading() {
  return (
    <PageShell active="/simulasi">
      <SimulationSkeleton />
    </PageShell>
  );
}
