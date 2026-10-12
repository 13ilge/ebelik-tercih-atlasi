"use client";

import { useId, useMemo, useRef, useState } from "react";
import { Plus, Search } from "lucide-react";
import { alimGetir, ilSirali } from "@/lib/data";
import { normTr } from "@/lib/metin";
import { puanStr } from "@/lib/format";

export default function IlAraEkle({
  secililer,
  donem,
  onEkle,
  genis,
}: {
  secililer: number[];
  donem: string;
  onEkle: (plaka: number) => void;
  genis?: boolean;
}) {
  const [sorgu, setSorgu] = useState("");
  const [acik, setAcik] = useState(false);
  const [vurgu, setVurgu] = useState(0);
  const kapsayiciRef = useRef<HTMLDivElement>(null);
  const listeId = useId();

  const sonuclar = useMemo(() => {
    const nq = normTr(sorgu.trim());
    if (!nq) return [];
    const uyanlar = ilSirali.filter(
      (il) => !secililer.includes(il.plaka) && normTr(il.ad).includes(nq)
    );
    const oncelik = (ad: string) => (normTr(ad).startsWith(nq) ? 0 : 1);
    return [...uyanlar]
      .sort((a, b) => oncelik(a.ad) - oncelik(b.ad))
      .slice(0, 8);
  }, [sorgu, secililer]);

  const goster = acik && sorgu.trim().length > 0;
  const etkinVurgu =
    sonuclar.length === 0 ? -1 : Math.min(vurgu, sonuclar.length - 1);

  const sec = (plaka: number) => {
    onEkle(plaka);
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
    <div ref={kapsayiciRef} onBlur={odakCikti} className="relative">
      <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1.5 focus-within:border-sky-400">
        {sorgu && !goster ? (
          <Plus className="h-3.5 w-3.5 text-sky-600" />
        ) : (
          <Search className="h-3.5 w-3.5 text-slate-400" />
        )}
        <input
          value={sorgu}
          onChange={(e) => {
            setSorgu(e.target.value);
            setAcik(true);
            setVurgu(0);
          }}
          onFocus={() => setAcik(true)}
          onKeyDown={tusla}
          role="combobox"
          aria-expanded={goster}
          aria-controls={listeId}
          aria-autocomplete="list"
          aria-activedescendant={
            goster && etkinVurgu >= 0
              ? `${listeId}-${sonuclar[etkinVurgu].plaka}`
              : undefined
          }
          aria-label="İl ara ve ekle"
          placeholder="İl ara ve ekle…"
          className={`bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 ${
            genis ? "w-full" : "w-36 sm:w-44"
          }`}
        />
      </div>
      {goster && (
        <ul
          id={listeId}
          role="listbox"
          aria-label="İl önerileri"
          className={`absolute left-0 top-full z-40 mt-1 max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg ${
            genis ? "w-full" : "w-56"
          }`}
        >
          {sonuclar.length === 0 ? (
            <li
              role="presentation"
              className="px-3 py-2 text-sm text-slate-400"
            >
              Sonuç bulunamadı
            </li>
          ) : (
            sonuclar.map((il, i) => {
              const alim = alimGetir(il, donem);
              return (
                <li
                  key={il.plaka}
                  id={`${listeId}-${il.plaka}`}
                  role="option"
                  aria-selected={i === etkinVurgu}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => sec(il.plaka)}
                  onMouseEnter={() => setVurgu(i)}
                  className={`flex cursor-pointer items-center justify-between gap-2 px-3 py-1.5 text-left text-sm text-slate-700 ${
                    i === etkinVurgu ? "bg-sky-50" : ""
                  }`}
                >
                  <span>
                    <span className="font-medium">{il.ad}</span>
                    <span className="ml-1.5 text-slate-400">{il.bolge}</span>
                  </span>
                  <span className="tabular-nums text-slate-500">
                    {alim ? puanStr(alim.taban) : "—"}
                  </span>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
