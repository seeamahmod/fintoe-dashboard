/** Shown instantly on navigation while the next page streams in. */
export default function Loading() {
  return (
    <div className="flex flex-col gap-6 animate-fade" aria-busy="true" aria-label="Loading">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-2"><div className="bone h-10 w-72" /><div className="bone h-5 w-96" /></div>
        <div className="flex gap-3"><div className="bone h-10 w-36" /><div className="bone h-10 w-40" /></div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="shell"><div className="card flex h-[148px] flex-col gap-3 p-4"><div className="bone h-4 w-28" /><div className="bone h-8 w-40" /><div className="bone mt-auto h-6 w-full" /></div></div>)}
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-4">
        <div className="shell"><div className="card h-[380px] p-4"><div className="bone h-full w-full" /></div></div>
        <div className="shell"><div className="card h-[380px] p-4"><div className="bone h-full w-full" /></div></div>
      </div>
    </div>
  );
}
