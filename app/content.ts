// All page copy and event data lives here so it can be edited without touching components.
// Items marked VERIFY were gathered from public listings and should be checked before launch.

export const contact = {
  phone: "+94 70 282 5777",
  whatsapp: "94702825777",
  email: "bsanka27@gmail.com",
  facebookUrl: "https://www.facebook.com/", // VERIFY: replace with the SANKA / Snehaye Nagaraya page
};

export type Edition = {
  id: string;
  number: string;
  title: string;
  subtitle?: string;
  date: string;
  city: "Kandy" | "Colombo";
  venue: string;
  lineup: string[];
  image?: string;
  imageAlt?: string;
  note: string;
  story: string;
  photos?: string[];
};

export const editions: Edition[] = [
  {
    id: "1",
    number: "1.0",
    title: "Snehaye Nagaraya",
    date: "21 March 2025", // VERIFY year
    city: "Kandy",
    venue: "Dharmaraja College Auditorium",
    lineup: ["Suneera Sumanga", "Gangadara", "Mihiran", "Yasas Medagedara", "Yashodha Medagedara"],
    note: "Where it started: a Kandy night of young romantic voices.",
    story:
      "Snehaye Nagaraya began in Kandy. The first night brought together a new generation of romantic voices, from Derana Dream Star winner Suneera Sumanga to singer and composer Yasas Medagedara.",
  },
  {
    id: "2",
    number: "2.0",
    title: "Snehaye Nagaraya",
    date: "13 December 2025",
    city: "Colombo",
    venue: "Musaeus College Auditorium",
    lineup: ["Amarasiri Peiris", "Kasun Kalhara", "Sunil Edirisinghe", "Karunarathna Divulgane", "Shashika Nisansala"],
    image: "/images/crowd-4.jpg",
    imageAlt: "A packed Musaeus College Auditorium with phone lights raised",
    note: "The first Snehaye Nagaraya in Colombo, and a full house at Musaeus College.",
    story:
      "The series came to Colombo for the first time. Three legends of Sinhala song shared the Musaeus College stage with Kasun Kalhara and Shashika Nisansala, in front of a hall lit up with phone lights.",
    photos: ["/images/crowd-1.jpg", "/images/crowd-3.jpg", "/images/crowd-2.jpg"],
  },
  {
    id: "3",
    number: "3.0",
    title: "Snehaye Nagaraya",
    subtitle: "Legend Edition",
    date: "7 March 2026",
    city: "Colombo",
    venue: "Musaeus College Auditorium",
    lineup: ["Sunil Edirisinghe", "T.M. Jayarathne", "Amarasiri Peiris", "Karunarathna Divulgane", "Suneera Sumanga"],
    image: "/images/poster-3.jpg",
    imageAlt: "Snehaye Nagaraya 3.0 Legend Edition poster",
    note: "Four legends of Sinhala song on one bill, with Suneera Sumanga for the new generation.",
    story:
      "A night built around the legends. Sunil Edirisinghe, T.M. Jayarathne, Amarasiri Peiris and Karunarathna Divulgane on one bill, with Suneera Sumanga carrying the songs to a new generation.",
  },
  {
    id: "4",
    number: "4.0",
    title: "Snehaye Nagaraya",
    date: "4 July 2026",
    city: "Kandy",
    venue: "NICD Auditorium, Polgolla",
    lineup: [], // VERIFY: add the 4.0 lineup
    note: "Back to Kandy, this time at the NICD Auditorium in Polgolla.",
    story: "Snehaye Nagaraya returned to Kandy for a second night, this time at the NICD Auditorium in Polgolla, and filled the hall again.",
  },
];

// image: original photo, cut: background-removed portrait name in /images/cut/{bw,color}/
export type Voice = { name: string; known: string; editions: string[]; image: string; cut: string };

export const voices: Voice[] = [
  { name: "Amarasiri Peiris", known: "The voice behind Snehaye Nagarayai", editions: ["2.0", "3.0"], image: "/images/artists/amarasiri.jpg", cut: "amarasiri" },
  { name: "Sunil Edirisinghe", known: "Master of melody", editions: ["2.0", "3.0"], image: "/images/artists/sunil.jpg", cut: "sunil" },
  { name: "T.M. Jayarathne", known: "Vocalist and violinist", editions: ["3.0"], image: "/images/artists/tm.jpg", cut: "tm" },
  { name: "Karunarathna Divulgane", known: "Classical virtuoso", editions: ["2.0", "3.0"], image: "/images/artists/karunarathna.jpg", cut: "karunarathna" },
  { name: "Kasun Kalhara", known: "Contemporary icon", editions: ["2.0"], image: "/images/artists/kasun.jpg", cut: "kasun" },
  { name: "Shashika Nisansala", known: "Voice of the youth", editions: ["2.0"], image: "/images/artists/shashika.jpg", cut: "shashika" },
  { name: "Suneera Sumanga", known: "Derana Dream Star winner", editions: ["1.0", "3.0"], image: "/images/artists/suneera.jpg", cut: "suneera" },
  { name: "Yasas Medagedara", known: "Singer, composer and music director", editions: ["1.0"], image: "/images/artists/yasas.jpg", cut: "yasas" },
  { name: "Yashodha Medagedara", known: "Vocalist", editions: ["1.0"], image: "/images/artists/yashodha.jpg", cut: "yashodha" },
  { name: "Gangadara", known: "Vocalist", editions: ["1.0"], image: "/images/artists/gangadara.jpg", cut: "gangadara" },
  { name: "Mihiran", known: "Vocalist", editions: ["1.0"], image: "/images/artists/mihiran.jpg", cut: "mihiran" },
];

export type Service = { id: string; name: string; blurb: string };

export const services: Service[] = [
  { id: "wedding", name: "Wedding management", blurb: "Poruwa to after-party. We plan the day, run the timeline and keep the families relaxed." },
  { id: "event", name: "Event management", blurb: "Concerts, corporate nights, school and private events, planned and run end to end." },
  { id: "stage", name: "Stage", blurb: "Platforms, risers and truss built to fit the venue, indoors or out." },
  { id: "sound", name: "Sound", blurb: "Line-array PA, monitors and engineers who have mixed legends live." },
  { id: "lighting", name: "Lighting", blurb: "Moving heads, washes, haze and a lighting designer on the desk." },
  { id: "band", name: "Stage bands", blurb: "Full live bands for concerts, weddings and dinner dances." },
  { id: "led", name: "LED walls", blurb: "High-brightness LED screens for stage backdrops, live feeds and visuals." },
];

export type Photo = { src: string; alt: string; caption: string; w: number; h: number };

// Photos for the highlights reel and the photo strip under it
export const photos: Photo[] = [
  { src: "/images/crowd-1.jpg", alt: "Phone lights across the hall during a ballad", caption: "Snehaye Nagaraya 2.0, the hall lights up", w: 1280, h: 853 },
  { src: "/images/crowd-4.jpg", alt: "The crowd singing along with lights raised", caption: "Snehaye Nagaraya 2.0, singing every word", w: 1280, h: 853 },
  { src: "/images/stage-sunil.jpg", alt: "Sunil Edirisinghe on stage", caption: "Sunil Edirisinghe", w: 1280, h: 796 },
  { src: "/images/crowd-3.jpg", alt: "A full house in the stalls and balcony", caption: "Snehaye Nagaraya 2.0, full from stalls to balcony", w: 1280, h: 853 },
  { src: "/images/stage-shashika.jpg", alt: "Shashika Nisansala singing", caption: "Shashika Nisansala", w: 720, h: 808 },
  { src: "/images/crowd-2.jpg", alt: "Audience listening in the front rows", caption: "Snehaye Nagaraya 2.0, the front rows", w: 1280, h: 853 },
  { src: "/images/stage-kasun.jpg", alt: "Kasun Kalhara on stage", caption: "Kasun Kalhara", w: 959, h: 959 },
  { src: "/images/poster-3.jpg", alt: "Snehaye Nagaraya 3.0 Legend Edition poster", caption: "Snehaye Nagaraya 3.0, Legend Edition", w: 1080, h: 977 },
];

// Videos. Add concert clips here:
//   { kind: "facebook", url: "https://www.facebook.com/<page>/videos/<id>/", title: "...", note: "..." }
//   { kind: "youtube", id: "<video id>", thumb: "/images/....jpg", title: "...", note: "..." }
//   { kind: "file", src: "/videos/clip.mp4", poster: "/images/....jpg", title: "...", note: "..." }
export type Video =
  | { kind: "youtube"; id: string; title: string; note: string; thumb: string }
  | { kind: "facebook"; url: string; title: string; note: string }
  | { kind: "file"; src: string; poster?: string; title: string; note: string };

export const videos: Video[] = [
  {
    kind: "youtube",
    id: "A_KT_TpVlZ8",
    title: "Snehaye Nagarayai",
    note: "The song the concert series is named after, sung by Amarasiri Peiris and Manik Jayasekara.",
    thumb: "/images/song-thumb.jpg",
  },
];
