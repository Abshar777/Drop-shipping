import type { Metadata } from "next";
import {
  Inter,
  Geist_Mono,
  Noto_Sans_Devanagari,
  Noto_Sans_Arabic,
  Noto_Sans_Malayalam,
  Noto_Sans_Tamil,
} from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { LocaleProvider } from "@/lib/i18n/client";
import { getT } from "@/lib/i18n/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  display: "swap",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Script fonts for the non-Latin languages. Not preloaded: the browser only downloads
// one when text in that script is actually on the page. adjustFontFallback is off so the
// CSS variable holds just the family name, without a synthesized Latin fallback that
// would otherwise sit in front of Inter. (next/font needs literal options, so no spread.)
const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});
const notoArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});
const notoMalayalam = Noto_Sans_Malayalam({
  variable: "--font-malayalam",
  subsets: ["malayalam"],
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});
const notoTamil = Noto_Sans_Tamil({
  variable: "--font-tamil",
  subsets: ["tamil"],
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t.meta.title, description: t.meta.description };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale, t, dir } = await getT();

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${inter.variable} ${geistMono.variable} ${notoDevanagari.variable} ${notoArabic.variable} ${notoMalayalam.variable} ${notoTamil.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LocaleProvider locale={locale} dictionary={t} dir={dir}>
          <CartProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
