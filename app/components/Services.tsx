"use client";

import { useState } from "react";
import { services } from "../content";

// A stage drawn in SVG. Each service lights up its own layer of the rig;
// wedding management swaps the band and crowd for a poruwa and garlands.

function person(x: number, base: number, h: number) {
  const r = h * 0.085;
  const sy = base - h + r * 2.4;
  const sw = h * 0.13;
  const wy = base - h * 0.45;
  const ww = h * 0.09;
  const lw = h * 0.085;
  return {
    head: { cx: x, cy: base - h + r, r },
    body: `M ${x - sw} ${sy + 4} Q ${x - sw} ${sy} ${x - sw + 5} ${sy} L ${x + sw - 5} ${sy} Q ${x + sw} ${sy} ${x + sw} ${sy + 4} L ${x + ww} ${wy} L ${x + lw} ${base} L ${x + lw * 0.2} ${base} L ${x} ${wy + h * 0.1} L ${x - lw * 0.2} ${base} L ${x - lw} ${base} L ${x - ww} ${wy} Z`,
  };
}

function Person({ x, base, h }: { x: number; base: number; h: number }) {
  const p = person(x, base, h);
  return (
    <g>
      <circle {...p.head} />
      <path d={p.body} />
    </g>
  );
}

const fixtures = [150, 230, 290, 350, 410, 490];

const crowd = Array.from({ length: 22 }, (_, i) => {
  const x = 10 + i * 29.5 + ((i * 37) % 11) - 5;
  const h = 78 + ((i * 53) % 17);
  const phone = i % 3 === 1;
  return { x, h, phone, side: i % 2 ? 1 : -1 };
});

const garland = (() => {
  let d = "M 60 54";
  for (let x = 60; x < 580; x += 52) d += ` Q ${x + 26} 86 ${x + 52} 54`;
  return d;
})();

export default function Services() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section className="services" id="services" aria-labelledby="services-title">
      <header className="section-head">
        <h2 id="services-title">Everything behind the night</h2>
        <p>
          The crew that builds Snehaye Nagaraya is available for your wedding, concert or corporate event. Book one
          service or the whole production.
        </p>
      </header>

      <div className="services-grid">
        <div className="stage-wrap" data-anim>
          <svg
            className="stage-svg"
            data-active={active ?? "all"}
            viewBox="0 0 640 420"
            role="img"
            aria-label={active ? `Stage diagram highlighting ${services.find((s) => s.id === active)?.name}` : "Stage diagram"}
          >
            <defs>
              <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFF1CF" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#FFF1CF" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="beamRose" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D63F7C" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#D63F7C" stopOpacity="0" />
              </linearGradient>
              <radialGradient id="floorGlow" cx="50%" cy="0%" r="70%">
                <stop offset="0%" stopColor="#D63F7C" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#D63F7C" stopOpacity="0" />
              </radialGradient>
              <pattern id="pixelGrid" width="5" height="5" patternUnits="userSpaceOnUse">
                <path d="M0 0.4H5M0.4 0V5" stroke="#000" strokeWidth="1.2" />
              </pattern>
              <radialGradient id="ledRose">
                <stop offset="0%" stopColor="#D63F7C" />
                <stop offset="100%" stopColor="#D63F7C" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="ledGold">
                <stop offset="0%" stopColor="#C9A25A" />
                <stop offset="100%" stopColor="#C9A25A" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="ledViolet">
                <stop offset="0%" stopColor="#7B3FD6" />
                <stop offset="100%" stopColor="#7B3FD6" stopOpacity="0" />
              </radialGradient>
              <clipPath id="ledClip">
                <rect x="180" y="92" width="280" height="170" />
              </clipPath>
            </defs>

            {/* LED wall */}
            <g data-layer="led event" className="layer layer--led">
              <rect x="176" y="88" width="288" height="178" rx="2" className="led-frame" />
              <g clipPath="url(#ledClip)">
                <rect x="180" y="92" width="280" height="170" fill="#1a0b22" />
                <g className="led-content">
                  <ellipse cx="200" cy="150" rx="120" ry="85" fill="url(#ledRose)" />
                  <ellipse cx="330" cy="210" rx="140" ry="80" fill="url(#ledGold)" />
                  <ellipse cx="460" cy="130" rx="120" ry="95" fill="url(#ledViolet)" />
                  <ellipse cx="590" cy="200" rx="130" ry="85" fill="url(#ledRose)" />
                </g>
                <rect x="180" y="92" width="280" height="170" fill="url(#pixelGrid)" />
              </g>
            </g>

            {/* Lighting beams */}
            <g data-layer="lighting event" className="layer layer--lighting">
              {fixtures.map((x, i) => (
                <polygon
                  key={x}
                  className="beam"
                  style={{ animationDelay: `${i * -0.9}s` }}
                  points={`${x - 3},64 ${x + 3},64 ${x + 55},326 ${x - 55},326`}
                  fill={i % 2 ? "url(#beamRose)" : "url(#beam)"}
                />
              ))}
              {fixtures.map((x) => (
                <rect key={x} x={x - 7} y="52" width="14" height="12" rx="2" className="fixture" />
              ))}
            </g>

            {/* Stage platform and truss */}
            <g data-layer="stage event" className="layer layer--stage">
              <rect x="40" y="36" width="16" height="290" className="truss" />
              <rect x="584" y="36" width="16" height="290" className="truss" />
              <rect x="40" y="36" width="560" height="16" className="truss" />
              <path
                d={Array.from({ length: 28 }, (_, i) => `M ${40 + i * 20} 36 L ${50 + i * 20} 52 L ${60 + i * 20} 36`).join(" ")}
                className="truss-lace"
              />
              <path
                d={Array.from({ length: 14 }, (_, i) => `M 40 ${52 + i * 20} L 56 ${62 + i * 20} L 40 ${72 + i * 20} M 584 ${52 + i * 20} L 600 ${62 + i * 20} L 584 ${72 + i * 20}`).join(" ")}
                className="truss-lace"
              />
              <polygon points="90,300 550,300 600,326 40,326" className="deck" />
              <rect x="40" y="326" width="560" height="22" className="deck-front" />
            </g>

            {/* Sound */}
            <g data-layer="sound event" className="layer layer--sound">
              {Array.from({ length: 6 }, (_, i) => (
                <g key={i}>
                  <rect x={64 + i * 0.8} y={60 + i * 18} width="40" height="16" rx="1.5" transform={`rotate(${i * 2.2} ${84} ${60 + i * 18})`} className="speaker" />
                  <rect x={536 - i * 0.8} y={60 + i * 18} width="40" height="16" rx="1.5" transform={`rotate(${-i * 2.2} ${556} ${60 + i * 18})`} className="speaker" />
                </g>
              ))}
              {[0, 1, 2].map((i) => (
                <g key={i} className="wave" style={{ animationDelay: `${i * 0.6}s` }}>
                  <path d="M 116 90 Q 136 115 116 140" />
                  <path d="M 524 90 Q 504 115 524 140" />
                </g>
              ))}
            </g>

            {/* Band */}
            <g data-layer="band event" className="layer layer--band">
              <circle cx="330" cy="283" r="16" className="kit" />
              <circle cx="306" cy="272" r="7" className="kit" />
              <circle cx="354" cy="272" r="7" className="kit" />
              <path d="M 290 258 L 318 254 M 344 252 L 372 256" className="kit-line" />
              <Person x={330} base={292} h={58} />
              <rect x="196" y="266" width="58" height="6" rx="1" className="kit" />
              <path d="M 204 272 L 246 300 M 246 272 L 204 300" className="kit-line" />
              <Person x={224} base={300} h={70} />
              <Person x={426} base={300} h={76} />
              <path d="M 404 268 L 452 244" className="guitar" />
              <ellipse cx="412" cy="266" rx="11" ry="7" transform="rotate(-28 412 266)" className="kit" />
              <path d="M 288 300 L 288 238 L 296 230" className="kit-line" />
              <Person x={300} base={300} h={84} />
            </g>

            {/* Audience */}
            <g data-layer="event" className="layer layer--crowd">
              <rect x="0" y="348" width="640" height="72" fill="url(#floorGlow)" />
              {crowd.map((c, i) => (
                <g key={i}>
                  {c.phone && (
                    <>
                      <path d={`M ${c.x + c.side * 8} ${450 - c.h * 0.78} L ${c.x + c.side * 14} ${452 - c.h - 18}`} className="arm" />
                      <circle cx={c.x + c.side * 14} cy={450 - c.h - 22} r="7" className="phone-glow" />
                      <rect x={c.x + c.side * 14 - 2.5} y={450 - c.h - 26} width="5" height="8" rx="1" className="phone" />
                    </>
                  )}
                  <Person x={c.x} base={450} h={c.h} />
                </g>
              ))}
            </g>

            {/* Wedding: garlands and a poruwa */}
            <g data-layer="wedding" className="layer layer--wedding">
              <path d={garland} className="garland" />
              {Array.from({ length: 20 }, (_, i) => (
                <circle key={i} cx={73 + i * 26} cy={i % 2 ? 70 : 62} r="3.2" className={i % 3 ? "flower" : "flower flower--rose"} />
              ))}
              <rect x="236" y="286" width="168" height="14" className="poruwa-base" />
              <rect x="248" y="276" width="144" height="10" className="poruwa-base" />
              {[258, 290, 350, 382].map((x) => (
                <rect key={x} x={x - 3} y="196" width="6" height="80" className="poruwa-post" />
              ))}
              <path d="M 232 204 Q 320 150 408 204 L 396 194 Q 320 142 244 194 Z" className="poruwa-roof" />
              <path d="M 252 186 Q 320 128 388 186" className="poruwa-roof-line" />
              <path d="M 320 140 L 320 118" className="poruwa-roof-line" />
              <circle cx="320" cy="114" r="5" className="flower" />
              {[258, 290, 350, 382].map((x) =>
                [210, 230, 250, 270].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2.6" className="flower" />),
              )}
              <path d="M 196 300 L 196 274 M 444 300 L 444 274" className="poruwa-post-line" />
              <circle cx="196" cy="268" r="6" className="phone-glow" />
              <circle cx="444" cy="268" r="6" className="phone-glow" />
            </g>
          </svg>
        </div>

        <ul className="services-list" onPointerLeave={() => setActive(null)}>
          {services.map((s) => (
            <li key={s.id}>
              <button
                className={`service${active === s.id ? " is-active" : ""}`}
                aria-pressed={active === s.id}
                onPointerEnter={(e) => e.pointerType === "mouse" && setActive(s.id)}
                onFocus={() => setActive(s.id)}
                onClick={() => setActive(s.id)}
              >
                <span className="service-name">{s.name}</span>
                <span className="service-blurb">
                  <span>{s.blurb}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
