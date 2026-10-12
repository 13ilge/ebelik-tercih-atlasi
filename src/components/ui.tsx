import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function Kart({
  baslik,
  icon: Icon,
  ekstra,
  children,
  className,
}: {
  baslik: string;
  icon?: LucideIcon;
  ekstra?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${
        className ?? ""
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
          {Icon ? <Icon className="h-4 w-4 text-sky-600" /> : null}
          {baslik}
        </h3>
        {ekstra}
      </div>
      {children}
    </section>
  );
}

export function Rozet({
  children,
  ton = "notr",
  baslik,
}: {
  children: ReactNode;
  ton?: "notr" | "sky" | "amber" | "kirmizi" | "yesil";
  baslik?: string;
}) {
  const tonlar: Record<string, string> = {
    notr: "bg-slate-100 text-slate-700 border-slate-200",
    sky: "bg-sky-50 text-sky-800 border-sky-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    kirmizi: "bg-red-50 text-red-700 border-red-200",
    yesil: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return (
    <span
      title={baslik}
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${tonlar[ton]}`}
    >
      {children}
    </span>
  );
}

export function IstatistikKutusu({
  etiket,
  deger,
  alt,
  vurgu,
}: {
  etiket: string;
  deger: ReactNode;
  alt?: ReactNode;
  vurgu?: "iyi" | "kotu";
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-2.5">
      <div className="text-sm font-medium text-slate-500">{etiket}</div>
      <div
        className={`mt-0.5 text-lg font-semibold tabular-nums ${
          vurgu === "iyi"
            ? "text-emerald-700"
            : vurgu === "kotu"
              ? "text-red-700"
              : "text-slate-900"
        }`}
      >
        {deger}
      </div>
      {alt ? <div className="mt-0.5 text-xs text-slate-500">{alt}</div> : null}
    </div>
  );
}
