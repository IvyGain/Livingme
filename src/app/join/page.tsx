import { getJoinSettings } from "@/server/actions/join-settings";
import { prisma } from "@/lib/prisma";
import { JoinPageClient } from "./JoinPageClient";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ invite?: string }>;

export default async function JoinPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const settings = await getJoinSettings();
  const { invite: inviteToken } = await searchParams;

  let inviteEmail: string | null = null;
  let inviteError: string | null = null;

  if (inviteToken) {
    const invite = await prisma.inviteToken.findUnique({
      where: { token: inviteToken },
    });
    if (!invite) {
      inviteError = "招待リンクが無効です。";
    } else if (invite.usedAt) {
      inviteError = "この招待リンクは既に使用されています。";
    } else if (invite.expiresAt < new Date()) {
      inviteError = "招待リンクの有効期限が切れています。";
    } else {
      inviteEmail = invite.email;
    }
  }

  return (
    <JoinPageClient
      settings={settings}
      inviteToken={inviteToken ?? null}
      inviteEmail={inviteEmail}
      inviteError={inviteError}
    />
  );
}
