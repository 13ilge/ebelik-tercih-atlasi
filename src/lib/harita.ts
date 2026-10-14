import haritaJson from "@/data/turkey-map.generated.json";
import type { Harita } from "./types";

export const harita = haritaJson as unknown as Harita;
