import {
  listeTuvaliCiz,
  tuvalIndir,
  type ListeSatiri,
} from "./liste-tuval";

export function listePngIndir(opts: {
  baslik: string;
  altBaslik: string;
  satirlar: ListeSatiri[];
  dipnot: string;
  dosyaAdi: string;
}) {
  const canvas = listeTuvaliCiz(opts, 1080);
  tuvalIndir(canvas, opts.dosyaAdi);
}
