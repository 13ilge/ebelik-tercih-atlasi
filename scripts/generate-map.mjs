import fs from "node:fs";
import { normTr as norm } from "../src/lib/metin.mjs";
import path from "node:path";
import { geoMercator, geoPath } from "d3-geo";

const root = path.resolve(import.meta.dirname, "..");
const geo = JSON.parse(
  fs.readFileSync(path.join(root, "data", "tr-cities.geojson"), "utf8")
);
const provinces = JSON.parse(
  fs.readFileSync(path.join(root, "data", "provinces.json"), "utf8")
);

const alias = { afyon: "afyonkarahisar" };
const byNorm = new Map(provinces.map((p) => [norm(p.ad), p]));

if (geo.features.length !== 81) {
  throw new Error(`Beklenen 81 il, bulunan: ${geo.features.length}`);
}

const W = 1000;
const H = 620;
const projection = geoMercator().fitSize([W, H], geo);
const pathGen = geoPath(projection);

const round1 = (n) => Math.round(n * 10) / 10;

const BASE = geo.features.map((f) => {
  let key = norm(f.properties.name);
  key = alias[key] ?? key;
  const p = byNorm.get(key);
  if (!p) throw new Error("Eşleşmeyen il: " + f.properties.name);
  const d = pathGen(f).replace(/(\d+\.\d)\d+/g, "$1");
  const [cx, cy] = pathGen.centroid(f);
  const [[x0, y0], [x1, y1]] = pathGen.bounds(f);
  return {
    plaka: p.plaka,
    ad: p.ad,
    d,
    cx: round1(cx),
    cy: round1(cy),
    alan: Math.round((x1 - x0) * (y1 - y0)),
  };
});

const kesisiyor = (a, b) =>
  a.x0 - 2 < b.x1 && a.x1 + 2 > b.x0 && a.y0 - 2 < b.y1 && a.y1 + 2 > b.y0;

const OFSET_TABANI = [
  [0, 0],
  [0, 9],
  [0, -9],
  [11, 0],
  [-11, 0],
  [0, 16],
  [0, -16],
  [14, 9],
  [-14, 9],
  [14, -9],
  [-14, -9],
  [22, 0],
  [-22, 0],
  [0, 23],
  [0, -23],
];

function yerlestir(scale) {
  const charW = 5.6 * scale;
  const nameWidth = (ad) => Math.round(ad.length * charW + 6 * scale);
  const PUAN_W = Math.round(30 * scale);
  const SATIR_H = 10 * scale;

  const kutular = [];
  const yerlesimler = BASE.map((il) => ({
    plaka: il.plaka,
    x: null,
    y: null,
    tier: "yok",
  }));

  const sirali = [...BASE].sort((a, b) => b.alan - a.alan);
  for (const il of sirali) {
    const row = yerlesimler.find((y) => y.plaka === il.plaka);
    const nw = nameWidth(il.ad);
    const denemeler = [
      { tier: "tam", w: Math.max(nw, PUAN_W), h: SATIR_H * 2 + 2 * scale },
      { tier: "ad", w: nw, h: SATIR_H + 2 * scale },
    ];
    let konuldu = false;
    for (const d of denemeler) {
      for (const [ox, oy] of OFSET_TABANI) {
        const dx = ox;
        const dy = oy;
        const x = round1(il.cx + dx);
        const y = round1(il.cy + dy);
        const kutu = {
          x0: x - d.w / 2,
          y0: y - d.h / 2,
          x1: x + d.w / 2,
          y1: y + d.h / 2,
        };
        if (
          kutu.x0 < 2 ||
          kutu.x1 > W - 2 ||
          kutu.y0 < 2 ||
          kutu.y1 > H - 2
        ) {
          continue;
        }
        if (!kutular.some((k) => kesisiyor(kutu, k))) {
          kutular.push(kutu);
          row.x = x;
          row.y = y;
          row.tier = d.tier;
          konuldu = true;
          break;
        }
      }
      if (konuldu) break;
    }
  }
  return yerlesimler;
}

const masaustu = yerlestir(1.5);
const mobil = yerlestir(3.5);

const iller = BASE.map((il) => {
  const m1 = masaustu.find((r) => r.plaka === il.plaka);
  const m2 = mobil.find((r) => r.plaka === il.plaka);
  return {
    ...il,
    etiketX: m1.x,
    etiketY: m1.y,
    etiketTier: m1.tier,
    mEtiketX: m2.x,
    mEtiketY: m2.y,
    mEtiketTier: m2.tier,
  };
});

iller.sort((a, b) => a.plaka - b.plaka);

const say = (tier) => iller.filter((i) => i.etiketTier === tier).length;
const sayM = (tier) => iller.filter((i) => i.mEtiketTier === tier).length;
const tierSayisi = {
  masaustu: { tam: say("tam"), ad: say("ad"), yok: say("yok") },
  mobil: { tam: sayM("tam"), ad: sayM("ad"), yok: sayM("yok") },
};

const outDir = path.join(root, "src", "data");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "turkey-map.generated.json"),
  JSON.stringify({ width: W, height: H, iller })
);
console.log(
  `OK: ${iller.length} il haritası yazıldı. Etiketler: ${JSON.stringify(tierSayisi)}`
);
