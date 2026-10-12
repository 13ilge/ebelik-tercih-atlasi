export interface PngSatiri {
  sira: number;
  ad: string;
  sag: string;
}

export function listePngIndir(opts: {
  baslik: string;
  altBaslik: string;
  satirlar: PngSatiri[];
  dipnot: string;
  dosyaAdi: string;
}) {
  const W = 1080;
  const SATIR = 64;
  const UST = 210;
  const ALT = 158;
  const H = UST + opts.satirlar.length * SATIR + ALT;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.textBaseline = "middle";

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#0369a1";
  ctx.fillRect(0, 0, W, 12);

  ctx.fillStyle = "#020617";
  ctx.font = "700 46px Arial, sans-serif";
  ctx.fillText(opts.baslik, 48, 84);

  ctx.fillStyle = "#475569";
  ctx.font = "400 26px Arial, sans-serif";
  ctx.fillText(opts.altBaslik, 48, 138);

  ctx.fillStyle = "#0ea5e9";
  ctx.fillRect(48, 176, W - 96, 3);

  opts.satirlar.forEach((s, i) => {
    const y = UST + i * SATIR + SATIR / 2;
    if (i % 2 === 0) {
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, UST + i * SATIR, W, SATIR);
    }
    ctx.fillStyle = "#e0f2fe";
    ctx.beginPath();
    ctx.arc(74, y, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#075985";
    ctx.font = "700 24px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(s.sira), 74, y + 1);
    ctx.textAlign = "left";

    ctx.fillStyle = "#0f172a";
    ctx.font = "600 30px Arial, sans-serif";
    ctx.fillText(s.ad, 112, y);

    ctx.fillStyle = "#334155";
    ctx.font = "400 27px Arial, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(s.sag, W - 48, y);
    ctx.textAlign = "left";
  });

  const altY = UST + opts.satirlar.length * SATIR;
  ctx.fillStyle = "#94a3b8";
  ctx.fillRect(48, altY + 26, W - 96, 1);
  ctx.fillStyle = "#64748b";
  ctx.font = "400 22px Arial, sans-serif";
  const satirlarDipnot = opts.dipnot.match(/.{1,86}(\s|$)/g) ?? [opts.dipnot];
  satirlarDipnot.slice(0, 2).forEach((satir, i) => {
    ctx.fillText(satir.trim(), 48, altY + 62 + i * 32);
  });

  ctx.fillStyle = "#0369a1";
  ctx.font = "700 22px Arial, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("Ebelik Tercih Atlası", W - 48, altY + 128);
  ctx.textAlign = "left";

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = opts.dosyaAdi;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }, "image/png");
}
