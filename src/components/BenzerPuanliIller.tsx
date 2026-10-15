"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { isaretli, puanStr, tl } from "@/lib/format";

export interface BenzerIl {
  plaka: number;
  ad: string;
  slug: string;
  bolge: string;
  taban: number;
  kontenjan: number;
  kira: number | null;
  fark: number;
}

function farkSinifi(fark: number): string {
  if (Math.abs(fark) < 0.05) return "bg-slate-100 text-slate-600";
  return fark > 0
    ? "bg-amber-50 text-amber-700"
    : "bg-emerald-50 text-emerald-700";
}

export default function BenzerPuanliIller({
  donem,
  taban,
  iller,
}: {
  donem: string;
  taban: number;
  iller: BenzerIl[];
}) {
  const kaydirmaRef = useRef<HTMLDivElement>(null);

  if (iller.length === 0) return null;

  const kaydir = (yon: -1 | 1) => {
    const el = kaydirmaRef.current;
    if (!el) return;
    el.scrollBy({
      left: yon * Math.round(el.clientWidth * 0.8),
      behavior: "smooth",
    });
  };

  return (
    <section className="mt-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Yakın puanlı iller
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {donem} taban puanı {puanStr(taban)}; en yakın puanlı diğer iller.
            Kartları yana kaydırabilirsin.
          </p>
        </div>
        <div className="hidden shrink-0 gap-1.5 sm:flex">
          <button
            onClick={() => kaydir(-1)}
            aria-label="Önceki iller"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-sky-300 hover:text-sky-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => kaydir(1)}
            aria-label="Sonraki iller"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-sky-300 hover:text-sky-800"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div
        ref={kaydirmaRef}
        role="region"
        aria-roledescription="karusel"
        aria-label="Yakın puanlı iller listesi"
        className="-mx-4 mt-3 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {iller.map((x) => (
          <Link
            key={x.plaka}
            href={`/il/${x.slug}`}
            className="w-52 shrink-0 snap-start rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-sky-300 hover:shadow"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-semibold text-slate-900">
                {x.ad}
              </span>
              <span
                className={`shrink-0 rounded-full px-1.5 py-0.5 text-[0.625rem] font-semibold tabular-nums ${farkSinifi(
                  x.fark
                )}`}
              >
                {Math.abs(x.fark) < 0.05 ? "±0,0" : isaretli(x.fark)}
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold tabular-nums text-slate-900">
              {puanStr(x.taban)}
            </div>
            <div className="text-xs text-slate-500">
              {x.kontenjan} kadro · {x.bolge}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {x.kira !== null ? tl(x.kira) : "kira verisi yok"}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
