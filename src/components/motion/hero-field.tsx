"use client";

import { useEffect, useRef } from "react";

/**
 * Animowane tło hero: siatka punktów falująca w czasie i odpychana przez kursor.
 * Punkty blisko kursora świecą kolorem akcentu i łączą się liniami.
 * Zatrzymuje się poza ekranem i w ukrytej karcie; przy prefers-reduced-motion rysuje jedną klatkę.
 */
export function HeroField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let gap = 34;
    let cols = 0;
    let rows = 0;
    let raf = 0;
    let running = false;
    let t = 0;
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
    let colors = { dot: "rgba(120,125,140,0.5)", accent: "#7357ff" };

    const readColors = () => {
      const s = getComputedStyle(document.documentElement);
      const light = document.documentElement.getAttribute("data-theme") === "light";
      colors = {
        dot: light ? "rgba(17,18,22,0.22)" : "rgba(200,204,220,0.22)",
        accent: s.getPropertyValue("--accent").trim() || "#7357ff",
      };
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gap = w < 640 ? 28 : 34;
      cols = Math.ceil(w / gap) + 1;
      rows = Math.ceil(h / gap) + 1;
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      mouse.x += (mouse.tx - mouse.x) * 0.12;
      mouse.y += (mouse.ty - mouse.y) * 0.12;
      const R = Math.min(260, w * 0.28);
      const lit: { x: number; y: number; k: number }[] = [];

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const bx = i * gap;
          const by = j * gap;
          // fala przesuwająca się po siatce
          const wave = Math.sin(i * 0.22 + t * 0.9) * Math.cos(j * 0.18 - t * 0.6) * 5;
          let x = bx + wave * 0.6;
          let y = by + wave;
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const dist = Math.hypot(dx, dy);
          let k = 0;
          if (dist < R) {
            k = 1 - dist / R;
            const push = k * k * 34;
            x += (dx / (dist || 1)) * push;
            y += (dy / (dist || 1)) * push;
          }
          // wyciszenie przy dolnej krawędzi
          const fade = Math.min(1, (h - y) / (h * 0.35));
          if (fade <= 0) continue;
          ctx.globalAlpha = fade;
          if (k > 0.05) {
            ctx.fillStyle = colors.accent;
            ctx.globalAlpha = fade * (0.35 + k * 0.65);
            const r = 1.2 + k * 2.4;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
            if (k > 0.35) lit.push({ x, y, k });
          } else {
            ctx.fillStyle = colors.dot;
            ctx.fillRect(x - 0.9, y - 0.9, 1.8, 1.8);
          }
        }
      }

      // linie między najjaśniejszymi punktami
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1;
      for (let a = 0; a < lit.length; a++) {
        for (let b = a + 1; b < lit.length; b++) {
          const d = Math.hypot(lit[a].x - lit[b].x, lit[a].y - lit[b].y);
          if (d < gap * 1.6) {
            ctx.globalAlpha = Math.min(lit[a].k, lit[b].k) * 0.5;
            ctx.beginPath();
            ctx.moveTo(lit[a].x, lit[a].y);
            ctx.lineTo(lit[b].x, lit[b].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = () => {
      t += 0.016;
      draw();
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduced) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.tx = e.clientX - rect.left;
      mouse.ty = e.clientY - rect.top;
      if (mouse.x < -1000) {
        mouse.x = mouse.tx;
        mouse.y = mouse.ty;
      }
    };
    const onLeave = () => {
      mouse.tx = -9999;
      mouse.ty = -9999;
    };

    readColors();
    resize();
    if (reduced) draw();
    else {
      // pierwszy „oddech” kursora na środku, żeby efekt był widoczny także bez myszy (telefon)
      mouse.tx = w * 0.72;
      mouse.ty = h * 0.38;
    }

    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
    io.observe(canvas);
    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw();
    });
    ro.observe(canvas);
    const mo = new MutationObserver(() => {
      readColors();
      if (reduced) draw();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} className="hero-canvas" aria-hidden="true" />;
}
