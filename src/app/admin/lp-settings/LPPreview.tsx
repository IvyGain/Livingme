"use client";

import type { LPSettings } from "@/lib/lp-settings";

function Lines({ text }: { text: string }) {
  return (
    <>
      {text.split("\\n").map((line, i, arr) => (
        <span key={i}>
          {line}
          {i < arr.length - 1 && <br />}
        </span>
      ))}
    </>
  );
}

function SecStyle(sec: { bgColor: string; bgImageUrl: string }): React.CSSProperties {
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

export function LPPreview({ settings }: { settings: LPSettings }) {
  const heroSec = settings.sections.find((s) => s.type === "hero");
  const aboutSec = settings.sections.find((s) => s.type === "about");
  const videosSec = settings.sections.find((s) => s.type === "videos");
  const activitiesSec = settings.sections.find((s) => s.type === "activities");
  const ctaSec = settings.sections.find((s) => s.type === "cta");

  return (
    <div
      className="bg-[var(--lm-bg)] text-[var(--lm-primary)] pointer-events-none select-none overflow-hidden"
      style={{ fontSize: "10px" }}
    >
      {/* Header */}
      <div className="bg-[var(--lm-card-bg)] border-b border-[var(--lm-border)] px-3 h-7 flex items-center justify-between">
        <span className="font-serif text-[9px] tracking-widest text-[var(--lm-primary)]">Living Me</span>
        <div className="h-4 px-3 rounded-full bg-[var(--lm-accent)] flex items-center">
          <span className="text-[7px] text-white">{settings.ctaButtonText}</span>
        </div>
      </div>

      {/* Sections in order */}
      {settings.sections.map((sec) => {
        if (!sec.visible) return null;

        if (sec.type === "hero") {
          return (
            <div key={sec.id} className="py-10 px-4 text-center" style={SecStyle(sec)}>
              <p className="text-[7px] tracking-[0.2em] text-[var(--lm-muted)] mb-2 uppercase">Member Community</p>
              {sec.imageUrl && (
                <img src={sec.imageUrl} alt="" className="w-20 mx-auto mb-2 rounded-lg object-cover" />
              )}
              <h1 className="font-serif text-[13px] font-semibold leading-snug mb-2">
                <Lines text={sec.heading || "本当の自分と\n出逢う場所"} />
              </h1>
              <p className="text-[var(--lm-muted)] text-[8px] max-w-[200px] mx-auto mb-4 leading-relaxed">
                <Lines text={sec.subheading || ""} />
              </p>
              <div className="inline-flex items-center justify-center h-6 px-4 rounded-full bg-[var(--lm-accent)]">
                <span className="text-[8px] text-white font-medium">{settings.ctaButtonText}</span>
              </div>
            </div>
          );
        }

        if (sec.type === "about") {
          return (
            <div key={sec.id} className="py-8 px-4 bg-[var(--lm-card-bg)] text-center" style={SecStyle(sec)}>
              <p className="text-[7px] tracking-[0.2em] text-[var(--lm-muted)] mb-2 uppercase">Concept</p>
              {sec.imageUrl && (
                <img src={sec.imageUrl} alt="" className="w-16 mx-auto mb-2 rounded-lg object-cover" />
              )}
              <h2 className="font-serif text-[12px] font-semibold mb-2">
                <Lines text={sec.heading || "Living Me とは"} />
              </h2>
              <p className="text-[var(--lm-muted)] text-[8px] mb-3 max-w-[220px] mx-auto leading-relaxed">
                {sec.body || ""}
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {settings.concepts.map((c, i) => (
                  <div
                    key={i}
                    className="text-[7px] bg-[var(--lm-bg)] rounded px-1.5 py-1 border border-[var(--lm-border)] text-left flex items-start gap-1"
                  >
                    <span className="text-[var(--lm-accent)]">♥</span>
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        if (sec.type === "videos") {
          const visibleVideos = settings.videos.slice(0, 3);
          return (
            <div key={sec.id} className="py-8 px-4 text-center" style={SecStyle(sec)}>
              <p className="text-[7px] tracking-[0.2em] text-[var(--lm-muted)] mb-2 uppercase">Trial</p>
              {sec.imageUrl && (
                <img src={sec.imageUrl} alt="" className="w-16 mx-auto mb-2 rounded-lg object-cover" />
              )}
              <h2 className="font-serif text-[12px] font-semibold mb-1">
                <Lines text={sec.heading || "お試し動画"} />
              </h2>
              <p className="text-[var(--lm-muted)] text-[8px] mb-3">{sec.subheading || ""}</p>
              {visibleVideos.length > 0 ? (
                <div className="grid grid-cols-3 gap-1.5">
                  {visibleVideos.map((v) => (
                    <div
                      key={v.id}
                      className="aspect-video bg-[var(--lm-card-bg)] border border-[var(--lm-border)] rounded flex flex-col items-center justify-center gap-0.5"
                    >
                      <div className="w-4 h-4 rounded-full bg-[var(--lm-accent)]/10 flex items-center justify-center">
                        <span className="text-[6px] text-[var(--lm-accent)] ml-px">▶</span>
                      </div>
                      {v.title && <p className="text-[6px] text-[var(--lm-muted)] px-1 truncate w-full text-center">{v.title}</p>}
                    </div>
                  ))}
                  {settings.videos.length > 3 && (
                    <div className="aspect-video bg-[var(--lm-card-bg)] border border-[var(--lm-border)] rounded flex items-center justify-center">
                      <span className="text-[6px] text-[var(--lm-muted)]">+{settings.videos.length - 3}本</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video max-w-[200px] mx-auto bg-[var(--lm-card-bg)] border border-[var(--lm-border)] rounded flex items-center justify-center">
                  <span className="text-[8px] text-[var(--lm-muted)]">動画を準備中</span>
                </div>
              )}
            </div>
          );
        }

        if (sec.type === "activities") {
          const activities = settings.activities ?? [];
          return (
            <div key={sec.id} className="py-8 px-4 bg-[var(--lm-card-bg)]" style={SecStyle(sec)}>
              <p className="text-[7px] tracking-[0.2em] text-[var(--lm-muted)] mb-2 uppercase text-center">Activities</p>
              {sec.imageUrl && (
                <img src={sec.imageUrl} alt="" className="w-16 mx-auto mb-2 rounded-lg object-cover" />
              )}
              <h2 className="font-serif text-[12px] font-semibold text-center mb-3">
                <Lines text={sec.heading || "活動内容"} />
              </h2>
              <div className="grid grid-cols-3 gap-1.5">
                {activities.map((a) => (
                  <div key={a.id} className="bg-[var(--lm-bg)] rounded p-1.5 border border-[var(--lm-border)]">
                    {a.imageUrl ? (
                      <img src={a.imageUrl} alt="" className="w-full aspect-video object-cover rounded mb-1" />
                    ) : (
                      <div className="w-4 h-4 rounded bg-[var(--lm-accent)]/10 mb-1" />
                    )}
                    <p className="text-[7px] font-semibold mb-0.5">{a.title || "タイトル"}</p>
                    <p className="text-[6px] text-[var(--lm-muted)] leading-tight">{a.description}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        if (sec.type === "testimonials") {
          const testimonials = settings.testimonials ?? [];
          return (
            <div key={sec.id} className="py-8 px-4" style={SecStyle(sec)}>
              <p className="text-[7px] tracking-[0.2em] text-[var(--lm-muted)] mb-2 uppercase text-center">Testimonials</p>
              <h2 className="font-serif text-[12px] font-semibold text-center mb-1">
                <Lines text={sec.heading || "参加者の声"} />
              </h2>
              {sec.subheading && (
                <p className="text-[var(--lm-muted)] text-[7px] text-center mb-3">{sec.subheading}</p>
              )}
              {testimonials.length === 0 ? (
                <p className="text-[7px] text-[var(--lm-muted)] text-center">口コミがまだありません</p>
              ) : (
                <div className="grid grid-cols-2 gap-1.5">
                  {testimonials.map((tm) => (
                    <div key={tm.id} className="bg-[var(--lm-card-bg)] rounded p-2 border border-[var(--lm-border)]">
                      <p className="text-[6px] text-[var(--lm-muted)] leading-tight mb-1.5">{tm.body}</p>
                      <div className="flex items-center gap-1">
                        {tm.avatarUrl ? (
                          <img src={tm.avatarUrl} alt="" className="w-4 h-4 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-[var(--lm-accent)]/20 flex-shrink-0" />
                        )}
                        <div>
                          <p className="text-[6px] font-medium">{tm.name || "お名前"}</p>
                          {tm.role && <p className="text-[5px] text-[var(--lm-muted)]">{tm.role}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        }

        if (sec.type === "cta") {
          return (
            <div key={sec.id} className="py-10 px-4 text-center" style={SecStyle(sec)}>
              <p className="text-[7px] tracking-[0.2em] text-[var(--lm-muted)] mb-2 uppercase">Join Us</p>
              {sec.imageUrl && (
                <img src={sec.imageUrl} alt="" className="w-16 mx-auto mb-2 rounded-lg object-cover" />
              )}
              <h2 className="font-serif text-[12px] font-semibold mb-2">
                <Lines text={sec.heading || "あなたの居場所が\nここにあります"} />
              </h2>
              <p className="text-[var(--lm-muted)] text-[8px] mb-3 max-w-[180px] mx-auto leading-relaxed">
                {sec.subheading || ""}
              </p>
              <div className="flex flex-col items-center gap-1.5">
                <div className="inline-flex items-center justify-center h-6 px-5 rounded-full bg-[var(--lm-accent)]">
                  <span className="text-[8px] text-white font-medium">{settings.ctaButtonText}</span>
                </div>
                {settings.ctaLoginButtonText && (
                  <div className="inline-flex items-center justify-center h-6 px-4 rounded-full border-2 border-[var(--lm-accent)]">
                    <span className="text-[7px] text-[var(--lm-accent)] font-medium">{settings.ctaLoginButtonText}</span>
                  </div>
                )}
              </div>
            </div>
          );
        }

        return null;
      })}

      {/* Footer */}
      <div className="border-t border-[var(--lm-border)] py-3 px-4 text-center bg-[var(--lm-card-bg)]">
        <p className="font-serif text-[8px] text-[var(--lm-primary)]">Living Me</p>
        <p className="text-[7px] text-[var(--lm-muted)]">© 2026 Living Me. All rights reserved.</p>
      </div>
    </div>
  );
}
