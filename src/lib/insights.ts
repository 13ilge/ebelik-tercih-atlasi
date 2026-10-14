import type { Il } from "./types";
import { isaretli, puanStr, sayi } from "./format";

export interface Oneri {
  arti: boolean;
  metin: string;
}

export interface OneriBaglami {
  donem: string;
  medyanKira: number;
  kiraDonem: string;
  tabanYuzdeligi: number | null;
  taban: number | null;
  kontenjan: number | null;
}

const BOL_KONTENJAN = 25;
const KIT_KONTENJAN = 3;

export function ilOnerileri(il: Il, ctx: OneriBaglami): Oneri[] {
  const artilar: Oneri[] = [];
  const eksiler: Oneri[] = [];

  if (il.kira !== null) {
    const kiraOran = il.kira / ctx.medyanKira;
    if (kiraOran <= 0.8) {
      artilar.push({
        arti: true,
        metin: `Ortalama kira Türkiye medyanının %${Math.round(
          (1 - kiraOran) * 100
        )} altında (~${sayi(il.kira)} TL; TR medyan ~${sayi(
          Math.round(ctx.medyanKira)
        )} TL — Endeksa, ${ctx.kiraDonem})`,
      });
    } else if (kiraOran >= 1.2) {
      eksiler.push({
        arti: false,
        metin: `Ortalama kira Türkiye medyanının %${Math.round(
          (kiraOran - 1) * 100
        )} üzerinde (~${sayi(il.kira)} TL; TR medyan ~${sayi(
          Math.round(ctx.medyanKira)
        )} TL — Endeksa, ${ctx.kiraDonem})`,
      });
    }
  }

  if (il.dogum >= 12000) {
    artilar.push({
      arti: true,
      metin: `Yıllık ${sayi(il.dogum)} canlı doğum (TÜİK ${
        il.dogumYil
      }) — doğum hizmetlerinde yoğun istihdam sinyali`,
    });
  }

  if (ctx.kontenjan === null) {
    eksiler.push({
      arti: false,
      metin: `${ctx.donem} döneminde bu ile ebe kadrosu verilmedi`,
    });
  } else if (ctx.kontenjan >= BOL_KONTENJAN) {
    artilar.push({
      arti: true,
      metin: `${ctx.donem} döneminde ${ctx.kontenjan} ebe kadrosu açıldı — kontenjan boldur`,
    });
  } else if (ctx.kontenjan <= KIT_KONTENJAN) {
    eksiler.push({
      arti: false,
      metin: `${ctx.donem} döneminde yalnızca ${ctx.kontenjan} ebe kadrosu açıldı — kontenjan çok sınırlı`,
    });
  }

  if (ctx.taban !== null && ctx.tabanYuzdeligi !== null) {
    if (ctx.tabanYuzdeligi <= 0.25) {
      artilar.push({
        arti: true,
        metin: `Taban puan (${puanStr(ctx.taban)}) o dönemin en düşük çeyreğinde — ulaşmak görece kolay`,
      });
    } else if (ctx.tabanYuzdeligi >= 0.75) {
      eksiler.push({
        arti: false,
        metin: `Taban puan (${puanStr(ctx.taban)}) o dönemin en yüksek çeyreğinde — rekabet yoğun`,
      });
    }
  }

  if (il.gocHizi >= 5) {
    artilar.push({
      arti: true,
      metin: `Son yılda net göç alıyor (binde ${isaretli(
        il.gocHizi
      )}; TÜİK ${il.gocYil}) — şehir nüfus çekiyor`,
    });
  } else if (il.gocHizi <= -5) {
    eksiler.push({
      arti: false,
      metin: `Son yılda net göç veriyor (binde ${isaretli(
        il.gocHizi
      )}; TÜİK ${il.gocYil}) — şehir nüfus kaybediyor`,
    });
  }

  const kadinDogumlar = il.hastaneler.filter((h) => h.tur === "kdd");
  if (kadinDogumlar.length > 0) {
    artilar.push({
      arti: true,
      metin: `Kadın doğum / çocuk hastanesi mevcut: ${kadinDogumlar
        .slice(0, 2)
        .map((h) => h.ad)
        .join(", ")}`,
    });
  }
  if (il.hastaneler.some((h) => h.tur === "sehir")) {
    artilar.push({
      arti: true,
      metin: "Şehir hastanesi mevcut — büyük ölçekli sağlık altyapısı",
    });
  }

  return [...artilar.slice(0, 6), ...eksiler.slice(0, 6)];
}
