"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDownWideNarrow,
  ArrowLeftRight,
  Check,
  Download,
  GripVertical,
  Link2,
  ListOrdered,
  Printer,
  Trash2,
  X,
} from "lucide-react";
import { alimGetir, dataset, donemKadro, ilHaritasi } from "@/lib/data";
import { puanStr, sayi, tl } from "@/lib/format";
import { listePngIndir } from "@/lib/png";
import type { Il } from "@/lib/types";
import IlAraEkle from "./IlAraEkle";
import IlDetay from "./IlDetay";
import KarsilastirmaTablosu from "./KarsilastirmaTablosu";
import { Kart, Rozet } from "./ui";

const YAZDIRMA_STILI = `
  * { box-sizing: border-box; }
  body { font-family: Arial, sans-serif; margin: 32px; color: #0f172a; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .alt { color: #475569; font-size: 14px; margin-bottom: 20px; }
  ol { list-style: none; padding: 0; margin: 0; }
  li { display: flex; justify-content: space-between; gap: 16px; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 15px; }
  li:nth-child(odd) { background: #f8fafc; }
  li span { color: #334155; white-space: nowrap; }
  .not { margin-top: 20px; font-size: 12px; color: #64748b; line-height: 1.5; }
`;

interface Props {
  secililer: number[];
  aktif: number | null;
  donem: string;
  puan: number | null;
  karsilastir: boolean;
  genis?: boolean;
  onFareGiris?: () => void;
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
  karsilastir,
  genis,
  onFareGiris,
  onKarsilastir,
  onEkle,
  onCikar,
  onAktif,
  onSirala,
  onTemizle,
}: Props) {
  const aktifIl = aktif !== null ? ilHaritasi.get(aktif) : undefined;
  const [kopyalandi, setKopyalandi] = useState(false);
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
      return {
        sira: i + 1,
        ad: il?.ad ?? "",
        sag: alim
          ? `${puanStr(alim.taban)} · ${alim.kontenjan} kadro · ${tl(il!.kira)}`
          : `bu dönem alım yok · ${il ? tl(il.kira) : ""}`,
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

  const pngIndir = () => {
    listePngIndir({
      baslik: "Ebelik Tercih Listem",
      altBaslik: `${donem} dönemi${puan !== null ? ` · KPSS P3: ${puanStr(puan, 3)}` : ""} · ${secililer.length} il`,
      satirlar: listeSatirlari(),
      dipnot:
        "Bilgilendirme amaçlıdır; kesin tercih için ÖSYM ve Sağlık Bakanlığı duyurularını esas alın. Taban puan, ilgili dönemde o ile yerleşen en düşük puandır.",
      dosyaAdi: `ebe-tercih-listesi-${donem.replace("/", "-")}.png`,
    });
  };

  const yazdir = () => {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.tabIndex = -1;
    iframe.style.position = "fixed";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument;
    const pencere = iframe.contentWindow;
    if (!doc || !pencere) {
      iframe.remove();
      return;
    }
    doc.title = `Ebelik Tercih Listem — ${donem}`;
    const stil = doc.createElement("style");
    stil.textContent = YAZDIRMA_STILI;
    doc.head.appendChild(stil);

    const baslik = doc.createElement("h1");
    baslik.textContent = "Ebelik Tercih Listem";
    const altBilgi = doc.createElement("div");
    altBilgi.className = "alt";
    altBilgi.textContent = `${donem} dönemi${
      puan !== null ? ` · KPSS P3 puanın: ${puanStr(puan, 3)}` : ""
    } · ${secililer.length} il`;
    const liste = doc.createElement("ol");
    for (const s of listeSatirlari()) {
      const satir = doc.createElement("li");
      const ad = doc.createElement("b");
      ad.textContent = `${s.sira}. ${s.ad}`;
      const deger = doc.createElement("span");
      deger.textContent = s.sag;
      satir.append(ad, deger);
      liste.appendChild(satir);
    }
    const not = doc.createElement("p");
    not.className = "not";
    not.textContent =
      "Bilgilendirme amaçlıdır; kesin tercih için ÖSYM ve Sağlık Bakanlığı duyurularını esas alın. Taban puan, ilgili dönemde o ile yerleşen en düşük puandır. — Ebelik Tercih Atlası";
    doc.body.append(baslik, altBilgi, liste, not);

    try {
      pencere.focus();
      pencere.print();
    } finally {
      setTimeout(() => iframe.remove(), 1500);
    }
  };

  const tasi = (i: number, yon: -1 | 1) => {
    const j = i + yon;
    if (j < 0 || j >= secililer.length) return;
    const yeni = [...secililer];
    [yeni[i], yeni[j]] = [yeni[j], yeni[i]];
    onSirala(yeni);
  };

  const surukleBasla = (e: React.PointerEvent, i: number) => {
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

  return (
    <section
      id="icerik"
      tabIndex={-1}
      onMouseEnter={onFareGiris}
      className={`flex h-[40dvh] shrink-0 flex-col border-t border-slate-200 bg-slate-50 transition-[height] duration-300 ease-out outline-none motion-reduce:transition-none ${
        genis ? "lg:h-[76dvh]" : "lg:h-[50dvh]"
      }`}
    >
      <div className="flex-1 overflow-y-auto p-3 lg:p-4">
        {secililer.length > 0 ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
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
              <div className="ml-auto flex flex-wrap items-center gap-1.5">
                <button
                  onClick={baglantiKopyala}
                  title="Tercih listesi bağlantısını kopyala"
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition ${
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
                  {kopyalandi ? "Kopyalandı" : "Bağlantı"}
                </button>
                <button
                  onClick={pngIndir}
                  title="Listeyi PNG olarak indir"
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                >
                  <Download className="h-4 w-4" />
                  PNG
                </button>
                <button
                  onClick={yazdir}
                  title="Yazdır / PDF olarak kaydet"
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                >
                  <Printer className="h-4 w-4" />
                  Yazdır
                </button>
                <button
                  onClick={onTemizle}
                  title="Seçimi temizle"
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Temizle
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
            <aside
              className={`w-full shrink-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm lg:flex lg:w-80 lg:flex-col ${
                genis
                  ? "lg:max-h-[calc(76dvh-2rem)]"
                  : "lg:max-h-[calc(50dvh-2rem)]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <ListOrdered className="h-4 w-4 text-sky-700" />
                  Tercih sıran
                </h3>
                <Rozet ton="sky">{secililer.length} il</Rozet>
              </div>

              <button
                onClick={siralaPuanGore}
                disabled={secililer.length < 2}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-800 transition hover:bg-sky-100 disabled:cursor-default disabled:opacity-50"
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
                <IlAraEkle
                  secililer={secililer}
                  donem={donem}
                  onEkle={onEkle}
                  genis
                />
              </div>

              <ul className="mt-1.5 max-h-[28vh] space-y-1 overflow-y-auto pr-1 lg:max-h-none lg:min-h-0 lg:flex-1">
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
                        onClick={() => onAktif(plaka)}
                        className="flex min-w-0 flex-1 items-center gap-2 text-left"
                        title={`${il.ad} detayını göster`}
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
                          {i + 1}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">
                          {il.ad}
                        </span>
                        <span className="w-11 shrink-0 text-right text-xs tabular-nums text-slate-500">
                          {alim ? puanStr(alim.taban) : "—"}
                        </span>
                        <span className="w-16 shrink-0 text-right text-xs tabular-nums text-slate-500">
                          {alim ? `${alim.kontenjan} kadro` : "alım yok"}
                        </span>
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
            </aside>

            <div className="min-w-0 flex-1">
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
            </div>
          </div>
        ) : (
          <BosDurum secililer={secililer} donem={donem} onEkle={onEkle} />
        )}
      </div>
    </section>
  );
}

function BosDurum({
  secililer,
  donem,
  onEkle,
}: {
  secililer: number[];
  donem: string;
  onEkle: (plaka: number) => void;
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
      <Kart baslik="Nasıl çalışır?">
        <ol className="space-y-2 text-sm text-slate-700">
          <li className="flex gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-800">
              1
            </span>
            Haritadan bir ile tıkla; seçtiğin il soldaki tercih listene
            eklenir, detayları burada açılır.
          </li>
          <li className="flex gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-800">
              2
            </span>
            Üstteki alana KPSS P3 puanını yaz; harita &quot;puanına göre
            ulaşılabilirlik&quot; renklerine döner.
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
          alın.
        </p>
      </Kart>

      <Kart
        baslik={`${donem} · en ulaşılabilir iller`}
        ekstra={<Rozet ton="yesil">düşük taban</Rozet>}
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
