import type { DonemIstatistik } from "./data";

export const ALIM_YOK_RENK = "#e2e8f0";

export const HASTANE_RENK: Record<string, string> = {
  kdd: "#e11d48",
  sehir: "#0284c7",
  eah: "#6366f1",
  uni: "#8b5cf6",
  devlet: "#94a3b8",
  diger: "#cbd5e1",
};

export const HASTANE_TUR_ADI: Record<string, string> = {
  kdd: "Kadın doğum / çocuk",
  sehir: "Şehir hastanesi",
  eah: "Eğitim ve araştırma",
  uni: "Üniversite hastanesi",
  devlet: "Devlet hastanesi",
  diger: "Diğer",
};

export const PUAN_RAMP = [
  "#2dd4bf",
  "#a3e635",
  "#facc15",
  "#fb923c",
  "#ef4444",
] as const;

export function puanRengi(
  taban: number | null,
  ist: DonemIstatistik
): { renk: string; dilim: number | null } {
  if (taban === null) return { renk: ALIM_YOK_RENK, dilim: null };
  const aralik = ist.max - ist.min || 1;
  const t = (taban - ist.min) / aralik;
  const dilim = Math.min(4, Math.max(0, Math.floor(t * 5)));
  return { renk: PUAN_RAMP[dilim], dilim };
}

export interface UygunlukSonuc {
  anahtar: "rahat" | "muhtemel" | "sinirda" | "zor" | "yok";
  renk: string;
  etiket: string;
}

export function uygunlukSonucu(margin: number | null): UygunlukSonuc {
  if (margin === null)
    return { anahtar: "yok", renk: ALIM_YOK_RENK, etiket: "Alım yok" };
  if (margin >= 1.5)
    return { anahtar: "rahat", renk: "#059669", etiket: "Rahat" };
  if (margin >= 0)
    return { anahtar: "muhtemel", renk: "#4ade80", etiket: "Muhtemel" };
  if (margin >= -1.5)
    return { anahtar: "sinirda", renk: "#fbbf24", etiket: "Sınırda" };
  return { anahtar: "zor", renk: "#f87171", etiket: "Zor" };
}

export const UYGUNLUK_ACIKLAMA: Record<UygunlukSonuc["anahtar"], string> = {
  rahat: "Puanın son tabanın belirgin üstünde",
  muhtemel: "Puanın son tabana yakın veya üstünde",
  sinirda: "Puanın son tabanın 1,5 puan altına kadar",
  zor: "Puanın son tabanın belirgin altında",
  yok: "Seçili dönemde bu ile ebe kadrosu verilmedi",
};
