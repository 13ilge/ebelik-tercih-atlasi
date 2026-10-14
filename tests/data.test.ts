import { describe, expect, it } from "vitest";
import {
  dataset,
  donemIstatistigi,
  donemKadro,
  genelPuanAraligi,
  ilSlug,
  kaynakBilgileri,
  meta,
  medyanKira,
  slugHaritasi,
  tabanYuzdeligi,
} from "@/lib/data";
import { normTr, slugla } from "@/lib/metin";

describe("veri kümesi bütünlüğü", () => {
  it("81 ili plaka sırasıyla içerir", () => {
    expect(dataset.iller).toHaveLength(81);
    expect(dataset.iller.map((il) => il.plaka)).toEqual(
      Array.from({ length: 81 }, (_, i) => i + 1)
    );
  });

  it("her ilde en az bir alım kaydı ve tutarlı alanlar var", () => {
    for (const il of dataset.iller) {
      expect(il.alimlar.length, `${il.ad}: alım kaydı`).toBeGreaterThan(0);
      expect(il.nufus, `${il.ad}: nüfus`).toBeGreaterThan(0);
      expect(il.dogum, `${il.ad}: doğum`).toBeGreaterThan(0);
      if (il.kira !== null) {
        expect(il.kira, `${il.ad}: kira`).toBeGreaterThan(0);
      }
      expect(Number.isFinite(il.gocHizi), `${il.ad}: göç hızı`).toBe(true);
      expect(Math.abs(il.gocHizi), `${il.ad}: göç hızı aralığı`).toBeLessThan(
        60
      );
      expect(il.gocYil).toBe(2025);
      for (const a of il.alimlar) {
        expect(meta.donemler, `${il.ad}: dönem`).toContain(a.donem);
        expect(a.taban, `${il.ad} ${a.donem}: taban`).toBeGreaterThanOrEqual(
          genelPuanAraligi.min
        );
        expect(a.taban).toBeLessThanOrEqual(genelPuanAraligi.max);
        expect(a.kontenjan).toBeGreaterThan(0);
      }
    }
  });

  it("dönem toplamları veriyle eşleşiyor", () => {
    for (const donem of meta.donemler) {
      const toplam = dataset.iller
        .flatMap((il) => il.alimlar)
        .filter((a) => a.donem === donem)
        .reduce((s, a) => s + a.kontenjan, 0);
      expect(donemKadro(donem), `${donem}: kadroToplam`).toBe(toplam);
      expect(donemIstatistigi(donem).kadro).toBe(toplam);
    }
    expect(meta.varsayilanDonem).toBe(meta.donemler.at(-1));
  });

  it("istatistikler tutarlı", () => {
    for (const donem of meta.donemler) {
      const ist = donemIstatistigi(donem);
      expect(ist.min).toBeLessThanOrEqual(ist.medyan);
      expect(ist.medyan).toBeLessThanOrEqual(ist.max);
      expect(ist.tabanlar.length).toBeGreaterThan(0);
    }
    for (const il of dataset.iller) {
      for (const a of il.alimlar) {
        const y = tabanYuzdeligi(a.donem, a.taban);
        expect(y, `${il.ad} ${a.donem}`).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(1);
      }
    }
  });

  it("kira verisi 78 ilde var, 3 ilde Endeksa'da veri yok", () => {
    const bos = dataset.iller.filter((il) => il.kira === null);
    expect(bos.map((il) => il.ad).sort()).toEqual([
      "Ardahan",
      "Diyarbakır",
      "Şırnak",
    ]);
  });

  it("slug'lar benzersiz ve Türkçe karakterlerden arınmış", () => {
    expect(slugHaritasi.size).toBe(81);
    for (const il of dataset.iller) {
      const slug = ilSlug(il);
      expect(slug).toMatch(/^[a-z0-9-]+$/);
      expect(slugHaritasi.get(slug)?.plaka).toBe(il.plaka);
    }
    expect(normTr("Kâğıthane")).toBe("kagithane");
    expect(slugla("Şanlıurfa")).toBe("sanliurfa");
  });

  it("kaynak listesi dolu ve medyan kira makul", () => {
    expect(kaynakBilgileri.kaynaklar.length).toBeGreaterThan(0);
    for (const k of kaynakBilgileri.kaynaklar) {
      expect(k.url).toMatch(/^https?:\/\//);
      expect(k.baslik.length).toBeGreaterThan(0);
    }
    expect(medyanKira).toBeGreaterThan(0);
  });
});
