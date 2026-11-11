import { SimulationView } from "@/components/simulation-view";
import { getCachedRegions } from "@/lib/analysis-cache";
import { getCachedBudget } from "@/lib/budget-cache";

export const dynamic = "force-dynamic";

export default async function SimulasiPage() {
  const [bundle, regions] = await Promise.all([
    getCachedBudget("13.18", 0),
    getCachedRegions(),
  ]);
  return <SimulationView initialBundle={bundle} regions={regions} />;
}
