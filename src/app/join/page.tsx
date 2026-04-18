import { getJoinSettings } from "@/server/actions/join-settings";
import { JoinPageClient } from "./JoinPageClient";

export const dynamic = "force-dynamic";

export default async function JoinPage() {
  const settings = await getJoinSettings();
  return <JoinPageClient settings={settings} />;
}
