import datasetJson from "@/data/provinces.generated.json";
import kaynaklarJson from "@/data/kaynaklar.generated.json";
import { slugla } from "./metin";
import type { Alim, Dataset, Il, KaynakBilgileri } from "./types";

export const dataset = datasetJson as unknown as Dataset;
export const kaynakBilgileri = kaynaklarJson as KaynakBilgileri;

export const meta = dataset.meta;

export const ilSirali = [...dataset.iller].sort((a, b) => a.ad.localeCompare(b.ad, "tr"));

export const ilHaritasi = new Map(dataset.iller.map((il) => [il.plaka, il]));

export function ilSlug(il: Il): string {
  return slugla(il.ad);
}

export const slugHaritasi = new Map(
  dataset.iller.map((il) => [ilSlug(il), il])
);

export function alimGetir(
  il: { alimlar: Alim[] },
  donem: string
): Alim | undefined {
  return il.alimlar.find((a) => a.donem === donem);
}

export interface DonemIstatistik {
  donem: string;
  min: number;
  max: number;
  kadro: number;
  tabanlar: number[];
}

const istCache = new Map<string, DonemIstatistik>();

export function donemIstatistigi(donem: string): DonemIstatistik {
  const cached = istCache.get(donem);
  if (cached) return cached;
  const alimlar = dataset.iller
    .map((il) => alimGetir(il, donem))
    .filter((a): a is Alim => Boolean(a));
  const tabanlar = alimlar.map((a) => a.taban).sort((a, b) => a - b);
  const ist: DonemIstatistik = {
    donem,
    min: tabanlar[0] ?? 0,
    max: tabanlar[tabanlar.length - 1] ?? 0,
    kadro: alimlar.reduce((s, a) => s + a.kontenjan, 0),
    tabanlar,
  };
  istCache.set(donem, ist);
  return ist;
}

export function tabanYuzdeligi(donem: string, taban: number): number {
  const { tabanlar } = donemIstatistigi(donem);
  if (tabanlar.length === 0) return 0.5;
  const kucukEsit = tabanlar.filter((t) => t <= taban).length;
  return kucukEsit / tabanlar.length;
}

export const medyanKira = (() => {
  const kiralar = dataset.iller
    .map((il) => il.kira)
    .filter((k): k is number => k !== null)
    .sort((a, b) => a - b);
  if (kiralar.length === 0) return 0;
  const orta = kiralar.length >> 1;
  return kiralar.length % 2 === 1
    ? kiralar[orta]
    : (kiralar[orta - 1] + kiralar[orta]) / 2;
})();

export function dogumOrani(il: Il): number {
  return (il.dogum / il.nufus) * 1000;
}

export const trDogumOrani = (() => {
  const dogum = dataset.iller.reduce((s, il) => s + il.dogum, 0);
  const nufus = dataset.iller.reduce((s, il) => s + il.nufus, 0);
  return (dogum / nufus) * 1000;
})();

export const genelPuanAraligi = (() => {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const donem of meta.donemler) {
    const ist = donemIstatistigi(donem);
    min = Math.min(min, ist.min);
    max = Math.max(max, ist.max);
  }
  return { min: Math.floor(min), max: Math.ceil(max) };
})();

export function donemKadro(donem: string): number {
  return meta.kadroToplam[donem] ?? 0;
}
