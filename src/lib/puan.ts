export const PUAN_MIN = 40;
export const PUAN_MAKS = 100;

export function puanAyristir(s: string): number | null {
  const t = s.trim().replace(/\s/g, "");
  if (!t) return null;
  let c = t;
  if (c.includes(",") && c.includes(".")) {
    c = c.replaceAll(".", "").replace(",", ".");
  } else {
    c = c.replace(",", ".");
  }
  const n = Number(c);
  if (!Number.isFinite(n) || n < PUAN_MIN || n > PUAN_MAKS) return null;
  return n;
}
