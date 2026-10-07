"use client";

import { useEffect, useRef } from "react";

// A hall full of raised phone lights, drawn in perspective: small and dense at the
// back, large and sparse at the front. Lights switch on row by row (back first)
// once the intro finishes, sway together like a crowd during a chorus, and
// brighten around the pointer.

type Light = {
  x: number;
  y: number;
  r: number;
  depth: number;
  phase: number;
  sway: number;
  speed: number;
  delay: number;
  rose: boolean;
};

function makeSprite(core: string, mid: string, edge: string) {
  const s = document.createElement("canvas");
  const n = 64;
  s.width = s.height = n;
  const c = s.getContext("2d")!;
  const g = c.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
  g.addColorStop(0, "rgba(255,252,240,1)");
  g.addColorStop(0.1, core);
  g.addColorStop(0.32, mid);
  g.addColorStop(1, edge);
  c.fillStyle = g;
  c.fillRect(0, 0, n, n);
  return s;
}

export default function LightField({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const warm = makeSprite("rgba(255,241,207,0.95)", "rgba(255,206,140,0.26)", "rgba(255,190,120,0)");
    const rose = makeSprite("rgba(255,214,232,0.95)", "rgba(214,63,124,0.3)", "rgba(214,63,124,0)");

    let W = 0;
    let H = 0;
    let lights: Light[] = [];
    let raf = 0;
    let inView = true;
    let start = -1;
    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999 };

    const build = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      if (!W || !H) return;
      const dpr = W < 700 ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      lights = [];
      const narrow = W < 700;
      const rows = narrow ? 15 : 22;
      for (let i = 0; i < rows; i++) {
        const depth = i / (rows - 1); // 0 = back row, 1 = front row
        const y = H * (0.36 + 0.6 * Math.pow(depth, 1.3));
        const spacing = (narrow ? 9 : 11) + 58 * depth * depth;
        const n = Math.ceil((W * 1.1) / spacing);
        for (let k = 0; k < n; k++) {
          if (Math.random() > 0.58) continue; // not everyone holds a light up
          const x = -W * 0.05 + ((k + Math.random() * 0.8) / n) * W * 1.1;
          const side = (x / W - 0.5) * 2;
          const curve = side * side * H * 0.06 * (1 - depth); // rows curve up toward the walls
          lights.push({
            x,
            y: y - curve + (Math.random() - 0.5) * spacing * 0.6,
            r: 0.6 + 3.4 * depth * depth + Math.random() * 0.5,
            depth,
            phase: Math.random() * Math.PI * 2,
            sway: (1.2 + 7 * depth) * (0.5 + Math.random() * 0.8),
            speed: 0.7 + Math.random() * 0.6,
            delay: depth * 1500 + Math.random() * 650,
            rose: Math.random() < 0.07,
          });
        }
      }
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, W, H);
      if (start < 0) return;
      ctx.globalCompositeOperation = "lighter";
      pointer.x += (pointer.tx - pointer.x) * 0.08;
      pointer.y += (pointer.ty - pointer.y) * 0.08;
      const elapsed = reduce ? 1e9 : now - start;
      const R = Math.max(160, W * 0.14);

      for (const L of lights) {
        const on = Math.min(1, Math.max(0, (elapsed - L.delay) / 450));
        if (on <= 0) continue;
        const t = reduce ? 0 : now * 0.001;
        // shared wave across the hall plus a little individual drift
        const wave = Math.sin(t * 1.15 - L.x * 0.0045 + L.phase * 0.25);
        const sx = L.x + (wave * 0.75 + Math.sin(t * L.speed + L.phase) * 0.25) * L.sway;
        const sy = L.y + Math.cos(t * 0.9 * L.speed + L.phase) * L.sway * 0.25;
        const flicker = reduce ? 1 : 0.78 + 0.22 * Math.sin(t * 3.1 * L.speed + L.phase * 3);
        const dx = sx - pointer.x;
        const dy = sy - pointer.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        const boost = d < R ? 1 - d / R : 0;
        // the switch-on flash overshoots slightly, like a phone screen waking
        const flash = on < 1 ? 1 + Math.sin(on * Math.PI) * 0.6 : 1;
        ctx.globalAlpha = Math.min(1, on * flicker * (0.38 + 0.62 * L.depth) * flash + boost * 0.55);
        const size = L.r * (9 + boost * 7);
        ctx.drawImage(L.rose ? rose : warm, sx - size / 2, sy - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    let last = -1;
    const loop = (now: number) => {
      if (now - last >= 32) {
        last = now;
        draw(now);
      }
      if (inView && !reduce) raf = requestAnimationFrame(loop);
    };

    const kick = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    };

    const begin = () => {
      if (start < 0) start = performance.now();
      kick();
    };

    build();
    if (document.documentElement.dataset.introDone) begin();
    window.addEventListener("sanka:intro-done", begin);

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        build();
        kick();
      }, 120);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.tx = e.clientX - rect.left;
      pointer.ty = e.clientY - rect.top;
      if (pointer.x < -9000) {
        pointer.x = pointer.tx;
        pointer.y = pointer.ty;
      }
    };
    const onLeave = () => {
      pointer.tx = pointer.ty = -9999;
    };
    const host = canvas.parentElement ?? canvas;
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView && start >= 0) kick();
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("sanka:intro-done", begin);
      ro.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      io.disconnect();
    };
  }, []);

  return <canvas ref={ref} className={`lightfield ${className}`} aria-hidden="true" />;
}
