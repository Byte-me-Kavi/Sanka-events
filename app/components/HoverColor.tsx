"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// The colour version of a portrait only appears on hover, so it is only downloaded the first
// time someone hovers (or focuses) it. Touch devices never fetch it.
export default function HoverColor({
  src,
  sizes,
  className,
  within,
}: {
  src: string;
  sizes: string;
  className: string;
  within: string; // selector of the hover target that contains this image
}) {
  const marker = useRef<HTMLSpanElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const host = marker.current?.closest(within);
    if (!host) return;
    const reveal = () => setShow(true);
    host.addEventListener("pointerenter", reveal, { once: true });
    host.addEventListener("focusin", reveal, { once: true });
    return () => {
      host.removeEventListener("pointerenter", reveal);
      host.removeEventListener("focusin", reveal);
    };
  }, [within]);

  if (show) return <Image src={src} alt="" fill sizes={sizes} className={className} />;
  return <span ref={marker} hidden />;
}
