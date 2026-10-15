"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ChevronDown, X } from "lucide-react";
import { donemKadro, ilHaritasi, meta, slugHaritasi } from "@/lib/data";
import { sayi } from "@/lib/format";
import { puanAyristir } from "@/lib/puan";
import type { Mod } from "@/lib/types";
import AltPanel from "./AltPanel";
import KaynakModal from "./KaynakModal";
import Logo from "./Logo";
import MobilIlArama from "./MobilIlArama";

const TurkiyeHaritasi = dynamic(() => import("./TurkiyeHaritasi"), {
  ssr: false,
  loading: () => (
    <div
      role="status"
      className="flex h-full items-center justify-center text-sm text-slate-400"
    >
      Harita yükleniyor…
    </div>
  ),
});

interface KayitliDurum {
  secililer: number[];
  aktif: number | null;
  puanMetni: string;
  donem: string;
  modDegisken: Mod;
}

const KAYIT_ANAHTARI = "ebelik-tercih-atlasi-v1";

let imlecMedya: MediaQueryList | null = null;
function imlecMedyaAl() {
  if (!imlecMedya) {
    imlecMedya = window.matchMedia("(hover: hover) and (min-width: 1024px)");
  }
  return imlecMedya;
}

let mobilMedya: MediaQueryList | null = null;
function mobilMedyaAl() {
  if (!mobilMedya) {
    mobilMedya = window.matchMedia("(max-width: 767px)");
  }
  return mobilMedya;
}

export default function TercihMotoru() {
  const [donem, setDonem] = useState(meta.varsayilanDonem);
  const [puanMetni, setPuanMetni] = useState("");
  const [modDegisken, setModDegisken] = useState<Mod>("puan");
  const [secililer, setSecililer] = useState<number[]>([]);
  const [aktif, setAktif] = useState<number | null>(null);
  const [karsilastir, setKarsilastir] = useState(false);
  const [kaynakAcik, setKaynakAcik] = useState(false);
  const [cekmece, setCekmece] = useState(false);
  const [yuklendi, setYuklendi] = useState(false);

  const imlecAbone = useCallback((cb: () => void) => {
    const mq = imlecMedyaAl();
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
  }, []);
  const imlecVar = useSyncExternalStore(
    imlecAbone,
    () => imlecMedyaAl().matches,
    () => false
  );

  const mobilAbone = useCallback((cb: () => void) => {
    const mq = mobilMedyaAl();
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
  }, []);
  const mobilVar = useSyncExternalStore(
    mobilAbone,
    () => mobilMedyaAl().matches,
    () => false
  );

  const puan = puanAyristir(puanMetni);
  const etkinMod: Mod = puan === null ? "puan" : modDegisken;
  const puanGecersiz = puanMetni.trim().length > 0 && puan === null;

  useEffect(() => {
    const yukle = () => {
      try {
        const ham = window.localStorage.getItem(KAYIT_ANAHTARI);
        if (ham) {
          const kayit = JSON.parse(ham) as Partial<KayitliDurum>;
          if (Array.isArray(kayit.secililer)) {
            const plakalar = [
              ...new Set(
                kayit.secililer.filter(
                  (n) => typeof n === "number" && ilHaritasi.has(n)
                )
              ),
            ];
            if (plakalar.length > 0) {
              setSecililer(plakalar);
              setAktif(
                typeof kayit.aktif === "number" &&
                  plakalar.includes(kayit.aktif)
                  ? kayit.aktif
                  : plakalar[plakalar.length - 1]
              );
            }
          }
          if (
            typeof kayit.puanMetni === "string" &&
            puanAyristir(kayit.puanMetni) !== null
          ) {
            setPuanMetni(kayit.puanMetni);
            setModDegisken(kayit.modDegisken === "puan" ? "puan" : "uygunluk");
          }
          if (
            typeof kayit.donem === "string" &&
            meta.donemler.includes(kayit.donem)
          ) {
            setDonem(kayit.donem);
          }
        }
      } catch {
        /* bozuk kayıt yok sayılır */
      }

      const p = new URLSearchParams(window.location.search);
      const donemP = p.get("donem");
      if (donemP && meta.donemler.includes(donemP)) setDonem(donemP);
      const puanP = p.get("puan");
      if (puanP) {
        const s = puanAyristir(puanP);
        if (s !== null) {
          setPuanMetni(String(s).replace(".", ","));
          setModDegisken("uygunluk");
        }
      }
      const listeP = p.get("liste");
      if (listeP) {
        const plakalar = [
          ...new Set(
            listeP
              .split(",")
              .map((s) => Number.parseInt(s, 10))
              .filter((n) => ilHaritasi.has(n))
          ),
        ];
        if (plakalar.length > 0) {
          setSecililer(plakalar);
          setAktif(plakalar[plakalar.length - 1]);
        }
      }
      const ilP = p.get("il");
      if (ilP) {
        const il = slugHaritasi.get(ilP);
        if (il) {
          setSecililer((prev) =>
            prev.includes(il.plaka) ? prev : [...prev, il.plaka]
          );
          setAktif(il.plaka);
        }
      }
      if (p.toString()) {
        window.history.replaceState(null, "", window.location.pathname);
      }
      setYuklendi(true);
    };
    yukle();
  }, []);

  useEffect(() => {
    if (!yuklendi) return;
    try {
      const kayit: KayitliDurum = {
        secililer,
        aktif,
        puanMetni,
        donem,
        modDegisken,
      };
      window.localStorage.setItem(KAYIT_ANAHTARI, JSON.stringify(kayit));
    } catch {
      /* depolama kapalıysa sessizce geç */
    }
  }, [yuklendi, secililer, aktif, puanMetni, donem, modDegisken]);

  const ekle = (plaka: number) => {
    if (secililer.includes(plaka)) {
      setAktif(plaka);
      setKarsilastir(false);
      return;
    }
    setSecililer([...secililer, plaka]);
    setAktif(plaka);
    setKarsilastir(false);
  };

  const cikar = (plaka: number) => {
    const yeni = secililer.filter((p) => p !== plaka);
    setSecililer(yeni);
    if (aktif === plaka) setAktif(yeni.length > 0 ? yeni[yeni.length - 1] : null);
    if (yeni.length < 2) setKarsilastir(false);
  };

  const temizle = () => {
    setSecililer([]);
    setAktif(null);
    setKarsilastir(false);
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-slate-50">
      <a
        href="#icerik"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-sky-800 focus:shadow-lg"
      >
        Haritayı geç, panele git
      </a>
      <header
        onMouseEnter={() => setCekmece(false)}
        className="z-30 border-b border-slate-200 bg-white/95 px-3 py-2 backdrop-blur sm:px-4 sm:py-2.5"
      >
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-4 gap-y-2">
          <Link href="/" className="shrink-0" aria-label="Ebelik Tercih Atlası ana sayfa">
            <h1>
              <Logo
                mobildeGizle
                mobilKucuk
                altBaslik="KPSS lisans (P3) ebelik atamaları · 81 il"
              />
            </h1>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500 max-sm:sr-only">
              Atama dönemi
            </span>
            <div
              role="group"
              aria-label="Atama dönemi"
              className="hidden rounded-lg border border-slate-200 bg-slate-100 p-0.5 sm:flex"
            >
              {meta.donemler.map((d) => (
                <button
                  key={d}
                  onClick={() => setDonem(d)}
                  aria-pressed={d === donem}
                  className={`rounded-md px-2.5 py-1 text-sm font-medium transition ${
                    d === donem
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-white"
                  }`}
                  title={`${d} döneminde toplam ${donemKadro(d)} ebe kadrosu`}
                >
                  {d}
                  <span
                    className={`ml-1 hidden tabular-nums 2xl:inline ${
                      d === donem ? "text-slate-300" : "text-slate-400"
                    }`}
                  >
                    {sayi(donemKadro(d))}
                  </span>
                </button>
              ))}
            </div>
            <span className="relative sm:hidden">
              <select
                value={donem}
                onChange={(e) => setDonem(e.target.value)}
                aria-label="Atama dönemi"
                title={`${donem} döneminde toplam ${donemKadro(donem)} ebe kadrosu`}
                className="appearance-none rounded-lg border border-slate-200 bg-slate-100 py-1.5 pl-3 pr-8 text-sm font-medium text-slate-800 outline-none"
              >
                {meta.donemler.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            </span>
          </div>

          <div className="flex w-full flex-wrap items-center gap-x-3 gap-y-2 lg:w-auto">
            <label className="flex min-w-0 flex-1 items-center gap-2 sm:flex-none">
              <span className="text-sm font-medium text-slate-500 max-sm:sr-only">
                KPSS P3
              </span>
              <span className="relative min-w-0 flex-1 sm:flex-none">
                <input
                  value={puanMetni}
                  onChange={(e) => {
                    setPuanMetni(e.target.value);
                    setModDegisken("uygunluk");
                  }}
                  inputMode="decimal"
                  placeholder="Puanını gir (örn. 78,456)"
                  aria-invalid={puanGecersiz}
                  className={`w-full rounded-lg border bg-white px-2.5 py-2 pr-7 text-sm tabular-nums text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 sm:w-48 ${
                    puanGecersiz
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : "border-slate-200 focus:border-sky-400 focus:ring-sky-100"
                  }`}
                />
                {puanMetni && (
                  <button
                    onClick={() => setPuanMetni("")}
                    aria-label="Puanı temizle"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </span>
            </label>
            {puanGecersiz && (
              <span className="text-xs font-medium text-red-600">
                40–100 arası
              </span>
            )}

            {puan !== null && (
              <div
                role="group"
                aria-label="Harita görünümü"
                className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 max-sm:w-full"
              >
                <button
                  onClick={() => setModDegisken("puan")}
                  aria-pressed={etkinMod === "puan"}
                  title="Taban puan ısı haritası"
                  className={`rounded-md px-2.5 py-1 text-sm font-medium transition max-sm:flex-1 ${
                    etkinMod === "puan"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Taban
                </button>
                <button
                  onClick={() => setModDegisken("uygunluk")}
                  aria-pressed={etkinMod === "uygunluk"}
                  className={`rounded-md px-2.5 py-1 text-sm font-medium transition max-sm:flex-1 ${
                    etkinMod === "uygunluk"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Puanıma göre
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl min-h-0 flex-1 flex-col">
        {mobilVar ? (
          <div className="shrink-0" onMouseEnter={() => setCekmece(false)}>
            <MobilIlArama
              donem={donem}
              puan={puan}
              secililer={secililer}
              aktif={aktif}
              onSec={ekle}
            />
          </div>
        ) : (
          <div
            className="min-h-0 flex-1"
            onMouseEnter={() => setCekmece(false)}
          >
            <TurkiyeHaritasi
              donem={donem}
              mod={etkinMod}
              puan={puan}
              secililer={secililer}
              aktif={aktif}
              daralt={imlecVar && cekmece}
              onSec={ekle}
              onCikar={cikar}
            />
          </div>
        )}
        <AltPanel
          secililer={secililer}
          aktif={aktif}
          donem={donem}
          puan={puan}
          mobil={mobilVar}
          karsilastir={karsilastir}
          genis={imlecVar && cekmece}
          onFareGiris={() => {
            if (imlecVar) setCekmece(true);
          }}
          onKaynak={() => setKaynakAcik(true)}
          onKarsilastir={setKarsilastir}
          onEkle={ekle}
          onCikar={cikar}
          onAktif={(p) => {
            setAktif(p);
            setKarsilastir(false);
          }}
          onSirala={(yeni) => setSecililer(yeni)}
          onTemizle={temizle}
        />
      </main>

      <KaynakModal acik={kaynakAcik} kapat={() => setKaynakAcik(false)} />
    </div>
  );
}
