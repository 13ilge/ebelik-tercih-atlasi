import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { kaynakBilgileri } from "@/lib/data";
import Logo from "@/components/Logo";

export const metadata: Metadata = {
  title: "Gizlilik ve Veri Kullanımı — Ebelik Tercih Atlası",
  description:
    "Ebelik Tercih Atlası gizlilik notu: çerez yok, izleme yok; tercih listeniz yalnızca kendi cihazınızda saklanır.",
  alternates: { canonical: "/gizlilik" },
};

export default function GizlilikSayfasi() {
  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-sky-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Haritaya dön
          </Link>
          <Logo boyut="sm" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Gizlilik ve veri kullanımı
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Bu sayfa, Ebelik Tercih Atlası&apos;nı kullanırken hangi verilerin
          nerede tutulduğunu özetler. Kısa özet: hesap yok, çerez yok, izleme
          yok; tercih listeniz yalnızca kendi cihazınızda saklanır.
        </p>

        <div className="mt-5 space-y-3">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Cihazınızda saklananlar
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Tercih listeniz, girdiğiniz KPSS puanı ve seçili dönem yalnızca
              tarayıcınızın yerel depolamasında (
              <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
                localStorage
              </code>
              , anahtar:{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
                ebelik-tercih-atlasi-v1
              </code>
              ) tutulur. Bu bilgiler sunucuya gönderilmez, bir hesapla ya da
              kişiyle ilişkilendirilmez. Tarayıcı verilerinizi temizleyerek
              dilediğiniz zaman silebilirsiniz.
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Çerez ve izleme yok
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Site çerez kullanmaz; reklam veya analitik izleme aracı
              içermez. Ziyaretiniz boyunca kimliğinizi tanımlayan bir veri
              toplanmaz.
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Paylaşılan bağlantılar
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              &quot;Bağlantı&quot; düğmesiyle oluşturduğunuz adres; tercih
              listenizi, puanınızı ve dönemi parametre olarak içerir. Bu
              bağlantıyı paylaştığınız kişiler ilgili bilgileri görebilir;
              paylaşmadan önce içeriği kontrol edin.
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Sunucu kayıtları
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Site bir barındırma sağlayıcısı üzerinde yayınlanır; sağlayıcı,
              güvenlik ve işletim amacıyla standart erişim kayıtları (IP
              adresi, tarayıcı bilgisi, zaman) tutabilir. Bu kayıtlar tarafımızca
              profilleme veya pazarlama amacıyla kullanılmaz.
            </p>
          </section>

          <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <h2 className="text-lg font-bold text-amber-900">
              Veri kaynakları
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-amber-900">
              {kaynakBilgileri.uyari}
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Kaynakların kullanımı ve telif
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              TÜİK doğum ve nüfus verileri, TÜİK&apos;in yasal uyarısı
              gereğince kaynak gösterilerek kullanılmıştır. Kira verileri
              Endeksa&apos;nın yazılı izniyle (Ekim 2026) kaynak gösterilerek
              yayımlanmaktadır. Taban puan ve
              kontenjan bilgileri, Sağlık Bakanlığı atama sonuçlarının kamuya
              açık özetlerinden derlenmiştir; sayfada il bazlı en düşük puanlar
              yayımlanır, kaynak sitelerin tabloları kopyalanmaz. Hastane
              listeleri Sağlık Bakanlığı ve YÖK&apos;ün kamuya açık listelerine
              dayanır. Harita sınır verisi Natural Earth&apos;ten alınmıştır
              (kamu malı).
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Bir hak sahibi, içeriğin kullanımına itiraz ederse ilgili veri
              incelenir; gerekirse kaldırılır veya güncellenir.
            </p>
          </section>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-slate-400">
          Bu not, sitenin mevcut sürümü için geçerlidir; siteye analitik veya
          benzeri bir araç eklenirse güncellenecektir.
        </p>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto w-full max-w-3xl px-4 text-xs text-slate-500">
          Ebelik Tercih Atlası — KPSS lisans (P3) ebelik atamaları için
          bağımsız bilgilendirme aracı.
        </div>
      </footer>
    </div>
  );
}
