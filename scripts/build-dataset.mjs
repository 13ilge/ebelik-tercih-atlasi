import fs from "node:fs";
import { normTr as norm } from "../src/lib/metin.mjs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (name) =>
  JSON.parse(fs.readFileSync(path.join(root, "data", name), "utf8"));

const provinces = read("provinces.json");
const kpss = read("kpss.json");
const tuik = read("tuik.json");
const kira = read("kira.json");
const goc = read("goc.json");
const hastaneler = read("hastaneler.json");
const hastanelerKhgm = read("hastaneler-khgm.json");
const hastanelerEk = read("hastaneler-ek.json");
const hastanelerUni = read("hastaneler-uni.json");

const index = (arr, field = "il") => {
  const m = new Map();
  for (const item of arr) m.set(norm(item[field]), item);
  return m;
};

const mKpss = new Map();
for (const r of kpss) {
  const key = norm(r.il);
  if (!mKpss.has(key)) mKpss.set(key, []);
  mKpss.get(key).push(r);
}
const mTuik = index(tuik);
const mKira = index(kira);
const mGoc = index(goc);
const mHastane = index(hastaneler);
const mHastaneKhgm = index(hastanelerKhgm);
const mHastaneEk = index(hastanelerEk);
const mHastaneUni = index(hastanelerUni);

const GENEL_KELIMELER = new Set([
  "t.c.",
  "sağlık",
  "bakanlığı",
  "hastanesi",
  "eğitim",
  "eğt",
  "araştırma",
  "araş",
  "ve",
  "hastalıkları",
  "bilkent",
]);

const sadelestir = (ad) =>
  ad
    .replace(/^t\.?c\.?\s*sağlık bakanlığı\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();

const tokenler = (ad) =>
  new Set(
    norm(sadelestir(ad))
      .replace(/[.,;:()/\\-]/g, " ")
      .split(/\s+/)
      .filter((t) => t && !GENEL_KELIMELER.has(t))
  );

const benzer = (a, b) => {
  const na = norm(sadelestir(a));
  const nb = norm(sadelestir(b));
  if (na === nb || na.includes(nb) || nb.includes(na)) return true;
  const ta = tokenler(a);
  const tb = tokenler(b);
  if (ta.size === 0 || tb.size === 0) return false;
  let kesisim = 0;
  for (const t of ta) if (tb.has(t)) kesisim++;
  const jaccard = kesisim / (ta.size + tb.size - kesisim);
  return jaccard >= 0.7;
};

const turBelirle = (ad) => {
  if (/şehir hastanesi/i.test(ad)) return "sehir";
  if (
    /kadın doğum|kadın hastalıkları|kadın sağlığı|kadın ve çocuk|doğumevi|doğum ve çocuk|doğum çocuk|çocuk hastalıkları|çocuk sağlığı/i.test(
      ad
    )
  ) {
    return "kdd";
  }
  if (/eğitim ve araştırma|eğitim araştırma/i.test(ad)) {
    return "eah";
  }
  if (/devlet hastanesi/i.test(ad)) {
    return "devlet";
  }
  return "diger";
};

const TUR_SIRA = { kdd: 0, sehir: 1, eah: 2, uni: 3, devlet: 4, diger: 5 };

const YENI_ADLAR = new Map(
  [
    ["Adana Şehir Hastanesi", "Adana Şehir Eğitim ve Araştırma Hastanesi"],
    ["Aydın Atatürk Devlet Hastanesi", "Aydın Devlet Hastanesi"],
    ["Nurdağı Devlet Hastanesi", "Nurdağı İlçe Devlet Hastanesi"],
    ["Oğuzeli Devlet Hastanesi", "Oğuzeli İlçe Devlet Hastanesi"],
  ].map(([eski, yeni]) => [norm(eski), yeni])
);

function hastaneleriBirlestir(ad) {
  const key = norm(ad);
  const kaynakDizileri = [
    [mHastaneKhgm.get(key)?.liste ?? [], null],
    [mHastane.get(key)?.liste ?? [], null],
    [mHastaneEk.get(key)?.liste ?? [], null],
    [mHastaneUni.get(key)?.liste ?? [], "uni"],
  ];
  const kayitlar = [];
  for (const [liste, sabitTur] of kaynakDizileri) {
    for (const item of liste) {
      const temiz = sadelestir(item);
      if (!temiz) continue;
      const adSon = YENI_ADLAR.get(norm(temiz)) ?? temiz;
      if (!kayitlar.some((v) => benzer(v.ad, adSon))) {
        kayitlar.push({
          ad: adSon,
          tur: sabitTur ?? turBelirle(adSon),
        });
      }
    }
  }
  return kayitlar.sort(
    (a, b) =>
      TUR_SIRA[a.tur] - TUR_SIRA[b.tur] || a.ad.localeCompare(b.ad, "tr")
  );
}

const hata = [];
const iller = provinces
  .sort((a, b) => a.plaka - b.plaka)
  .map((p) => {
    const key = norm(p.ad);
    const t = mTuik.get(key);
    const k = mKira.get(key);
    const g = mGoc.get(key);
    const liste = hastaneleriBirlestir(p.ad);
    const alimlar = (mKpss.get(key) ?? []).sort((a, b) =>
      a.donem.localeCompare(b.donem)
    );
    if (!t) hata.push(`${p.ad}: TÜİK verisi yok`);
    if (!g) hata.push(`${p.ad}: göç verisi yok`);
    if (liste.length === 0) hata.push(`${p.ad}: hastane verisi yok`);
    if (alimlar.length === 0) hata.push(`${p.ad}: KPSS alım verisi yok`);
    return {
      plaka: p.plaka,
      ad: p.ad,
      bolge: p.bolge,
      nufus: t?.nufus ?? null,
      nufusYil: t?.yil ?? null,
      dogum: t?.dogum ?? null,
      dogumYil: t?.yil ?? null,
      kira: k?.kira ?? null,
      gocHizi: g?.gocHizi ?? null,
      gocYil: g?.yil ?? null,
      hastaneler: liste,
      alimlar: alimlar.map((a) => ({
        donem: a.donem,
        taban: a.taban,
        kontenjan: a.kontenjan,
        guven: a.guven ?? "derleme",
      })),
    };
  });

if (hata.length) {
  console.error("EKSİK VERİ:\n" + hata.join("\n"));
  process.exit(1);
}

const donemler = [...new Set(kpss.map((r) => r.donem))].sort();
const kadroToplam = Object.fromEntries(
  donemler.map((d) => [
    d,
    kpss.filter((r) => r.donem === d).reduce((s, r) => s + r.kontenjan, 0),
  ])
);

const metaOlustur = (insaTarihi) => ({
  insaTarihi,
  dogumYil: tuik[0]?.yil ?? null,
  nufusYil: tuik[0]?.yil ?? null,
  kiraDonem: "Eylül 2026",
  gocYil: goc[0]?.yil ?? null,
  donemler,
  kadroToplam,
  varsayilanDonem: donemler[donemler.length - 1],
});

const outDir = path.join(root, "src", "data");
fs.mkdirSync(outDir, { recursive: true });
const outYolu = path.join(outDir, "provinces.generated.json");

let oncekiIcerik = null;
try {
  oncekiIcerik = fs.readFileSync(outYolu, "utf8");
} catch {
  /* ilk derleme */
}
let oncekiTarih = null;
if (oncekiIcerik !== null) {
  try {
    oncekiTarih = JSON.parse(oncekiIcerik)?.meta?.insaTarihi ?? null;
  } catch {
    oncekiTarih = null;
  }
}

const ayniVeri =
  typeof oncekiTarih === "string" &&
  oncekiIcerik === JSON.stringify({ meta: metaOlustur(oncekiTarih), iller });

if (ayniVeri) {
  console.log("Veri değişmedi; dosya ve insaTarihi korundu.");
} else {
  fs.writeFileSync(
    outYolu,
    JSON.stringify({
      meta: metaOlustur(new Date().toISOString().slice(0, 10)),
      iller,
    })
  );
}
fs.copyFileSync(
  path.join(root, "data", "kaynaklar.json"),
  path.join(outDir, "kaynaklar.generated.json")
);
console.log(
  `OK: ${iller.length} il, ${kpss.length} alım kaydı, dönemler: ${donemler.join(", ")}`
);
