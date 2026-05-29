import type { ExpressionTask } from "../../types/today-path";

export function ExpressionTaskCard({ task }: { task: ExpressionTask }) {
  return (
    <div className="space-y-3">
      <p className="text-base font-bold text-ink">{task.promptZh}</p>
      {task.promptEn && <p className="text-sm text-muted">{task.promptEn}</p>}
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{task.expectedLength.replace(/_/g, " ")}</p>
      {task.sentenceFrames && (
        <div className="grid gap-2">
          {task.sentenceFrames.map((frame) => (
            <p className="rounded-md bg-paper px-3 py-2 text-sm text-muted" key={frame}>
              {frame}
            </p>
          ))}
        </div>
      )}
      <textarea
        className="min-h-24 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-ocean"
        placeholder="把今天想表达的话写在这里。"
      />
    </div>
  );
}
