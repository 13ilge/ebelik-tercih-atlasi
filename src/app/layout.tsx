import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Playfair_Display } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700"],
});

const BASLIK =
  "Ebelik Tercih Atlası — KPSS Ebelik Taban Puanları ve Şehir Bilgileri";
const ACIKLAMA =
  "81 il için KPSS ebelik (lisans P3) taban puanları, kontenjanlar, TÜİK doğum verileri, ortalama kira ve hastane bilgileriyle interaktif tercih atlası. Puanını gir, ulaşabileceğin illeri gör.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: BASLIK,
  description: ACIKLAMA,
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${atkinson.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50 text-slate-950">{children}</body>
    </html>
  );
}
