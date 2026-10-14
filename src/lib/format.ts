const sayiFmt = new Intl.NumberFormat("tr-TR");

export function sayi(n: number): string {
  return sayiFmt.format(n);
}

export function puanStr(n: number, basamak = 1): string {
  return n.toFixed(basamak).replace(".", ",");
}

export function tl(n: number): string {
  return `${sayi(n)} TL`;
}

export function yuzde(x: number): string {
  return `%${Math.round(x * 100)}`;
}

const tarihFmt = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function tarihStr(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : tarihFmt.format(d);
}

export function isaretli(n: number): string {
  const s = puanStr(Math.abs(n));
  return n >= 0 ? `+${s}` : `-${s}`;
}
