import gsap from "gsap";
import { type ReactElement, useEffect, useRef } from "react";

import { GorolaMountainMark } from "@/components/shared/GorolaMountainMark";
import { TopographicBg } from "@/components/shared/TopographicBg";
import { useWeatherStore } from "@/store/weather.store";

export function HeroSection(): ReactElement {
  const isWeatherMode = useWeatherStore((s) => s.isWeatherMode);
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline();

      timeline
        .fromTo(".hero-logo", { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6 })
        .fromTo(".hero-wordmark", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 0.3)
        .fromTo(".hero-tagline", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, 0.6)
        .fromTo(".hero-cta", { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 }, 0.8)
        .fromTo(".hero-eta", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, 1.0);
    }, rootRef);

    return () => {
      ctx.revert();
    };
  }, []);

  const scrollToCategories = (): void => {
    document.getElementById("home-categories")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      ref={rootRef}
      aria-label="Hero section"
      className="relative flex min-h-screen items-center overflow-hidden rounded-3xl bg-gorola-pine px-6 py-16 text-gorola-fog sm:px-10"
    >
      <TopographicBg opacity={0.12} />
      <div className="noise-overlay pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative z-10 flex max-w-2xl flex-col gap-5">
        <div className="hero-logo w-fit">
          <GorolaMountainMark width={64} height={56} />
        </div>

        <h1 className="hero-wordmark font-playfair text-5xl leading-tight sm:text-6xl">GoRola</h1>
        <p className="hero-tagline font-dm-sans text-xl text-gorola-fog/90">Mussoorie, delivered.</p>

        <button
          type="button"
          className="hero-cta w-fit rounded-full bg-gorola-saffron px-6 py-3 font-dm-sans text-sm font-semibold text-gorola-charcoal transition hover:brightness-105"
          onClick={scrollToCategories}
        >
          Shop Now
        </button>

        <div
          className={`hero-eta mt-2 w-fit rounded-full px-4 py-2 text-sm font-medium ${
            isWeatherMode ? "bg-gorola-slate text-white" : "bg-gorola-amber/20 text-gorola-fog"
          }`}
          role="status"
        >
          {isWeatherMode ? "Scheduled delivery window tonight" : "ETA ~ 12-18 min"}
        </div>

        {isWeatherMode && (
          <p className="font-dm-sans text-sm text-gorola-fog/90">Fog tonight — we're still coming</p>
        )}
      </div>
    </section>
  );
}
