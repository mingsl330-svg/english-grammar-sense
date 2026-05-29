import type { ReadingSeed } from "../../types/today-path";

export function ReadingSeedCard({ reading, showQuestion }: { reading: ReadingSeed; showQuestion: boolean }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-lg font-bold text-ink">{reading.title}</p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted">{reading.wordCount} words</p>
      </div>
      <p className="rounded-md bg-paper p-4 text-sm leading-7 text-ink">{reading.passage}</p>
      <div className="flex flex-wrap gap-2">
        {reading.keyWords.map((word) => (
          <span className="rounded-md border border-line px-3 py-2 text-sm font-semibold text-muted" key={word}>
            {word}
          </span>
        ))}
      </div>
      <p className="text-sm leading-6 text-muted">{reading.summaryZh}</p>
      {showQuestion && <p className="rounded-md bg-ocean/5 p-3 text-sm leading-6 text-muted">{reading.guidingQuestion}</p>}
    </div>
  );
}
