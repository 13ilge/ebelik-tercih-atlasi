// Kaynak: Sağlık Bakanlığı KHGM "2. ve 3. basamak kamu sağlık tesisleri" listesi
// (01.02.2022 güncellemesi). Dosya: data/kaynaklar/khgm-2-3-basamak-2022.xls
// İndirme adresi (arşiv): https://web.archive.org/web/20241211233030if_/https://dosyamerkez.saglik.gov.tr/Eklenti/42500/0/kamu-hastaneleri-genel-mudurlugune-bagli-2-ve-3-basamak-kamu-saglik-tesisleri-guncel-listesi-01022022xlsxls.xls
import fs from "node:fs";
import { normTr as norm } from "../src/lib/metin.mjs";
import path from "node:path";
import XLSX from "xlsx";

const root = path.resolve(import.meta.dirname, "..");
const provinces = JSON.parse(
  fs.readFileSync(path.join(root, "data", "provinces.json"), "utf8")
);

const HARIC_TURLER = new Set(["DİŞ", "F.T.R", "GÖZ", "LEPRA"]);

const kanonik = new Map(provinces.map((p) => [norm(p.ad), p.ad]));
const gruplar = new Map(provinces.map((p) => [p.ad, []]));

const wb = XLSX.read(
  fs.readFileSync(
    path.join(root, "data", "kaynaklar", "khgm-2-3-basamak-2022.xls")
  ),
  { type: "buffer" }
);
const ws = wb.Sheets["GÜNCEL TABLO "];
if (!ws) throw new Error("Beklenen sayfa bulunamadı: 'GÜNCEL TABLO '");
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

let alinan = 0;
let haric = 0;
const eslesmeyen = [];

for (const r of rows.slice(1)) {
  const sira = r[0];
  if (typeof sira !== "number") continue;
  const ilHam = String(r[2] ?? "").trim();
  const adHam = String(r[4] ?? "").trim();
  const tur = String(r[6] ?? "").trim();
  if (!adHam) continue;

  const ad = kanonik.get(norm(ilHam));
  if (!ad) {
    eslesmeyen.push(ilHam);
    continue;
  }
  if (HARIC_TURLER.has(tur)) {
    haric++;
    continue;
  }

  const temizAd = adHam
    .replace(/^t\.?c\.?\s*sağlık bakanlığı\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
  gruplar.get(ad).push(temizAd);
  alinan++;
}

if (eslesmeyen.length) {
  console.error("Eşleşmeyen İL değerleri:", eslesmeyen.join(" | "));
  process.exit(1);
}

const bosIller = [...gruplar.entries()]
  .filter(([, liste]) => liste.length === 0)
  .map(([ad]) => ad);
if (bosIller.length) {
  console.warn("Uyarı: hiç tesis bulunamayan iller:", bosIller.join(", "));
}

const cikti = provinces.map((p) => ({ il: p.ad, liste: gruplar.get(p.ad) }));
fs.writeFileSync(
  path.join(root, "data", "hastaneler-khgm.json"),
  JSON.stringify(cikti, null, 0)
);

const enBuyuk = [...gruplar.entries()]
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 3)
  .map(([ad, l]) => `${ad}: ${l.length}`);
console.log(
  `OK: ${alinan} tesis alındı (${haric} tesis tür filtresine takıldı). En kalabalık: ${enBuyuk.join(", ")}`
);
