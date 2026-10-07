"use client";

import { CaretLeft, CaretRight, Play } from "@phosphor-icons/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { photos, videos, type Video } from "../content";
import Lightbox from "./Lightbox";

const SLIDE_MS = 5200;

function VideoCard({ v }: { v: Video }) {
  const [playing, setPlaying] = useState(false);

  let frame: React.ReactNode;
  if (v.kind === "file") {
    frame = <video src={v.src} poster={v.poster} controls preload="none" playsInline />;
  } else if (v.kind === "facebook") {
    frame = (
      <iframe
        src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(v.url)}&show_text=false`}
        title={v.title}
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  } else if (playing) {
    frame = (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`}
        title={v.title}
        allow="autoplay; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  } else {
    frame = (
      <button className="video-facade" onClick={() => setPlaying(true)} aria-label={`Play ${v.title}`}>
        <Image src={v.thumb} alt="" fill sizes="(max-width: 820px) 92vw, 40vw" />
        <span className="video-play" aria-hidden="true">
          <Play weight="fill" />
        </span>
      </button>
    );
  }

  return (
    <figure className="video">
      <div className="video-frame">{frame}</div>
      <figcaption>
        <strong>{v.title}</strong>
        <span>{v.note}</span>
      </figcaption>
    </figure>
  );
}

export default function Highlights() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [lb, setLb] = useState<number | null>(null);
  const reel = useRef<HTMLDivElement>(null);
  const swipeX = useRef<number | null>(null);

  useEffect(() => {
    const el = reel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const running = visible && !paused && lb === null;
  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % photos.length), SLIDE_MS);
    return () => window.clearTimeout(id);
  }, [running, index]);

  const closeLb = useCallback(() => setLb(null), []);

  return (
    <section className="highlights" id="highlights" aria-labelledby="highlights-title">
      <header className="section-head">
        <h2 id="highlights-title">Nights worth replaying</h2>
        <p>Phone lights from the balcony to the front row, and the voices that filled the hall.</p>
      </header>

      <div
        className={`reel${running ? " is-running" : ""}`}
        ref={reel}
        onPointerEnter={(e) => e.pointerType === "mouse" && setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onTouchStart={(e) => (swipeX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (swipeX.current === null) return;
          const dx = e.changedTouches[0].clientX - swipeX.current;
          swipeX.current = null;
          if (Math.abs(dx) < 45) return;
          setIndex((i) => (i + (dx < 0 ? 1 : -1) + photos.length) % photos.length);
        }}
      >
        <div className="reel-bars" role="tablist" aria-label="Highlights">
          {photos.map((p, i) => (
            <button
              key={p.src}
              role="tab"
              aria-selected={i === index}
              aria-label={p.caption}
              className={i < index ? "is-done" : i === index ? "is-current" : undefined}
              onClick={() => setIndex(i)}
            >
              <span style={{ animationDuration: `${SLIDE_MS}ms` }} />
            </button>
          ))}
        </div>
        {photos.map((p, i) => (
          <button
            key={p.src}
            className={`reel-slide${i === index ? " is-on" : ""}`}
            onClick={() => setLb(i)}
            tabIndex={i === index ? 0 : -1}
            aria-hidden={i !== index}
            aria-label={`Open photo: ${p.alt}`}
          >
            <Image src={p.src} alt={p.alt} fill sizes="(max-width: 820px) 100vw, 1200px" />
          </button>
        ))}
        <p className="reel-caption" key={index}>
          {photos[index].caption}
        </p>
        <div className="reel-ctrl">
          <button onClick={() => setIndex((i) => (i - 1 + photos.length) % photos.length)} aria-label="Previous highlight">
            <CaretLeft />
          </button>
          <button onClick={() => setIndex((i) => (i + 1) % photos.length)} aria-label="Next highlight">
            <CaretRight />
          </button>
        </div>
      </div>

      <ul className="strip" aria-label="All photos">
        {photos.map((p, i) => (
          <li key={p.src}>
            <button className={i === index ? "is-on" : undefined} onClick={() => setLb(i)} aria-label={`Open photo: ${p.alt}`}>
              <Image src={p.src} alt="" fill sizes="160px" />
            </button>
          </li>
        ))}
      </ul>

      <div className="videos">
        {videos.map((v) => (
          <VideoCard key={v.kind === "youtube" ? v.id : v.kind === "facebook" ? v.url : v.src} v={v} />
        ))}
        <div className="videos-note">
          <p className="videos-quote" lang="si">
            &ldquo;ස්නේහයේ නගරයයි...&rdquo;
          </p>
          <p>
            The concerts take their name from Snehaye Nagarayai, Rohana Weerasinghe&rsquo;s much-loved song about a city
            built of love, sung by Amarasiri Peiris.
          </p>
        </div>
      </div>
      <p className="gallery-credit">Concert photography by Vidula Shishan, Global Image.</p>

      <Lightbox items={photos} index={lb} onIndex={setLb} onClose={closeLb} />
    </section>
  );
}
