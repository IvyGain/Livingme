"use client";

import { Button } from "@/components/ui/button";
import { deleteEvent } from "@/server/actions/events";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function EventDeleteButton({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("このイベントを削除しますか？")) return;

    setIsDeleting(true);
    const result = await deleteEvent(eventId);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error ?? "削除に失敗しました");
    }
    setIsDeleting(false);
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-xs h-7 text-red-500 hover:text-red-700 hover:bg-red-50"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? "..." : "削除"}
    </Button>
  );
}
