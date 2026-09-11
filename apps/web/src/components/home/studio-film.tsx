"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Clapperboard, Volume2, VolumeX } from "lucide-react";
import { studioFilm } from "@/config/brand-media";
import { cn } from "@/lib/utils";

export function StudioFilm({ posterSrc = "" }: { posterSrc?: string }) {
  const id = useId();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mutedRef = useRef(true);
  const [muted, setMuted] = useState(true);
  const [videoBroken, setVideoBroken] = useState(false);
  const useYoutube = Boolean(studioFilm.youtubeId?.trim());
  const poster = posterSrc;

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const attemptPlay = () => {
    const video = videoRef.current;
    if (!video || useYoutube) return;
    video.muted = mutedRef.current;
    void video.play().catch(() => {});
  };

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section || useYoutube) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            video.muted = mutedRef.current;
            void video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.12 },
    );
    io.observe(section);
    return () => io.disconnect();
  }, [useYoutube]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || useYoutube) return;
    video.muted = muted;
  }, [muted, useYoutube]);

  const youtubeSrc = studioFilm.youtubeId?.trim()
    ? `https://www.youtube-nocookie.com/embed/${studioFilm.youtubeId}?rel=0&autoplay=1&mute=1&playsinline=1&loop=1&playlist=${studioFilm.youtubeId}&controls=1`
    : "";

  return (
    <section
      ref={sectionRef}
      id="studio-film"
      aria-labelledby={`${id}-heading`}
      className="relative overflow-hidden bg-[#0c0b0a] py-14 text-white sm:py-20"
    >
      <div className="shop-wrap relative text-center">
        <div className="mx-auto max-w-2xl">
          <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--accent-warm)]">
            <Clapperboard className="h-4 w-4" strokeWidth={1.75} />
            Studio film
          </span>
          <h2
            id={`${id}-heading`}
            className="mt-3 font-serif text-3xl font-medium tracking-tight sm:text-4xl"
          >
            {studioFilm.title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/65 sm:text-base">
            {studioFilm.description}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mt-8 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#141210] shadow-[var(--shadow-lg)]"
        >
          <div className="relative aspect-video w-full overflow-hidden">
            {useYoutube && youtubeSrc ? (
              <iframe
                title={studioFilm.title}
                src={youtubeSrc}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : videoBroken ? (
              <div className="flex h-full min-h-[220px] items-center justify-center bg-[#1a1816] text-sm text-white/70">
                Không tải được video.
              </div>
            ) : (
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                autoPlay
                playsInline
                preload="auto"
                poster={poster || undefined}
                muted={muted}
                loop
                onLoadedData={attemptPlay}
                onCanPlay={attemptPlay}
                onError={() => setVideoBroken(true)}
              >
                <source src={studioFilm.mp4Src} type="video/mp4" />
              </video>
            )}
          </div>
          {!useYoutube && !videoBroken ? (
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              className={cn(
                "absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-md",
              )}
              aria-label={muted ? "Bật tiếng" : "Tắt tiếng"}
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}
