export function FinalCanSayCard({ lines }: { lines: string[] }) {
  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
      <p className="text-sm font-bold text-ink">今天我能说</p>
      <div className="mt-3 grid gap-2">
        {lines.map((line) => (
          <p className="rounded-md bg-paper px-3 py-2 text-sm font-semibold text-muted" key={line}>
            {line}
          </p>
        ))}
      </div>
    </section>
  );
}
