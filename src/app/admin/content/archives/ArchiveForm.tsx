"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArchiveCategory } from "@/lib/content-types";
import { createArchive, updateArchive, ArchiveInput } from "@/server/actions/archives";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { VideoUpload } from "@/components/admin/VideoUpload";

const categoryOptions = [
  { value: ArchiveCategory.MORNING_SESSION, label: "朝会" },
  { value: ArchiveCategory.EVENING_SESSION, label: "夜会" },
  { value: ArchiveCategory.LEARNING, label: "学び" },
  { value: ArchiveCategory.EVENT, label: "イベント" },
  { value: ArchiveCategory.OTHER, label: "その他" },
];

interface ArchiveFormProps {
  archiveId?: string;
  initialData?: Partial<ArchiveInput>;
}

export function ArchiveForm({ archiveId, initialData }: ArchiveFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? false);
  const [category, setCategory] = useState<ArchiveCategory>(
    initialData?.category ?? ArchiveCategory.MORNING_SESSION
  );
  const [tagInput, setTagInput] = useState(
    initialData?.tags?.join(", ") ?? ""
  );
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnailUrl ?? "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const tags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const data: ArchiveInput = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      date: formData.get("date") as string,
      category,
      videoUrl,
      thumbnailUrl,
      minutes: formData.get("minutes") as string,
      summary: formData.get("summary") as string,
      energyShare: formData.get("energyShare") as string,
      journalingTheme: formData.get("journalingTheme") as string,
      isPublished,
      tags,
    };

    const result = archiveId
      ? await updateArchive(archiveId, data)
      : await createArchive(data);

    if (result.success) {
      router.push("/admin/content/archives");
    } else {
      setError(result.error ?? "保存に失敗しました");
      setIsLoading(false);
    }
  }

  const defaultDate = initialData?.date
    ? typeof initialData.date === "string"
      ? initialData.date
      : new Date(initialData.date as unknown as Date).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="title">タイトル *</Label>
          <Input
            id="title"
            name="title"
            defaultValue={initialData?.title}
            required
            placeholder="アーカイブタイトル"
          />
        </div>

        <div className="space-y-2">
          <Label>カテゴリー *</Label>
          <Select
            value={category}
            onValueChange={(v) => { if (v) setCategory(v as ArchiveCategory); }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">日付 *</Label>
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={defaultDate}
            required
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <VideoUpload
            label="動画"
            hint="（PC直接アップロード または YouTube埋め込みURL）"
            value={videoUrl}
            onChange={setVideoUrl}
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <ImageUpload
            label="サムネイル画像"
            hint="（PC直接アップロード または URL）"
            value={thumbnailUrl}
            onChange={setThumbnailUrl}
            previewClass="h-24 w-40 object-cover rounded-lg border border-gray-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="minutes">再生時間（分）</Label>
          <Input
            id="minutes"
            name="minutes"
            defaultValue={initialData?.minutes ?? ""}
            placeholder="60"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="description">説明</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={initialData?.description ?? ""}
            rows={2}
            placeholder="アーカイブの説明..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="energyShare">エネルギーシェア</Label>
          <Textarea
            id="energyShare"
            name="energyShare"
            defaultValue={initialData?.energyShare ?? ""}
            rows={3}
            placeholder="その日のエネルギーシェア..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="journalingTheme">ジャーナリングテーマ</Label>
          <Input
            id="journalingTheme"
            name="journalingTheme"
            defaultValue={initialData?.journalingTheme ?? ""}
            placeholder="ジャーナリングテーマ..."
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="summary">サマリー</Label>
          <Textarea
            id="summary"
            name="summary"
            defaultValue={initialData?.summary ?? ""}
            rows={4}
            placeholder="セッションのサマリー..."
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="tags">タグ（カンマ区切り）</Label>
          <Input
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="タグ1, タグ2, タグ3"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={() => setIsPublished(!isPublished)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isPublished ? "bg-[#7A9E7E]" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isPublished ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className="text-sm text-gray-600">
          {isPublished ? "公開する" : "下書き保存"}
        </span>
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-[#C07052] hover:bg-[#a85e42] text-white"
        >
          {isLoading ? "保存中..." : archiveId ? "更新する" : "作成する"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/content/archives")}
          disabled={isLoading}
        >
          キャンセル
        </Button>
      </div>
    </form>
  );
}
