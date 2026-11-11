import { PageShell } from "@/components/page-shell";
import { AnalysisSkeleton } from "@/components/page-skeletons";

export default function AnalisisLoading() {
  return (
    <PageShell active="/analisis">
      <AnalysisSkeleton />
    </PageShell>
  );
}
