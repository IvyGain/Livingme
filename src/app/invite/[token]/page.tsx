import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { InviteForm } from "./InviteForm";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: PageProps) {
  const { token } = await params;

  const invite = await prisma.inviteToken.findUnique({ where: { token } });

  if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
    notFound();
  }

  return <InviteForm token={token} email={invite.email} />;
}
