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

export function listeTuvaliCiz(
  opts: ListeTuvaliSecenekleri,
  W = 1080
): HTMLCanvasElement {
  const ol = W / 1080;
  const SATIR = 64 * ol;
  const UST = 210 * ol;
  const ALT = 158 * ol;
  const H = Math.round(UST + opts.satirlar.length * SATIR + ALT);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
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
    ctx.fillStyle = "#e0f2fe";
    ctx.beginPath();
    ctx.arc(74 * ol, y, 20 * ol, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#075985";
    ctx.font = `700 ${Math.round(24 * ol)}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(String(s.sira), 74 * ol, y + 1);
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

  const altY = UST + opts.satirlar.length * SATIR;
  ctx.fillStyle = "#94a3b8";
  ctx.fillRect(48 * ol, altY + 26 * ol, W - 96 * ol, 1);
  ctx.fillStyle = "#64748b";
  ctx.font = `400 ${Math.round(22 * ol)}px Arial, sans-serif`;
  const satirlarDipnot =
    opts.dipnot.match(/.{1,86}(\s|$)/g) ?? [opts.dipnot];
  satirlarDipnot.slice(0, 2).forEach((satir, i) => {
    ctx.fillText(satir.trim(), 48 * ol, altY + 62 * ol + i * 32 * ol);
  });

  ctx.fillStyle = "#0369a1";
  ctx.font = `700 ${Math.round(22 * ol)}px Arial, sans-serif`;
  ctx.textAlign = "right";
  ctx.fillText("Ebelik Tercih Atlası", W - 48 * ol, altY + 128 * ol);
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
