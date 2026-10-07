"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { editions, voices, type Edition } from "../content";
import City from "./City";
import LightField from "./LightField";
import Lightbox, { type LightboxItem } from "./Lightbox";

const citySi: Record<string, string> = { Kandy: "මහනුවර", Colombo: "කොළඹ" };
const voiceByName = new Map(voices.map((v) => [v.name, v]));

// Two-row poster layouts (left/top/width in % of the poster), back row first
const layouts: Record<number, [number, number, number][]> = {
  1: [[50, 6, 78]],
  2: [[32, 8, 60], [68, 8, 60]],
  3: [[24, 6, 52], [76, 6, 52], [50, 22, 58]],
  4: [[24, 4, 50], [76, 4, 50], [36, 30, 50], [64, 30, 50]],
  5: [[18, 4, 46], [50, 0, 50], [82, 4, 46], [33, 30, 50], [67, 30, 50]],
  6: [[18, 2, 42], [50, 0, 44], [82, 2, 42], [24, 28, 46], [52, 30, 48], [80, 28, 46]],
};

// A poster in the style of the official artwork, built from the night's own lineup
function EditionPoster({ e }: { e: Edition }) {
  const faces = e.lineup.map((n) => voiceByName.get(n)).filter((v) => v !== undefined);
  const n = faces.length;
  return (
    <div className="poster" aria-label={`Snehaye Nagaraya ${e.number} poster`} role="img">
      <LightField className="poster-lights" />
      {n > 0 ? (
        <div className="poster-faces">
          {faces.map((v, i) => {
            const [left, top, width] = (layouts[n] ?? layouts[6])[i % 6];
            return (
              <span
                key={v.name}
                className="poster-face"
                style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, zIndex: top > 15 ? 2 : 1, "--i": i } as React.CSSProperties}
              >
                <Image src={`/images/cut/bw/${v.cut}.png`} alt="" fill sizes="240px" />
              </span>
            );
          })}
        </div>
      ) : (
        <p className="poster-city" lang="si">
          {citySi[e.city]}
        </p>
      )}
      <div className="poster-title">
        <span lang="si">ස්නේහයේ නගරය</span>
        <span className="poster-num">{e.number}</span>
      </div>
      <p className="poster-meta">
        {e.date}
        <br />
        {e.venue}, {e.city}
      </p>
    </div>
  );
}

function Chapter({
  e,
  index,
  active,
  horizontal,
  onPhoto,
}: {
  e: Edition;
  index: number;
  active: boolean;
  horizontal: boolean;
  onPhoto: (photos: LightboxItem[], i: number) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.25 });
  const on = horizontal ? active : seen;
  const lineup = e.lineup.map((n) => voiceByName.get(n)).filter((v) => v !== undefined);
  const items: LightboxItem[] = (e.photos ?? []).map((src, i) => ({
    src,
    alt: `Snehaye Nagaraya ${e.number}, photo ${i + 1}`,
    caption: `Snehaye Nagaraya ${e.number}, ${e.venue}`,
    w: 1280,
    h: 853,
  }));

  return (
    <article className={`chapter${on ? " is-on" : ""}`} ref={ref} id={`night-${e.id}`} aria-labelledby={`night-${e.id}-title`}>
      <div className="chapter-media">
        {e.image ? (
          <Image src={e.image} alt={e.imageAlt ?? ""} fill sizes="(max-width: 820px) 92vw, 40vw" />
        ) : (
          <EditionPoster e={e} />
        )}
      </div>

      <div className="chapter-body">
        <p className="chapter-where">
          Night {index + 1} in <span lang="si">{citySi[e.city]}</span> {e.city}
        </p>
        <h3 id={`night-${e.id}-title`} className="chapter-title">
          <span className="chapter-num">{e.number}</span>
          <span className="chapter-name">
            Snehaye Nagaraya
            {e.subtitle && <em>{e.subtitle}</em>}
          </span>
        </h3>
        <p className="chapter-story">{e.story}</p>

        <dl className="chapter-facts">
          <div>
            <dt>Date</dt>
            <dd>{e.date}</dd>
          </div>
          <div>
            <dt>Venue</dt>
            <dd>{e.venue}</dd>
          </div>
          <div>
            <dt>The house</dt>
            <dd className="chapter-sold">Sold out</dd>
          </div>
        </dl>

        {lineup.length > 0 && (
          <ul className="chapter-lineup" aria-label="On stage">
            {lineup.map((v, i) => (
              <li key={v.name} style={{ "--i": i } as React.CSSProperties}>
                <span className="chapter-face">
                  <Image src={`/images/cut/bw/${v.cut}.png`} alt="" fill sizes="96px" className="face-bw" />
                  <Image src={`/images/cut/color/${v.cut}.png`} alt="" fill sizes="96px" className="face-color" />
                </span>
                <span className="chapter-face-name">{v.name}</span>
              </li>
            ))}
          </ul>
        )}

        {items.length > 0 && (
          <ul className="chapter-moments" aria-label="Photos from this night">
            {items.map((p, i) => (
              <li key={p.src}>
                <button onClick={() => onPhoto(items, i)} aria-label={`Open ${p.alt}`}>
                  <Image src={p.src} alt="" fill sizes="140px" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

function Count({ to, on }: { to: number; on: boolean }) {
  const [n, setN] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!on) return;
    if (reduce || to === 0) {
      const id = window.setTimeout(() => setN(to), 0);
      return () => window.clearTimeout(id);
    }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / 1100);
      setN(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on, to, reduce]);
  return <>{n}</>;
}

function Gate({ active, horizontal }: { active: boolean; horizontal: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.4 });
  const on = horizontal ? active : seen;
  const cities = new Set(editions.map((e) => e.city)).size;
  return (
    <article className={`gate${on ? " is-on" : ""}`} ref={ref} aria-label="Snehaye Nagaraya so far">
      <p className="gate-si" lang="si">
        ස්නේහයේ නගරය
      </p>
      <h3>Every night, a full house.</h3>
      <dl className="gate-stats">
        <div>
          <dt>Nights</dt>
          <dd>
            <Count to={editions.length} on={on} />
          </dd>
        </div>
        <div>
          <dt>Cities</dt>
          <dd>
            <Count to={cities} on={on} />
          </dd>
        </div>
        <div>
          <dt>Voices</dt>
          <dd>
            <Count to={voices.length} on={on} />
          </dd>
        </div>
        <div>
          <dt>Empty seats</dt>
          <dd>0</dd>
        </div>
      </dl>
      <a className="btn btn--gold btn--lg" href="#highlights">
        Watch highlights
      </a>
    </article>
  );
}

export default function Editions() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const distance = useRef(0);
  const pan = useRef(0);
  const [horizontal, setHorizontal] = useState(false);
  const horizontalRef = useRef(false);
  const [active, setActive] = useState(0);
  const [lb, setLb] = useState<{ items: LightboxItem[]; i: number | null }>({ items: [], i: null });
  const stops = editions.length + 2; // intro, nights, gate

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useMotionValue(0);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    pan.current = p;
    x.set(horizontalRef.current ? -p * distance.current : 0);
    const i = Math.round(p * (stops - 1));
    setActive((prev) => (prev === i ? prev : i));
  });

  useEffect(() => {
    const sec = section.current;
    const tr = track.current;
    if (!sec || !tr) return;
    const mq = window.matchMedia("(min-width: 821px)");
    const measure = () => {
      const h = mq.matches;
      horizontalRef.current = h;
      setHorizontal(h);
      if (!h) {
        sec.style.height = "";
        distance.current = 0;
        x.set(0);
        return;
      }
      distance.current = Math.max(0, tr.scrollWidth - window.innerWidth);
      sec.style.height = `${window.innerHeight + distance.current}px`;
      x.set(-scrollYProgress.get() * distance.current);
    };
    measure();
    window.addEventListener("resize", measure);
    mq.addEventListener("change", measure);
    const ro = new ResizeObserver(measure);
    ro.observe(tr);
    return () => {
      window.removeEventListener("resize", measure);
      mq.removeEventListener("change", measure);
      ro.disconnect();
    };
  }, [x, scrollYProgress]);

  const jump = (stop: number) => {
    const sec = section.current;
    if (!sec) return;
    if (!horizontal) {
      document.getElementById(`night-${editions[stop - 1]?.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const top = sec.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (distance.current * stop) / (stops - 1), behavior: "smooth" });
  };

  const openPhoto = useCallback((items: LightboxItem[], i: number) => setLb({ items, i }), []);
  const closePhoto = useCallback(() => setLb((s) => ({ ...s, i: null })), []);

  const night = active >= 1 && active <= editions.length ? editions[active - 1] : null;

  return (
    <section className="walk" id="city" ref={section} aria-labelledby="walk-title">
      <div className="walk-sticky">
        <City mode="walk" panRef={pan} className="walk-city" />

        <motion.div className="walk-track" ref={track} style={{ x }}>
          <div className={`walk-intro${active === 0 || !horizontal ? " is-on" : ""}`}>
            <div className="walk-intro-copy">
              <h2 id="walk-title">Walk through the city of love</h2>
              <p>
                Snehaye Nagaraya means &ldquo;the city of love&rdquo;. Each concert built a new district of it, in Kandy
                and in Colombo. Every one of them sold out.
              </p>
            </div>
            <ol className="walk-index">
              {editions.map((e, i) => (
                <li key={e.id} style={{ "--i": i } as React.CSSProperties}>
                  <button onClick={() => jump(i + 1)}>
                    <span className="walk-index-num">{e.number}</span>
                    <span className="walk-index-city">
                      <span lang="si">{citySi[e.city]}</span>
                      {e.venue}, {e.date}
                    </span>
                    <ArrowRight className="walk-index-arrow" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ol>
          </div>

          {editions.map((e, i) => (
            <Chapter key={e.id} e={e} index={i} active={active === i + 1} horizontal={horizontal} onPhoto={openPhoto} />
          ))}

          <Gate active={active === stops - 1} horizontal={horizontal} />
        </motion.div>

        <div className="walk-progress" aria-hidden={!horizontal}>
          <p className="walk-here">
            {night ? (
              <>
                You are in <strong key={night.id}>{night.city}</strong>
              </>
            ) : active === 0 ? (
              <>
                Entering <strong>the city</strong>
              </>
            ) : (
              <>
                You walked <strong>the whole city</strong>
              </>
            )}
          </p>
          <div className="walk-bar">
            <motion.span style={{ scaleX: scrollYProgress }} />
          </div>
          <div className="walk-dots">
            {editions.map((e, i) => (
              <button
                key={e.id}
                className={active === i + 1 ? "is-active" : undefined}
                onClick={() => jump(i + 1)}
                aria-label={`Go to Snehaye Nagaraya ${e.number}`}
                tabIndex={horizontal ? 0 : -1}
              >
                {e.number}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Lightbox items={lb.items} index={lb.i} onIndex={(i) => setLb((s) => ({ ...s, i }))} onClose={closePhoto} />
    </section>
  );
}
