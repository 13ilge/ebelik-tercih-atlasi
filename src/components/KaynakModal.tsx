"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { BookMarked, ExternalLink, X } from "lucide-react";
import { kaynakBilgileri, meta } from "@/lib/data";
import { tarihStr } from "@/lib/format";
import { kaydirmaKilidiAl } from "@/lib/kaydirma-kilidi";

export default function KaynakModal({
  acik,
  kapat,
}: {
  acik: boolean;
  kapat: () => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const kapatRef = useRef(kapat);
  const oncekiOdakRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    kapatRef.current = kapat;
  }, [kapat]);

  useEffect(() => {
    if (!acik) return;
    oncekiOdakRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const kilidiBirak = kaydirmaKilidiAl();
    modalRef.current?.focus();

    const tusla = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        kapatRef.current();
        return;
      }
      if (e.key !== "Tab" || !modalRef.current) return;
      const odaklanabilirler = modalRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (odaklanabilirler.length === 0) return;
      const ilk = odaklanabilirler[0];
      const son = odaklanabilirler[odaklanabilirler.length - 1];
      if (e.shiftKey && document.activeElement === ilk) {
        e.preventDefault();
        son.focus();
      } else if (!e.shiftKey && document.activeElement === son) {
        e.preventDefault();
        ilk.focus();
      }
    };
    document.addEventListener("keydown", tusla);
    return () => {
      document.removeEventListener("keydown", tusla);
      kilidiBirak();
      oncekiOdakRef.current?.focus();
    };
  }, [acik]);

  if (!acik) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onClick={() => kapatRef.current()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="kaynak-baslik"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="max-h-[82dvh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2
              id="kaynak-baslik"
              className="flex items-center gap-2 text-lg font-bold text-slate-900"
            >
              <BookMarked className="h-5 w-5 text-sky-600" />
              Veri kaynakları ve uyarı
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Son veri derlemesi: {tarihStr(meta.insaTarihi)}
            </p>
          </div>
          <button
            onClick={() => kapatRef.current()}
            aria-label="Kapat"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-relaxed text-amber-900">
          {kaynakBilgileri.uyari}
        </p>

        <ul className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
          {kaynakBilgileri.kaynaklar.map((k) => (
            <li key={k.baslik}>
              <a
                href={k.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 px-3.5 py-3 transition hover:bg-sky-50/40"
              >
                <span className="text-sm font-medium text-slate-800">
                  {k.baslik}
                </span>
                <span className="flex shrink-0 items-center gap-1.5 text-xs text-slate-400">
                  {k.tarih}
                  <ExternalLink className="h-3.5 w-3.5 text-sky-700" />
                </span>
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-xs leading-relaxed text-slate-400">
          Bu proje bağımsız bir bilgilendirme aracıdır. Taban puanlar ilgili
          atama döneminde o ile yerleşen adayların en düşük puanını gösterir ve
          sonraki dönemler için bağlayıcı değildir. Doğum ve nüfus verileri
          TÜİK, kira verileri Endeksa&apos;dan yazılı izinle, hastane listeleri
          Sağlık Bakanlığı kaynaklarından alınmıştır. Çerez ve izleme
          kullanılmaz;
          ayrıntılar için{" "}
          <Link
            href="/gizlilik"
            className="font-medium text-sky-700 underline underline-offset-2 hover:text-sky-800"
          >
            gizlilik notuna
          </Link>{" "}
          bakın.
        </p>
      </div>
    </div>
  );
}
