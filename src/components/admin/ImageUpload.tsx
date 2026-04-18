"use client";

import { useRef, useState } from "react";
import { Upload, Link as LinkIcon, X, Loader2 } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  previewClass?: string;
}

/**
 * 画像アップロードコンポーネント
 * - ファイル選択ボタン（Vercel Blob にアップロード）
 * - URL 直接入力（切り替え可能）
 */
export function ImageUpload({
  value,
  onChange,
  label,
  hint,
  previewClass = "h-20 w-32 object-cover rounded-lg border border-gray-200",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "アップロードに失敗しました");
        return;
      }
      onChange(data.url);
    } catch {
      setError("アップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // 同じファイルを再選択できるようリセット
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-xs font-medium text-gray-600">
          {label}
          {hint && <span className="ml-1.5 font-normal text-gray-400">{hint}</span>}
        </p>
      )}

      {/* 現在の画像プレビュー */}
      {value && (
        <div className="flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className={previewClass}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-500">アップロード済み</p>
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-600"
            >
              <X className="w-3 h-3" /> 削除
            </button>
          </div>
        </div>
      )}

      {/* アップロードエリア */}
      {!value && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-[#C07052] transition-colors"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <Loader2 className="w-5 h-5 text-[#C07052] animate-spin" />
              <p className="text-xs text-gray-400">アップロード中...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <Upload className="w-5 h-5 text-gray-300" />
              <p className="text-xs text-gray-500">
                ここにドラッグ&ドロップ、または
              </p>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C07052] text-white text-xs font-medium rounded-lg hover:bg-[#a85e42] transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                ファイルを選択
              </button>
              <p className="text-[10px] text-gray-300">JPEG / PNG / WebP / GIF・最大10MB</p>
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleInputChange}
      />

      {/* URL直接入力（折りたたみ） */}
      <div>
        <button
          type="button"
          onClick={() => setShowUrlInput((v) => !v)}
          className="inline-flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600"
        >
          <LinkIcon className="w-3 h-3" />
          {showUrlInput ? "URL入力を閉じる" : "URLで直接指定する"}
        </button>
        {showUrlInput && (
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://... の画像URLを貼り付け"
            className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#C07052]/30 focus:border-[#C07052] bg-white"
          />
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
