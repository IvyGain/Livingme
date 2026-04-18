import { auth } from "@/lib/auth";
import { TodayCard } from "@/components/member/TodayCard";
import { ArchiveCard } from "@/components/member/ArchiveCard";
import Link from "next/link";
import { format, isToday, isTomorrow } from "date-fns";
import { ja } from "date-fns/locale";
import { getChannels } from "@/server/actions/chat";
import { getTodayContentForMember } from "@/server/actions/today";
import { getPublishedArchives } from "@/server/actions/archives";
import { getUpcomingEventsForMember } from "@/server/actions/events";
import { getHomeLayoutSettings } from "@/server/actions/home-layout";
import { EventType } from "@/lib/content-types";

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  MORNING_SESSION: "朝会",
  EVENING_SESSION: "夜会",
  ONLINE_EVENT:    "オンライン",
  OFFLINE_EVENT:   "オフライン",
  GIVE_KAI:        "ギブ会",
  STUDY_GROUP:     "勉強会",
};

export default async function MemberHomePage() {
  const session = await auth();
  const userName = session?.user?.name;

  const [todayContent, archives, events, channels, { sections }] = await Promise.all([
    getTodayContentForMember().catch(() => null),
    getPublishedArchives(24).catch(() => [] as Awaited<ReturnType<typeof getPublishedArchives>>),
    getUpcomingEventsForMember(10).catch(() => [] as Awaited<ReturnType<typeof getUpcomingEventsForMember>>),
    getChannels(),
    getHomeLayoutSettings(),
  ]);

  const isVisible = (id: string) => {
    const sec = sections.find((s) => s.id === id);
    return sec ? sec.visible : true;
  };

  return (
    <>
      {/* ── 左：チャンネル一覧 ─────────────────────────────── */}
      {isVisible("chat") && (
      <aside
        className="w-52 flex-shrink-0 flex flex-col border-r overflow-y-auto hidden md:flex"
        style={{ borderColor: "var(--lm-border)", backgroundColor: "var(--lm-card-bg)" }}
      >
        {/* Greeting */}
        <div className="px-4 pt-5 pb-3">
          <p className="text-sm font-medium" style={{ color: "var(--lm-primary)" }}>
            {userName ? `${userName}さん` : "メンバー"}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--lm-muted)" }}>
            今日も自分らしく
          </p>
        </div>

        <div className="border-t mx-3" style={{ borderColor: "var(--lm-border)" }} />

        {/* Channel list */}
        <div className="flex-1 py-3">
          <p
            className="px-4 pb-1 text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--lm-muted)" }}
          >
            チャンネル
          </p>
          {channels.length === 0 ? (
            <p className="px-4 py-2 text-xs" style={{ color: "var(--lm-muted)" }}>
              チャンネルなし
            </p>
          ) : (
            <nav className="space-y-0.5 px-2">
              {channels.map((ch) => (
                <Link
                  key={ch.id}
                  href={`/chat/${ch.id}`}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors hover:opacity-80"
                  style={{ color: "var(--lm-muted)" }}
                >
                  <span className="font-medium">#</span>
                  <span className="truncate">{ch.name}</span>
                </Link>
              ))}
            </nav>
          )}
        </div>
      </aside>
      )}

      {/* ── 中央：今日のコンテンツ + アーカイブ ─────────────── */}
      <main
        className="flex-1 min-w-0 overflow-y-auto"
        style={{ backgroundColor: "var(--lm-bg)" }}
      >
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
          {/* 今日のエネルギー */}
          {isVisible("today") && (
            <TodayCard
              date={new Date()}
              energyShare={todayContent?.energyShare}
              journalingTheme={todayContent?.journalingTheme}
              morningNote={todayContent?.morningNote}
            />
          )}

          {/* エネルギーシェア プレビュー（マヤ暦 + タイトル + 続きを見る） */}
          {isVisible("today") && todayContent && (todayContent.title || todayContent.mayanInfo) && (
            <div
              className="rounded-xl border p-5"
              style={{ borderColor: "var(--lm-border)", backgroundColor: "var(--lm-card-bg)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                {todayContent.mayanBlackKin && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#1a1a1a] text-white text-[10px] font-bold">
                    黒
                  </span>
                )}
                {todayContent.moonPhase === "full" && <span className="text-lg">🌝</span>}
                {todayContent.moonPhase === "new" && <span className="text-lg">🌚</span>}
                <p className="text-xs" style={{ color: "var(--lm-muted)" }}>
                  {todayContent.mayanInfo}
                </p>
              </div>
              {todayContent.title && (
                <p className="text-base font-medium leading-relaxed mb-3" style={{ color: "var(--lm-primary)" }}>
                  {todayContent.title}
                </p>
              )}
              <Link
                href="/energy"
                className="inline-flex items-center gap-1 text-sm transition-colors hover:opacity-80"
                style={{ color: "var(--lm-accent)" }}
              >
                続きを見る →
              </Link>
            </div>
          )}

          {/* 今日のジャーナリングテーマ */}
          {isVisible("today") && todayContent?.journalingTheme && (
            <div
              className="rounded-xl border p-5"
              style={{ borderColor: "var(--lm-secondary)", backgroundColor: "var(--lm-card-bg)" }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: "var(--lm-secondary)" }}
              >
                今日のジャーナリングテーマ
              </p>
              <p
                className="text-base font-medium leading-relaxed mb-4"
                style={{ color: "var(--lm-primary)" }}
              >
                「{todayContent.journalingTheme}」
              </p>
              <Link
                href="/journal/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors hover:opacity-80"
                style={{ backgroundColor: "var(--lm-secondary)", color: "#fff" }}
              >
                ジャーナルを書く →
              </Link>
            </div>
          )}

          {/* アーカイブ */}
          {isVisible("archives") && (
            archives.length > 0 ? (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="text-base font-medium"
                    style={{ color: "var(--lm-primary)" }}
                  >
                    アーカイブ
                  </h3>
                  <Link
                    href="/archive"
                    className="text-sm hover:opacity-70 transition-opacity"
                    style={{ color: "var(--lm-accent)" }}
                  >
                    すべて見る →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </section>
            ) : (
              <div
                className="rounded-xl border p-10 text-center text-sm"
                style={{ borderColor: "var(--lm-border)", color: "var(--lm-muted)" }}
              >
                アーカイブはまだありません
              </div>
            )
          )}
        </div>
      </main>

      {/* ── 右：イベント ─────────────────────────────────────── */}
      {isVisible("events") && (
      <aside
        className="w-72 flex-shrink-0 flex flex-col border-l overflow-y-auto hidden lg:flex"
        style={{ borderColor: "var(--lm-border)", backgroundColor: "var(--lm-card-bg)" }}
      >
        <div className="px-4 pt-5 pb-2 flex items-center justify-between">
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--lm-muted)" }}
          >
            直近のイベント
          </p>
          <Link
            href="/events"
            className="text-xs hover:opacity-70 transition-opacity"
            style={{ color: "var(--lm-accent)" }}
          >
            すべて →
          </Link>
        </div>

        {events.length === 0 ? (
          <p className="px-4 py-3 text-sm" style={{ color: "var(--lm-muted)" }}>
            予定されているイベントはありません
          </p>
        ) : (
          <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2">
            {events.map((event) => {
              const eventToday = isToday(event.startsAt);
              const eventTomorrow = isTomorrow(event.startsAt);
              const dateLabel = eventToday
                ? "今日"
                : eventTomorrow
                ? "明日"
                : format(event.startsAt, "M月d日(E)", { locale: ja });
              const timeStr = format(event.startsAt, "HH:mm");

              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="block rounded-xl p-3 border transition-all hover:shadow-sm"
                  style={{
                    borderColor: eventToday ? "var(--lm-accent)" : "var(--lm-border)",
                    backgroundColor: "var(--lm-bg)",
                  }}
                >
                  {eventToday && (
                    <div className="h-0.5 -mx-3 -mt-3 mb-2 rounded-t-xl"
                      style={{ background: "linear-gradient(to right, var(--lm-accent), var(--lm-secondary))" }}
                    />
                  )}
                  <div className="flex items-start gap-2.5">
                    <div
                      className="flex-shrink-0 w-11 rounded-lg text-center py-1.5 text-xs"
                      style={
                        eventToday
                          ? { backgroundColor: "var(--lm-accent)", color: "#fff" }
                          : { backgroundColor: "var(--lm-bg)", color: "var(--lm-primary)", border: "1px solid var(--lm-border)" }
                      }
                    >
                      <p className="font-medium leading-tight">{dateLabel}</p>
                      <p className="text-sm font-bold leading-tight">{timeStr}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: "var(--lm-border)", color: "var(--lm-muted)" }}
                      >
                        {EVENT_TYPE_LABELS[event.eventType]}
                      </span>
                      <p
                        className="text-xs font-medium mt-1 line-clamp-2 leading-snug"
                        style={{ color: "var(--lm-primary)" }}
                      >
                        {event.title}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </aside>
      )}
    </>
  );
}
