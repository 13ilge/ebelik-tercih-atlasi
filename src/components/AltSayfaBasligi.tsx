import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import Logo from "./Logo";

export default function AltSayfaBasligi({
  bolum,
  children,
}: {
  bolum?: string;
  children?: ReactNode;
}) {
  return (
    <header className="border-b border-slate-200 bg-white/95 px-3 py-2 backdrop-blur sm:px-4 sm:py-2.5">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-4 gap-y-2">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-sky-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Haritaya dön
        </Link>
        <span className="flex items-center gap-2">
          <Logo boyut="sm" />
          {bolum ? (
            <span className="text-sm text-slate-500">· {bolum}</span>
          ) : null}
        </span>
        {children}
      </div>
    </header>
  );
}
