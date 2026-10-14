import { listeTuvaliCiz, type ListeSatiri } from "./liste-tuval";

const A4_GENISLIK = 595.28;
const A4_YUKSEKLIK = 841.89;
const KENAR = 24;

function jpegBaytlari(
  canvas: HTMLCanvasElement
): Promise<Uint8Array<ArrayBuffer>> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Tuval görüntüye çevrilemedi"));
          return;
        }
        blob
          .arrayBuffer()
          .then((tampon) => resolve(new Uint8Array(tampon)), reject);
      },
      "image/jpeg",
      0.92
    );
  });
}

function pdfMetin(s: string): string {
  if (/^[\x20-\x7e]*$/.test(s)) {
    return `(${s.replace(/[\\()]/g, (m) => `\\${m}`)})`;
  }
  let hex = "feff";
  for (const ch of s) {
    const cp = ch.codePointAt(0) ?? 0;
    if (cp > 0xffff) {
      const kalan = cp - 0x10000;
      hex += (0xd800 + (kalan >> 10)).toString(16).padStart(4, "0");
      hex += (0xdc00 + (kalan & 0x3ff)).toString(16).padStart(4, "0");
    } else {
      hex += cp.toString(16).padStart(4, "0");
    }
  }
  return `<${hex}>`;
}

function pdfTarihi(d: Date): string {
  return `D:${d
    .toISOString()
    .replace(/[-:T]/g, "")
    .slice(0, 14)}Z`;
}

function pdfOlustur(
  jpeg: Uint8Array<ArrayBuffer>,
  goruntuG: number,
  goruntuY: number,
  bilgi: { baslik: string; konu: string }
): Blob {
  const kodlayici = new TextEncoder();
  const parcalar: BlobPart[] = [];
  const ofsetler: number[] = [];
  let konum = 0;

  const metinEkle = (s: string) => {
    const b = kodlayici.encode(s);
    parcalar.push(b);
    konum += b.length;
  };
  const baytEkle = (b: Uint8Array<ArrayBuffer>) => {
    parcalar.push(b);
    konum += b.length;
  };

  metinEkle("%PDF-1.4\n");

  ofsetler[1] = konum;
  metinEkle("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  ofsetler[2] = konum;
  metinEkle("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");

  ofsetler[3] = konum;
  metinEkle(
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " +
      `${A4_GENISLIK} ${A4_YUKSEKLIK}` +
      "] /Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>\nendobj\n"
  );

  const kullanilabilirG = A4_GENISLIK - KENAR * 2;
  const kullanilabilirY = A4_YUKSEKLIK - KENAR * 2;
  let cizimG = kullanilabilirG;
  let cizimY = kullanilabilirG * (goruntuY / goruntuG);
  if (cizimY > kullanilabilirY) {
    cizimY = kullanilabilirY;
    cizimG = kullanilabilirY * (goruntuG / goruntuY);
  }
  const x = (A4_GENISLIK - cizimG) / 2;
  const y = A4_YUKSEKLIK - KENAR - cizimY;
  const icerik = `q ${cizimG.toFixed(2)} 0 0 ${cizimY.toFixed(
    2
  )} ${x.toFixed(2)} ${y.toFixed(2)} cm /Im0 Do Q`;

  ofsetler[4] = konum;
  metinEkle(
    `4 0 obj\n<< /Length ${kodlayici.encode(icerik).length} >>\nstream\n${icerik}\nendstream\nendobj\n`
  );

  ofsetler[5] = konum;
  metinEkle(
    `5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${goruntuG} /Height ${goruntuY} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`
  );
  baytEkle(jpeg);
  metinEkle("\nendstream\nendobj\n");

  ofsetler[6] = konum;
  metinEkle(
    "6 0 obj\n<< /Title " +
      pdfMetin(bilgi.baslik) +
      " /Author " +
      pdfMetin("Ebelik Tercih Atlası") +
      " /Subject " +
      pdfMetin(bilgi.konu) +
      " /Creator " +
      pdfMetin("Ebelik Tercih Atlası") +
      " /Producer " +
      pdfMetin("Ebelik Tercih Atlası") +
      " /CreationDate (" +
      pdfTarihi(new Date()) +
      ") >>\nendobj\n"
  );

  const xrefKonum = konum;
  let xref = "xref\n0 7\n0000000000 65535 f \n";
  for (let i = 1; i <= 6; i++) {
    xref += `${String(ofsetler[i]).padStart(10, "0")} 00000 n \n`;
  }
  xref += `trailer\n<< /Size 7 /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xrefKonum}\n%%EOF`;
  metinEkle(xref);

  return new Blob(parcalar, { type: "application/pdf" });
}

export async function listePdfIndir(opts: {
  baslik: string;
  altBaslik: string;
  satirlar: ListeSatiri[];
  dipnot: string;
  dosyaAdi: string;
}) {
  const kullanilabilirG = A4_GENISLIK - KENAR * 2;
  const kullanilabilirY = A4_YUKSEKLIK - KENAR * 2;
  const canvas = listeTuvaliCiz(
    opts,
    1600,
    1600 * (kullanilabilirY / kullanilabilirG)
  );
  const jpeg = await jpegBaytlari(canvas);
  const pdf = pdfOlustur(jpeg, canvas.width, canvas.height, {
    baslik: opts.baslik,
    konu: opts.altBaslik,
  });
  const url = URL.createObjectURL(pdf);
  const a = document.createElement("a");
  a.href = url;
  a.download = opts.dosyaAdi;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
