"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import Logo from "@/components/Logo";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
      <Logo altBaslik="KPSS lisans (P3) ebelik atamaları · 81 il" />
      <h1 className="text-xl font-bold text-slate-900">
        Beklenmeyen bir hata oluştu
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-slate-600">
        Sayfa yüklenirken bir sorun yaşandı. Tekrar deneyebilir ya da haritaya
        dönebilirsin. Sorun sürerse sayfayı yenilemen yeterli olabilir.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => retry()}
          className="flex items-center gap-1.5 rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-800"
        >
          <RotateCcw className="h-4 w-4" />
          Tekrar dene
        </button>
        <Link
          href="/"
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-sky-800"
        >
          Haritaya dön
        </Link>
      </div>
    </div>
  );
}
