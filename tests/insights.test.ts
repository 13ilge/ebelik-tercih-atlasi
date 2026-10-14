import { describe, expect, it } from "vitest";
import { ilOnerileri } from "@/lib/insights";
import type { Il } from "@/lib/types";

const MEDYAN_KIRA = 20_000;

function il(over: Partial<Il> = {}): Il {
  return {
    plaka: 6,
    ad: "Ankara",
    bolge: "İç Anadolu",
    nufus: 5_000_000,
    nufusYil: 2025,
    dogum: 50_000,
    dogumYil: 2025,
    kira: MEDYAN_KIRA,
    gocHizi: 0,
    gocYil: 2025,
    hastaneler: [],
    alimlar: [],
    ...over,
  };
}

const ctx = {
  donem: "2025/5",
  medyanKira: MEDYAN_KIRA,
  kiraDonem: "Eylül 2026",
  tabanYuzdeligi: 0.5,
  taban: 75,
  kontenjan: 10,
};

const metinler = (liste: { metin: string }[]) =>
  liste.map((o) => o.metin).join(" | ");

describe("ilOnerileri", () => {
  it("medyan civarı kira için artı/eksi üretmez", () => {
    const sonuc = ilOnerileri(il({ kira: 21_000 }), ctx);
    expect(metinler(sonuc)).not.toMatch(/kira/i);
  });

  it("ucuz kirayı artı olarak işaretler", () => {
    const sonuc = ilOnerileri(il({ kira: 14_000 }), ctx);
    const arti = sonuc.filter((o) => o.arti);
    expect(metinler(arti)).toMatch(/kira.*altında/i);
  });

  it("pahalı kirayı eksi olarak işaretler", () => {
    const sonuc = ilOnerileri(il({ kira: 26_000 }), ctx);
    const eksi = sonuc.filter((o) => !o.arti);
    expect(metinler(eksi)).toMatch(/kira.*üzerinde/i);
  });

  it("yüksek doğum sayısını artı sayar", () => {
    const sonuc = ilOnerileri(il({ dogum: 12_000 }), ctx);
    expect(metinler(sonuc.filter((o) => o.arti))).toMatch(/canlı doğum/);
  });

  it("alım yoksa eksi üretir", () => {
    const sonuc = ilOnerileri(il(), { ...ctx, kontenjan: null, taban: null });
    expect(metinler(sonuc.filter((o) => !o.arti))).toMatch(/kadrosu verilmedi/);
  });

  it("boldan kontenjanı artı, çok az kontenjanı eksi sayar", () => {
    const bol = ilOnerileri(il(), { ...ctx, kontenjan: 25 });
    expect(metinler(bol.filter((o) => o.arti))).toMatch(/kontenjan boldur/);
    const az = ilOnerileri(il(), { ...ctx, kontenjan: 3 });
    expect(metinler(az.filter((o) => !o.arti))).toMatch(/yalnızca 3/);
  });

  it("taban yüzdelik dilimine göre artı/eksi üretir", () => {
    const kolay = ilOnerileri(il(), { ...ctx, tabanYuzdeligi: 0.2 });
    expect(metinler(kolay.filter((o) => o.arti))).toMatch(/en düşük çeyreğinde/);
    const zor = ilOnerileri(il(), { ...ctx, tabanYuzdeligi: 0.8 });
    expect(metinler(zor.filter((o) => !o.arti))).toMatch(/en yüksek çeyreğinde/);
  });

  it("net göç durumunu artı/eksi sayar", () => {
    const arti = ilOnerileri(il({ gocHizi: 8.4 }), ctx);
    expect(metinler(arti.filter((o) => o.arti))).toMatch(/net göç alıyor/);
    const eksi = ilOnerileri(il({ gocHizi: -8.4 }), ctx);
    expect(metinler(eksi.filter((o) => !o.arti))).toMatch(/net göç veriyor/);
    const notr = ilOnerileri(il({ gocHizi: 2 }), ctx);
    expect(metinler(notr)).not.toMatch(/net göç/);
  });

  it("kadın doğum ve şehir hastanesini artı sayar", () => {
    const sonuc = ilOnerileri(
      il({
        hastaneler: [
          { ad: "Ankara Etlik Şehir Hastanesi", tur: "sehir" },
          { ad: "Ankara Şehir KDD", tur: "kdd" },
        ],
      }),
      ctx
    );
    const artilar = metinler(sonuc.filter((o) => o.arti));
    expect(artilar).toMatch(/Kadın doğum/);
    expect(artilar).toMatch(/Şehir hastanesi/);
  });

  it("en fazla 6 artı ve 6 eksi döner", () => {
    const sonuc = ilOnerileri(il(), ctx);
    expect(sonuc.filter((o) => o.arti).length).toBeLessThanOrEqual(6);
    expect(sonuc.filter((o) => !o.arti).length).toBeLessThanOrEqual(6);
  });
});
