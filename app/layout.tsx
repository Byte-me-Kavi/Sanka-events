import type { Metadata, Viewport } from "next";
import { Abhaya_Libre, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const display = Abhaya_Libre({
  variable: "--font-display",
  subsets: ["latin", "sinhala"],
  weight: ["400", "500", "700", "800"],
});

const body = Hanken_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SANKA | Snehaye Nagaraya, the City of Love",
  description:
    "SANKA presents Snehaye Nagaraya, the City of Love: four sold-out concerts in Kandy and Colombo with the legends of Sinhala song. Plus wedding and event management, stage, sound, lighting, bands and LED walls.",
  openGraph: {
    title: "Snehaye Nagaraya, the City of Love",
    description: "Four sold-out nights in Kandy and Colombo. Presented by SANKA.",
    images: ["/images/crowd-1.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: "try{if(sessionStorage.getItem('sanka-intro')==='1')document.documentElement.classList.add('seen-intro')}catch(e){}",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
