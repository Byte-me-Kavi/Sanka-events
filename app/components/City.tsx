"use client";

import { useEffect, useRef, type RefObject } from "react";

// The City of Love, drawn on canvas: three layers of skyline with lit windows,
// Colombo's Lotus Tower, Kandy's octagon, and one tower whose windows form a heart.
// "hero" mode drifts with the pointer; "walk" mode pans sideways as panRef (0..1) changes.

type Mode = "hero" | "walk";
type Twinkle = { x: number; y: number; w: number; h: number; phase: number; speed: number };
type Heart = { x: number; y: number; w: number; h: number; d: number };
type Landmark = { kind: "lotus" | "heart"; x: number; y: number; s: number };
type Layer = {
  shape: HTMLCanvasElement;
  lights: HTMLCanvasElement;
  extra: number;
  depth: number;
  twinkles: Twinkle[];
  hearts: Heart[];
  marks: Landmark[];
};

const SPECS = [
  { depth: 0.35, color: "#1d1030", minH: 0.42, maxH: 0.82, win: "236,200,255", lit: 0.1, a: [0.12, 0.4], s: 0.62 },
  { depth: 0.65, color: "#0f0718", minH: 0.3, maxH: 0.74, win: "255,222,170", lit: 0.17, a: [0.3, 0.8], s: 0.85 },
  { depth: 1, color: "#030105", minH: 0.16, maxH: 0.46, win: "255,236,200", lit: 0.24, a: [0.45, 1], s: 1.1 },
];

function prng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function inHeart(u: number, v: number) {
  // u, v in roughly -1.3..1.3, v up
  const a = u * u + v * v - 1;
  return a * a * a - u * u * v * v * v <= 0;
}

export default function City({
  mode = "hero",
  panRef,
  className = "",
}: {
  mode?: Mode;
  panRef?: RefObject<number>;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let layers: Layer[] = [];
    let raf = 0;
    let inView = true;
    let start = -1;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      dpr = mode === "walk" ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);

      const narrow = W < 700;
      const cityH = mode === "hero" ? Math.min(H * (narrow ? 0.42 : 0.6), 600) : Math.min(H * 0.6, 560);
      const unit = Math.max(0.7, Math.min(1.25, W / 1400));
      const rand = prng(mode === "hero" ? 7 : 21);

      layers = SPECS.map((spec, li) => {
        const extra = mode === "walk" ? W * 2.6 * spec.depth : 60;
        const worldW = W + extra + 40;
        const s = spec.s * unit;
        const mk = () => {
          const c = document.createElement("canvas");
          c.width = Math.ceil(worldW * dpr);
          c.height = Math.ceil(H * dpr);
          const g = c.getContext("2d")!;
          g.scale(dpr, dpr);
          return { c, g };
        };
        const shape = mk();
        const lights = mk();
        const twinkles: Twinkle[] = [];
        const hearts: Heart[] = [];
        const marks: Landmark[] = [];
        shape.g.fillStyle = spec.color;

        // landmark positions (world x), chosen so they sit near the matching city panels
        const at = (p: number, f: number) => p * extra + W * f;
        const lotusX = mode === "hero" ? W * (narrow ? 0.74 : 0.535) : at(0.42, 0.62);
        const heartX = mode === "hero" ? W * (narrow ? 0.34 : 0.455) : at(0.58, 0.4);
        const templeXs = mode === "hero" ? [W * (narrow ? 0.12 : 0.3)] : [at(0.02, 0.7), at(0.9, 0.62)];
        const reserved: [number, number][] = [];

        if (li === 1) {
          drawLotus(shape.g, lights.g, lotusX, H, cityH * 1.08, s);
          marks.push({ kind: "lotus", x: lotusX, y: H - cityH * 1.08 + 46 * s, s });
          reserved.push([lotusX - 50 * s, lotusX + 50 * s]);
          for (const tx of templeXs) {
            drawTemple(shape.g, lights.g, tx, H, s * 1.1);
            reserved.push([tx - 70 * s, tx + 70 * s]);
          }
          // the heart tower
          const tw = 112 * s;
          const th = cityH * 0.84;
          const hx = heartX - tw / 2;
          shape.g.fillRect(hx, H - th, tw, th);
          shape.g.fillRect(heartX - 2 * s, H - th - 34 * s, 4 * s, 34 * s);
          const cols = 11;
          const HR = 10;
          const rows = Math.floor((th - 20 * s) / (11 * s));
          const cw = (tw - 14 * s) / cols;
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const x = hx + 7 * s + c * cw + cw * 0.22;
              const y = H - th + 12 * s + r * 11 * s;
              const u = ((c + 0.5) / cols - 0.5) * 2.7;
              const v = 1.25 - ((r + 0.5) / HR) * 2.45;
              if (r < HR && inHeart(u, v)) {
                hearts.push({ x, y, w: cw * 0.6, h: 6 * s, d: Math.hypot(u, v) });
              } else if (rand() < 0.1) {
                lights.g.fillStyle = `rgba(${spec.win},${0.2 + rand() * 0.3})`;
                lights.g.fillRect(x, y, cw * 0.6, 6 * s);
              }
            }
          }
          marks.push({ kind: "heart", x: heartX, y: H - th - 34 * s, s });
          reserved.push([hx - 6, hx + tw + 6]);
        }

        let x = -20;
        while (x < worldW) {
          const bw = (30 + rand() * 78) * s;
          const blocked = reserved.some(([a, b]) => x + bw > a && x < b);
          if (blocked && li === 1) {
            x += 12 * s;
            continue;
          }
          const wave = 0.75 + 0.25 * Math.sin(x / (W * 0.18) + li * 2);
          const bh = cityH * (spec.minH + rand() * (spec.maxH - spec.minH)) * wave;
          const top = H - bh;
          shape.g.fillRect(x, top, bw, bh);

          const roof = rand();
          if (roof < 0.18) {
            shape.g.fillRect(x + bw * 0.45, top - 22 * s, 2 * s, 22 * s);
            if (li > 0) twinkles.push({ x: x + bw * 0.45 - 1.5 * s, y: top - 25 * s, w: 5 * s, h: 4 * s, phase: rand() * 6, speed: -1 });
          } else if (roof < 0.38) {
            shape.g.fillRect(x + bw * 0.2, top - 14 * s, bw * 0.6, 14 * s);
          } else if (roof < 0.48) {
            shape.g.beginPath();
            shape.g.moveTo(x - 2 * s, top);
            shape.g.lineTo(x + bw / 2, top - bw * 0.35);
            shape.g.lineTo(x + bw + 2 * s, top);
            shape.g.fill();
          } else if (roof < 0.54) {
            shape.g.beginPath();
            shape.g.arc(x + bw / 2, top, bw * 0.32, Math.PI, 0);
            shape.g.fill();
          }

          const gx = 9 * s;
          const gy = 12 * s;
          const cols = Math.floor((bw - 8 * s) / gx);
          const rows = Math.floor((bh - 14 * s) / gy);
          const ox = x + (bw - cols * gx) / 2 + 2 * s;
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              if (rand() > spec.lit) continue;
              const wx = ox + c * gx;
              const wy = top + 10 * s + r * gy;
              if (rand() < 0.05) {
                twinkles.push({ x: wx, y: wy, w: 4 * s, h: 6 * s, phase: rand() * 6.28, speed: 0.4 + rand() * 1.4 });
              } else {
                lights.g.fillStyle = `rgba(${spec.win},${spec.a[0] + rand() * (spec.a[1] - spec.a[0])})`;
                lights.g.fillRect(wx, wy, 4 * s, 6 * s);
              }
            }
          }
          x += bw + rand() * 5 * s;
        }

        // street lamps along the front layer
        if (li === 2) {
          for (let lx = 40 * s; lx < worldW; lx += 170 * s) {
            shape.g.fillRect(lx, H - 74 * s, 3 * s, 74 * s);
            shape.g.fillRect(lx - 9 * s, H - 76 * s, 21 * s, 4 * s);
            const g = lights.g.createRadialGradient(lx + 1, H - 70 * s, 0, lx + 1, H - 70 * s, 46 * s);
            g.addColorStop(0, "rgba(255,226,170,0.85)");
            g.addColorStop(0.15, "rgba(255,206,140,0.35)");
            g.addColorStop(1, "rgba(255,190,120,0)");
            lights.g.fillStyle = g;
            lights.g.fillRect(lx - 50 * s, H - 120 * s, 100 * s, 120 * s);
          }
        }

        return { shape: shape.c, lights: lights.c, extra, depth: spec.depth, twinkles, hearts, marks };
      });
    };

    const draw = (now: number) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;
      const t = reduce ? 0 : now / 1000;
      const elapsed = start < 0 ? -1 : reduce ? 1e9 : now - start;
      const pan = panRef?.current ?? 0;

      layers.forEach((L, i) => {
        const ox = -pan * L.extra - 30 - pointer.x * 30 * L.depth;
        const oy = pointer.y * 8 * L.depth;
        ctx.drawImage(L.shape, 0, 0, L.shape.width, L.shape.height, ox, oy, L.shape.width / dpr, L.shape.height / dpr);
        const on = elapsed < 0 ? 0 : Math.min(1, Math.max(0, (elapsed - i * 380) / 1300));
        if (on <= 0) return;
        ctx.globalAlpha = on;
        ctx.drawImage(L.lights, 0, 0, L.lights.width, L.lights.height, ox, oy, L.lights.width / dpr, L.lights.height / dpr);

        const spec = SPECS[i];
        for (const k of L.twinkles) {
          const a = k.speed < 0 ? (Math.sin(t * 3 + k.phase) > 0.6 ? 1 : 0.15) : 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * k.speed + k.phase));
          ctx.globalAlpha = on * a;
          ctx.fillStyle = k.speed < 0 ? "#ff4d6d" : `rgb(${spec.win})`;
          ctx.fillRect(k.x + ox, k.y + oy, k.w, k.h);
        }

        for (const m of L.marks) {
          if (m.kind === "lotus") {
            // the Lotus Tower's lights cycle slowly between rose and gold
            const mix = 0.5 + 0.5 * Math.sin(t * 0.5);
            const r = Math.round(214 + (242 - 214) * mix);
            const g = Math.round(63 + (196 - 63) * mix);
            const b = Math.round(124 + (107 - 124) * mix);
            const cx = m.x + ox;
            const cy = m.y + oy;
            const R = 150 * m.s;
            const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
            grd.addColorStop(0, `rgba(${r},${g},${b},0.75)`);
            grd.addColorStop(0.35, `rgba(${r},${g},${b},0.25)`);
            grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
            ctx.globalAlpha = on;
            ctx.fillStyle = grd;
            ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
          }
        }

        if (L.hearts.length) {
          // heart windows light from the centre outward, then pulse
          for (const hw of L.hearts) {
            const reveal = Math.min(1, Math.max(0, (elapsed - 1500 - hw.d * 600) / 500));
            const pulse = 0.75 + 0.25 * Math.sin(t * 2.2 - hw.d * 1.5);
            ctx.globalAlpha = reveal * pulse;
            ctx.fillStyle = "#ff5c93";
            ctx.fillRect(hw.x + ox, hw.y + oy, hw.w, hw.h);
          }
          const hx = L.hearts.reduce((s, h) => s + h.x, 0) / L.hearts.length + ox;
          const hy = L.hearts.reduce((s, h) => s + h.y, 0) / L.hearts.length + oy;
          const grd = ctx.createRadialGradient(hx, hy, 0, hx, hy, 90);
          grd.addColorStop(0, "rgba(255,92,147,0.35)");
          grd.addColorStop(1, "rgba(255,92,147,0)");
          ctx.globalAlpha = Math.min(1, Math.max(0, (elapsed - 2200) / 800));
          ctx.fillStyle = grd;
          ctx.fillRect(hx - 90, hy - 90, 180, 180);
        }
        ctx.globalAlpha = 1;
      });
    };

    const loop = (now: number) => {
      draw(now);
      if (inView) raf = requestAnimationFrame(loop);
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
    kick();
    if (mode === "walk" || document.documentElement.dataset.introDone) begin();
    window.addEventListener("sanka:intro-done", begin);

    let timer = 0;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        build();
        kick();
      }, 150);
    };
    window.addEventListener("resize", onResize);

    const onMove = (e: PointerEvent) => {
      if (mode !== "hero" || reduce) return;
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) kick();
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      window.removeEventListener("sanka:intro-done", begin);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      io.disconnect();
    };
  }, [mode, panRef]);

  return <canvas ref={ref} className={`city ${className}`} aria-hidden="true" />;
}

// Colombo's Lotus Tower: podium, tapering shaft, lotus bud and spire
function drawLotus(g: CanvasRenderingContext2D, lights: CanvasRenderingContext2D, cx: number, H: number, h: number, s: number) {
  const top = H - h;
  g.fillRect(cx - 48 * s, H - 34 * s, 96 * s, 34 * s);
  g.beginPath();
  g.moveTo(cx - 15 * s, H - 34 * s);
  g.lineTo(cx - 7 * s, top + 80 * s);
  g.lineTo(cx + 7 * s, top + 80 * s);
  g.lineTo(cx + 15 * s, H - 34 * s);
  g.fill();
  // bud
  const by = top + 20 * s;
  g.beginPath();
  g.moveTo(cx, by + 66 * s);
  g.bezierCurveTo(cx - 40 * s, by + 50 * s, cx - 34 * s, by + 14 * s, cx, by - 6 * s);
  g.bezierCurveTo(cx + 34 * s, by + 14 * s, cx + 40 * s, by + 50 * s, cx, by + 66 * s);
  g.fill();
  g.beginPath();
  g.moveTo(cx - 6 * s, by + 62 * s);
  g.bezierCurveTo(cx - 52 * s, by + 54 * s, cx - 56 * s, by + 30 * s, cx - 48 * s, by + 18 * s);
  g.bezierCurveTo(cx - 34 * s, by + 40 * s, cx - 20 * s, by + 52 * s, cx - 6 * s, by + 62 * s);
  g.moveTo(cx + 6 * s, by + 62 * s);
  g.bezierCurveTo(cx + 52 * s, by + 54 * s, cx + 56 * s, by + 30 * s, cx + 48 * s, by + 18 * s);
  g.bezierCurveTo(cx + 34 * s, by + 40 * s, cx + 20 * s, by + 52 * s, cx + 6 * s, by + 62 * s);
  g.fill();
  g.fillRect(cx - 1.5 * s, top - 40 * s, 3 * s, 60 * s);
  // outline light on the bud
  lights.strokeStyle = "rgba(255,214,232,0.55)";
  lights.lineWidth = 1.2 * s;
  lights.beginPath();
  lights.moveTo(cx, by + 66 * s);
  lights.bezierCurveTo(cx - 40 * s, by + 50 * s, cx - 34 * s, by + 14 * s, cx, by - 6 * s);
  lights.bezierCurveTo(cx + 34 * s, by + 14 * s, cx + 40 * s, by + 50 * s, cx, by + 66 * s);
  lights.stroke();
  const rim = lights.createLinearGradient(0, top, 0, H);
  rim.addColorStop(0, "rgba(255,120,170,0.75)");
  rim.addColorStop(1, "rgba(255,120,170,0.15)");
  lights.strokeStyle = rim;
  lights.lineWidth = 1.2 * s;
  lights.beginPath();
  lights.moveTo(cx - 15 * s, H - 34 * s);
  lights.lineTo(cx - 7 * s, top + 80 * s);
  lights.moveTo(cx + 15 * s, H - 34 * s);
  lights.lineTo(cx + 7 * s, top + 80 * s);
  lights.stroke();
  for (let y = H - 40 * s; y > top + 90 * s; y -= 22 * s) {
    lights.fillStyle = "rgba(255,226,180,0.7)";
    lights.fillRect(cx - 1.5 * s, y, 3 * s, 3 * s);
  }
}

// Kandy's octagon (Pattirippuwa): base, pavilion and tiered Kandyan roof
function drawTemple(g: CanvasRenderingContext2D, lights: CanvasRenderingContext2D, cx: number, H: number, s: number) {
  const baseH = 46 * s;
  g.fillRect(cx - 80 * s, H - baseH, 160 * s, baseH);
  const pavH = 42 * s;
  const pavTop = H - baseH - pavH;
  g.fillRect(cx - 40 * s, pavTop, 80 * s, pavH);
  const roof = (y: number, wTop: number, wBot: number, h: number) => {
    g.beginPath();
    g.moveTo(cx - wBot / 2 - 8 * s, y + 4 * s);
    g.quadraticCurveTo(cx - wBot / 2 + 4 * s, y - 2 * s, cx - wTop / 2, y - h);
    g.lineTo(cx + wTop / 2, y - h);
    g.quadraticCurveTo(cx + wBot / 2 - 4 * s, y - 2 * s, cx + wBot / 2 + 8 * s, y + 4 * s);
    g.closePath();
    g.fill();
  };
  roof(H - baseH, 120 * s, 176 * s, 14 * s);
  roof(pavTop, 34 * s, 104 * s, 26 * s);
  g.fillRect(cx - 2 * s, pavTop - 44 * s, 4 * s, 20 * s);
  g.beginPath();
  g.arc(cx, pavTop - 46 * s, 4 * s, 0, Math.PI * 2);
  g.fill();
  for (let i = -2; i <= 2; i++) {
    lights.fillStyle = "rgba(255,206,140,0.75)";
    lights.beginPath();
    lights.roundRect(cx + i * 14 * s - 4 * s, pavTop + 12 * s, 8 * s, 18 * s, [4 * s, 4 * s, 0, 0]);
    lights.fill();
  }
  for (let i = -4; i <= 4; i++) {
    lights.fillStyle = "rgba(255,220,160,0.5)";
    lights.fillRect(cx + i * 16 * s - 2 * s, H - baseH + 16 * s, 4 * s, 10 * s);
  }
}
