import { getPublishedArchives } from "@/server/actions/archives";
import { ArchiveCard } from "@/components/member/ArchiveCard";
import { ArchiveCategory } from "@/lib/content-types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const categoryLabels: Record<ArchiveCategory, string> = {
  MORNING_SESSION: "朝会",
  EVENING_SESSION: "夜会",
  LEARNING: "学び",
  EVENT: "イベント",
  OTHER: "その他",
};

interface SearchParams {
  q?: string;
  tag?: string;
  category?: string;
}

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { q, tag, category } = params;

  const allArchives = await getPublishedArchives().catch(() => [] as Awaited<ReturnType<typeof getPublishedArchives>>);

  // Filter in memory
  let archives = allArchives;
  if (q) {
    const lower = q.toLowerCase();
    archives = archives.filter(
      (a) =>
        a.title.toLowerCase().includes(lower) ||
        (a.description ?? "").toLowerCase().includes(lower) ||
        (a.summary ?? "").toLowerCase().includes(lower)
    );
  }
  if (tag) {
    archives = archives.filter((a) =>
      a.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
    );
  }
  if (category && Object.keys(categoryLabels).includes(category)) {
    archives = archives.filter((a) => a.category === category);
  }

  // Collect unique tags from all published archives
  const tagSet = new Set<string>();
  for (const a of allArchives) {
    for (const t of a.tags) {
      if (t) tagSet.add(t);
    }
  }
  const allTags = Array.from(tagSet).sort();

  const currentCategory = params.category;
  const currentTag = params.tag;
  const currentQ = params.q;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-light text-[#6B4F3A] mb-1">アーカイブ</h1>
        <p className="text-sm text-[#9a8070]">
          過去の朝会・夜会・イベントの記録
        </p>
      </div>

      {/* Search */}
      <form method="GET" className="space-y-4">
        <div className="flex gap-2">
          <Input
            name="q"
            placeholder="キーワードで検索..."
            defaultValue={currentQ}
            className="border-[#e8ddd5] bg-white focus:border-[#C07052]"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#C07052] text-white rounded-lg text-sm hover:bg-[#a85e42] transition-colors"
          >
            検索
          </button>
          {(currentQ || currentTag || currentCategory) && (
            <Link
              href="/archive"
              className="px-4 py-2 bg-[#EFF4EF] text-[#7A9E7E] rounded-lg text-sm hover:bg-[#ddeade] transition-colors"
            >
              クリア
            </Link>
          )}
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/archive"
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              !currentCategory
                ? "bg-[#6B4F3A] text-white border-[#6B4F3A]"
                : "border-[#e8ddd5] text-[#9a8070] hover:border-[#6B4F3A]"
            }`}
          >
            すべて
          </Link>
          {Object.entries(categoryLabels).map(([value, label]) => (
            <Link
              key={value}
              href={`/archive?category=${value}${currentQ ? `&q=${currentQ}` : ""}`}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                currentCategory === value
                  ? "bg-[#6B4F3A] text-white border-[#6B4F3A]"
                  : "border-[#e8ddd5] text-[#9a8070] hover:border-[#6B4F3A]"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </form>

      {/* Tags */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {allTags.map((tagName) => (
            <Link
              key={tagName}
              href={`/archive?tag=${encodeURIComponent(tagName)}`}
            >
              <Badge
                variant="outline"
                className={`text-xs cursor-pointer transition-colors ${
                  currentTag === tagName
                    ? "bg-[#7A9E7E] text-white border-[#7A9E7E]"
                    : "border-[#d0e4d0] text-[#7A9E7E] hover:bg-[#EFF4EF]"
                }`}
              >
                # {tagName}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {/* Results */}
      <div>
        <p className="text-xs text-[#9a8070] mb-4">
          {archives.length}件のアーカイブ
        </p>
        {archives.length === 0 ? (
          <div className="text-center py-16 bg-[#FEFCF8] rounded-xl border border-[#e8ddd5]">
            <p className="text-[#9a8070]">該当するアーカイブがありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {archives.map((archive) => (
              <ArchiveCard
                key={archive.id}
                id={archive.id}
                title={archive.title}
                date={archive.date}
                category={archive.category}
                thumbnailUrl={archive.thumbnailUrl}
                description={archive.description}
                minutes={archive.minutes}
                tags={archive.tags}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
