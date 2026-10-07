"use client";

import { useEffect } from "react";

// Pauses the CSS animations of any [data-anim] section while it is off screen, so the
// hero's floating portraits, the marquee and the stage diagram cost nothing elsewhere.
export default function AnimationPauser() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-anim]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.target.classList.toggle("anim-off", !e.isIntersecting);
      },
      { rootMargin: "120px 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
