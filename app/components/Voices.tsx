"use client";

import { useInView } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { voices } from "../content";
import HoverColor from "./HoverColor";

// Rows of 4 legends, 3 headliners, 4 new voices: 11 tiles on a 12-column grid, no empty cells.
const span = (i: number) => (i < 4 ? "tile--3" : i < 7 ? "tile--4" : "tile--3");

export default function Voices() {
  const grid = useRef<HTMLUListElement>(null);
  const seen = useInView(grid, { once: true, amount: 0.15 });

  return (
    <section className="voices" id="voices" aria-labelledby="voices-title">
      <header className="section-head">
        <h2 id="voices-title">The voices of the city</h2>
        <p>
          {voices.length} artists have sung at Snehaye Nagaraya, from the legends who defined Sinhala romantic song to
          the voices carrying it forward.
        </p>
      </header>

      <ul className={`tiles${seen ? " is-on" : ""}`} ref={grid}>
        {voices.map((v, i) => (
          <li key={v.name} className={`tile ${span(i)}`} style={{ "--i": i } as React.CSSProperties}>
            <div className="tile-stage" aria-hidden="true">
              <span className="tile-beam" />
              <Image src={`/images/cut/bw/${v.cut}.png`} alt="" fill sizes="(max-width: 820px) 50vw, 25vw" className="tile-bw" />
              <HoverColor src={`/images/cut/color/${v.cut}.png`} sizes="25vw" className="tile-color" within=".tile" />
            </div>
            <div className="tile-info">
              <h3>{v.name}</h3>
              <p>{v.known}</p>
              <p className="tile-eds" aria-label={`Sang at Snehaye Nagaraya ${v.editions.join(" and ")}`}>
                {v.editions.map((ed) => (
                  <span key={ed}>{ed}</span>
                ))}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
