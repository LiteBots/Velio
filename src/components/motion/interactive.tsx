"use client";

import { useEffect, useRef, type ReactNode } from "react";

const canHover = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Element „przyciągany” przez kursor. Na dotyku i przy ograniczonym ruchu nic nie robi. */
export function Magnetic({ children, strength = 0.35, className = "" }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !canHover()) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * strength;
      const y = (e.clientY - (r.top + r.height / 2)) * strength;
      el.classList.add("is-active");
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    const leave = () => {
      el.classList.remove("is-active");
      el.style.transform = "";
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [strength]);
  return (
    <span ref={ref} className={`magnetic ${className}`}>
      {children}
    </span>
  );
}

/**
 * Karta z efektem 3D (tilt) i reflektorem podążającym za kursorem.
 * `as` pozwala wyrenderować <article>, <li> itd.
 */
export function TiltCard({
  children,
  className = "",
  max = 7,
  as: Tag = "div",
  id,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  as?: "div" | "article" | "li";
  id?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const tilt = canHover();
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.setProperty("--mx", `${px * 100}%`);
      el.style.setProperty("--my", `${py * 100}%`);
      if (tilt) {
        el.classList.add("is-active");
        el.style.setProperty("--rx", `${(0.5 - py) * max}deg`);
        el.style.setProperty("--ry", `${(px - 0.5) * max}deg`);
      }
    };
    const leave = () => {
      el.classList.remove("is-active");
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [max]);
  return (
    <Tag ref={ref as never} id={id} className={`tilt spot ${className}`}>
      {children}
    </Tag>
  );
}

/** Licznik od 0 do wartości, uruchamiany po wejściu w ekran. */
export function CountUp({ to, suffix = "", duration = 1600 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = `${to}${suffix}`;
      return;
    }
    el.textContent = `0${suffix}`;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = `${Math.round(to * eased)}${suffix}`;
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, suffix, duration]);
  return (
    <span ref={ref} data-count>
      {to}
      {suffix}
    </span>
  );
}

/** Własny kursor (kropka + pierścień) — tylko na urządzeniach z myszą. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!canHover()) return;
    const d = dot.current;
    const r = ring.current;
    if (!d || !r) return;
    let x = -100;
    let y = -100;
    let rx = -100;
    let ry = -100;
    let raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      d.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      const t = e.target as Element | null;
      r.classList.toggle("is-hover", Boolean(t?.closest("a, button, summary, label, [data-cursor]")));
    };
    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      r.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <>
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
      <div ref={ring} className="cursor-ring" aria-hidden="true" />
    </>
  );
}

/** Ustawia --mx/--my na elemencie wg pozycji kursora (np. reflektor na dużym napisie w stopce). */
export function PointerVars({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    el.addEventListener("pointermove", move);
    return () => el.removeEventListener("pointermove", move);
  }, []);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
