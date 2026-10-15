"use client";

import { useCallback, useId, useMemo, useState } from "react";
import { ArrowDownWideNarrow, Search, X } from "lucide-react";
import { alimGetir, dataset, donemIstatistigi } from "@/lib/data";
import {
  ALIM_YOK_RENK,
  PUAN_RAMP,
  puanRengi,
  uygunlukSonucu,
} from "@/lib/colors";
import { puanStr } from "@/lib/format";
import { normTr } from "@/lib/metin";
import type { Il } from "@/lib/types";

type Siralama = "kolay" | "zor" | "puanima";

const BOLGELER = [
  "Tümü",
  "Marmara",
  "Ege",
  "Akdeniz",
  "İç Anadolu",
  "Karadeniz",
  "Doğu Anadolu",
  "Güneydoğu Anadolu",
];

export default function MobilIlArama({
  donem,
  puan,
  secililer,
  aktif,
  onSec,
}: {
  donem: string;
  puan: number | null;
  secililer: number[];
  aktif: number | null;
  onSec: (plaka: number) => void;
}) {
  const [sorgu, setSorgu] = useState("");
  const [acik, setAcik] = useState(false);
  const [bolge, setBolge] = useState("Tümü");
  const [siralama, setSiralama] = useState<Siralama>(
    puan !== null ? "puanima" : "kolay"
  );
  const [vurgu, setVurgu] = useState(0);
  const listeId = useId();

  const [sonPuan, setSonPuan] = useState(puan);
  if (puan !== sonPuan) {
    setSonPuan(puan);
    if (puan === null && siralama === "puanima") setSiralama("kolay");
  }

  const ist = donemIstatistigi(donem);
  const gecerliSiralama: Siralama =
    siralama === "puanima" && puan === null ? "kolay" : siralama;

  const karsilastir = useCallback(
    (a: Il, b: Il, nq: string) => {
      if (nq) {
        const pa = normTr(a.ad).startsWith(nq) ? 0 : 1;
        const pb = normTr(b.ad).startsWith(nq) ? 0 : 1;
        if (pa !== pb) return pa - pb;
      }
      const aa = alimGetir(a, donem);
      const ab = alimGetir(b, donem);
      if (gecerliSiralama === "puanima" && puan !== null) {
        const ma = aa ? puan - aa.taban : Number.NEGATIVE_INFINITY;
        const mb = ab ? puan - ab.taban : Number.NEGATIVE_INFINITY;
        if (mb !== ma) return mb > ma ? 1 : -1;
        return a.ad.localeCompare(b.ad, "tr");
      }
      const ta = aa ? aa.taban : null;
      const tb = ab ? ab.taban : null;
      if (ta === null && tb === null) return a.ad.localeCompare(b.ad, "tr");
      if (ta === null) return 1;
      if (tb === null) return -1;
      if (ta === tb) return a.ad.localeCompare(b.ad, "tr");
      return gecerliSiralama === "kolay" ? ta - tb : tb - ta;
    },
    [donem, puan, gecerliSiralama]
  );

  const sonuclar = useMemo(() => {
    const nq = normTr(sorgu.trim());
    const liste = dataset.iller.filter(
      (il) =>
        (bolge === "Tümü" || il.bolge === bolge) &&
        (!nq || normTr(il.ad).includes(nq))
    );
    return [...liste].sort((a, b) => karsilastir(a, b, nq));
  }, [sorgu, bolge, karsilastir]);

  const goster = acik && sorgu.trim().length > 0;
  const etkinVurgu =
    sonuclar.length === 0 ? -1 : Math.min(vurgu, sonuclar.length - 1);

  const sec = (plaka: number) => {
    onSec(plaka);
    setSorgu("");
    setAcik(false);
    setVurgu(0);
  };

  const odakCikti = (e: React.FocusEvent<HTMLDivElement>) => {
    const hedef = e.relatedTarget as Node | null;
    if (!hedef || !e.currentTarget.contains(hedef)) setAcik(false);
  };

  const tusla = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!goster) {
        if (sorgu.trim()) setAcik(true);
        return;
      }
      setVurgu((v) => Math.min(v + 1, sonuclar.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setVurgu((v) => Math.max(v - 1, 0));
    } else if (e.key === "Enter") {
      if (goster && etkinVurgu >= 0 && sonuclar[etkinVurgu]) {
        e.preventDefault();
        sec(sonuclar[etkinVurgu].plaka);
      }
    } else if (e.key === "Escape") {
      setAcik(false);
    }
  };

  return (
    <div
      data-mobil-arama
      onBlur={odakCikti}
      className="relative border-b border-slate-200 bg-white"
    >
      <div className="flex items-center gap-2 px-3 pt-2">
        <div className="flex flex-1 items-stretch gap-2 rounded-lg border border-slate-200 bg-white px-2.5 transition focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100">
          <Search className="h-4 w-4 shrink-0 self-center text-slate-400" />
          <input
            value={sorgu}
            onChange={(e) => {
              setSorgu(e.target.value);
              setAcik(true);
              setVurgu(0);
            }}
            onFocus={() => setAcik(true)}
            onKeyDown={tusla}
            placeholder="İl ara ve ekle…"
            aria-label="İl ara"
            role="combobox"
            aria-expanded={goster}
            aria-controls={listeId}
            aria-autocomplete="list"
            aria-activedescendant={
              goster && etkinVurgu >= 0
                ? `${listeId}-${sonuclar[etkinVurgu].plaka}`
                : undefined
            }
            className="w-full bg-transparent py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />
          {sorgu && (
            <button
              onClick={() => {
                setSorgu("");
                setAcik(false);
              }}
              aria-label="Aramayı temizle"
              className="shrink-0 self-center text-slate-400 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {goster && (
        <div
          id={listeId}
          role="listbox"
          aria-label="İl sonuçları"
          className="absolute inset-x-0 top-full z-40 max-h-[62vh] overflow-y-auto border-b border-slate-200 bg-white shadow-lg"
        >
          <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-100 px-3 py-2">
            <div
              role="group"
              aria-label="Sıralama"
              className="flex shrink-0 rounded-lg border border-slate-200 bg-slate-100 p-0.5"
            >
              {(
                [
                  ["kolay", "En kolay"],
                  ["zor", "En zor"],
                  ...(puan !== null ? [["puanima", "Puanıma göre"]] : []),
                ] as [Siralama, string][]
              ).map(([anahtar, etiket]) => (
                <button
                  key={anahtar}
                  onClick={() => setSiralama(anahtar)}
                  aria-pressed={gecerliSiralama === anahtar}
                  className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                    gecerliSiralama === anahtar
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  {anahtar === "puanima" ? (
                    <span className="flex items-center gap-1">
                      <ArrowDownWideNarrow className="h-3.5 w-3.5" />
                      {etiket}
                    </span>
                  ) : (
                    etiket
                  )}
                </button>
              ))}
            </div>
            <span className="h-5 w-px shrink-0 bg-slate-200" />
            {BOLGELER.map((b) => (
              <button
                key={b}
                onClick={() => setBolge(b)}
                aria-pressed={bolge === b}
                className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  bolge === b
                    ? "border-sky-300 bg-sky-50 text-sky-800"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          {sonuclar.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-400">
              Sonuç bulunamadı
            </p>
          ) : (
            <ul>
              {sonuclar.map((il, i) => {
                const alim = alimGetir(il, donem);
                const { renk } = puanRengi(alim ? alim.taban : null, ist);
                const secili = secililer.includes(il.plaka);
                const sonuc = uygunlukSonucu(
                  puan !== null && alim ? puan - alim.taban : null
                );
                return (
                  <li
                    key={il.plaka}
                    id={`${listeId}-${il.plaka}`}
                    role="option"
                    aria-selected={i === etkinVurgu}
                  >
                    <button
                      onClick={() => sec(il.plaka)}
                      className={`flex w-full items-center gap-2.5 border-b border-slate-100 px-3 py-2 text-left transition ${
                        secili ? "bg-sky-50/70" : "bg-white active:bg-slate-100"
                      } ${aktif === il.plaka ? "border-l-4 border-l-sky-500" : "border-l-4 border-l-transparent"}`}
                    >
                      <span
                        className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/5"
                        style={{
                          background: alim ? renk : ALIM_YOK_RENK,
                        }}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-slate-800">
                          {il.ad}
                        </span>
                        <span className="block text-xs text-slate-400">
                          {il.bolge}
                          {alim ? ` · ${alim.kontenjan} kadro` : " · alım yok"}
                        </span>
                      </span>
                      {puan !== null && (
                        <span
                          className="shrink-0 rounded-full px-2 py-0.5 text-[0.625rem] font-semibold"
                          style={{
                            background:
                              sonuc.anahtar === "yok" ? "#94a3b8" : sonuc.renk,
                            color:
                              sonuc.anahtar === "sinirda" ? "#422006" : "#fff",
                          }}
                        >
                          {sonuc.etiket}
                        </span>
                      )}
                      <span className="w-14 shrink-0 text-right">
                        <span className="block text-sm font-semibold tabular-nums text-slate-900">
                          {alim ? puanStr(alim.taban) : "—"}
                        </span>
                        <span className="block text-[0.625rem] text-slate-400">
                          taban
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex items-center gap-2 bg-white px-3 py-2 text-xs text-slate-500">
            <span>kolay</span>
            <span
              className="h-2 flex-1 rounded-full"
              style={{
                background: `linear-gradient(to right, ${PUAN_RAMP.join(", ")})`,
              }}
            />
            <span>zor</span>
            <span className="tabular-nums text-slate-400">
              {puanStr(ist.min)}–{puanStr(ist.max)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
