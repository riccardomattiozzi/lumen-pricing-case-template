import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

// Manrope: a geometric, Scandinavian-feeling sans with clean tabular
// numerals — the LUMEN brand typeface. Self-hosted by next/font (no
// external request at runtime), exposed as a CSS variable that
// app/globals.css layers in front of the system stack, so a failed font
// load still renders legibly on the platform's own typeface.
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-lumen",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LUMEN — Germany Launch Simulator",
  description:
    "Bright energy. Clear decisions. An interactive pricing and go-to-market simulator for LUMEN's German market entry.",
};

// Lets Safari and mobile browsers tint their own chrome to match the page.
// These two mirror --background in app/globals.css: a <meta> tag can't read
// a CSS variable, so they are the one place a color is repeated.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f2e9" },
    { media: "(prefers-color-scheme: dark)", color: "#0f120e" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full antialiased ${manrope.variable}`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
