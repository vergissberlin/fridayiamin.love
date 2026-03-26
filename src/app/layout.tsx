import type { Metadata } from "next";
import { Chicle, Caveat, Special_Elite, Permanent_Marker, Righteous } from "next/font/google";
import "./globals.css";

const chicle = Chicle({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-handwritten",
  subsets: ["latin"],
});

const specialElite = Special_Elite({
  weight: "400",
  variable: "--font-typewriter",
  subsets: ["latin"],
});

const permanentMarker = Permanent_Marker({
  weight: "400",
  variable: "--font-marker",
  subsets: ["latin"],
});

const righteous = Righteous({
  weight: "400",
  variable: "--font-retro",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Friday I'm in Love | The Cure",
  description: "A vibrant celebration of The Cure's iconic song - exploring the joy, love, and colorful escape captured in music.",
  keywords: ["The Cure", "Friday I'm in Love", "Alternative Rock", "1992", "Wish"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💜</text></svg>" />
      </head>
      <body className={`${chicle.variable} ${caveat.variable} ${specialElite.variable} ${permanentMarker.variable} ${righteous.variable}`}>
        {children}
        <div className="noise-overlay" aria-hidden="true" />
      </body>
    </html>
  );
}
