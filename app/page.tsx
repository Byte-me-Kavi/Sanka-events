import Image from "next/image";
import Contact from "./components/Contact";
import Editions from "./components/Editions";
import Hero from "./components/Hero";
import Loader from "./components/Loader";
import Highlights from "./components/Highlights";
import Nav from "./components/Nav";
import Services from "./components/Services";
import Voices from "./components/Voices";
import { contact, editions } from "./content";

function Marquee() {
  // repeated so the row is always wider than the screen
  const items = [...editions, ...editions].map((e, i) => ({
    key: `${e.id}-${i}`,
    text: `Snehaye Nagaraya ${e.number}, ${e.city}`,
  }));
  const row = (hidden: boolean) => (
    <div className="marquee-row" aria-hidden={hidden || undefined}>
      {items.map((i) => (
        <span key={i.key} className="marquee-item">
          {i.text}
          <span className="marquee-tag">Sold out</span>
          <span className="marquee-sep" aria-hidden="true" />
        </span>
      ))}
    </div>
  );
  return (
    <div className="marquee">
      {row(false)}
      {row(true)}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Loader />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Editions />
        <Highlights />
        <Voices />
        <Services />
        <Contact />
      </main>
      <footer className="footer">
        <Image src="/images/sanka-logo.png" alt="SANKA, just for entertainment" width={674} height={241} className="footer-logo" />
        <div className="footer-meta">
          <p>Concerts, weddings and live event production across Sri Lanka.</p>
          <p>
            <a href={contact.facebookUrl} target="_blank" rel="noopener">
              Facebook
            </a>
            <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener">
              WhatsApp
            </a>
            <a href={`mailto:${contact.email}`}>Email</a>
          </p>
          <p className="footer-small">© 2026 SANKA. Concert photography by Vidula Shishan, Global Image.</p>
        </div>
      </footer>
    </>
  );
}
