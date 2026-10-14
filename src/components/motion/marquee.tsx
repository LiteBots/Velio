"use client";

import { useEffect, useRef } from "react";

/**
 * Pasek z dużą typografią przesuwający się bez końca. Prędkość rośnie przy przewijaniu,
 * a kierunek odwraca się, gdy przewijasz w górę.
 */
export function Marquee({ items, speed = 0.6 }: { items: string[]; speed?: number }) {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let x = 0;
    let dir = -1;
    let boost = 0;
    let lastY = window.scrollY;
    let raf = 0;
    let visible = true;

    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      if (dy !== 0) dir = dy > 0 ? -1 : 1;
      boost = Math.min(boost + Math.abs(dy) * 0.08, 14);
    };

    const loop = () => {
      if (visible) {
        const half = el.scrollWidth / 2;
        x += dir * (speed + boost);
        boost *= 0.92;
        if (x <= -half) x += half;
        if (x > 0) x -= half;
        el.style.transform = `translate3d(${x}px,0,0)`;
      }
      raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [speed]);

  const row = (
    <>
      {items.map((it, i) => (
        <span key={i} className="marquee-item">
          <span className={i % 2 === 0 ? "solid" : "hollow"}>{it}</span>
          <svg className="star" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 0l2.4 9.6L24 12l-9.6 2.4L12 24l-2.4-9.6L0 12l9.6-2.4z" fill="currentColor" />
          </svg>
        </span>
      ))}
    </>
  );

  return (
    <div className="marquee" aria-label={items.join(", ")} role="img">
      <div ref={track} className="marquee-track" aria-hidden="true">
        {row}
        {row}
      </div>
    </div>
  );
}
