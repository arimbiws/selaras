import { PageShell } from "@/components/page-shell";
import { SourceSkeleton } from "@/components/page-skeletons";

export default function SumberDataLoading() {
  return (
    <PageShell active="/sumber-data">
      <SourceSkeleton />
    </PageShell>
  );
}
