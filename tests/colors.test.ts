import { describe, expect, it } from "vitest";
import { ALIM_YOK_RENK, PUAN_RAMP, puanRengi, uygunlukSonucu } from "@/lib/colors";
import type { DonemIstatistik } from "@/lib/data";

const ist: DonemIstatistik = {
  donem: "2025/5",
  min: 70,
  max: 80,
  medyan: 75,
  kadro: 100,
  tabanlar: [70, 75, 80],
};

describe("puanRengi", () => {
  it("minimum puanı ilk dilime koyar", () => {
    expect(puanRengi(70, ist)).toEqual({ renk: PUAN_RAMP[0], dilim: 0 });
  });

  it("maksimum puanı son dilime koyar", () => {
    expect(puanRengi(80, ist)).toEqual({ renk: PUAN_RAMP[4], dilim: 4 });
  });

  it("orta puanı ara dilime koyar", () => {
    expect(puanRengi(75, ist).dilim).toBe(2);
  });

  it("alım yoksa nötr renk döner", () => {
    expect(puanRengi(null, ist)).toEqual({ renk: ALIM_YOK_RENK, dilim: null });
  });

  it("tek puanlı dönemde bölme hatası vermez", () => {
    const tek = { ...ist, min: 75, max: 75 };
    expect(puanRengi(75, tek).dilim).toBe(0);
  });
});

describe("uygunlukSonucu", () => {
  it("eşikleri doğru uygular", () => {
    expect(uygunlukSonucu(2).anahtar).toBe("rahat");
    expect(uygunlukSonucu(1.5).anahtar).toBe("rahat");
    expect(uygunlukSonucu(0).anahtar).toBe("muhtemel");
    expect(uygunlukSonucu(-1.4).anahtar).toBe("sinirda");
    expect(uygunlukSonucu(-1.5).anahtar).toBe("sinirda");
    expect(uygunlukSonucu(-1.6).anahtar).toBe("zor");
  });

  it("alım yoksa 'yok' döner", () => {
    expect(uygunlukSonucu(null).anahtar).toBe("yok");
  });
});
