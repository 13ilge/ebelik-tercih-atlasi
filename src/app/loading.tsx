export default function Loading() {
  return (
    <div className="flex h-dvh flex-col bg-slate-50">
      <div className="h-16 shrink-0 border-b border-slate-200 bg-white" />
      <div className="flex flex-1 items-center justify-center">
        <div
          role="status"
          className="flex items-center gap-3 text-sm text-slate-500"
        >
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-sky-600 motion-reduce:animate-none" />
          Yükleniyor…
        </div>
      </div>
    </div>
  );
}
