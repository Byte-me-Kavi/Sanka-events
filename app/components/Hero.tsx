"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { voices } from "../content";
import City from "./City";
import HoverColor from "./HoverColor";

// Poster-style ensemble: cut-out portraits rise behind the skyline in three rows,
// legends at the back under the moon. x/y are percentages of the hero, w is vw.
const ensemble: Record<string, { x: number; y: number; w: number; d: number; z: number }> = {
  sunil: { x: 60, y: 12, w: 18, d: 0.45, z: 1 },
  amarasiri: { x: 76, y: 7, w: 22, d: 0.55, z: 2 },
  tm: { x: 92, y: 13, w: 18, d: 0.45, z: 1 },
  shashika: { x: 53, y: 31, w: 14, d: 0.75, z: 3 },
  karunarathna: { x: 67, y: 29, w: 16, d: 0.8, z: 4 },
  kasun: { x: 84, y: 29, w: 16, d: 0.8, z: 4 },
  suneera: { x: 96, y: 34, w: 12, d: 0.7, z: 3 },
  mihiran: { x: 58, y: 47, w: 11, d: 1, z: 5 },
  yasas: { x: 71, y: 46, w: 12, d: 1.1, z: 6 },
  yashodha: { x: 84, y: 47, w: 12, d: 1.1, z: 6 },
  gangadara: { x: 95, y: 50, w: 11, d: 1, z: 5 },
};

export default function Hero() {
  const hero = useRef<HTMLElement>(null);
  const [named, setNamed] = useState<string | null>(null);
  const label = named ? voices.find((v) => v.cut === named) : undefined;
  const at = named ? ensemble[named] : undefined;
  // phones can't hover, so a spotlight steps through the artists and names each one
  const [featured, setFeatured] = useState<string | null>(null);
  const spot = featured ? voices.find((v) => v.cut === featured) : undefined;

  useEffect(() => {
    const el = hero.current;
    const mq = window.matchMedia("(max-width: 820px)");
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    let kick = 0;
    let i = 0;
    let visible = true;
    let ready = !!document.documentElement.dataset.introDone;
    const step = () => {
      if (!mq.matches || !visible || !ready) return;
      setFeatured(voices[i % voices.length].cut);
      i++;
    };
    const start = () => {
      window.clearInterval(timer);
      window.clearTimeout(kick);
      if (!mq.matches) {
        setFeatured(null);
        return;
      }
      kick = window.setTimeout(step, 2200);
      timer = window.setInterval(step, 2600);
    };
    const onReady = () => {
      ready = true;
      start();
    };
    window.addEventListener("sanka:intro-done", onReady);
    mq.addEventListener("change", start);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    if (ready) start();
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(kick);
      window.removeEventListener("sanka:intro-done", onReady);
      mq.removeEventListener("change", start);
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    const el = hero.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    const tick = () => {
      cur.x += (target.x - cur.x) * 0.06;
      cur.y += (target.y - cur.y) * 0.06;
      el.style.setProperty("--mx", cur.x.toFixed(3));
      el.style.setProperty("--my", cur.y.toFixed(3));
      if (Math.abs(target.x - cur.x) > 0.001 || Math.abs(target.y - cur.y) > 0.001) raf = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <section className="hero" id="top" ref={hero} data-anim>
      <div className="hero-sky" aria-hidden="true">
        <span className="hero-stars" />
        <span className="hero-moon" />
      </div>
      <div className="hero-beams" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <ul className={`legends${featured ? " has-featured" : ""}`} aria-label="Artists who have sung at Snehaye Nagaraya">
        {voices.map((v, i) => {
          const p = ensemble[v.cut];
          return (
            <li
              key={v.name}
              className={`legend${featured === v.cut ? " is-featured" : ""}`}
              style={
                {
                  "--x": `${p.x}%`,
                  "--y": `${p.y}%`,
                  "--w": `${p.w}vw`,
                  "--xm": `${(p.x - 50) * 2}%`,
                  "--ym": `${(p.y - 5) * 1.5}%`,
                  "--wm": `${p.w * 2.1}vw`,
                  "--d": p.d,
                  "--i": i,
                  zIndex: p.z,
                } as React.CSSProperties
              }
            >
              <a
                href="#voices"
                className="legend-link"
                aria-label={v.name}
                onPointerEnter={() => setNamed(v.cut)}
                onPointerLeave={() => setNamed((n) => (n === v.cut ? null : n))}
                onFocus={() => setNamed(v.cut)}
                onBlur={() => setNamed((n) => (n === v.cut ? null : n))}
              >
                <span className="legend-img">
                  <Image src={`/images/cut/bw/${v.cut}.png`} alt="" fill sizes="(max-width: 820px) 40vw, 22vw" className="legend-bw" />
                  <HoverColor src={`/images/cut/color/${v.cut}.png`} sizes="22vw" className="legend-color" within=".legend-link" />
                </span>
              </a>
            </li>
          );
        })}
      </ul>

      <City mode="hero" className="hero-city" />

      {/* Phone spotlight caption: who is lit right now */}
      <p className="legend-spot" aria-hidden="true">
        {spot && (
          <span key={spot.cut}>
            <strong>{spot.name}</strong>
            <small>{spot.known}</small>
          </span>
        )}
      </p>

      {/* Name label lives above the skyline and the other portraits so it is never covered */}
      <p
        className={`legend-caption${label ? " is-on" : ""}`}
        aria-hidden="true"
        style={
          at
            ? ({ "--x": `${at.x}%`, "--y": `${at.y}%`, "--w": `${at.w}vw`, "--d": at.d } as React.CSSProperties)
            : undefined
        }
      >
        {label?.name}
      </p>

      <div className="hero-inner">
        <p className="hero-kicker">
          <Image src="/images/sanka-logo.png" alt="SANKA" width={674} height={241} className="hero-kicker-logo" preload />
          <span>presents</span>
        </p>

        <h1 className="hero-title">
          <span className="hero-title-si" lang="si">
            ස්නේහයේ නගරය
          </span>
          <span className="hero-title-en">
            Snehaye Nagaraya, <em>the City of Love</em>
          </span>
        </h1>

        <p className="hero-lede">Four sold-out nights in Kandy and Colombo with the legends of Sinhala love songs.</p>

        <div className="hero-actions">
          <a className="btn btn--gold btn--lg" href="#city">
            Walk the city
          </a>
          <a className="btn btn--ghost btn--lg" href="#highlights">
            Watch highlights
          </a>
        </div>
      </div>
    </section>
  );
}
