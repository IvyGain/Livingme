import { getPublishedEnergyShares } from "@/server/actions/today";
import { EnergyShareList } from "./EnergyShareList";

export const dynamic = "force-dynamic";

export default async function EnergySharePage() {
  const shares = await getPublishedEnergyShares();
  return <EnergyShareList shares={shares} />;
}
