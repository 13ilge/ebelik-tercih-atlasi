export type Guven = "dogrulandi" | "derleme";

export interface Alim {
  donem: string;
  taban: number;
  kontenjan: number;
  guven: Guven;
}

export type HastaneTuru = "kdd" | "sehir" | "eah" | "uni" | "devlet" | "diger";

export interface Hastane {
  ad: string;
  tur: HastaneTuru;
}

export interface Il {
  plaka: number;
  ad: string;
  bolge: string;
  nufus: number;
  nufusYil: number;
  dogum: number;
  dogumYil: number;
  kira: number | null;
  gocHizi: number;
  gocYil: number;
  hastaneler: Hastane[];
  alimlar: Alim[];
}

export interface Meta {
  insaTarihi: string;
  dogumYil: number;
  nufusYil: number;
  kiraDonem: string;
  gocYil: number;
  donemler: string[];
  kadroToplam: Record<string, number>;
  varsayilanDonem: string;
}

export interface Dataset {
  meta: Meta;
  iller: Il[];
}

export type EtiketTier = "tam" | "ad" | "yok";

export interface HaritaIl {
  plaka: number;
  ad: string;
  d: string;
  cx: number;
  cy: number;
  alan: number;
  etiketX: number | null;
  etiketY: number | null;
  etiketTier: EtiketTier;
}

export interface Harita {
  width: number;
  height: number;
  iller: HaritaIl[];
}

export interface Kaynak {
  baslik: string;
  aciklama: string;
  url: string;
  tarih: string;
}

export interface KaynakBilgileri {
  uyari: string;
  kaynaklar: Kaynak[];
}

export type Mod = "puan" | "uygunluk";
