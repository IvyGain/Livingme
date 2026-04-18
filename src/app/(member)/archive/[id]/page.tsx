import { getPublishedArchive } from "@/server/actions/archives";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ArchiveCategory } from "@/lib/content-types";
import Link from "next/link";

const categoryLabels: Record<ArchiveCategory, string> = {
  MORNING_SESSION: "朝会",
  EVENING_SESSION: "夜会",
  LEARNING: "学び",
  EVENT: "イベント",
  OTHER: "その他",
};

export default async function ArchiveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const archive = await getPublishedArchive(id);

  if (!archive) {
    notFound();
  }

  const dateStr = archive.date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/archive"
        className="inline-flex items-center gap-1 text-sm text-[#9a8070] hover:text-[#6B4F3A] transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        アーカイブ一覧に戻る
      </Link>

      {/* Header */}
      <div className="bg-[#FEFCF8] border border-[#e8ddd5] rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs bg-[#EFF4EF] text-[#7A9E7E] px-2.5 py-0.5 rounded-full">
            {categoryLabels[archive.category]}
          </span>
          <span className="text-xs text-[#9a8070]">{dateStr}</span>
          {archive.minutes && (
            <span className="text-xs text-[#9a8070]">· {archive.minutes}分</span>
          )}
        </div>
        <h1 className="text-xl font-medium text-[#6B4F3A] leading-snug">
          {archive.title}
        </h1>
        {archive.description && (
          <p className="mt-3 text-sm text-[#9a8070] leading-relaxed">
            {archive.description}
          </p>
        )}

        {/* Tags */}
        {archive.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {archive.tags.map((tagName) => (
              <Link key={tagName} href={`/archive?tag=${encodeURIComponent(tagName)}`}>
                <Badge
                  variant="outline"
                  className="text-xs border-[#d0e4d0] text-[#7A9E7E] hover:bg-[#EFF4EF] cursor-pointer"
                >
                  # {tagName}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Video player */}
      {archive.videoUrl && (
        <div className="bg-black rounded-xl overflow-hidden aspect-video">
          {archive.videoUrl.includes("youtube") || archive.videoUrl.includes("youtu.be") ? (
            <iframe
              src={archive.videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : archive.videoUrl.includes("vimeo") ? (
            <iframe
              src={`https://player.vimeo.com/video/${archive.videoUrl.split("/").pop()}`}
              className="w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={archive.videoUrl}
              controls
              className="w-full h-full"
            />
          )}
        </div>
      )}

      {/* Content sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {archive.energyShare && (
          <div className="bg-[#FEFCF8] border border-[#e8ddd5] rounded-xl p-5">
            <h3 className="text-xs font-medium text-[#C07052] uppercase tracking-wide mb-2">
              エネルギーシェア
            </h3>
            <p className="text-sm text-[#6B4F3A] leading-relaxed whitespace-pre-line">
              {archive.energyShare}
            </p>
          </div>
        )}

        {archive.journalingTheme && (
          <div className="bg-[#FEFCF8] border border-[#e8ddd5] rounded-xl p-5">
            <h3 className="text-xs font-medium text-[#7A9E7E] uppercase tracking-wide mb-2">
              ジャーナリングテーマ
            </h3>
            <p className="text-sm text-[#6B4F3A] leading-relaxed font-medium">
              {archive.journalingTheme}
            </p>
          </div>
        )}
      </div>

      {/* Summary */}
      {archive.summary && (
        <div className="bg-[#FEFCF8] border border-[#e8ddd5] rounded-xl p-6">
          <h3 className="text-sm font-medium text-[#6B4F3A] mb-3">サマリー</h3>
          <p className="text-sm text-[#9a8070] leading-relaxed whitespace-pre-line">
            {archive.summary}
          </p>
        </div>
      )}
    </div>
  );
}
