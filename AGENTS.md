<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — Ebelik Tercih Atlası

Next.js 16 (App Router) + React 19 + Tailwind v4. Tüm kullanıcı metinleri Türkçe; font alt kümeleri `latin-ext` olmalı.

## Doğrulama komutları
- `npm run lint` → `npm run test` (vitest; `tests/*.test.ts`) → `npm run build` (typecheck build içindedir; ayrı typecheck scripti yok). CI: `.github/workflows/ci.yml` aynı sırayı koşar.
- Duman testi: `npm run test:duman -- <çıktı-dizini>` (script: `scripts/screenshot.mjs`) — çalışan sunucu (localhost:3000) gerektirir; sistem Edge'i kullanır (`channel: "msedge"`, tarayıcı indirmez); mobilde harita yok → `MobilIlArama` akışını test eder; assertion içerir, timeout'ta hata ile biter.

## Veri hattı (kritik)
- Uygulama YALNIZCA `src/data/*.generated.json` okur. Bunlar commit'li türetilmiş dosyalardır; elle düzenleme.
- Ham girdiler `data/` altında. Akış: `npm run veri:hepsi` = `veri:khgm` → `veri:harita` → `veri:derle`. Ham veri değişince hattı çalıştırıp üretileni de commit'le.
- KPSS dönem kayıtları resmî SB min/max belgeleriyle doğrulandı (`guven: "dogrulandi"`); yeni dönem eklerken puan uydurma, kaynak/tarih bilgisini `data/kaynaklar.json`'a işle.
- `normTr` tek kaynakta: `src/lib/metin.mjs` (node scriptleri de bunu import eder); `src/lib/metin.ts` yalnızca re-export. Diakritik katlama tablosunu kopyalama; `â→a` dahil değilse KHGM eşleşmesi kırılır.
- KHGM xls'i `data/kaynaklar/` altında commit'li. `xlsx`, SheetJS CDN tarball'ından kurulu; ESM sürümünde `XLSX.readFile` yok → `XLSX.read(fs.readFileSync(...), { type: "buffer" })` kullan.
- KPSS-2024/5, 2025/4 ve 2025/5 resmî SB min/max PDF'leri `data/kaynaklar/` altında commit'li (`minmax_lisansdt04032024.pdf`: 671 ebe programı / 2.000 kadro; `minmaxlisans_sb4d14052025.pdf`: 647 program / 1.280 kadro; `minmax_lisanssb5d14052025.pdf`: 629 program / 805 kadro); üç dönemin kayıtları bu belgelerle birebir doğrulandı (il bazında kontenjan + min puan, uyuşmazlık yok). Belge güncellenirse python + pdfplumber ile satır çıkarımı yapılabilir.
- Kira verileri Endeksa'dan yazılı izinle (Ekim 2026) kaynak gösterilerek kullanılır; izin notu `data/kaynaklar.json`'da. Atıf metinlerini kaldırma. Veri `data/kira.json` (Eylül 2026 tablosu); 3 ilde (Diyarbakır, Şırnak, Ardahan) Endeksa verisi yok → `kira: null`, UI bunu tolere eder (medyan hesabı null'ları dışlar).
- Göç verisi `data/goc.json` (il bazlı net göç hızı, TÜİK İç Göç İstatistikleri 2025); ham kaynak `data/kaynaklar/tuik-iller-arasi-goc.xlsx`. Ham tabloda her çift iki yönlü satır olarak durur; net göç yalnızca "Göç Alan İl" tarafından toplanmalı (yoksa iki katına çıkar). Çıkarım python + openpyxl ile yapıldı; Σnet=0, toplam 2.475.019 ve İstanbul -2,62‰ çapalarıyla doğrulandı.
- Sıra önemli: şema/alan eklerken `scripts/build-dataset.mjs` + `src/lib/types.ts` birlikte güncellenmeli.

## Mimari notları (dosya adlarından çıkmaz)
- Mobil (<768px) harita YOK: `MobilIlArama` (arama çubuğu + açılır sonuçlar, öneri çipleri). Masaüstü `TurkiyeHaritasi` kullanır. Harita bileşenine mobil dal geri ekleme; ayrım TercihMotoru'nda `mobilVar` ile yapılır.
- Kök yazı boyutu 18px (masaüstü) / 20px (mobil) — `globals.css`. Tailwind rem değerleri varsayılandan büyük render eder; yeni UI eklerken mevcut ölçekle hizala.
- Harita verisi `scripts/generate-map.mjs` ile GeoJSON'dan üretilir (SVG path + çakışmasız etiket yerleşimi/tier). Geometri/etiket değişirse `veri:harita` çalıştır. Zoom'da beliren etiketler CSS değişkeni `--zoom` ile kontrol edilir. `data/tr-cities.geojson`, Natural Earth 10m admin-1'den (kamu malı) süzülüp il adları `provinces.json`'a eşlenerek üretilmiştir; feature'larda `type: "Feature"` alanı zorunludur (d3-geo aksi hâlde null path döndürür).
- Harita GeoJSON'u `src/lib/harita.ts` üzerinden yalnızca `TurkiyeHaritasi`'na gider; bileşen `TercihMotoru`'nda `next/dynamic` + `ssr:false` ile yüklenir. `harita`'yı `src/lib/data.ts`'e geri taşıma; mobil ilk yükte 75 KB'lık harita verisi inmemeli.
- SEO: kök ve il bazlı `opengraph-image.tsx` dosa konvansiyonu (next/og, SSG). Türkçe karakter için `assets/AtkinsonHyperlegible-Bold.ttf` (OFL, commit'li) kullanılır; başka font gerekirse latin-ext olmalı.
- Tema: slate + sky vurgu; harita rampası teal→kırmızı (`src/lib/colors.ts`). Fontlar: gövde Atkinson Hyperlegible, logo Inter (`font-display`), plaka/sıra sayıları IBM Plex Mono (`font-mono`).
- PDF/PNG çıktısı: tuval `src/lib/liste-tuval.ts`, PDF `src/lib/pdf.ts` (elle yazılmış minimal PDF; Info sözlüğünde başlık/tarih var). PDF tuvali A4 kullanılabilir oranına uzatılır, dipnot sayfa altına sabitlenir; PNG dar (içerik boyu) kalır. AltPanel PDF/PNG kütüphanelerini tıklamada dinamik import eder.
- Güvenlik başlıkları `next.config.ts` `headers()` içinde; CSP/HSTS yalnızca üretimde (dev'de HMR için kapalı).
- Masaüstünde AltPanel "çekmece": hover'da büyür (yalnızca hover'lı ≥1024px). Mobil panel `flex-1`.
- İl sayfalarında `export const instant = false` var (Next 16 instant-navigation doğrulaması) — dokümanı okumadan kaldırma.
- Tercih durumu localStorage `ebelik-tercih-atlasi-v1` anahtarında saklanır; `?liste&puan&donem&il` URL parametreleri tek seferlik içe aktarım olup `history.replaceState` ile temizlenir (yoksa silinen liste geri dirilir).

## Dış bağlantılar
- GitHub: `origin` → https://github.com/13ilge/ebelik-tercih-atlasi (dal: `master`). Commit/push yalnızca kullanıcı istediğinde.
- Yayın adresi: `NEXT_PUBLIC_SITE_URL` → `VERCEL_URL` → localhost sırası (`src/lib/site.ts`); canonical/sitemap/robots buna bağlı.

## Ortam tuzağı (Windows/PowerShell)
- Kaçış karakterli, çok satırlı `node -e "..."` komutları PowerShell'de bozulur. Karmaşık node tek-atımlıkları için `scripts/` altına geçici `.mjs` yazıp çalıştır, sonra sil.
