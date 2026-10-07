"use client";

import Image from "next/image";
import { useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";

const links = [
  { id: "city", label: "The city" },
  { id: "highlights", label: "Highlights" },
  { id: "voices", label: "Voices" },
  { id: "services", label: "Services" },
  { id: "contact", label: "Contact" },
];

export default function Nav() {
  const [active, setActive] = useState("");
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const last = scrollY.getPrevious() ?? 0;
    setSolid(y > 40);
    setHidden(y > last && y > 400);
  });

  useEffect(() => {
    const sections = links
      .map((l) => document.getElementById(l.id))
      .filter((el): el is HTMLElement => el !== null);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className={`nav${solid ? " is-solid" : ""}${hidden && !open ? " is-hidden" : ""}`}>
        <a href="#top" className="nav-logo" aria-label="SANKA, back to top">
          <Image src="/images/sanka-logo.png" alt="SANKA, just for entertainment" width={674} height={241} preload />
        </a>
        <nav className="nav-links" aria-label="Sections">
          {links.map((l) => (
            <a key={l.id} href={`#${l.id}`} className={active === l.id ? "is-active" : undefined}>
              {l.label}
            </a>
          ))}
        </nav>
        <button
          className={`nav-burger${open ? " is-open" : ""}`}
          aria-expanded={open}
          aria-controls="menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
        </button>
      </header>

      <div id="menu" className={`menu${open ? " is-open" : ""}`} inert={!open}>
        <nav aria-label="Menu">
          {links.map((l, i) => (
            <a key={l.id} href={`#${l.id}`} style={{ "--i": i } as React.CSSProperties} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
        </nav>
      </div>

      <aside className="rail" aria-hidden="true">
        {links.map((l) => (
          <a key={l.id} href={`#${l.id}`} tabIndex={-1} className={active === l.id ? "is-active" : undefined}>
            <span>{l.label}</span>
          </a>
        ))}
      </aside>
    </>
  );
}
