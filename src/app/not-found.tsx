import Link from "next/link";
import Logo from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
      <Logo altBaslik="KPSS lisans (P3) ebelik atamaları · 81 il" />
      <p className="text-6xl font-bold tabular-nums text-slate-300">404</p>
      <h1 className="text-xl font-bold text-slate-900">
        Aradığın sayfa bulunamadı
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-slate-600">
        Bağlantı taşınmış ya da il adı hatalı yazılmış olabilir. Haritadan tüm
        illere ulaşabilir, arama kutusuyla istediğin ili bulabilirsin.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Link
          href="/"
          className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-800"
        >
          Haritaya dön
        </Link>
        <Link
          href="/il/ankara"
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-sky-800"
        >
          Örnek il sayfası
        </Link>
      </div>
    </div>
  );
}
