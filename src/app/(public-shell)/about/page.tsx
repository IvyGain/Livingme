import { ChevronDown, Play, Heart, BookOpen, Calendar, Users } from "lucide-react";
import { getLPSettings } from "@/server/actions/lp-settings";
import type { LPSectionConfig } from "@/lib/lp-settings";

const activities = [
  {
    icon: Play,
    title: "アーカイブ動画",
    description: "過去の朝会・夜会・イベントの動画を好きなときに何度でも。",
  },
  {
    icon: Calendar,
    title: "朝会・夜会",
    description: "仲間と一緒に朝と夜のひとときを共有します。",
  },
  {
    icon: BookOpen,
    title: "ジャーナリング",
    description: "毎日のテーマに沿って、自分の内側と対話する時間を。",
  },
  {
    icon: Users,
    title: "イベント参加",
    description: "ワークショップやオフ会など、体験型イベントに参加できます。",
  },
  {
    icon: Heart,
    title: "コミュニティ",
    description: "「今のままで最高」を分かち合える横のつながり。",
  },
];

function TextWithBreaks({ text }: { text: string }) {
  const lines = text.split("\\n");
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </>
  );
}

function sectionStyle(sec: LPSectionConfig): React.CSSProperties {
  if (sec.bgImageUrl) {
    return {
      backgroundImage: sec.bgColor
        ? `linear-gradient(${sec.bgColor}CC, ${sec.bgColor}CC), url(${sec.bgImageUrl})`
        : `url(${sec.bgImageUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  return sec.bgColor ? { background: sec.bgColor } : {};
}

export default async function AboutPage() {
  const lp = await getLPSettings();

  const heroSec = lp.sections.find((s) => s.type === "hero");
  const aboutSec = lp.sections.find((s) => s.type === "about");
  const videosSec = lp.sections.find((s) => s.type === "videos");
  const activitiesSec = lp.sections.find((s) => s.type === "activities");

  return (
    <main
      className="flex-1 overflow-y-auto"
      style={{ backgroundColor: "var(--lm-bg)" }}
    >
      <div style={{ color: "var(--lm-primary)" }}>

        {/* ─── Hero ─── */}
        {(!heroSec || heroSec.visible) && (
          <section
            className="py-24 px-4 flex flex-col items-center justify-center text-center"
            style={heroSec ? sectionStyle(heroSec) : {}}
          >
            <p className="text-xs tracking-[0.3em] mb-6 uppercase" style={{ color: "var(--lm-muted)" }}>
              Member Community
            </p>
            {heroSec?.imageUrl && (
              <img
                src={heroSec.imageUrl}
                alt=""
                className="w-full max-w-lg mx-auto mb-8 rounded-2xl object-cover"
              />
            )}
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold leading-snug mb-6">
              <TextWithBreaks text={heroSec?.heading ?? "本当の自分と\n出逢う場所"} />
            </h1>
            <p className="text-base sm:text-lg max-w-md mx-auto leading-relaxed mb-10" style={{ color: "var(--lm-muted)" }}>
              <TextWithBreaks text={heroSec?.subheading ?? ""} />
            </p>
            <a
              href="#about-concept"
              className="flex flex-col items-center gap-2 text-xs hover:opacity-70 transition-opacity"
              style={{ color: "var(--lm-muted)" }}
            >
              <span>もっと見る</span>
              <ChevronDown className="w-4 h-4 animate-bounce" />
            </a>
          </section>
        )}

        {/* ─── About / Concept ─── */}
        {(!aboutSec || aboutSec.visible) && (
          <section
            id="about-concept"
            className="py-24 px-4"
            style={{ ...(aboutSec ? sectionStyle(aboutSec) : {}), backgroundColor: "var(--lm-card-bg)" }}
          >
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-xs tracking-[0.3em] mb-6 uppercase" style={{ color: "var(--lm-muted)" }}>Concept</p>
              {aboutSec?.imageUrl && (
                <img
                  src={aboutSec.imageUrl}
                  alt=""
                  className="w-full max-w-md mx-auto mb-8 rounded-2xl object-cover"
                />
              )}
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold mb-10 leading-snug">
                <TextWithBreaks text={aboutSec?.heading ?? "Living Me とは"} />
              </h2>
              <p className="leading-relaxed mb-12" style={{ color: "var(--lm-muted)" }}>
                {aboutSec?.body ?? "波動から見た人間観をベースに、自分を愛し、人生をアートする仲間が集まるコミュニティです。感じたことを信じ、自分を表現し、満たされる自分を取り戻す。そんな時間と空間を一緒に作っています。"}
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                {lp.concepts.map((c, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-2xl px-5 py-4 border"
                    style={{ backgroundColor: "var(--lm-bg)", borderColor: "var(--lm-border)" }}
                  >
                    <Heart className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--lm-accent)" }} />
                    <span className="text-sm leading-relaxed">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ─── Trial Videos ─── */}
        {(!videosSec || videosSec.visible) && (
          <section
            className="py-24 px-4"
            style={videosSec ? sectionStyle(videosSec) : {}}
          >
            <div className="max-w-5xl mx-auto text-center">
              <p className="text-xs tracking-[0.3em] mb-6 uppercase" style={{ color: "var(--lm-muted)" }}>Trial</p>
              {videosSec?.imageUrl && (
                <img
                  src={videosSec.imageUrl}
                  alt=""
                  className="w-full max-w-lg mx-auto mb-8 rounded-2xl object-cover"
                />
              )}
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold mb-4">
                <TextWithBreaks text={videosSec?.heading ?? "お試し動画"} />
              </h2>
              <p className="text-sm mb-10" style={{ color: "var(--lm-muted)" }}>
                {videosSec?.subheading ?? "Living Me の雰囲気を感じてみてください。"}
              </p>
              {lp.videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lp.videos.map((video) => (
                    <div key={video.id} className="flex flex-col gap-3">
                      <div
                        className="relative aspect-video border rounded-2xl overflow-hidden"
                        style={{ backgroundColor: "var(--lm-card-bg)", borderColor: "var(--lm-border)" }}
                      >
                        {video.url ? (
                          <iframe
                            src={video.url}
                            title={video.title || "お試し動画"}
                            className="absolute inset-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ color: "var(--lm-muted)" }}>
                            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: "color-mix(in srgb, var(--lm-accent) 10%, transparent)" }}>
                              <Play className="w-6 h-6 ml-1" style={{ color: "var(--lm-accent)" }} />
                            </div>
                            <p className="text-sm">動画を準備中です</p>
                          </div>
                        )}
                      </div>
                      {video.title && <p className="text-sm font-medium text-left">{video.title}</p>}
                      {video.description && <p className="text-xs text-left" style={{ color: "var(--lm-muted)" }}>{video.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="max-w-3xl mx-auto">
                  <div
                    className="relative aspect-video border rounded-2xl overflow-hidden flex items-center justify-center"
                    style={{ backgroundColor: "var(--lm-card-bg)", borderColor: "var(--lm-border)" }}
                  >
                    <div className="flex flex-col items-center gap-3" style={{ color: "var(--lm-muted)" }}>
                      <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: "color-mix(in srgb, var(--lm-accent) 10%, transparent)" }}>
                        <Play className="w-6 h-6 ml-1" style={{ color: "var(--lm-accent)" }} />
                      </div>
                      <p className="text-sm">動画を準備中です</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ─── Activities ─── */}
        {(!activitiesSec || activitiesSec.visible) && (
          <section
            className="py-24 px-4"
            style={{ ...(activitiesSec ? sectionStyle(activitiesSec) : {}), backgroundColor: "var(--lm-card-bg)" }}
          >
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-14">
                <p className="text-xs tracking-[0.3em] mb-6 uppercase" style={{ color: "var(--lm-muted)" }}>Activities</p>
                {activitiesSec?.imageUrl && (
                  <img
                    src={activitiesSec.imageUrl}
                    alt=""
                    className="w-full max-w-lg mx-auto mb-8 rounded-2xl object-cover"
                  />
                )}
                <h2 className="font-serif text-3xl sm:text-4xl font-semibold">
                  <TextWithBreaks text={activitiesSec?.heading ?? "活動内容"} />
                </h2>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {activities.map(({ icon: Icon, title, description }) => (
                  <li
                    key={title}
                    className="rounded-2xl p-6 border flex flex-col gap-3"
                    style={{ backgroundColor: "var(--lm-bg)", borderColor: "var(--lm-border)" }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "color-mix(in srgb, var(--lm-accent) 10%, transparent)" }}>
                      <Icon className="w-5 h-5" style={{ color: "var(--lm-accent)" }} />
                    </div>
                    <h3 className="font-semibold text-base">{title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--lm-muted)" }}>{description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

      </div>
    </main>
  );
}
