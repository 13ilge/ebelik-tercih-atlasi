export default function Logo({
  boyut = "lg",
  altBaslik,
}: {
  boyut?: "lg" | "sm";
  altBaslik?: string;
}) {
  const metin = boyut === "lg" ? "text-2xl" : "text-lg";
  return (
    <span className="inline-flex flex-col leading-tight">
      <span
        className={`font-display ${metin} font-semibold tracking-tight text-slate-950`}
      >
        Ebelik Tercih <span className="text-sky-700">Atlası</span>
      </span>
      {altBaslik ? (
        <span className="mt-0.5 text-xs font-normal text-slate-500">
          {altBaslik}
        </span>
      ) : null}
    </span>
  );
}
