"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type Slide = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  ctaText: string | null;
  ctaHref: string | null;
  showText?: boolean;
};

const AUTOPLAY_MS = 5500;

export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = slides.length;
  const go = useCallback((d: number) => setI((p) => (p + d + n) % n), [n]);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    if (n <= 1 || paused) return;
    // Respeta prefers-reduced-motion: sin autoplay
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((p) => (p + 1) % n), AUTOPLAY_MS);
    return () => clearInterval(t);
    // `i` en deps → el timer se reinicia tras navegación manual (no salta rápido)
  }, [n, paused, i]);

  if (n === 0) return null;

  return (
    <section
      className="relative w-full overflow-hidden border-b border-oni-line"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
        setPaused(true);
      }}
      onTouchEnd={(e) => {
        if (touchX.current !== null) {
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        }
        touchX.current = null;
        setPaused(false);
      }}
    >
      <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${i * 100}%)` }}>
        {slides.map((s, idx) => {
          const showText = s.showText ?? true;
          return (
            <div key={s.id} className="relative min-w-full" aria-hidden={idx !== i}>
              <div className="relative aspect-[16/9] max-h-[560px] w-full sm:aspect-[16/7] lg:aspect-[16/6]">
                <Image
                  src={s.imageUrl}
                  alt={s.title}
                  fill
                  priority={idx === 0}
                  // Precarga la siguiente para transición suave
                  loading={idx <= 1 ? "eager" : "lazy"}
                  unoptimized={s.imageUrl.endsWith(".svg")}
                  sizes="100vw"
                  className="object-cover"
                />
                {showText && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-oni-black via-oni-black/70 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-center gap-3 p-5 sm:p-10 md:max-w-xl">
                      <h2 className="font-display text-3xl leading-tight text-oni-bone sm:text-5xl">{s.title}</h2>
                      {s.subtitle && <p className="max-w-md text-sm text-oni-ash sm:text-base">{s.subtitle}</p>}
                      {s.ctaHref && (
                        <Link
                          href={s.ctaHref}
                          className="mt-1 w-fit rounded-md bg-oni-red px-5 py-2.5 font-display text-base tracking-wide text-white hover:bg-oni-red-dark sm:px-7 sm:py-3 sm:text-lg"
                        >
                          {s.ctaText ?? "Ver más"}
                        </Link>
                      )}
                    </div>
                  </>
                )}
                {/* Banner con texto quemado: toda la imagen es clickeable si tiene CTA */}
                {!showText && s.ctaHref && (
                  <Link href={s.ctaHref} aria-label={s.title} className="absolute inset-0" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {n > 1 && (
        <>
          <button onClick={() => go(-1)} aria-label="Anterior" className="absolute left-2 top-1/2 hidden -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-black/40 text-white hover:bg-oni-red sm:grid">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button onClick={() => go(1)} aria-label="Siguiente" className="absolute right-2 top-1/2 hidden -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-black/40 text-white hover:bg-oni-red sm:grid">
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                aria-label={`Ir al slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all ${idx === i ? "w-6 bg-oni-red" : "w-2 bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
