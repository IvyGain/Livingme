import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ArchiveCategory } from "@/lib/content-types";

interface ArchiveCardProps {
  id: string;
  title: string;
  date: Date;
  category: ArchiveCategory;
  thumbnailUrl?: string | null;
  description?: string | null;
  minutes?: string | null;
  tags?: string[];
}

const categoryLabels: Record<ArchiveCategory, string> = {
  MORNING_SESSION: "朝会",
  EVENING_SESSION: "夜会",
  LEARNING: "学び",
  EVENT: "イベント",
  OTHER: "その他",
};

const categoryColors: Record<ArchiveCategory, string> = {
  MORNING_SESSION: "bg-[#FFF4E8] text-[#C07052]",
  EVENING_SESSION: "bg-[#EEF0F8] text-[#5B6B9A]",
  LEARNING: "bg-[#EFF4EF] text-[#7A9E7E]",
  EVENT: "bg-[#F5EDEC] text-[#9B4B3E]",
  OTHER: "bg-[#F5F0EA] text-[#9a8070]",
};

export function ArchiveCard({
  id,
  title,
  date,
  category,
  thumbnailUrl,
  description,
  minutes,
  tags = [],
}: ArchiveCardProps) {
  const dateStr = date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Link href={`/archive/${id}`} className="block group">
      <div className="bg-[#FEFCF8] border border-[#e8ddd5] rounded-xl overflow-hidden hover:shadow-md hover:border-[#C07052]/30 transition-all duration-200">
        {/* Thumbnail */}
        <div className="aspect-video relative bg-[#EFF4EF] overflow-hidden">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-[#C07052]/30"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          )}
          <span
            className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[category]}`}
          >
            {categoryLabels[category]}
          </span>
          {minutes && (
            <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
              {minutes}分
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-xs text-[#9a8070] mb-1">{dateStr}</p>
          <h3 className="font-medium text-[#6B4F3A] text-sm leading-snug mb-2 line-clamp-2 group-hover:text-[#C07052] transition-colors">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-[#9a8070] line-clamp-2">{description}</p>
          )}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {tags.slice(0, 3).map((tagName) => (
                <Badge
                  key={tagName}
                  variant="secondary"
                  className="text-xs bg-[#EFF4EF] text-[#7A9E7E] border-0 px-2 py-0"
                >
                  {tagName}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
