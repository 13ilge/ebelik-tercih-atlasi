import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { meta } from "@/lib/data";
import { tarihStr } from "@/lib/format";

export const alt =
  "Ebelik Tercih Atlası — KPSS ebelik taban puanları, kontenjanlar ve şehir bilgileri";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const yazi = await readFile(
  join(process.cwd(), "assets/AtkinsonHyperlegible-Bold.ttf")
);

const cipler = ["Taban puanlar", "Kontenjanlar", "Şehir bilgileri", "Hastaneler"];

export default function Gorsel() {
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
              fontSize: 92,
              color: "#020617",
              letterSpacing: -2,
            }}
          >
            <span>Ebelik Tercih</span>
            <span style={{ color: "#0369a1" }}>&nbsp;Atlası</span>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 20,
              fontSize: 36,
              color: "#334155",
            }}
          >
            KPSS lisans (P3) ebelik atamaları · 81 il
          </div>
          <div style={{ display: "flex", marginTop: 48, gap: 16 }}>
            {cipler.map((c) => (
              <div
                key={c}
                style={{
                  display: "flex",
                  border: "2px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#334155",
                  borderRadius: 999,
                  padding: "10px 26px",
                  fontSize: 28,
                }}
              >
                {c}
              </div>
            ))}
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
          <span>Veriler kamuya açık kaynaklardan derlenmiştir</span>
          <span>Son derleme: {tarihStr(meta.insaTarihi)}</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Atkinson", data: yazi, weight: 700, style: "normal" }],
    }
  );
}
