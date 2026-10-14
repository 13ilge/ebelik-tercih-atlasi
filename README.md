# Ebelik Tercih Atlası

KPSS ebelik (lisans / P3) atamaları için interaktif tercih atlası. 81 ilin taban puanlarını, kontenjanlarını ve şehir yaşam verilerini tek haritada toplar; adayların puanına göre ulaşabileceği illeri görmesini ve sıralı bir tercih listesi oluşturmasını sağlar.

## Özellikler

- **İnteraktif Türkiye haritası** (masaüstü): il bazlı taban puan ısı haritası, "puanına göre uygunluk" modu, zoom/pan; mobilde arama çubuğu ve öneri çipleriyle hızlı il seçimi
- **İl paneli**: dönemlere göre taban puan ve kontenjan, ortalama kira, TÜİK doğum/nüfus verileri, kamu hastaneleri listesi, verilerden üretilen artı/eksiler
- **Tercih listesi**: sürükle-bırak sıralama, "puanıma göre sırala", kalıcılık (localStorage)
- **Karşılaştırma tablosu**: seçilen illeri yan yana, kaydırmalı tablo
- **Dışa aktarma**: paylaşım bağlantısı, PNG ve PDF indirme
- **İl sayfaları**: 81 il için SEO uyumlu statik sayfa (`/il/ankara`), sitemap ve robots

## Kurulum

```bash
npm install
npm run dev
```

Uygulama `http://localhost:3000` adresinde açılır.

## Veri

Veriler `data/` klasöründeki ham dosyalardan derlenir ve `src/data/*.generated.json` olarak üretilir:

| Komut | Ne yapar |
| --- | --- |
| `npm run veri:khgm` | Sağlık Bakanlığı KHGM tesis listesini (xls) işler |
| `npm run veri:harita` | İl sınırı GeoJSON'unu SVG etiket yerleşimine dönüştürür |
| `npm run veri:derle` | Tüm ham verileri tekilleştirir ve `provinces.generated.json` üretir |
| `npm run veri:hepsi` | Üç adımı sırayla çalıştırır |

Yeni atama dönemi eklemek için `data/kpss.json` dosyasına kayıt ekleyip `npm run veri:derle` çalıştırmak yeterlidir.

### Veri kaynakları

- Taban puanlar: Sağlık Bakanlığı atama sonuçları (kamuya açık derlemeler; 2024/5 iki bağımsız kaynakla doğrulandı)
- Doğum ve nüfus: TÜİK (Doğum İstatistikleri 2025, ADNKS 2025)
- Kira: Endeksa (Eylül 2026 tablosu; yazılı izinle kullanılır)
- Hastaneler: SB KHGM 2.-3. basamak listesi (2022) + 2022–2026 yeni açılışlar + devlet üniversitesi hastaneleri

Veriler bilgilendirme amaçlıdır; resmî tercih kaynağı değildir. Tercih öncesi ÖSYM ve Sağlık Bakanlığı duyurularını esas alın.

## Ortam değişkenleri

| Değişken | Açıklama |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Yayın adresi (canonical, sitemap, robots). Verilmezse Vercel adresi, o da yoksa `http://localhost:3000` kullanılır. |

## Komutlar

```bash
npm run dev      # geliştirme sunucusu
npm run build    # üretim derlemesi (typecheck dahil)
npm run lint     # ESLint
npm run test     # birim testleri (vitest)
npm run test:duman -- <çıktı-dizini>  # duman testi (localhost:3000 açıkken)
npm run veri:hepsi  # veri hattı
```
