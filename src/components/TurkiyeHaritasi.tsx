"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Maximize2, Minus, Plus } from "lucide-react";
import {
  alimGetir,
  dataset,
  donemIstatistigi,
  harita,
  ilHaritasi,
} from "@/lib/data";
import {
  ALIM_YOK_RENK,
  PUAN_RAMP,
  UYGUNLUK_ACIKLAMA,
  puanRengi,
  uygunlukSonucu,
} from "@/lib/colors";
import { puanStr, sayi, tl } from "@/lib/format";
import type { Mod } from "@/lib/types";

interface Props {
  donem: string;
  mod: Mod;
  puan: number | null;
  secililer: number[];
  aktif: number | null;
  onSec: (plaka: number) => void;
}

interface FareKonum {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Gorunum {
  k: number;
  x: number;
  y: number;
}

const MIN_K = 1;
const MAKS_K = 8;
const SLACK = 60;

const ETIKET_RENK = "#0f172a";
const VURGU_RENK = "#0369a1";

function sinirla(x: number, y: number, k: number): { x: number; y: number } {
  if (k <= 1.01) return { x: 0, y: 0 };
  return {
    x: Math.min(SLACK, Math.max(harita.width * (1 - k) - SLACK, x)),
    y: Math.min(SLACK, Math.max(harita.height * (1 - k) - SLACK, y)),
  };
}

export default function TurkiyeHaritasi({
  donem,
  mod,
  puan,
  secililer,
  aktif,
  onSec,
}: Props) {
  const kapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [fare, setFare] = useState<FareKonum | null>(null);
  const fareSonRef = useRef<FareKonum | null>(null);
  const fareRafRef = useRef<number | null>(null);
  const [gorunum, setGorunum] = useState<Gorunum>({ k: 1, x: 0, y: 0 });
  const gorunumRef = useRef(gorunum);
  useEffect(() => {
    gorunumRef.current = gorunum;
  }, [gorunum]);

  const bosAbone = useCallback(() => () => {}, []);
  const monte = useSyncExternalStore(
    bosAbone,
    () => true,
    () => false
  );

  const isaretcilerRef = useRef(new Map<number, { x: number; y: number }>());
  const surukleRef = useRef<{ x: number; y: number } | null>(null);
  const pinchRef = useRef<{
    k0: number;
    x0: number;
    y0: number;
    mid0: { x: number; y: number };
    dist0: number;
  } | null>(null);
  const tasindiRef = useRef(false);
  const sonPointerTipiRef = useRef("mouse");
  const sonDokunmaRef = useRef<{ t: number; x: number; y: number } | null>(
    null
  );

  const ist = useMemo(() => donemIstatistigi(donem), [donem]);

  const renkler = useMemo(() => {
    const m = new Map<number, string>();
    for (const il of dataset.iller) {
      const alim = alimGetir(il, donem);
      if (mod === "uygunluk" && puan !== null) {
        m.set(il.plaka, uygunlukSonucu(alim ? puan - alim.taban : null).renk);
      } else {
        m.set(il.plaka, puanRengi(alim ? alim.taban : null, ist).renk);
      }
    }
    return m;
  }, [donem, mod, puan, ist]);

  const clientToView = useCallback((clientX: number, clientY: number) => {
    const el = svgRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    const s = Math.min(rect.width / harita.width, rect.height / harita.height);
    const ox = (rect.width - harita.width * s) / 2;
    const oy = (rect.height - harita.height * s) / 2;
    return {
      x: (clientX - rect.left - ox) / s,
      y: (clientY - rect.top - oy) / s,
    };
  }, []);

  const zoomNoktaya = useCallback(
    (yeniK: number, px: number, py: number) => {
      setGorunum((g) => {
        const k2 = Math.min(MAKS_K, Math.max(MIN_K, yeniK));
        if (k2 === g.k) return g;
        const oran = k2 / g.k;
        const x = px - (px - g.x) * oran;
        const y = py - (py - g.y) * oran;
        const s = sinirla(x, y, k2);
        return { k: k2, x: s.x, y: s.y };
      });
    },
    []
  );

  const sifirla = useCallback(() => setGorunum({ k: 1, x: 0, y: 0 }), []);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const tekerlek = (e: WheelEvent) => {
      e.preventDefault();
      const p = clientToView(e.clientX, e.clientY);
      const faktor = Math.exp(-e.deltaY * 0.0016);
      setGorunum((g) => {
        const k2 = Math.min(MAKS_K, Math.max(MIN_K, g.k * faktor));
        if (k2 === g.k) return g;
        const oran = k2 / g.k;
        const x = p.x - (p.x - g.x) * oran;
        const y = p.y - (p.y - g.y) * oran;
        const s = sinirla(x, y, k2);
        return { k: k2, x: s.x, y: s.y };
      });
    };
    el.addEventListener("wheel", tekerlek, { passive: false });
    return () => el.removeEventListener("wheel", tekerlek);
  }, [clientToView]);

  const pinchHesapla = useCallback(() => {
    const noktalar = [...isaretcilerRef.current.values()];
    if (noktalar.length < 2) return null;
    const [a, b] = noktalar;
    const orta = clientToView((a.x + b.x) / 2, (a.y + b.y) / 2);
    const dist = Math.hypot(a.x - b.x, a.y - b.y);
    return { orta, dist };
  }, [clientToView]);

  const isaretciBasla = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      sonPointerTipiRef.current = e.pointerType;
      isaretcilerRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      tasindiRef.current = false;
      if (isaretcilerRef.current.size === 1) {
        surukleRef.current = { x: e.clientX, y: e.clientY };
        pinchRef.current = null;
      } else if (isaretcilerRef.current.size === 2) {
        const el = svgRef.current;
        if (el) {
          for (const id of isaretcilerRef.current.keys()) {
            try {
              el.setPointerCapture(id);
            } catch {
              /* pointer artık aktif değil */
            }
          }
        }
        const p = pinchHesapla();
        surukleRef.current = null;
        if (p) {
          const g = gorunumRef.current;
          pinchRef.current = {
            k0: g.k,
            x0: g.x,
            y0: g.y,
            mid0: p.orta,
            dist0: Math.max(1, p.dist),
          };
        }
      }
    },
    [pinchHesapla]
  );

  const isaretciHareket = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!isaretcilerRef.current.has(e.pointerId)) return;
      isaretcilerRef.current.set(e.pointerId, {
        x: e.clientX,
        y: e.clientY,
      });

      if (isaretcilerRef.current.size >= 2) {
        setHover(null);
        const p = pinchHesapla();
        const baslangic = pinchRef.current;
        if (p && baslangic) {
          const mid1 = p.orta;
          setGorunum(() => {
            const k2 = Math.min(
              MAKS_K,
              Math.max(MIN_K, baslangic.k0 * (p.dist / baslangic.dist0))
            );
            const wx = (baslangic.mid0.x - baslangic.x0) / baslangic.k0;
            const wy = (baslangic.mid0.y - baslangic.y0) / baslangic.k0;
            const x = mid1.x - wx * k2;
            const y = mid1.y - wy * k2;
            const s = sinirla(x, y, k2);
            return { k: k2, x: s.x, y: s.y };
          });
          tasindiRef.current = true;
        }
        return;
      }

      const surukle = surukleRef.current;
      if (surukle) {
        if (
          Math.hypot(e.clientX - surukle.x, e.clientY - surukle.y) > 5 &&
          gorunumRef.current.k > 1.01
        ) {
          tasindiRef.current = true;
          setHover(null);
          const el = svgRef.current;
          if (el) {
            try {
              el.setPointerCapture(e.pointerId);
            } catch {
              /* pointer artık aktif değil */
            }
          }
        }
        setGorunum((g) => {
          if (g.k <= 1.01) return g;
          const onceki = clientToView(surukle.x, surukle.y);
          const simdi = clientToView(e.clientX, e.clientY);
          const s = sinirla(
            g.x + (simdi.x - onceki.x),
            g.y + (simdi.y - onceki.y),
            g.k
          );
          return { k: g.k, x: s.x, y: s.y };
        });
        surukleRef.current = { x: e.clientX, y: e.clientY };
      }
    },
    [clientToView, pinchHesapla]
  );

  const isaretciBitir = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (tasindiRef.current) setHover(null);
      isaretcilerRef.current.delete(e.pointerId);
      if (isaretcilerRef.current.size < 2) pinchRef.current = null;
      const kalan = [...isaretcilerRef.current.values()];
      surukleRef.current =
        kalan.length === 1 ? { x: kalan[0].x, y: kalan[0].y } : null;

      if (e.pointerType === "touch" && !tasindiRef.current) {
        const simdi = Date.now();
        const onceki = sonDokunmaRef.current;
        if (
          onceki &&
          simdi - onceki.t < 320 &&
          Math.hypot(e.clientX - onceki.x, e.clientY - onceki.y) < 30
        ) {
          const p = clientToView(e.clientX, e.clientY);
          setGorunum((g) => {
            if (g.k > 1.5) return { k: 1, x: 0, y: 0 };
            const k2 = 2.6;
            const oran = k2 / g.k;
            const x = p.x - (p.x - g.x) * oran;
            const y = p.y - (p.y - g.y) * oran;
            const s = sinirla(x, y, k2);
            return { k: k2, x: s.x, y: s.y };
          });
          sonDokunmaRef.current = null;
        } else {
          sonDokunmaRef.current = { t: simdi, x: e.clientX, y: e.clientY };
        }
      }
    },
    [clientToView]
  );

  const tikEngelle = useCallback((e: React.MouseEvent) => {
    if (tasindiRef.current) {
      e.stopPropagation();
      e.preventDefault();
      tasindiRef.current = false;
    }
  }, []);

  const ciftTikla = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (sonPointerTipiRef.current === "touch") return;
      const p = clientToView(e.clientX, e.clientY);
      setGorunum((g) => {
        if (g.k > 1.5) return { k: 1, x: 0, y: 0 };
        const k2 = 2.2;
        const oran = k2 / g.k;
        const x = p.x - (p.x - g.x) * oran;
        const y = p.y - (p.y - g.y) * oran;
        const s = sinirla(x, y, k2);
        return { k: k2, x: s.x, y: s.y };
      });
    },
    [clientToView]
  );

  const fareHareket = useCallback(
    (e: React.MouseEvent) => {
      const rect = kapRef.current?.getBoundingClientRect();
      if (!rect) return;
      fareSonRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        w: rect.width,
        h: rect.height,
      };
      if (fareRafRef.current === null) {
        fareRafRef.current = window.requestAnimationFrame(() => {
          fareRafRef.current = null;
          if (fareSonRef.current) setFare(fareSonRef.current);
        });
      }
      const hedef = e.target as Element | null;
      if (!hedef?.closest?.("[data-il-yolu]")) setHover(null);
    },
    []
  );

  useEffect(() => {
    return () => {
      if (fareRafRef.current !== null) {
        window.cancelAnimationFrame(fareRafRef.current);
      }
    };
  }, []);

  const girildi = useCallback((plaka: number) => setHover(plaka), []);
  const cikildi = useCallback(() => setHover(null), []);

  const hoverIl = hover !== null ? ilHaritasi.get(hover) : undefined;
  const hoverAlim = hoverIl ? alimGetir(hoverIl, donem) : undefined;
  const yakinlastirilabilir = gorunum.k > 1.01;

  return (
    <div
      ref={kapRef}
      onMouseMove={fareHareket}
      onMouseLeave={cikildi}
      className="relative h-full w-full overflow-hidden"
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${harita.width} ${harita.height}`}
        className={`h-full w-full ${
          yakinlastirilabilir ? "cursor-grab active:cursor-grabbing" : ""
        }`}
        preserveAspectRatio="xMidYMid meet"
        style={
          {
            touchAction: "none",
            "--zoom": gorunum.k,
          } as React.CSSProperties
        }
        role="group"
        aria-label="Türkiye ebe atama taban puanları haritası"
        onPointerDown={isaretciBasla}
        onPointerMove={isaretciHareket}
        onPointerUp={isaretciBitir}
        onPointerCancel={isaretciBitir}
        onClickCapture={tikEngelle}
        onDoubleClick={ciftTikla}
      >
        <g
          transform={`translate(${gorunum.x} ${gorunum.y}) scale(${gorunum.k})`}
        >
          <HaritaCizim
            donem={donem}
            mod={mod}
            secililer={secililer}
            aktif={aktif}
            monte={monte}
            hover={hover}
            puan={puan}
            renkler={renkler}
            onSec={onSec}
            onGir={girildi}
            onCik={cikildi}
          />
        </g>
      </svg>

      <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-1">
        <button
          onClick={() =>
            zoomNoktaya(gorunum.k * 1.6, harita.width / 2, harita.height / 2)
          }
          aria-label="Yakınlaştır"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-950"
        >
          <Plus className="h-4.5 w-4.5" />
        </button>
        <button
          onClick={() =>
            zoomNoktaya(gorunum.k / 1.6, harita.width / 2, harita.height / 2)
          }
          disabled={!yakinlastirilabilir}
          aria-label="Uzaklaştır"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-950 disabled:cursor-default disabled:opacity-40"
        >
          <Minus className="h-4.5 w-4.5" />
        </button>
        <button
          onClick={sifirla}
          disabled={!yakinlastirilabilir}
          aria-label="Haritayı sıfırla"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-950 disabled:cursor-default disabled:opacity-40"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {yakinlastirilabilir && (
        <div className="pointer-events-none absolute bottom-[130px] right-3 z-20 rounded-md bg-slate-900/75 px-2 py-1 text-xs text-white backdrop-blur">
          %{Math.round(gorunum.k * 100)} · kaydırarak gez
        </div>
      )}

      {hoverIl && fare && (
        <div
          className="pointer-events-none absolute z-30 w-60 rounded-lg border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur"
          style={{
            left: fare.x > fare.w - 268 ? fare.x - 260 - 16 : fare.x + 16,
            top: Math.min(Math.max(6, fare.y + 16), Math.max(6, fare.h - 176)),
          }}
        >
          <div className="flex items-baseline justify-between">
            <span className="text-base font-semibold text-slate-950">
              {hoverIl.ad}
            </span>
            <span className="text-xs text-slate-500">
              {hoverIl.plaka.toString().padStart(2, "0")} · {hoverIl.bolge}
            </span>
          </div>
          <div className="mt-2 space-y-1 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Taban puan ({donem})</span>
              <span className="font-semibold text-slate-900 tabular-nums">
                {hoverAlim ? puanStr(hoverAlim.taban) : "alım yok"}
              </span>
            </div>
            {hoverAlim && (
              <div className="flex justify-between">
                <span>Kontenjan</span>
                <span className="tabular-nums">{hoverAlim.kontenjan} ebe</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Doğum ({hoverIl.dogumYil})</span>
              <span className="tabular-nums">{sayi(hoverIl.dogum)}</span>
            </div>
            <div className="flex justify-between">
              <span>Ort. kira</span>
              <span className="tabular-nums">{tl(hoverIl.kira)}</span>
            </div>
          </div>
          <div className="mt-2 border-t border-slate-100 pt-1.5 text-xs font-medium text-sky-700">
            {secililer.includes(hoverIl.plaka)
              ? "Seçili — detaylar altta"
              : "Tıkla: detay + listeye ekle"}
          </div>
        </div>
      )}

      <Legend donem={donem} mod={mod} />
    </div>
  );
}

function Legend({ donem, mod }: { donem: string; mod: Mod }) {
  const ist = donemIstatistigi(donem);
  return (
    <div className="absolute bottom-3 left-3 z-20 hidden max-w-64 rounded-lg border border-slate-200 bg-white/92 p-3 text-xs shadow-sm backdrop-blur md:block">
      {mod === "puan" ? (
        <>
          <div className="mb-1.5 font-semibold text-slate-700">
            Taban puan · {donem} ({puanStr(ist.min)}–{puanStr(ist.max)})
          </div>
          <div className="flex overflow-hidden rounded">
            {PUAN_RAMP.map((r) => (
              <span key={r} className="h-3 flex-1" style={{ background: r }} />
            ))}
          </div>
          <div className="mt-0.5 flex justify-between text-slate-500">
            <span>kolay</span>
            <span>zor</span>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-slate-500">
            <span
              className="h-3 w-5 rounded-sm border border-slate-200"
              style={{ background: ALIM_YOK_RENK }}
            />
            bu dönem alım yok
          </div>
          <div className="mt-1.5 text-slate-400">
            Taban puan: dönemde o ile yerleşen en düşük puan
          </div>
        </>
      ) : (
        <>
          <div className="mb-1.5 font-semibold text-slate-700">
            Puanına uygunluk · {donem}
          </div>
          <div className="space-y-1">
            {(
              [
                ["rahat", "Rahat", "#059669"],
                ["muhtemel", "Muhtemel", "#4ade80"],
                ["sinirda", "Sınırda", "#fbbf24"],
                ["zor", "Zor", "#f87171"],
                ["yok", "Alım yok", ALIM_YOK_RENK],
              ] as const
            ).map(([k, ad, r]) => (
              <div key={k} className="flex items-start gap-1.5">
                <span
                  className="mt-0.5 h-3 w-5 shrink-0 rounded-sm border border-slate-200"
                  style={{ background: r }}
                />
                <span className="text-slate-500">
                  <b className="text-slate-700">{ad}</b> —{" "}
                  {UYGUNLUK_ACIKLAMA[k]}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-1.5 text-slate-400">
            Geçmiş taban puana göre tahmin; kesinlik garantisi değildir
          </div>
        </>
      )}
    </div>
  );
}

const HaritaCizim = memo(function HaritaCizim({
  donem,
  mod,
  secililer,
  aktif,
  monte,
  hover,
  puan,
  renkler,
  onSec,
  onGir,
  onCik,
}: {
  donem: string;
  mod: Mod;
  secililer: number[];
  aktif: number | null;
  monte: boolean;
  hover: number | null;
  puan: number | null;
  renkler: Map<number, string>;
  onSec: (plaka: number) => void;
  onGir: (plaka: number) => void;
  onCik: () => void;
}) {
  const hoverPath =
    hover !== null ? harita.iller.find((h) => h.plaka === hover) : undefined;

  return (
    <g>
      {harita.iller.map((h) => {
        const il = ilHaritasi.get(h.plaka);
        const alim = il ? alimGetir(il, donem) : undefined;
        const secili = secililer.includes(h.plaka);
        let aria = h.ad;
        if (alim) {
          aria += `: ${donem} taban puanı ${puanStr(alim.taban)}, ${alim.kontenjan} kadro`;
        } else {
          aria += `: ${donem} döneminde alım yok`;
        }
        if (secili) aria += ", seçili";
        return (
          <path
            key={h.plaka}
            data-il-yolu
            d={h.d}
            fill={renkler.get(h.plaka) ?? ALIM_YOK_RENK}
            stroke={secili ? "#0f172a" : "#ffffff"}
            strokeWidth={secili ? 1.6 : 0.7}
            strokeLinejoin="round"
            role="button"
            aria-label={aria}
            tabIndex={0}
            onClick={() => onSec(h.plaka)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSec(h.plaka);
              }
            }}
            onMouseEnter={() => onGir(h.plaka)}
            onFocus={() => onGir(h.plaka)}
            onBlur={onCik}
            className="cursor-pointer outline-none transition-colors duration-200 focus-visible:opacity-80"
          />
        );
      })}

      {hoverPath && (
        <path
          d={hoverPath.d}
          fill="none"
          stroke="#1c1917"
          strokeWidth={2}
          strokeLinejoin="round"
          className="pointer-events-none"
        />
      )}
      {aktif !== null &&
        aktif !== hover &&
        (() => {
          const a = harita.iller.find((h) => h.plaka === aktif);
          return a ? (
            <path
              d={a.d}
              fill="none"
              stroke="#0284c7"
              strokeWidth={2}
              strokeDasharray="5 3"
              strokeLinejoin="round"
              className="pointer-events-none"
            />
          ) : null;
        })()}

      {monte && (
        <g
          className="pointer-events-none select-none"
          style={{ animation: "etiketGiris 500ms ease-out" }}
        >
        {harita.iller.map((h) => {
          const il = ilHaritasi.get(h.plaka);
          if (!il) return null;
          const alim = alimGetir(il, donem);
          const vurgulu =
            h.plaka === hover || secililer.includes(h.plaka) || h.plaka === aktif;
          const x = h.etiketX ?? h.cx;
          const y = h.etiketY ?? h.cy;
          const tier = h.etiketTier;
          const soluk = tier === "yok" && !vurgulu;
          const adBoyut = 14.5;
          const puanBoyut = 13;
          const halo = 3;
          const gosterPuan = tier === "tam" || vurgulu;
          const puanMetin =
            mod === "uygunluk" && puan !== null
              ? alim
                ? puanStr(puan - alim.taban, 1)
                : "—"
              : alim
                ? puanStr(alim.taban)
                : "—";
          return (
            <text
              key={h.plaka}
              x={x}
              y={gosterPuan ? y - puanBoyut * 0.65 : y}
              textAnchor="middle"
              style={{
                fill: vurgulu ? VURGU_RENK : ETIKET_RENK,
                fontSize: adBoyut,
                fontWeight: 600,
                paintOrder: "stroke",
                stroke: "#ffffff",
                strokeWidth: halo,
                strokeLinejoin: "round",
                opacity: soluk
                  ? "clamp(0, calc((var(--zoom, 1) - 1.8) * 2), 1)"
                  : 1,
              }}
            >
              {il.ad}
              {gosterPuan && (
                <tspan
                  x={x}
                  dy={puanBoyut * 1.15}
                  style={{
                    fontSize: puanBoyut,
                    fontWeight: 500,
                    fill: vurgulu ? VURGU_RENK : "#475569",
                  }}
                >
                  {puanMetin}
                </tspan>
              )}
            </text>
          );
        })}
        </g>
      )}
    </g>
  );
});
