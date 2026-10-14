import type { Metadata, Viewport } from "next";
import {
  Atkinson_Hyperlegible,
  IBM_Plex_Mono,
  Inter,
} from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
});

const BASLIK =
  "Ebelik Tercih Atlası — KPSS Ebelik Taban Puanları ve Şehir Bilgileri";
const ACIKLAMA =
  "81 il için KPSS ebelik (lisans P3) taban puanları, kontenjanlar, TÜİK doğum verileri, ortalama kira ve hastane bilgileriyle interaktif tercih atlası. Puanını gir, ulaşabileceğin illeri gör.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: BASLIK,
  description: ACIKLAMA,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Ebelik Tercih Atlası",
    title: BASLIK,
    description: ACIKLAMA,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: BASLIK,
    description: ACIKLAMA,
  },
};

export const viewport: Viewport = {
  themeColor: "#0369a1",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Ebelik Tercih Atlası",
  url: SITE_URL,
  inLanguage: "tr",
  description: ACIKLAMA,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${atkinson.variable} ${inter.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50 text-slate-950">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}
