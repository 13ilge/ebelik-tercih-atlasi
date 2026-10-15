import { chromium } from "playwright";

const outDir = process.argv[2] ?? ".";
const adres = process.argv[3] ?? "http://localhost:3000";

const browser = await chromium.launch({ channel: "msedge" });

async function cek(masaustu) {
  const context = await browser.newContext({
    viewport: masaustu
      ? { width: 1600, height: 900 }
      : { width: 390, height: 844 },
    hasTouch: !masaustu,
    isMobile: !masaustu,
  });
  const page = await context.newPage();
  page.on("console", (m) => {
    if (m.type() === "error") console.log("KONSOL HATASI:", m.text());
  });
  page.on("pageerror", (e) => console.log("SAYFA HATASI:", e.message));
  return page;
}

const sayfa = await cek(true);
await sayfa.goto(adres, { waitUntil: "networkidle" });
await sayfa.waitForTimeout(1500);
await sayfa.screenshot({ path: `${outDir}/01-genel.png` });

await sayfa.click('path[aria-label^="Ankara"]');
await sayfa.waitForTimeout(700);
await sayfa.screenshot({ path: `${outDir}/02-detay.png` });

await sayfa.fill('input[placeholder="Puanını gir (örn. 78,456)"]', "78,4");
await sayfa.waitForTimeout(900);
await sayfa.screenshot({ path: `${outDir}/03-puan.png` });

await sayfa.click('path[aria-label^="İstanbul"]');
await sayfa.waitForTimeout(400);
await sayfa.click('path[aria-label^="Hakk"]');
await sayfa.waitForTimeout(400);
await sayfa.getByRole("button", { name: "Karşılaştır" }).click();
await sayfa.waitForTimeout(500);
await sayfa.screenshot({ path: `${outDir}/04-karsilastir.png` });

await sayfa.getByRole("button", { name: "Detaya dön" }).click();
await sayfa.waitForTimeout(300);

const haritaKutu = await sayfa
  .locator('svg[aria-label^="Türkiye"]')
  .boundingBox();
const mx = haritaKutu.x + haritaKutu.width / 2;
const my = haritaKutu.y + haritaKutu.height / 2;
await sayfa.mouse.move(mx, my);
await sayfa.mouse.wheel(0, -600);
await sayfa.waitForTimeout(500);
await sayfa.screenshot({ path: `${outDir}/06-zoom.png` });

const oncekiSayi = await sayfa.locator("aside ul li").count();
await sayfa.mouse.move(mx - 120, my - 60);
await sayfa.mouse.down();
await sayfa.mouse.move(mx + 180, my + 90, { steps: 8 });
await sayfa.mouse.up();
await sayfa.waitForTimeout(400);
await sayfa.screenshot({ path: `${outDir}/07-pan.png` });
const sonrakiSayi = await sayfa.locator("aside ul li").count();
console.log(
  `Sürükleme sonrası seçim korunuyor: ${
    sonrakiSayi === oncekiSayi && sonrakiSayi > 0
  } (${oncekiSayi} -> ${sonrakiSayi})`
);

const mobil = await cek(false);
await mobil.goto(adres, { waitUntil: "networkidle" });
await mobil.waitForTimeout(1200);
await mobil.screenshot({ path: `${outDir}/05-mobil.png` });

const arama = mobil.locator('input[aria-label="İl ara"]');
await arama.fill("Ankara");
await mobil.waitForTimeout(600);
await mobil.screenshot({ path: `${outDir}/08-mobil-arama.png` });

const mobilSonuclar = mobil
  .getByRole("listbox", { name: "İl sonuçları" })
  .getByRole("option");
const mobilSonucSayi = await mobilSonuclar.count();
console.log(
  `Mobil aramada "Ankara" sonucu: ${mobilSonucSayi > 0} (${mobilSonucSayi} sonuç)`
);

await mobilSonuclar.first().click();
await mobil.waitForTimeout(700);
await mobil.screenshot({ path: `${outDir}/09-mobil-secim.png` });

await browser.close();
console.log("Ekran görüntüleri hazır:", outDir);
