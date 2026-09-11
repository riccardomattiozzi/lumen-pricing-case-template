import type { Metadata, Viewport } from "next";
import "./globals.css";

// No web fonts: the interface uses the platform's system typeface (SF Pro on
// Apple devices), declared once in app/globals.css.

export const metadata: Metadata = {
  title: "LUMEN Germany — Pricing & GTM Simulator",
  description:
    "Pricing and go-to-market simulator for LUMEN's German launch.",
};

// Lets Safari and mobile browsers tint their own chrome to match the page.
// These two mirror --background in app/globals.css: a <meta> tag can't read
// a CSS variable, so they are the one place a color is repeated.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
