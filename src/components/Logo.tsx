export default function Logo({
  boyut = "lg",
  altBaslik,
  mobildeGizle,
  mobilKucuk,
}: {
  boyut?: "lg" | "sm";
  altBaslik?: string;
  mobildeGizle?: boolean;
  mobilKucuk?: boolean;
}) {
  const metin =
    boyut === "lg"
      ? mobilKucuk
        ? "text-lg sm:text-2xl"
        : "text-2xl"
      : "text-lg";
  return (
    <span className="inline-flex flex-col leading-tight">
      <span
        className={`font-display ${metin} font-semibold tracking-tight text-slate-950`}
      >
        Ebelik Tercih <span className="text-sky-700">Atlası</span>
      </span>
      {altBaslik ? (
        <span
          className={`mt-0.5 text-xs font-normal text-slate-500 ${
            mobildeGizle ? "max-sm:hidden" : ""
          }`}
        >
          {altBaslik}
        </span>
      ) : null}
    </span>
  );
}
