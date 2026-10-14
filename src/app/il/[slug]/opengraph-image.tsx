import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { dataset, ilSlug, meta, slugHaritasi } from "@/lib/data";
import { puanStr } from "@/lib/format";

export const alt =
  "İl bazlı ebe taban puanı, kontenjan ve şehir bilgileri — Ebelik Tercih Atlası";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return dataset.iller.map((il) => ({ slug: ilSlug(il) }));
}

const yazi = await readFile(
  join(process.cwd(), "assets/AtkinsonHyperlegible-Bold.ttf")
);

export default async function Gorsel({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const il = slugHaritasi.get(slug);
  const son = il?.alimlar.at(-1);
  const altSatir =
    il && son
      ? `${son.donem} · ${son.kontenjan} kadro · ${il.bolge}`
      : `Veri derlemesi: ${meta.insaTarihi}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#f8fafc",
          fontFamily: "Atkinson",
        }}
      >
        <div style={{ display: "flex", height: 14, background: "#0369a1" }} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "44px 72px 0",
            fontSize: 34,
            color: "#0369a1",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 18,
              height: 18,
              borderRadius: 999,
              background: "#0ea5e9",
            }}
          />
          Ebelik Tercih Atlası
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 72px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 104,
              color: "#020617",
              letterSpacing: -3,
            }}
          >
            {il?.ad ?? "İl bulunamadı"}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 16,
              fontSize: 48,
              color: "#0f172a",
            }}
          >
            {son ? `Ebe taban puanı ${puanStr(son.taban)}` : "Ebe taban puanı"}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 20,
              fontSize: 32,
              color: "#475569",
            }}
          >
            {altSatir}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "0 72px 44px",
            fontSize: 26,
            color: "#64748b",
          }}
        >
          <span>
            {il ? `${il.plaka.toString().padStart(2, "0")} · ${il.ad}` : ""}
          </span>
          <span>Veriler kamuya açık kaynaklardan derlenmiştir</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Atkinson", data: yazi, weight: 700, style: "normal" }],
    }
  );
}
