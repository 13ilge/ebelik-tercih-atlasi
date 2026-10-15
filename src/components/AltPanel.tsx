"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDownWideNarrow,
  ArrowLeftRight,
  Check,
  Download,
  FileDown,
  GripVertical,
  Link2,
  ListOrdered,
  Trash2,
  X,
} from "lucide-react";
import { alimGetir, dataset, donemKadro, ilHaritasi, meta } from "@/lib/data";
import { puanStr, sayi, tarihStr, tl } from "@/lib/format";
import { kaydirmaKilidiAl } from "@/lib/kaydirma-kilidi";
import type { Il } from "@/lib/types";
import IlAraEkle from "./IlAraEkle";
import IlDetay from "./IlDetay";
import KarsilastirmaTablosu from "./KarsilastirmaTablosu";
import { Kart, Rozet } from "./ui";

interface Props {
  secililer: number[];
  aktif: number | null;
  donem: string;
  puan: number | null;
  mobil?: boolean;
  karsilastir: boolean;
  genis?: boolean;
  onFareGiris?: () => void;
  onKaynak: () => void;
  onKarsilastir: (v: boolean) => void;
  onEkle: (plaka: number) => void;
  onCikar: (plaka: number) => void;
  onAktif: (plaka: number) => void;
  onSirala: (yeni: number[]) => void;
  onTemizle: () => void;
}

export default function AltPanel({
  secililer,
  aktif,
  donem,
  puan,
  mobil,
  karsilastir,
  genis,
  onFareGiris,
  onKaynak,
  onKarsilastir,
  onEkle,
  onCikar,
  onAktif,
  onSirala,
  onTemizle,
}: Props) {
  const aktifIl = aktif !== null ? ilHaritasi.get(aktif) : undefined;
  const [kopyalandi, setKopyalandi] = useState(false);
  const [listeAcik, setListeAcik] = useState(false);
  const [suruklenen, setSuruklenen] = useState<number | null>(null);
  const surukleRef = useRef<number | null>(null);
  const surukleTemizleRef = useRef<(() => void) | null>(null);
  const siraRef = useRef(secililer);
  useEffect(() => {
    siraRef.current = secililer;
  }, [secililer]);

  const listeSatirlari = () =>
    secililer.map((plaka, i) => {
      const il = ilHaritasi.get(plaka);
      const alim = il ? alimGetir(il, donem) : undefined;
      const kiraMetni = il && il.kira !== null ? ` · ${tl(il.kira)}` : "";
      return {
        sira: i + 1,
        ad: il?.ad ?? "",
        sag: alim
          ? `${puanStr(alim.taban)} · ${alim.kontenjan} kadro${kiraMetni}`
          : `bu dönem alım yok${kiraMetni}`,
      };
    });

  const baglantiKopyala = async () => {
    const p = new URLSearchParams();
    p.set("liste", secililer.join(","));
    if (puan !== null) p.set("puan", String(puan).replace(".", ","));
    p.set("donem", donem);
    const url = `${window.location.origin}/?${p.toString()}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Bağlantıyı kopyalayın:", url);
    }
    setKopyalandi(true);
    setTimeout(() => setKopyalandi(false), 2000);
  };

  const pngIndir = async () => {
    const { listePngIndir } = await import("@/lib/png");
    listePngIndir({
      baslik: "Ebelik Tercih Listem",
      altBaslik: `${donem} dönemi${puan !== null ? ` · KPSS P3: ${puanStr(puan, 3)}` : ""} · ${secililer.length} il`,
      satirlar: listeSatirlari(),
      dipnot:
        "Bilgilendirme amaçlıdır; kesin tercih için ÖSYM ve Sağlık Bakanlığı duyurularını esas alın. Taban puan, ilgili dönemde o ile yerleşen en düşük puandır.",
      dosyaAdi: `ebe-tercih-listesi-${donem.replace("/", "-")}.png`,
    });
  };

  const pdfIndir = async () => {
    const { listePdfIndir } = await import("@/lib/pdf");
    await listePdfIndir({
      baslik: "Ebelik Tercih Listem",
      altBaslik: `${donem} dönemi${puan !== null ? ` · KPSS P3: ${puanStr(puan, 3)}` : ""} · ${secililer.length} il`,
      satirlar: listeSatirlari(),
      dipnot:
        "Bilgilendirme amaçlıdır; kesin tercih için ÖSYM ve Sağlık Bakanlığı duyurularını esas alın. Taban puan, ilgili dönemde o ile yerleşen en düşük puandır. — Ebelik Tercih Atlası",
      dosyaAdi: `ebe-tercih-listesi-${donem.replace("/", "-")}.pdf`,
    });
  };

  const tasi = (i: number, yon: -1 | 1) => {
    const j = i + yon;
    if (j < 0 || j >= secililer.length) return;
    const yeni = [...secililer];
    [yeni[i], yeni[j]] = [yeni[j], yeni[i]];
    onSirala(yeni);
  };

  const surukleBasla = (e: React.PointerEvent, i: number) => {
    if (e.button !== 0) return;
    surukleRef.current = i;
    setSuruklenen(i);
    const hareket = (ev: PointerEvent) => {
      const hedefEl = document
        .elementFromPoint(ev.clientX, ev.clientY)
        ?.closest?.("[data-satir]");
      if (!hedefEl) return;
      const hedef = Number(hedefEl.getAttribute("data-satir"));
      const mevcut = surukleRef.current;
      if (mevcut === null || Number.isNaN(hedef) || hedef === mevcut) return;
      const yeni = [...siraRef.current];
      const [tasinan] = yeni.splice(mevcut, 1);
      yeni.splice(hedef, 0, tasinan);
      surukleRef.current = hedef;
      onSirala(yeni);
    };
    const bitir = () => {
      surukleRef.current = null;
      surukleTemizleRef.current = null;
      setSuruklenen(null);
      window.removeEventListener("pointermove", hareket);
      window.removeEventListener("pointerup", bitir);
      window.removeEventListener("pointercancel", bitir);
    };
    surukleTemizleRef.current = bitir;
    window.addEventListener("pointermove", hareket);
    window.addEventListener("pointerup", bitir);
    window.addEventListener("pointercancel", bitir);
  };

  useEffect(() => {
    return () => {
      surukleTemizleRef.current?.();
    };
  }, []);

  useEffect(() => {
    if (!listeAcik) return;
    const kilidiBirak = kaydirmaKilidiAl();
    const tusla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setListeAcik(false);
    };
    document.addEventListener("keydown", tusla);
    return () => {
      document.removeEventListener("keydown", tusla);
      kilidiBirak();
    };
  }, [listeAcik]);

  const aktifSec = (plaka: number) => {
    onAktif(plaka);
    setListeAcik(false);
  };

  const siralaPuanGore = () => {
    const yeni = [...secililer].sort((a, b) => {
      const ila = ilHaritasi.get(a);
      const ilb = ilHaritasi.get(b);
      const aa = ila ? alimGetir(ila, donem) : undefined;
      const ab = ilb ? alimGetir(ilb, donem) : undefined;
      if (puan !== null) {
        const ma = aa ? puan - aa.taban : Number.NEGATIVE_INFINITY;
        const mb = ab ? puan - ab.taban : Number.NEGATIVE_INFINITY;
        if (mb === ma) return 0;
        return mb > ma ? 1 : -1;
      }
      const ta = aa ? aa.taban : Number.NEGATIVE_INFINITY;
      const tb = ab ? ab.taban : Number.NEGATIVE_INFINITY;
      if (tb === ta) return 0;
      return tb > ta ? 1 : -1;
    });
    onSirala(yeni);
  };

  const araclar = (etiketGoster: boolean) => (
    <>
      <button
        onClick={baglantiKopyala}
        title="Tercih listesi bağlantısını kopyala"
        aria-label="Bağlantıyı kopyala"
        className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition max-sm:flex-1 ${
          kopyalandi
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
        }`}
      >
        {kopyalandi ? (
          <Check className="h-4 w-4" />
        ) : (
          <Link2 className="h-4 w-4" />
        )}
        <span className={etiketGoster ? undefined : "hidden sm:inline"}>
          {kopyalandi ? "Kopyalandı" : "Bağlantı"}
        </span>
      </button>
      <button
        onClick={pngIndir}
        title="Listeyi PNG olarak indir"
        aria-label="PNG indir"
        className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition max-sm:flex-1 hover:border-slate-300 hover:text-slate-900"
      >
        <Download className="h-4 w-4" />
        <span className={etiketGoster ? undefined : "hidden sm:inline"}>
          PNG
        </span>
      </button>
      <button
        onClick={pdfIndir}
        title="Listeyi PDF olarak indir"
        aria-label="PDF indir"
        className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition max-sm:flex-1 hover:border-slate-300 hover:text-slate-900"
      >
        <FileDown className="h-4 w-4" />
        <span className={etiketGoster ? undefined : "hidden sm:inline"}>
          PDF indir
        </span>
      </button>
      <button
        onClick={onTemizle}
        title="Seçimi temizle"
        aria-label="Seçimi temizle"
        className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-500 transition max-sm:flex-1 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
        <span className={etiketGoster ? undefined : "hidden sm:inline"}>
          Temizle
        </span>
      </button>
    </>
  );

  const listeIcerigi = (tamEkran: boolean) => (
    <>
      {!tamEkran && (
        <div className="flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <ListOrdered className="h-4 w-4 text-sky-700" />
            Tercih sıran
          </h3>
          <Rozet ton="sky">{secililer.length} il</Rozet>
        </div>
      )}

      <button
        onClick={siralaPuanGore}
        disabled={secililer.length < 2}
        className={`${
          tamEkran ? "mt-0" : "mt-2"
        } flex w-full items-center justify-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-800 transition hover:bg-sky-100 disabled:cursor-default disabled:opacity-50`}
        title={
          puan !== null
            ? "Puanına en uygun (rahat) iller başa gelir"
            : "En yüksek taban puanlı iller başa gelir (istenen → garanti)"
        }
      >
        <ArrowDownWideNarrow className="h-4 w-4" />
        {puan !== null ? "Puanıma göre sırala" : "Taban puana göre sırala"}
      </button>

      <div className="mt-1.5">
        <IlAraEkle secililer={secililer} donem={donem} onEkle={onEkle} genis />
      </div>

      <ul
        className={`mt-1.5 space-y-1 overflow-y-auto pr-1 ${
          tamEkran
            ? "max-h-none"
            : "max-h-[28vh] lg:max-h-none lg:min-h-0 lg:flex-1"
        }`}
      >
        {secililer.map((plaka, i) => {
          const il = ilHaritasi.get(plaka);
          if (!il) return null;
          const alim = alimGetir(il, donem);
          const seciliAktif = aktif === plaka && !karsilastir;
          return (
            <li
              key={plaka}
              data-satir={i}
              className={`flex select-none items-center gap-1 rounded-lg border py-1 pl-1 pr-1 transition ${
                seciliAktif
                  ? "border-sky-300 bg-sky-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              } ${suruklenen === i ? "opacity-70 ring-2 ring-sky-400" : ""}`}
            >
              <button
                onPointerDown={(e) => surukleBasla(e, i)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    tasi(i, -1);
                  }
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    tasi(i, 1);
                  }
                }}
                aria-label={`${il.ad} ilini sırala: sürükle veya ok tuşlarını kullan`}
                title="Sürükleyerek sırala (ok tuşları da çalışır)"
                className="cursor-grab touch-none rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 active:cursor-grabbing"
              >
                <GripVertical className="h-4 w-4" />
              </button>
              <button
                onClick={() => aktifSec(plaka)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
                title={`${il.ad} detayını göster`}
              >
                <span className="w-6 shrink-0 text-right font-mono text-xs font-semibold tabular-nums text-slate-500">
                  {i + 1}.
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">
                  {il.ad}
                </span>
                {tamEkran ? (
                  <span className="w-24 shrink-0 text-right text-xs tabular-nums text-slate-500">
                    {alim
                      ? `${puanStr(alim.taban)} · ${alim.kontenjan} kadro`
                      : "alım yok"}
                  </span>
                ) : (
                  <>
                    <span className="w-11 shrink-0 text-right text-xs tabular-nums text-slate-500">
                      {alim ? puanStr(alim.taban) : "—"}
                    </span>
                    <span className="w-16 shrink-0 text-right text-xs tabular-nums text-slate-500">
                      {alim ? `${alim.kontenjan} kadro` : "alım yok"}
                    </span>
                  </>
                )}
              </button>
              <button
                onClick={() => onCikar(plaka)}
                aria-label={`${il.ad} ilini listeden çıkar`}
                className="rounded p-1 text-slate-400 transition hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-[0.6875rem] leading-relaxed text-slate-400">
        Tercih listen bu cihazda otomatik kaydedilir.
      </p>
    </>
  );

  return (
    <section
      id="icerik"
      tabIndex={-1}
      onMouseEnter={onFareGiris}
      className={`flex min-h-0 flex-1 flex-col border-t border-slate-200 bg-slate-50 transition-[height] duration-300 ease-out outline-none motion-reduce:transition-none lg:flex-none ${
        genis ? "lg:h-[76dvh]" : "lg:h-[50dvh]"
      }`}
    >
      <div className="flex-1 overflow-y-auto p-3 lg:p-4">
        {secililer.length > 0 ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setListeAcik(true)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-sky-800 lg:hidden"
              >
                <ListOrdered className="h-4 w-4" />
                Tercih listem ({secililer.length})
              </button>

              {secililer.length >= 2 && (
                <button
                  onClick={() => onKarsilastir(!karsilastir)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    karsilastir
                      ? "border-sky-300 bg-sky-50 text-sky-800"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  {karsilastir ? "Detaya dön" : "Karşılaştır"}
                </button>
              )}
              <div className="ml-auto flex w-full items-center gap-1.5 sm:w-auto">
                {araclar(false)}
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
            <aside
              className={`hidden shrink-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm lg:flex lg:order-1 lg:w-80 lg:flex-col ${
                genis
                  ? "lg:max-h-[calc(76dvh-2rem)]"
                  : "lg:max-h-[calc(50dvh-2rem)]"
              }`}
            >
              {listeIcerigi(false)}
            </aside>

            <div className="order-1 min-w-0 flex-1 lg:order-2">
              {karsilastir && secililer.length >= 2 ? (
                <KarsilastirmaTablosu
                  plakalar={secililer}
                  donem={donem}
                  puan={puan}
                />
              ) : aktifIl ? (
                <IlDetay
                  il={aktifIl}
                  donem={donem}
                  puan={puan}
                  secili={secililer.includes(aktifIl.plaka)}
                  onEkle={onEkle}
                  onCikar={onCikar}
                />
              ) : null}
            </div>
            {listeAcik && (
              <div
                className="fixed inset-0 z-50 flex flex-col bg-slate-50 lg:hidden"
                role="dialog"
                aria-modal="true"
                aria-label="Tercih listem"
              >
                <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-2.5">
                  <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                    <ListOrdered className="h-4 w-4 text-sky-700" />
                    Tercih listem
                  </h2>
                  <Rozet ton="sky">{secililer.length} il</Rozet>
                  <button
                    onClick={() => setListeAcik(false)}
                    aria-label="Listeyi kapat"
                    className="ml-auto rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto p-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    {listeIcerigi(true)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5 border-t border-slate-200 bg-white p-3">
                  {araclar(true)}
                </div>
              </div>
            )}

            </div>
          </div>
        ) : (
          <BosDurum
            secililer={secililer}
            donem={donem}
            onEkle={onEkle}
            mobil={mobil}
          />
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-slate-200 pt-3 text-xs text-slate-400">
          <span>Bağımsız bilgilendirme aracı; resmî tercih kaynağı değildir.</span>
          <span className="flex items-center gap-2">
            <button
              onClick={onKaynak}
              className="py-1 font-medium text-slate-500 underline underline-offset-2 transition hover:text-sky-800"
            >
              Veri ve kaynaklar
            </button>
            <Link
              href="/gizlilik"
              className="py-1 font-medium text-slate-500 underline underline-offset-2 transition hover:text-sky-800"
            >
              Gizlilik
            </Link>
          </span>
        </div>
      </div>
    </section>
  );
}

function BosDurum({
  secililer,
  donem,
  onEkle,
  mobil,
}: {
  secililer: number[];
  donem: string;
  onEkle: (plaka: number) => void;
  mobil?: boolean;
}) {
  const kolay = [...dataset.iller]
    .map((il) => ({ il, alim: alimGetir(il, donem) }))
    .filter(
      (x): x is { il: Il; alim: NonNullable<ReturnType<typeof alimGetir>> } =>
        Boolean(x.alim)
    )
    .sort((a, b) => a.alim.taban - b.alim.taban)
    .slice(0, 5);
  const kadro = [...dataset.iller]
    .map((il) => ({ il, alim: alimGetir(il, donem) }))
    .filter(
      (x): x is { il: Il; alim: NonNullable<ReturnType<typeof alimGetir>> } =>
        Boolean(x.alim)
    )
    .sort((a, b) => b.alim.kontenjan - a.alim.kontenjan)
    .slice(0, 5);

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <Kart baslik="Nasıl çalışır?" className="max-lg:order-3">
        <ol className="space-y-2 text-sm text-slate-700">
          <li className="flex gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-800">
              1
            </span>
            {mobil
              ? "Arama çubuğundan bir il ara ve seç; tercih listene eklenir, detayları burada açılır."
              : "Bir il seç (haritadan, aramadan ya da listeden); tercih listene eklenir, detayları burada açılır."}
          </li>
          <li className="flex gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-800">
              2
            </span>
            {mobil
              ? "Üstteki alana KPSS P3 puanını yaz; sonuçlar ve detaylar puanına göre uygunluk rozetleriyle işaretlenir."
              : "Üstteki alana KPSS P3 puanını yaz; harita \"puanına göre ulaşılabilirlik\" renklerine döner."}
          </li>
          <li className="flex gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-800">
              3
            </span>
            Tercih listende illeri yukarı/aşağı taşı ya da &quot;puanıma göre
            sırala&quot; ile sıranı oluştur; Karşılaştır ile yan yana incele.
          </li>
        </ol>
        <p className="mt-3 rounded-lg bg-amber-50 p-2 text-[0.6875rem] leading-relaxed text-amber-800">
          Veriler kamuya açık kaynaklardan derlenmiştir; resmî tercih kaynağı
          değildir. Tercih öncesi ÖSYM ve Sağlık Bakanlığı duyurularını esas
          alın. Son veri derlemesi: {tarihStr(meta.insaTarihi)}.
        </p>
      </Kart>

      <Kart
        baslik={`${donem} · en ulaşılabilir iller`}
        ekstra={<Rozet ton="yesil">düşük taban</Rozet>}
        className="max-lg:order-1"
      >
        <Liste
          satirlar={kolay.map(({ il, alim }) => ({
            il,
            taban: alim.taban,
            kontenjan: alim.kontenjan,
          }))}
          secililer={secililer}
          onEkle={onEkle}
        />
      </Kart>

      <Kart
        baslik={`${donem} · en çok kadro`}
        ekstra={
          <Rozet ton="sky">
            {sayi(donemKadro(donem))} kadro toplam
          </Rozet>
        }
        className="max-lg:order-2"
      >
        <Liste
          satirlar={kadro.map(({ il, alim }) => ({
            il,
            taban: alim.taban,
            kontenjan: alim.kontenjan,
          }))}
          secililer={secililer}
          onEkle={onEkle}
        />
      </Kart>
    </div>
  );
}

function Liste({
  satirlar,
  secililer,
  onEkle,
}: {
  satirlar: { il: Il; taban: number | null; kontenjan: number | null }[];
  secililer: number[];
  onEkle: (plaka: number) => void;
}) {
  return (
    <ul className="space-y-1">
      {satirlar.map(({ il, taban, kontenjan }) => {
        const secili = secililer.includes(il.plaka);
        return (
          <li key={il.plaka}>
            <button
              onClick={() => onEkle(il.plaka)}
              disabled={secili}
              className={`grid w-full grid-cols-[minmax(0,1fr)_3rem_5rem] items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition ${
                secili
                  ? "cursor-default bg-slate-50 text-slate-400"
                  : "text-slate-700 hover:bg-sky-50"
              }`}
            >
              <span className="truncate font-medium">
                {il.ad}
                {secili && <span className="ml-1 text-sky-600">✓</span>}
              </span>
              <span className="text-right tabular-nums text-slate-600">
                {taban !== null ? puanStr(taban) : "—"}
              </span>
              <span className="text-right tabular-nums text-slate-600">
                {kontenjan !== null ? `${kontenjan} kadro` : "alım yok"}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
