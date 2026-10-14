import { describe, expect, it } from "vitest";
import { isaretli, puanStr, sayi, tarihStr, tl, yuzde } from "@/lib/format";

describe("sayi", () => {
  it("tr-TR binlik ayraç kullanır", () => {
    expect(sayi(5910320)).toBe("5.910.320");
    expect(sayi(805)).toBe("805");
  });
});

describe("puanStr", () => {
  it("varsayılan olarak tek basamak ve virgül kullanır", () => {
    expect(puanStr(75.666)).toBe("75,7");
    expect(puanStr(73)).toBe("73,0");
  });

  it("basamak sayısı verilebilir", () => {
    expect(puanStr(78.4567, 3)).toBe("78,457");
    expect(puanStr(74, 0)).toBe("74");
  });
});

describe("tl", () => {
  it("TL sonekiyle biçimler", () => {
    expect(tl(28587)).toBe("28.587 TL");
  });
});

describe("yuzde", () => {
  it("yuvarlayıp yüzde işareti ekler", () => {
    expect(yuzde(0.604)).toBe("%60");
    expect(yuzde(1)).toBe("%100");
  });
});

describe("tarihStr", () => {
  it("ISO tarihi tr-TR uzun biçime çevirir", () => {
    expect(tarihStr("2026-10-14")).toBe("14 Ekim 2026");
  });

  it("geçersiz girdiyi olduğu gibi döndürür", () => {
    expect(tarihStr("bozuk")).toBe("bozuk");
  });
});

describe("isaretli", () => {
  it("pozitif ve negatif işaretleri doğru üretir", () => {
    expect(isaretli(1.234)).toBe("+1,2");
    expect(isaretli(-2.5)).toBe("-2,5");
    expect(isaretli(0)).toBe("+0,0");
  });
});
