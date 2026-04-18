"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole, AmbassadorType } from "@prisma/client";
import { updateMemberActive, updateMemberRole, updateMemberAmbassadorType } from "@/server/actions/members";
import { addTagToUser, removeTagFromUser } from "@/server/actions/chat";
import { useRouter } from "next/navigation";

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface MemberActionsProps {
  userId: string;
  isActive: boolean;
  currentRole: UserRole;
  currentAmbassadorType: AmbassadorType | null;
  allTags: Tag[];
  userTagIds: string[];
}

export function MemberActions({ userId, isActive, currentRole, currentAmbassadorType, allTags, userTagIds }: MemberActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [tagIds, setTagIds] = useState<string[]>(userTagIds);
  const [isTagPending, startTagTransition] = useTransition();

  async function handleActiveToggle() {
    setIsLoading(true);
    const result = await updateMemberActive(userId, !isActive);
    if (result.success) router.refresh();
    setIsLoading(false);
    setShowEdit(false);
  }

  async function handleRoleChange(role: string | null) {
    if (!role) return;
    setIsLoading(true);
    const result = await updateMemberRole(userId, role as UserRole);
    if (result.success) router.refresh();
    setIsLoading(false);
  }

  async function handleAmbassadorTypeChange(val: string | null) {
    if (val === null) return;
    setIsLoading(true);
    const ambassadorType = val === "none" ? null : (val as AmbassadorType);
    const result = await updateMemberAmbassadorType(userId, ambassadorType);
    if (result.success) router.refresh();
    setIsLoading(false);
  }

  function handleTagToggle(tagId: string) {
    const has = tagIds.includes(tagId);
    startTagTransition(async () => {
      try {
        if (has) {
          await removeTagFromUser(userId, tagId);
          setTagIds((prev) => prev.filter((id) => id !== tagId));
        } else {
          await addTagToUser(userId, tagId);
          setTagIds((prev) => [...prev, tagId]);
        }
      } catch {
        // ignore
      }
    });
  }

  if (showEdit) {
    return (
      <div className="flex flex-col gap-2 items-end">
        <Button
          variant="outline"
          size="sm"
          className={`h-7 text-xs ${isActive ? "text-red-600 border-red-200 hover:bg-red-50" : "text-green-600 border-green-200 hover:bg-green-50"}`}
          onClick={handleActiveToggle}
          disabled={isLoading}
        >
          {isActive ? "無効にする" : "有効にする"}
        </Button>
        <Select
          defaultValue={currentRole}
          onValueChange={handleRoleChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-32 h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UserRole.MEMBER}>一般会員</SelectItem>
            <SelectItem value={UserRole.ADMIN}>管理者</SelectItem>
          </SelectContent>
        </Select>
        <Select
          defaultValue={currentAmbassadorType ?? "none"}
          onValueChange={handleAmbassadorTypeChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-40 h-7 text-xs">
            <SelectValue placeholder="アンバサダー" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">一般（3,300円）</SelectItem>
            <SelectItem value={AmbassadorType.REFERRAL}>紹介アンバサダー（4,300円）</SelectItem>
            <SelectItem value={AmbassadorType.PARTNER}>提携アンバサダー（9,900円）</SelectItem>
          </SelectContent>
        </Select>
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-end max-w-48">
            {allTags.map((tag) => {
              const active = tagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => handleTagToggle(tag.id)}
                  disabled={isTagPending}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border transition-all disabled:opacity-50"
                  style={
                    active
                      ? { backgroundColor: tag.color, color: "#fff", borderColor: tag.color }
                      : { backgroundColor: "transparent", color: tag.color, borderColor: tag.color }
                  }
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs text-gray-500"
          onClick={() => setShowEdit(false)}
        >
          閉じる
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="text-xs h-7"
      onClick={() => setShowEdit(true)}
    >
      編集
    </Button>
  );
}
