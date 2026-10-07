"use client";

import { useEffect, useRef, useState } from "react";

// First-visit loader. The skyline's windows switch on as real assets finish loading
// (fonts, the hero's portraits, the logo), stage lights sweep the sky, then converge on
// the logo before the whole thing lifts like a theatre curtain to reveal the hero.

type Phase = "loading" | "finale" | "exit" | "gone";

const MIN_MS = 2100; // long enough for the choreography to read
const MAX_MS = 7000; // never hold the page hostage on a slow connection
const FINALE_MS = 1300;
const EXIT_MS = 1150;

const BEAMS = [
  { x: 0.1, speed: 0.55, phase: 0.2, amp: 24, rose: false },
  { x: 0.3, speed: 0.7, phase: 2.1, amp: 20, rose: true },
  { x: 0.7, speed: 0.62, phase: 4.0, amp: 20, rose: true },
  { x: 0.9, speed: 0.5, phase: 1.1, amp: 24, rose: false },
];

function markDone() {
  document.documentElement.dataset.introDone = "1";
  window.dispatchEvent(new Event("sanka:intro-done"));
}

function prng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function Loader() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [pct, setPct] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beamRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const markRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<() => void>(() => {});

  useEffect(() => {
    const html = document.documentElement;
    let seen = html.classList.contains("seen-intro");
    try {
      seen = seen || sessionStorage.getItem("sanka-intro") === "1";
      sessionStorage.setItem("sanka-intro", "1");
    } catch {}
    if (seen) {
      const id = window.setTimeout(() => {
        setPhase("gone");
        markDone();
      }, 0);
      return () => window.clearTimeout(id);
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    html.style.overflow = "hidden";

    // ---- real progress: fonts, window load, and the images visible in the first screen
    let target = 0;
    const tasks: Promise<unknown>[] = [document.fonts ? document.fonts.ready : Promise.resolve()];
    tasks.push(
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise((r) => window.addEventListener("load", r, { once: true })),
    );
    document.querySelectorAll<HTMLImageElement>(".hero img, .nav img").forEach((img) => {
      const r = img.getBoundingClientRect();
      if (r.top > window.innerHeight * 1.2) return; // below the fold, lazy, not worth waiting for
      tasks.push(
        img.complete
          ? Promise.resolve()
          : new Promise((res) => {
              img.addEventListener("load", res, { once: true });
              img.addEventListener("error", res, { once: true });
            }),
      );
    });
    let settled = 0;
    tasks.forEach((t) =>
      t.then(() => {
        settled++;
        target = settled / tasks.length;
      }),
    );

    // ---- skyline canvas
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let W = 0;
    let H = 0;
    let dpr = 1;
    let shapes: HTMLCanvasElement | null = null;
    let windows: { x: number; y: number; w: number; h: number; a: number; warm: boolean }[] = [];
    let hearts: { x: number; y: number; w: number; h: number; d: number }[] = [];
    let lotus = { x: 0, y: 0 };

    const build = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      const rand = prng(11);
      const s = Math.max(0.7, Math.min(1.2, W / 1400));
      const cityH = Math.min(H * (W < 700 ? 0.3 : 0.38), 420);
      shapes = document.createElement("canvas");
      shapes.width = canvas.width;
      shapes.height = canvas.height;
      const g = shapes.getContext("2d")!;
      g.scale(dpr, dpr);
      windows = [];
      hearts = [];

      const layer = (color: string, minH: number, maxH: number, lit: number, warm: boolean, gap: number) => {
        g.fillStyle = color;
        let x = -10;
        while (x < W + 10) {
          const bw = (34 + rand() * 70) * s;
          const bh = cityH * (minH + rand() * (maxH - minH));
          const top = H - bh;
          g.fillRect(x, top, bw, bh);
          if (rand() < 0.2) g.fillRect(x + bw * 0.45, top - 18 * s, 2 * s, 18 * s);
          const cols = Math.floor((bw - 8 * s) / (9 * s));
          const rows = Math.floor((bh - 14 * s) / (12 * s));
          const ox = x + (bw - cols * 9 * s) / 2 + 2 * s;
          for (let r = 0; r < rows; r++)
            for (let c = 0; c < cols; c++)
              if (rand() < lit)
                windows.push({ x: ox + c * 9 * s, y: top + 10 * s + r * 12 * s, w: 4 * s, h: 6 * s, a: 0.35 + rand() * 0.65, warm });
          x += bw + rand() * gap * s;
        }
      };

      // back layer with the Lotus Tower and the heart tower
      g.fillStyle = "#1c0e28";
      const lx = W * (W < 700 ? 0.22 : 0.27);
      const top = H - cityH * 1.25;
      g.beginPath();
      g.moveTo(lx - 13 * s, H);
      g.lineTo(lx - 6 * s, top + 70 * s);
      g.lineTo(lx + 6 * s, top + 70 * s);
      g.lineTo(lx + 13 * s, H);
      g.fill();
      g.beginPath();
      g.moveTo(lx, top + 74 * s);
      g.bezierCurveTo(lx - 34 * s, top + 60 * s, lx - 30 * s, top + 26 * s, lx, top + 8 * s);
      g.bezierCurveTo(lx + 30 * s, top + 26 * s, lx + 34 * s, top + 60 * s, lx, top + 74 * s);
      g.fill();
      g.fillRect(lx - 1.5 * s, top - 34 * s, 3 * s, 44 * s);
      lotus = { x: lx, y: top + 42 * s };

      const hx = W * (W < 700 ? 0.74 : 0.7);
      const tw = 96 * s;
      const th = cityH * 1.02;
      g.fillRect(hx - tw / 2, H - th, tw, th);
      const cols = 11;
      const HR = 10;
      const cw = (tw - 12 * s) / cols;
      for (let r = 0; r < HR; r++)
        for (let c = 0; c < cols; c++) {
          const u = ((c + 0.5) / cols - 0.5) * 2.7;
          const v = 1.25 - ((r + 0.5) / HR) * 2.45;
          const k = u * u + v * v - 1;
          if (k * k * k - u * u * v * v * v <= 0)
            hearts.push({ x: hx - tw / 2 + 6 * s + c * cw + cw * 0.2, y: H - th + 12 * s + r * 10 * s, w: cw * 0.6, h: 5 * s, d: Math.hypot(u, v) });
        }

      layer("#1c0e28", 0.45, 0.85, 0.12, false, 4);
      layer("#050208", 0.2, 0.55, 0.22, true, 6);

      // shuffle so windows switch on scattered across the whole city
      for (let i = windows.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [windows[i], windows[j]] = [windows[j], windows[i]];
      }
    };

    // beams aim at the logo during the finale
    const aims: number[] = [];
    const measureAims = () => {
      const m = markRef.current?.getBoundingClientRect();
      const cx = m ? m.left + m.width / 2 : window.innerWidth / 2;
      const cy = m ? m.top + m.height / 2 : window.innerHeight * 0.42;
      BEAMS.forEach((b, i) => {
        const ox = b.x * window.innerWidth;
        const oy = window.innerHeight * 0.92;
        aims[i] = (Math.atan2(cx - ox, oy - cy) * 180) / Math.PI;
      });
    };

    build();
    measureAims();
    const onResize = () => {
      build();
      measureAims();
    };
    window.addEventListener("resize", onResize);

    // ---- main loop
    const start = performance.now();
    let shown = 0;
    let lastPct = -1;
    let finaleAt = -1;
    let skipped = false;
    let raf = 0;
    let stopped = false;
    const timers: number[] = [];

    skipRef.current = () => {
      skipped = true;
      target = 1;
    };

    const frame = (now: number) => {
      const elapsed = now - start;
      if (elapsed > MAX_MS) target = 1;
      const floor = skipped ? 1 : Math.min(1, elapsed / MIN_MS);
      shown += (target - shown) * (reduce ? 1 : 0.08);
      const p = Math.min(shown, floor, 1);
      const t = now / 1000;

      const rounded = Math.round(p * 100);
      if (rounded !== lastPct) {
        lastPct = rounded;
        setPct(rounded);
      }
      markRef.current?.style.setProperty("--p", p.toFixed(3));

      if (p >= 0.995 && finaleAt < 0) {
        finaleAt = now;
        setPhase("finale");
        timers.push(
          window.setTimeout(() => {
            setPhase("exit");
            markDone();
            html.style.overflow = "";
          }, skipped ? 250 : FINALE_MS),
        );
        timers.push(
          window.setTimeout(() => {
            stopped = true;
            cancelAnimationFrame(raf);
            setPhase("gone");
          }, (skipped ? 250 : FINALE_MS) + EXIT_MS),
        );
      }
      const f = finaleAt < 0 ? 0 : Math.min(1, (now - finaleAt) / 800);
      const ease = 1 - Math.pow(1 - f, 3);

      // beams: free sweep, then converge on the logo
      BEAMS.forEach((b, i) => {
        const el = beamRefs.current[i];
        if (!el) return;
        const sweep = reduce ? (b.x < 0.5 ? 14 : -14) : Math.sin(t * b.speed + b.phase) * b.amp;
        el.style.rotate = `${sweep + (aims[i] - sweep) * ease}deg`;
      });

      // city: windows switch on with progress
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (shapes) ctx.drawImage(shapes, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const litCount = Math.floor(windows.length * p);
      for (let i = 0; i < litCount; i++) {
        const w = windows[i];
        const age = Math.min(1, (litCount - i) / 40); // newest windows fade in
        const flick = reduce ? 1 : 0.85 + 0.15 * Math.sin(t * 3 + i);
        ctx.globalAlpha = w.a * age * flick;
        ctx.fillStyle = w.warm ? "#ffecc8" : "#e8c9ff";
        ctx.fillRect(w.x, w.y, w.w, w.h);
      }
      // lotus tower glow grows with progress
      const grd = ctx.createRadialGradient(lotus.x, lotus.y, 0, lotus.x, lotus.y, 90);
      grd.addColorStop(0, "rgba(214,63,124,0.7)");
      grd.addColorStop(1, "rgba(214,63,124,0)");
      ctx.globalAlpha = 0.2 + p * 0.8;
      ctx.fillStyle = grd;
      ctx.fillRect(lotus.x - 90, lotus.y - 90, 180, 180);
      // the heart lights from the centre out in the finale
      for (const h of hearts) {
        ctx.globalAlpha = Math.min(1, Math.max(0, (f * 1.6 - h.d * 0.5)));
        ctx.fillStyle = "#ff5c93";
        ctx.fillRect(h.x, h.y, h.w, h.h);
      }
      ctx.globalAlpha = 1;

      if (!stopped) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && skipRef.current();
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach((id) => window.clearTimeout(id));
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
      html.style.overflow = "";
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      className={`loader is-${phase}`}
      role="status"
      aria-live="polite"
      aria-busy={phase === "loading"}
      onClick={() => skipRef.current()}
    >
      <span className="loader-stars" aria-hidden="true" />
      <div className="loader-beams" aria-hidden="true">
        {BEAMS.map((b, i) => (
          <span
            key={i}
            ref={(el) => {
              beamRefs.current[i] = el;
            }}
            className={`loader-beam${b.rose ? " loader-beam--rose" : ""}`}
            style={{ left: `${b.x * 100}%` }}
          />
        ))}
      </div>
      <canvas ref={canvasRef} className="loader-city" aria-hidden="true" />

      <div className="loader-mark" ref={markRef}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/sanka-logo.png" alt="SANKA" width={674} height={241} />
        <p className="loader-si" lang="si" aria-hidden="true">
          ස්නේහයේ නගරය
        </p>
      </div>

      <p className="loader-meter">
        <span>{phase === "loading" ? "Lighting up the city" : "Welcome to the city of love"}</span>
        <span className="loader-pct">{pct}%</span>
      </p>
    </div>
  );
}
