import { alimGetir, ilHaritasi } from "@/lib/data";
import { uygunlukSonucu } from "@/lib/colors";
import { isaretli, puanStr, sayi, tl } from "@/lib/format";
import type { Il } from "@/lib/types";

interface Satir {
  etiket: string;
  deger: (il: Il) => React.ReactNode;
  sayi?: (il: Il) => number | null;
  yon?: "dusuk" | "yuksek";
}

export default function KarsilastirmaTablosu({
  plakalar,
  donem,
  puan,
}: {
  plakalar: number[];
  donem: string;
  puan: number | null;
}) {
  const iller = plakalar
    .map((p) => ilHaritasi.get(p))
    .filter((il): il is Il => Boolean(il));

  const satirlar: Satir[] = [
    {
      etiket: `Taban puan (${donem})`,
      sayi: (il) => alimGetir(il, donem)?.taban ?? null,
      yon: "dusuk",
      deger: (il) => {
        const a = alimGetir(il, donem);
        return a ? (
          <span className="tabular-nums font-semibold">{puanStr(a.taban)}</span>
        ) : (
          <span className="text-slate-400">alım yok</span>
        );
      },
    },
    {
      etiket: "Kontenjan",
      sayi: (il) => alimGetir(il, donem)?.kontenjan ?? null,
      yon: "yuksek",
      deger: (il) => {
        const a = alimGetir(il, donem);
        return a ? (
          <span className="tabular-nums">{a.kontenjan} kadro</span>
        ) : (
          <span className="text-slate-400">—</span>
        );
      },
    },
    {
      etiket: "Doğum (2025)",
      sayi: (il) => il.dogum,
      deger: (il) => <span className="tabular-nums">{sayi(il.dogum)}</span>,
    },
    {
      etiket: "Nüfus (2025)",
      sayi: (il) => il.nufus,
      deger: (il) => <span className="tabular-nums">{sayi(il.nufus)}</span>,
    },
    {
      etiket: "Ortalama kira",
      sayi: (il) => il.kira,
      yon: "dusuk",
      deger: (il) =>
        il.kira !== null ? (
          <span className="tabular-nums">{tl(il.kira)}</span>
        ) : (
          <span className="text-slate-400">veri yok</span>
        ),
    },
    {
      etiket: "Net göç hızı (2025)",
      sayi: (il) => il.gocHizi,
      yon: "yuksek",
      deger: (il) => (
        <span className="tabular-nums">{isaretli(il.gocHizi)}‰</span>
      ),
    },
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th
              scope="col"
              className="sticky left-0 z-10 min-w-40 whitespace-nowrap bg-slate-50 px-3 py-2 text-left font-medium text-slate-500"
            >
              Karşılaştırma
            </th>
            {iller.map((il) => (
              <th
                key={il.plaka}
                scope="col"
                className="min-w-40 whitespace-nowrap px-3 py-2 text-left font-semibold text-slate-800"
              >
                {il.ad}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {puan !== null && (
            <tr className="border-b border-slate-100 bg-sky-50/40">
              <td className="sticky left-0 z-10 whitespace-nowrap bg-sky-50/80 px-3 py-2 font-medium text-slate-500">
                Puanına uygunluk
              </td>
              {iller.map((il) => {
                const a = alimGetir(il, donem);
                const sonuc = uygunlukSonucu(a ? puan - a.taban : null);
                return (
                  <td key={il.plaka} className="whitespace-nowrap px-3 py-2">
                    <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: sonuc.renk }}
                      />
                      {sonuc.etiket}
                    </span>
                  </td>
                );
              })}
            </tr>
          )}
          {satirlar.map((satir) => {
            const degerler = iller
              .map((il) => (satir.sayi ? satir.sayi(il) : null))
              .filter((v): v is number => v !== null);
            const enIyi =
              satir.yon && degerler.length > 1
                ? satir.yon === "dusuk"
                  ? Math.min(...degerler)
                  : Math.max(...degerler)
                : null;
            return (
              <tr
                key={satir.etiket}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="sticky left-0 z-10 whitespace-nowrap bg-white px-3 py-2 font-medium text-slate-500">
                  {satir.etiket}
                </td>
                {iller.map((il) => {
                  const v = satir.sayi ? satir.sayi(il) : null;
                  const iyi = enIyi !== null && v === enIyi;
                  return (
                    <td
                      key={il.plaka}
                      className={`whitespace-nowrap px-3 py-2 ${
                        iyi ? "font-semibold text-emerald-700" : "text-slate-700"
                      }`}
                    >
                      {satir.deger(il)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="border-t border-slate-100 px-3 py-2 text-xs text-slate-400">
        Yeşil değerler o satırdaki görece en avantajlı ili gösterir. Taban puan
        ve kira için düşük, kontenjan için yüksek olan iyidir; doğum ve nüfus
        nötr bilgilerdir.
      </p>
    </div>
  );
}
