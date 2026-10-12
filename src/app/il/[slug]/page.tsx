import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import {
  dataset,
  dogumOrani,
  donemIstatistigi,
  ilSlug,
  kaynakBilgileri,
  medyanKira,
  meta,
  slugHaritasi,
  tabanYuzdeligi,
  trDogumOrani,
} from "@/lib/data";
import { HASTANE_RENK, HASTANE_TUR_ADI } from "@/lib/colors";
import { puanStr, sayi, tl } from "@/lib/format";
import { ilOnerileri } from "@/lib/insights";
import Logo from "@/components/Logo";

export const instant = false;

export function generateStaticParams() {
  return dataset.iller.map((il) => ({ slug: ilSlug(il) }));
}

export async function generateMetadata(
  props: PageProps<"/il/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const il = slugHaritasi.get(slug);
  if (!il) return { title: "İl bulunamadı — Ebelik Tercih Atlası" };
  const son = il.alimlar[il.alimlar.length - 1];
  const ilBaslik = `${il.ad} Ebe Taban Puanı ${son.donem} (${puanStr(son.taban)}) — Kontenjan ve Şehir Bilgileri`;
  const ilAciklama = `${il.ad} için KPSS ebelik (lisans) atama taban puanları: son dönem ${son.donem}, ${puanStr(
    son.taban
  )} puan ve ${son.kontenjan} kadro. Ortalama kira ${tl(
    il.kira
  )}; TÜİK ${il.dogumYil}: ${sayi(
    il.dogum
  )} canlı doğum. ${il.hastaneler.length} kamu hastanesi listesi ve şehir yaşam verileri.`;
  return {
    title: ilBaslik,
    description: ilAciklama,
    alternates: { canonical: `/il/${slug}` },
    openGraph: {
      type: "article",
      title: ilBaslik,
      description: ilAciklama,
      url: `/il/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: ilBaslik,
      description: ilAciklama,
    },
  };
}

export default async function IlSayfasi(props: PageProps<"/il/[slug]">) {
  const { slug } = await props.params;
  const il = slugHaritasi.get(slug);
  if (!il) notFound();

  const son = il.alimlar[il.alimlar.length - 1];
  const sonIst = donemIstatistigi(son.donem);
  const yuzdelik = tabanYuzdeligi(son.donem, son.taban);
  const konumEtiketi =
    yuzdelik <= 0.25
      ? "dönemin en düşük çeyreğinde"
      : yuzdelik >= 0.75
        ? "dönemin en yüksek çeyreğinde"
        : "dönemin orta bandında";
  const oneriler = ilOnerileri(il, {
    donem: son.donem,
    medyanKira,
    tabanYuzdeligi: yuzdelik,
    taban: son.taban,
    kontenjan: son.kontenjan,
  });
  const artilar = oneriler.filter((o) => o.arti);
  const eksiler = oneriler.filter((o) => !o.arti);
  const yakinIller = dataset.iller
    .filter((x) => x.bolge === il.bolge && x.plaka !== il.plaka)
    .sort((a, b) => a.ad.localeCompare(b.ad, "tr"))
    .slice(0, 10);

  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-sky-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Haritaya dön
          </Link>
          <span className="flex items-center gap-2">
            <Logo boyut="sm" />
            <span className="text-sm text-slate-500">· İl sayfası</span>
          </span>
          <Link
            href={`/?il=${slug}`}
            className="ml-auto flex items-center gap-1.5 rounded-lg bg-sky-700 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-sky-800"
          >
            Haritada incele
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-base font-bold text-white">
            {il.plaka.toString().padStart(2, "0")}
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            {il.ad} Ebe Taban Puanları
          </h1>
          <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-medium text-sky-800">
            {il.bolge}
          </span>
        </div>

        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-700">
          {il.ad} ilinin KPSS ebelik (lisans / P3) atamalarına ait il bazlı taban
          puanları, kontenjanları ve şehir yaşam verileri. Son açıklanan dönem{" "}
          <b>{son.donem}</b>: taban puan <b>{puanStr(son.taban)}</b>,{" "}
          <b>{son.kontenjan}</b> ebe kadrosu.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-medium text-slate-500">
              Son dönem taban puanı ({son.donem})
            </div>
            <div className="mt-1 text-3xl font-bold tabular-nums text-slate-950">
              {puanStr(son.taban)}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {son.donem} Türkiye aralığı: {puanStr(sonIst.min)}–
              {puanStr(sonIst.max)} · {konumEtiketi}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-medium text-slate-500">
              Kontenjan ({son.donem})
            </div>
            <div className="mt-1 text-3xl font-bold tabular-nums text-slate-950">
              {son.kontenjan}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              ebe kadrosu · TR toplam{" "}
              {sayi(meta.kadroToplam[son.donem] ?? 0)} kadro
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-medium text-slate-500">
              Canlı doğum (TÜİK {il.dogumYil})
            </div>
            <div className="mt-1 text-3xl font-bold tabular-nums text-slate-950">
              {sayi(il.dogum)}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              bin kişi başına {puanStr(dogumOrani(il))} (TR:{" "}
              {puanStr(trDogumOrani)})
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-medium text-slate-500">
              Ortalama kira
            </div>
            <div className="mt-1 text-3xl font-bold tabular-nums text-slate-950">
              {tl(il.kira)}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              TR ort. {tl(medyanKira)} · Endeksa 2025
            </div>
          </div>
        </div>

        <section className="mt-6">
          <h2 className="text-lg font-bold text-slate-900">
            Dönemlere göre taban puan ve kontenjan
          </h2>
          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th scope="col" className="px-4 py-2.5 font-medium text-slate-500">
                    Dönem
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium text-slate-500">
                    Taban puan
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium text-slate-500">
                    Kontenjan
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...il.alimlar].reverse().map((a) => (
                  <tr
                    key={a.donem}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-4 py-2.5 font-medium text-slate-700">
                      {a.donem}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-slate-900">
                      <b>{puanStr(a.taban)}</b>
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-slate-700">
                      {a.kontenjan} kadro
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Taban puan, ilgili dönemde o ile yerleşen adayların en düşük
            puanıdır; sonraki dönemler için bağlayıcı değildir.
          </p>
        </section>

        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Artılar</h2>
            {artilar.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">
                Öne çıkan artı bulunamadı.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {artilar.map((o, i) => (
                  <li
                    key={i}
                    className="rounded-lg bg-emerald-50/70 p-2.5 text-sm text-emerald-900"
                  >
                    {o.metin}
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Eksiler</h2>
            {eksiler.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">
                Öne çıkan eksi bulunamadı.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {eksiler.map((o, i) => (
                  <li
                    key={i}
                    className="rounded-lg bg-red-50/70 p-2.5 text-sm text-red-900"
                  >
                    {o.metin}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <section className="mt-6">
          <h2 className="text-lg font-bold text-slate-900">
            Kamu hastaneleri
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            SB Kamu Hastaneleri (2.-3. basamak) ve devlet üniversitesi
            hastaneleri. Renkler tesis türünü gösterir.
          </p>
          <ul className="mt-3 grid gap-1.5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2">
            {il.hastaneler.map((h) => (
              <li
                key={h.ad}
                className={`flex items-start gap-2 text-sm ${
                  h.tur === "kdd"
                    ? "font-medium text-rose-800"
                    : "text-slate-700"
                }`}
              >
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{ background: HASTANE_RENK[h.tur] }}
                />
                <span>
                  {h.ad}
                  <span className="block text-xs text-slate-400">
                    {HASTANE_TUR_ADI[h.tur]}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {yakinIller.length > 0 && (
          <section className="mt-6">
            <h2 className="text-lg font-bold text-slate-900">
              {il.bolge} bölgesindeki diğer iller
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {yakinIller.map((y) => (
                <Link
                  key={y.plaka}
                  href={`/il/${ilSlug(y)}`}
                  className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-sky-800"
                >
                  {y.ad}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm leading-relaxed text-amber-900">
            {kaynakBilgileri.uyari}
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <Link
              href={`/?il=${slug}`}
              className="font-medium text-sky-800 underline underline-offset-2 hover:text-sky-900"
            >
              {il.ad} ilini haritada puanına göre incele →
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto w-full max-w-5xl px-4 text-xs text-slate-500">
          Ebelik Tercih Atlası — KPSS lisans (P3) ebelik atamaları için bağımsız
          bilgilendirme aracı. Veriler kamuya açık kaynaklardan derlenmiştir;
          tercih öncesi ÖSYM ve Sağlık Bakanlığı duyurularını esas alın.
        </div>
      </footer>
    </div>
  );
}
