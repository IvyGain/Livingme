import Link from "next/link";
import { ChevronDown, Play, Heart } from "lucide-react";
import { getLPSettings } from "@/server/actions/lp-settings";
import { getPublishedArchives } from "@/server/actions/archives";
import type { LPSectionConfig } from "@/lib/lp-settings";

// Lark API / DB を呼ぶためビルド時静的生成を無効にする
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Living Me | 本当の自分と出逢う会",
  description: "リビングのような温かさ・安心感のある会員コミュニティ。楽しむために生まれてきた、あなたの居場所。",
};

/** \n を <br /> に変換してレンダリングする */
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

export default async function LPPage() {
  const [lp, allArchives] = await Promise.all([
    getLPSettings(),
    getPublishedArchives().catch(() => [] as Awaited<ReturnType<typeof getPublishedArchives>>),
  ]);
  const selectedArchives = allArchives.filter((a) =>
    (lp.larkArchiveIds ?? []).includes(a.id)
  );

  const heroSec = lp.sections.find((s) => s.type === "hero");
  const aboutSec = lp.sections.find((s) => s.type === "about");
  const videosSec = lp.sections.find((s) => s.type === "videos");
  const activitiesSec = lp.sections.find((s) => s.type === "activities");
  const testimonialsSec = lp.sections.find((s) => s.type === "testimonials");
  const ctaSec = lp.sections.find((s) => s.type === "cta");
  const activities = lp.activities ?? [];
  const testimonials = lp.testimonials ?? [];

  return (
    <div className="min-h-screen bg-[var(--lm-bg)] text-[var(--lm-primary)]">

      {/* ─── Fixed Header ─── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[var(--lm-card-bg)]/90 backdrop-blur-sm border-b border-[var(--lm-border)]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-serif text-lg tracking-widest text-[var(--lm-primary)]">
            Living Me
          </span>
          <div className="flex items-center gap-2">
            {lp.ctaLoginButtonText && (
              <Link
                href="/login"
                className="inline-flex items-center justify-center h-9 px-4 rounded-full border border-[var(--lm-accent)] text-[var(--lm-accent)] text-sm font-medium hover:bg-[var(--lm-accent)]/5 transition-colors"
              >
                {lp.ctaLoginButtonText}
              </Link>
            )}
            <Link
              href="/join"
              className="inline-flex items-center justify-center h-9 px-5 rounded-full bg-[var(--lm-accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {lp.ctaButtonText}
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      {(!heroSec || heroSec.visible) && (
        <section
          className="min-h-dvh flex flex-col items-center justify-center text-center px-4 pt-14"
          style={heroSec ? sectionStyle(heroSec) : {}}
        >
          <p className="text-xs tracking-[0.3em] text-[var(--lm-muted)] mb-6 uppercase">
            Member Community
          </p>
          {heroSec?.imageUrl && (
            <img
              src={heroSec.imageUrl}
              alt=""
              className="w-full max-w-lg mx-auto mb-8 rounded-2xl object-cover"
            />
          )}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-semibold leading-snug mb-6">
            <TextWithBreaks text={heroSec?.heading ?? "本当の自分と\n出逢う場所"} />
          </h1>
          <p className="text-[var(--lm-muted)] text-base sm:text-lg max-w-md mx-auto leading-relaxed mb-10">
            <TextWithBreaks text={heroSec?.subheading ?? ""} />
          </p>
          <Link
            href="/join"
            className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-[var(--lm-accent)] text-white text-base font-medium hover:opacity-90 transition-opacity"
          >
            {lp.ctaButtonText}
          </Link>
          <a
            href="#about"
            aria-label="下にスクロール"
            className="mt-16 flex flex-col items-center gap-2 text-[var(--lm-muted)] text-xs hover:text-[var(--lm-primary)] transition-colors"
          >
            <span>もっと見る</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </a>
        </section>
      )}

      {/* ─── About / Concept ─── */}
      {(!aboutSec || aboutSec.visible) && (
        <section
          id="about"
          className="py-24 px-4 bg-[var(--lm-card-bg)]"
          style={aboutSec ? sectionStyle(aboutSec) : {}}
        >
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-xs tracking-[0.3em] text-[var(--lm-muted)] mb-6 uppercase">Concept</p>
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
            <p className="text-[var(--lm-muted)] leading-relaxed mb-12">
              {aboutSec?.body ?? "波動から見た人間観をベースに、自分を愛し、人生をアートする仲間が集まるコミュニティです。感じたことを信じ、自分を表現し、満たされる自分を取り戻す。そんな時間と空間を一緒に作っています。"}
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {lp.concepts.map((c, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 bg-[var(--lm-bg)] rounded-2xl px-5 py-4 border border-[var(--lm-border)]"
                >
                  <Heart className="w-4 h-4 text-[var(--lm-accent)] mt-0.5 flex-shrink-0" />
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
            <p className="text-xs tracking-[0.3em] text-[var(--lm-muted)] mb-6 uppercase">Trial</p>
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
            <p className="text-[var(--lm-muted)] text-sm mb-10">
              {videosSec?.subheading ?? "Living Me の雰囲気を感じてみてください。"}
            </p>
            {(lp.videos.length > 0 || selectedArchives.length > 0) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {lp.videos.map((video) => (
                  <div key={video.id} className="flex flex-col gap-3">
                    <div className="relative aspect-video bg-[var(--lm-card-bg)] border border-[var(--lm-border)] rounded-2xl overflow-hidden">
                      {video.url ? (
                        <iframe
                          src={video.url}
                          title={video.title || "お試し動画"}
                          className="absolute inset-0 w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[var(--lm-muted)]">
                          <div className="w-14 h-14 rounded-full bg-[var(--lm-accent)]/10 flex items-center justify-center">
                            <Play className="w-6 h-6 text-[var(--lm-accent)] ml-1" />
                          </div>
                          <p className="text-sm">動画を準備中です</p>
                        </div>
                      )}
                    </div>
                    {video.title && (
                      <p className="text-sm font-medium text-left">{video.title}</p>
                    )}
                    {video.description && (
                      <p className="text-xs text-[var(--lm-muted)] text-left">{video.description}</p>
                    )}
                  </div>
                ))}
                {selectedArchives.map((archive) => (
                  <div key={archive.id} className="flex flex-col gap-3">
                    <div className="relative aspect-video bg-[var(--lm-card-bg)] border border-[var(--lm-border)] rounded-2xl overflow-hidden">
                      {archive.videoUrl ? (
                        <iframe
                          src={archive.videoUrl}
                          title={archive.title}
                          className="absolute inset-0 w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : archive.thumbnailUrl ? (
                        <img
                          src={archive.thumbnailUrl}
                          alt={archive.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[var(--lm-muted)]">
                          <div className="w-14 h-14 rounded-full bg-[var(--lm-accent)]/10 flex items-center justify-center">
                            <Play className="w-6 h-6 text-[var(--lm-accent)] ml-1" />
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium text-left">{archive.title}</p>
                    {archive.description && (
                      <p className="text-xs text-[var(--lm-muted)] text-left line-clamp-2">{archive.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="max-w-3xl mx-auto">
                <div className="relative aspect-video bg-[var(--lm-card-bg)] border border-[var(--lm-border)] rounded-2xl overflow-hidden flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3 text-[var(--lm-muted)]">
                    <div className="w-14 h-14 rounded-full bg-[var(--lm-accent)]/10 flex items-center justify-center">
                      <Play className="w-6 h-6 text-[var(--lm-accent)] ml-1" />
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
          className="py-24 px-4 bg-[var(--lm-card-bg)]"
          style={activitiesSec ? sectionStyle(activitiesSec) : {}}
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs tracking-[0.3em] text-[var(--lm-muted)] mb-6 uppercase">Activities</p>
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
              {activities.map((act) => (
                <li
                  key={act.id}
                  className="bg-[var(--lm-bg)] rounded-2xl border border-[var(--lm-border)] flex flex-col overflow-hidden"
                >
                  {act.imageUrl && (
                    <img
                      src={act.imageUrl}
                      alt={act.title}
                      className="w-full aspect-video object-cover"
                    />
                  )}
                  <div className="p-6 flex flex-col gap-3">
                    {!act.imageUrl && (
                      <div className="w-10 h-10 rounded-xl bg-[var(--lm-accent)]/10 flex items-center justify-center">
                        <Heart className="w-5 h-5 text-[var(--lm-accent)]" />
                      </div>
                    )}
                    <h3 className="font-semibold text-base">{act.title}</h3>
                    <p className="text-sm text-[var(--lm-muted)] leading-relaxed">{act.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ─── Testimonials ─── */}
      {(!testimonialsSec || testimonialsSec.visible) && testimonials.length > 0 && (
        <section
          className="py-24 px-4"
          style={testimonialsSec ? sectionStyle(testimonialsSec) : {}}
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs tracking-[0.3em] text-[var(--lm-muted)] mb-6 uppercase">Testimonials</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold mb-4">
                <TextWithBreaks text={testimonialsSec?.heading ?? "参加者の声"} />
              </h2>
              {testimonialsSec?.subheading && (
                <p className="text-[var(--lm-muted)] text-sm max-w-md mx-auto">{testimonialsSec.subheading}</p>
              )}
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {testimonials.map((tm) => (
                <li
                  key={tm.id}
                  className="bg-[var(--lm-card-bg)] rounded-2xl p-6 border border-[var(--lm-border)] flex flex-col gap-4"
                >
                  <p className="text-sm text-[var(--lm-muted)] leading-relaxed flex-1">"{tm.body}"</p>
                  <div className="flex items-center gap-3">
                    {tm.avatarUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={tm.avatarUrl}
                        alt={tm.name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[var(--lm-accent)]/10 flex-shrink-0 flex items-center justify-center">
                        <Heart className="w-4 h-4 text-[var(--lm-accent)]" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold">{tm.name}</p>
                      {tm.role && <p className="text-xs text-[var(--lm-muted)]">{tm.role}</p>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ─── Final CTA ─── */}
      {(!ctaSec || ctaSec.visible) && (
        <section
          className="py-28 px-4 text-center"
          style={ctaSec ? sectionStyle(ctaSec) : {}}
        >
          <p className="text-xs tracking-[0.3em] text-[var(--lm-muted)] mb-6 uppercase">Join Us</p>
          {ctaSec?.imageUrl && (
            <img
              src={ctaSec.imageUrl}
              alt=""
              className="w-full max-w-lg mx-auto mb-8 rounded-2xl object-cover"
            />
          )}
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold mb-4">
            <TextWithBreaks text={ctaSec?.heading ?? "あなたの居場所が\nここにあります"} />
          </h2>
          <p className="text-[var(--lm-muted)] text-sm mb-10 max-w-sm mx-auto leading-relaxed">
            {ctaSec?.subheading ?? "まずはアカウントを作成して、Living Me の世界をお試しください。"}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/join"
              className="inline-flex items-center justify-center h-12 px-10 rounded-full bg-[var(--lm-accent)] text-white text-base font-medium hover:opacity-90 transition-opacity"
            >
              {lp.ctaButtonText}
            </Link>
            {lp.ctaLoginButtonText && (
              <Link
                href="/api/auth/signin"
                className="inline-flex items-center justify-center h-12 px-8 rounded-full border-2 border-[var(--lm-accent)] text-[var(--lm-accent)] text-base font-medium hover:bg-[var(--lm-accent)]/5 transition-colors"
              >
                {lp.ctaLoginButtonText}
              </Link>
            )}
          </div>
        </section>
      )}

      {/* ─── Footer ─── */}
      <footer className="border-t border-[var(--lm-border)] py-8 px-4 text-center text-xs text-[var(--lm-muted)] bg-[var(--lm-card-bg)]">
        <p className="font-serif tracking-widest text-sm text-[var(--lm-primary)] mb-2">Living Me</p>
        <p className="mb-3">
          <Link href="/contact" className="hover:text-[var(--lm-primary)] transition-colors">
            お問い合わせ
          </Link>
        </p>
        <p>© 2026 Living Me. All rights reserved.</p>
      </footer>
    </div>
  );
}
