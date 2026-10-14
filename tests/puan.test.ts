import { describe, expect, it } from "vitest";
import { puanAyristir } from "@/lib/puan";

describe("puanAyristir", () => {
  it("virgüllü ondalığı çözer", () => {
    expect(puanAyristir("78,456")).toBe(78.456);
    expect(puanAyristir(" 60,5 ")).toBe(60.5);
  });

  it("noktalı ondalığı çözer", () => {
    expect(puanAyristir("78.456")).toBe(78.456);
  });

  it("karışık ayraçlı girdiyi reddeder", () => {
    expect(puanAyristir("1.234,5")).toBeNull();
    expect(puanAyristir("78.456,5")).toBeNull();
    expect(puanAyristir("4.5,6")).toBeNull();
    expect(puanAyristir("8.9,5")).toBeNull();
  });

  it("sınır değerleri kabul eder", () => {
    expect(puanAyristir("40")).toBe(40);
    expect(puanAyristir("100")).toBe(100);
  });

  it("aralık dışını reddeder", () => {
    expect(puanAyristir("39,9")).toBeNull();
    expect(puanAyristir("100,1")).toBeNull();
  });

  it("boş ve geçersiz girdiyi reddeder", () => {
    expect(puanAyristir("")).toBeNull();
    expect(puanAyristir("   ")).toBeNull();
    expect(puanAyristir("abc")).toBeNull();
    expect(puanAyristir("78,45,6")).toBeNull();
    expect(puanAyristir("Infinity")).toBeNull();
  });

  it("yazım sırasındaki kuyruk ayracı tolere edilir", () => {
    expect(puanAyristir("78,")).toBe(78);
  });
});
