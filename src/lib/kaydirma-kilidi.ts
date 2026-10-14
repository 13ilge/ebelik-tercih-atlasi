let kilitSayisi = 0;

export function kaydirmaKilidiAl(): () => void {
  if (typeof document === "undefined") return () => {};
  kilitSayisi += 1;
  if (kilitSayisi === 1) document.body.style.overflow = "hidden";
  let birakildi = false;
  return () => {
    if (birakildi) return;
    birakildi = true;
    kilitSayisi -= 1;
    if (kilitSayisi === 0) document.body.style.overflow = "";
  };
}
