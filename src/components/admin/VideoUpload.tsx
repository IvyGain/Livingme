"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { Upload, Link as LinkIcon, X, Loader2, Video } from "lucide-react";

interface VideoUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
}

/**
 * 動画アップロードコンポーネント
 * - ファイル選択（Vercel Blob クライアントアップロード・最大500MB）
 * - URL直接入力（YouTube埋め込みURLなど）
 * Mac / Windows どちらでも動作します
 */
export function VideoUpload({ value, onChange, label, hint }: VideoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    setProgress(0);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload-blob",
        onUploadProgress: ({ percentage }) => {
          setProgress(Math.round(percentage));
        },
      });
      onChange(blob.url);
    } catch {
      setError("動画のアップロードに失敗しました。ファイルサイズや形式を確認してください。");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  const isUploadedBlob = value && !value.includes("youtube") && !value.includes("youtu.be");

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-xs font-medium text-gray-600">
          {label}
          {hint && <span className="ml-1.5 font-normal text-gray-400">{hint}</span>}
        </p>
      )}

      {/* アップロード済みプレビュー */}
      {value && isUploadedBlob && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <Video className="w-5 h-5 text-[#C07052] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 truncate">{value.split("/").pop()}</p>
            <p className="text-[10px] text-gray-400">アップロード済み</p>
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* アップロードエリア（未選択時） */}
      {!value && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-[#C07052] transition-colors"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <Loader2 className="w-5 h-5 text-[#C07052] animate-spin" />
              <p className="text-xs text-gray-500">アップロード中... {progress}%</p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 max-w-xs">
                <div
                  className="bg-[#C07052] h-1.5 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <Video className="w-5 h-5 text-gray-300" />
              <p className="text-xs text-gray-500">
                ここにドラッグ&ドロップ、または
              </p>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C07052] text-white text-xs font-medium rounded-lg hover:bg-[#a85e42] transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                動画ファイルを選択
              </button>
              <p className="text-[10px] text-gray-300">MP4 / WebM / MOV・最大500MB（Mac / Windows対応）</p>
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,.mp4,.webm,.mov,.avi"
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
          {showUrlInput ? "URL入力を閉じる" : "URLで直接指定する（YouTube埋め込みURLなど）"}
        </button>
        {showUrlInput && (
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://www.youtube.com/embed/... または動画URL"
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
