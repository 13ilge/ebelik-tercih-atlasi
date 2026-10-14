export interface ListeSatiri {
  sira: number;
  ad: string;
  sag: string;
}

export interface ListeTuvaliSecenekleri {
  baslik: string;
  altBaslik: string;
  satirlar: ListeSatiri[];
  dipnot: string;
}

let monoAilesi: string | null = null;

function monoAile(): string {
  if (monoAilesi) return monoAilesi;
  if (typeof document === "undefined") return "monospace";
  const el = document.createElement("span");
  el.className = "font-mono";
  el.style.position = "absolute";
  el.style.visibility = "hidden";
  document.body.appendChild(el);
  monoAilesi = getComputedStyle(el).fontFamily || "monospace";
  el.remove();
  return monoAilesi;
}

function sarmala(
  ctx: CanvasRenderingContext2D,
  metin: string,
  maksGenislik: number
): string[] {
  const satirlar: string[] = [];
  let satir = "";
  for (const kelime of metin.split(/\s+/).filter(Boolean)) {
    const deneme = satir ? `${satir} ${kelime}` : kelime;
    if (satir && ctx.measureText(deneme).width > maksGenislik) {
      satirlar.push(satir);
      satir = kelime;
    } else {
      satir = deneme;
    }
  }
  if (satir) satirlar.push(satir);
  return satirlar;
}

export function listeTuvaliCiz(
  opts: ListeTuvaliSecenekleri,
  W = 1080,
  minYukseklik?: number
): HTMLCanvasElement {
  const ol = W / 1080;
  const SATIR = 64 * ol;
  const UST = 210 * ol;
  const dipnotYazisi = `400 ${Math.round(22 * ol)}px Arial, sans-serif`;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  const ctx = canvas.getContext("2d");
  if (ctx) ctx.font = dipnotYazisi;
  const satirlarDipnot = ctx
    ? sarmala(ctx, opts.dipnot, W - 96 * ol)
    : opts.dipnot.split(/\s+/).filter(Boolean);
  const dipnotSatirSayisi = Math.max(satirlarDipnot.length, 1);
  const ALT = (158 + Math.max(0, dipnotSatirSayisi - 2) * 32) * ol;
  const icerikY = UST + opts.satirlar.length * SATIR + ALT;
  const H = Math.round(Math.max(icerikY, minYukseklik ?? 0));
  canvas.height = H;
  if (!ctx) return canvas;

  ctx.textBaseline = "middle";

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#0369a1";
  ctx.fillRect(0, 0, W, 12 * ol);

  ctx.fillStyle = "#020617";
  ctx.font = `700 ${Math.round(46 * ol)}px Arial, sans-serif`;
  ctx.fillText(opts.baslik, 48 * ol, 84 * ol);

  ctx.fillStyle = "#475569";
  ctx.font = `400 ${Math.round(26 * ol)}px Arial, sans-serif`;
  ctx.fillText(opts.altBaslik, 48 * ol, 138 * ol);

  ctx.fillStyle = "#0ea5e9";
  ctx.fillRect(48 * ol, 176 * ol, W - 96 * ol, 3 * ol);

  opts.satirlar.forEach((s, i) => {
    const y = UST + i * SATIR + SATIR / 2;
    if (i % 2 === 0) {
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, UST + i * SATIR, W, SATIR);
    }
    ctx.fillStyle = "#64748b";
    ctx.font = `600 ${Math.round(24 * ol)}px ${monoAile()}, monospace`;
    ctx.textAlign = "right";
    ctx.fillText(`${s.sira}.`, 88 * ol, y + 1);
    ctx.textAlign = "left";

    ctx.fillStyle = "#0f172a";
    ctx.font = `600 ${Math.round(30 * ol)}px Arial, sans-serif`;
    ctx.fillText(s.ad, 112 * ol, y);

    ctx.fillStyle = "#334155";
    ctx.font = `400 ${Math.round(27 * ol)}px Arial, sans-serif`;
    ctx.textAlign = "right";
    ctx.fillText(s.sag, W - 48 * ol, y);
    ctx.textAlign = "left";
  });

  const altY = H;
  const dipnotIlkSatirY =
    altY - 64 * ol - (dipnotSatirSayisi - 1) * 32 * ol;
  ctx.fillStyle = "#94a3b8";
  ctx.fillRect(48 * ol, dipnotIlkSatirY - 36 * ol, W - 96 * ol, 1);
  ctx.fillStyle = "#64748b";
  ctx.font = dipnotYazisi;
  satirlarDipnot.forEach((satir, i) => {
    ctx.fillText(satir, 48 * ol, dipnotIlkSatirY + i * 32 * ol);
  });

  ctx.fillStyle = "#0369a1";
  ctx.font = `700 ${Math.round(22 * ol)}px Arial, sans-serif`;
  ctx.textAlign = "right";
  ctx.fillText("Ebelik Tercih Atlası", W - 48 * ol, altY - 30 * ol);
  ctx.textAlign = "left";

  return canvas;
}

export function tuvalIndir(canvas: HTMLCanvasElement, dosyaAdi: string) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = dosyaAdi;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }, "image/png");
}
