import Link from "next/link";
import {
  Baby,
  ExternalLink,
  GraduationCap,
  Home,
  Minus,
  Plus,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import {
  alimGetir,
  dataset,
  dogumOrani,
  genelPuanAraligi,
  ilSlug,
  medyanKira,
  tabanYuzdeligi,
  trDogumOrani,
} from "@/lib/data";
import { HASTANE_RENK, HASTANE_TUR_ADI, uygunlukSonucu } from "@/lib/colors";
import { isaretli, puanStr, sayi, tl, yuzde } from "@/lib/format";
import { ilOnerileri } from "@/lib/insights";
import type { Il } from "@/lib/types";
import { IstatistikKutusu, Kart, Rozet } from "./ui";

const DOGUM_SIRASI = (() => {
  const sirali = [...dataset.iller].sort((a, b) => b.dogum - a.dogum);
  return new Map(sirali.map((il, i) => [il.plaka, i + 1]));
})();

export default function IlDetay({
  il,
  donem,
  puan,
  secili,
  onEkle,
  onCikar,
}: {
  il: Il;
  donem: string;
  puan: number | null;
  secili: boolean;
  onEkle: (plaka: number) => void;
  onCikar: (plaka: number) => void;
}) {
  const alim = alimGetir(il, donem);
  const sonuc = uygunlukSonucu(alim && puan !== null ? puan - alim.taban : null);
  const oneriler = ilOnerileri(il, {
    donem,
    medyanKira,
    tabanYuzdeligi: alim ? tabanYuzdeligi(donem, alim.taban) : null,
    taban: alim?.taban ?? null,
    kontenjan: alim?.kontenjan ?? null,
  });
  const artilar = oneriler.filter((o) => o.arti);
  const eksiler = oneriler.filter((o) => !o.arti);
  const kiraOran = il.kira / medyanKira;
  const kdHastaneler = il.hastaneler.filter((h) => h.tur === "kdd");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
          {il.plaka.toString().padStart(2, "0")}
        </span>
        <h2 className="text-xl font-bold text-slate-900">{il.ad}</h2>
        <Rozet ton="sky">{il.bolge}</Rozet>
        <Rozet>Nüfus: {sayi(il.nufus)}</Rozet>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href={`/il/${ilSlug(il)}`}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:border-sky-300 hover:text-sky-800"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            İl sayfası
          </Link>
          {secili ? (
            <button
              onClick={() => onCikar(il.plaka)}
              className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              Listeden çıkar
            </button>
          ) : (
            <button
              onClick={() => onEkle(il.plaka)}
              className="rounded-lg bg-sky-700 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-sky-800"
            >
              + Tercih listeme ekle
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Kart
          baslik="Ebe alımları ve taban puanlar"
          icon={GraduationCap}
          ekstra={
            !alim ? <Rozet ton="notr">bu dönem alım yok</Rozet> : undefined
          }
        >
          <div className="space-y-1">
            {[...il.alimlar].reverse().map((a) => {
              const seciliDonem = a.donem === donem;
              return (
                <div
                  key={a.donem}
                  className={`grid grid-cols-[56px_1fr_auto] items-center gap-3 rounded-lg px-2 py-1.5 ${
                    seciliDonem ? "bg-sky-50 ring-1 ring-sky-200" : ""
                  }`}
                >
                  <div className="text-sm font-medium text-slate-500">
                    {a.donem}
                  </div>
                  <PuanAraligi taban={a.taban} puan={puan} />
                  <div className="text-right">
                    <div className="text-base font-semibold tabular-nums text-slate-900">
                      {puanStr(a.taban)}
                    </div>
                    <div className="text-[0.6875rem] text-slate-500">
                      {a.kontenjan} kadro
                    </div>
                  </div>
                  {puan !== null && (
                    <span className="sr-only">
                      {a.donem} dönemi taban puanı {puanStr(a.taban)}; senin
                      puanın {puanStr(puan)} ({isaretli(puan - a.taban)}{" "}
                      {puan >= a.taban ? "üstünde" : "altında"})
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 pl-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-800" />
              il taban puanı
            </span>
            {puan !== null && (
              <span className="flex items-center gap-1">
                <span className="inline-block h-0 w-0 border-x-4 border-b-[6px] border-x-transparent border-b-sky-600" />
                senin puanın
              </span>
            )}
            <span className="text-slate-400">
              şerit ölçeği: {puanStr(genelPuanAraligi.min, 0)}–
              {puanStr(genelPuanAraligi.max, 0)} puan (tüm dönemlerde aynı)
            </span>
          </div>

          {puan !== null &&
            (alim ? (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ background: sonuc.renk }}
                />
                <p className="text-sm text-slate-700">
                  <b className="text-slate-800">{puanStr(puan)}</b> puanın,{" "}
                  {donem} tabanının{" "}
                  <b
                    className={
                      puan >= alim.taban
                        ? "text-emerald-700"
                        : "text-red-700"
                    }
                  >
                    {isaretli(puan - alim.taban)}
                  </b>{" "}
                  {puan >= alim.taban ? "üstünde" : "altında"} —{" "}
                  <b>{sonuc.etiket}</b>.
                </p>
              </div>
            ) : (
              <p className="mt-3 rounded-lg bg-slate-50 p-2.5 text-sm text-slate-600">
                Seçili dönemde ({donem}) bu ile ebe kadrosu verilmedi.
              </p>
            ))}
        </Kart>

        <Kart baslik="Şehir hayatı" icon={Home}>
          <div className="grid grid-cols-2 gap-2">
            <IstatistikKutusu
              etiket="Ortalama kira"
              deger={tl(il.kira)}
              alt={`TR ort. ${sayi(medyanKira)} TL'nin ${yuzde(
                Math.abs(1 - kiraOran)
              )} ${kiraOran <= 1 ? "altında" : "üzerinde"} · Endeksa 2025`}
              vurgu={kiraOran <= 0.8 ? "iyi" : kiraOran >= 1.2 ? "kotu" : undefined}
            />
            <IstatistikKutusu
              etiket="Doğum oranı"
              deger={puanStr(dogumOrani(il))}
              alt={`bin kişi başına · TR ort. ${puanStr(trDogumOrani)} (TÜİK 2025)`}
              vurgu={dogumOrani(il) >= trDogumOrani * 1.15 ? "iyi" : undefined}
            />
            <IstatistikKutusu
              etiket="Nüfus"
              deger={sayi(il.nufus)}
              alt={`TÜİK ADNKS ${il.nufusYil}`}
            />
            <IstatistikKutusu etiket="Bölge" deger={il.bolge} />
          </div>
        </Kart>

        <Kart baslik="Doğum ve sağlık tesisleri" icon={Baby}>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums text-slate-900">
              {sayi(il.dogum)}
            </span>
            <span className="text-sm text-slate-600">
              canlı doğum · TÜİK {il.dogumYil}
            </span>
          </div>
          <div className="mt-0.5 text-sm text-slate-600">
            Doğum sayısında 81 il içinde {DOGUM_SIRASI.get(il.plaka)}. sırada
          </div>
          {kdHastaneler.length > 0 && (
            <div className="mt-2 rounded-lg border border-rose-100 bg-rose-50/60 p-2 text-sm text-rose-700">
              <b>Kadın doğum / çocuk:</b>{" "}
              {kdHastaneler.map((h) => h.ad).join(" · ")}
            </div>
          )}
          <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto pr-1">
            {il.hastaneler.map((h) => (
              <li
                key={h.ad}
                className={`flex items-start gap-1.5 text-xs ${
                  h.tur === "kdd"
                    ? "font-medium text-rose-800"
                    : "text-slate-600"
                }`}
                title={HASTANE_TUR_ADI[h.tur]}
              >
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: HASTANE_RENK[h.tur] }}
                />
                {h.ad}
              </li>
            ))}
          </ul>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100 pt-2 text-[0.6875rem] text-slate-400">
            {(["kdd", "sehir", "eah", "uni", "devlet"] as const).map((tur) => (
              <span key={tur} className="flex items-center gap-1">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: HASTANE_RENK[tur] }}
                />
                {HASTANE_TUR_ADI[tur]}
              </span>
            ))}
          </div>
          <p className="mt-1.5 text-[0.6875rem] leading-relaxed text-slate-400">
            SB kamu hastaneleri (KHGM 2022 + 2022–2026 yeni açılışlar) ve
            devlet üniversitesi hastaneleri. Ağız-diş ve fizik tedavi gibi ebe
            kadrosu bulunmayan türler listelenmemiştir. Üniversite hastaneleri
            kendi personel alımlarını yapar; KPSS tercih kılavuzlarında da
            kadro açabilirler.
          </p>
        </Kart>

        <Kart
          baslik="Artılar"
          icon={ThumbsUp}
          className="lg:col-span-3"
          ekstra={<Rozet ton="yesil">{artilar.length} madde</Rozet>}
        >
          {artilar.length === 0 ? (
            <p className="text-xs text-slate-400">Öne çıkan artı bulunamadı.</p>
          ) : (
            <ul className="grid gap-1.5 md:grid-cols-2 xl:grid-cols-3">
              {artilar.map((o, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 rounded-lg bg-emerald-50/60 p-2 text-xs text-emerald-900"
                >
                  <Plus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  {o.metin}
                </li>
              ))}
            </ul>
          )}
        </Kart>

        <Kart
          baslik="Eksiler"
          icon={ThumbsDown}
          className="lg:col-span-3"
          ekstra={<Rozet ton="kirmizi">{eksiler.length} madde</Rozet>}
        >
          {eksiler.length === 0 ? (
            <p className="text-xs text-slate-400">Öne çıkan eksi bulunamadı.</p>
          ) : (
            <ul className="grid gap-1.5 md:grid-cols-2 xl:grid-cols-3">
              {eksiler.map((o, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 rounded-lg bg-red-50/60 p-2 text-xs text-red-900"
                >
                  <Minus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                  {o.metin}
                </li>
              ))}
            </ul>
          )}
        </Kart>
      </div>

      <p className="text-[0.6875rem] leading-relaxed text-slate-400">
        Artı/eksiler sayısal verilerden kural bazlı üretilmiştir; yorum
        içermez. Taban puan = o dönemde ile yerleşen en düşük puan. Ok
        işareti (▲) senin puanını, daire (●) ilin tabanını gösterir.
      </p>
    </div>
  );
}

function PuanAraligi({
  taban,
  puan,
}: {
  taban: number;
  puan: number | null;
}) {
  const { min, max } = genelPuanAraligi;
  const aralik = max - min || 1;
  const konum = (v: number) =>
    Math.min(100, Math.max(0, ((v - min) / aralik) * 100));
  return (
    <div
      aria-hidden="true"
      className="relative h-1.5 w-full rounded-full bg-slate-100"
      title={`Şerit ölçeği: ${puanStr(min, 0)}–${puanStr(max, 0)} puan`}
    >
      <span
        className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-slate-800 shadow-sm"
        style={{ left: `${konum(taban)}%` }}
        title={`${puanStr(taban)} taban puanı`}
      />
      {puan !== null && (
        <span
          className="absolute top-1/2 h-0 w-0 -translate-x-1/2 -translate-y-full border-x-4 border-b-[7px] border-x-transparent border-b-sky-600"
          style={{ left: `${konum(puan)}%` }}
          title={`senin puanın: ${puanStr(puan)}`}
        />
      )}
    </div>
  );
}
