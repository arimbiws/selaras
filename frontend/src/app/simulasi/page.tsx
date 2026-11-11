import { SimulationView } from "@/components/simulation-view";
import { getCachedBudget } from "@/lib/budget-cache";

export const dynamic = "force-dynamic";

export default async function SimulasiPage() {
  const bundle = await getCachedBudget("13.18", 0);
  return <SimulationView bundle={bundle} />;
}
