"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type LightboxItem = { src: string; alt: string; caption: string; w: number; h: number };

// Full-screen photo viewer on a native <dialog> (focus trap and Esc for free).
export default function Lightbox({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: LightboxItem[];
  index: number | null;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);
  const [dir, setDir] = useState(0);
  const open = index !== null;

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      document.documentElement.classList.add("modal-open");
    }
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    const handleClose = () => {
      document.documentElement.classList.remove("modal-open");
      onClose();
    };
    d.addEventListener("close", handleClose);
    return () => d.removeEventListener("close", handleClose);
  }, [onClose]);

  const go = (step: number) => {
    if (index === null) return;
    setDir(step);
    onIndex((index + step + items.length) % items.length);
  };

  const item = index !== null ? items[index] : null;

  return (
    <dialog
      ref={dialog}
      className="lightbox"
      aria-label="Photo viewer"
      onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      {item && (
        <figure className="lightbox-figure" key={item.src} data-dir={dir}>
          <Image src={item.src} alt={item.alt} width={item.w} height={item.h} sizes="90vw" />
          <figcaption>
            <span>{item.caption}</span>
            {items.length > 1 && (
              <span>
                {index! + 1} of {items.length}
              </span>
            )}
          </figcaption>
        </figure>
      )}
      {items.length > 1 && (
        <>
          <button className="lightbox-btn lightbox-prev" onClick={() => go(-1)} aria-label="Previous photo">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
          </button>
          <button className="lightbox-btn lightbox-next" onClick={() => go(1)} aria-label="Next photo">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
          </button>
        </>
      )}
      <button className="lightbox-btn lightbox-close" onClick={() => dialog.current?.close()} aria-label="Close photo viewer">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
    </dialog>
  );
}
