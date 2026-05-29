import type { ExamLensTask } from "../../types/today-path";

export function ExamLensCard({ task }: { task: ExamLensTask }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-bold text-ocean">想看看这篇材料如果出成高考题会怎么考？</p>
      <p className="text-base font-bold text-ink">{task.question}</p>
      {task.options && (
        <div className="grid gap-2">
          {task.options.map((option) => (
            <p className="rounded-md border border-line px-3 py-2 text-sm text-muted" key={option}>
              {option}
            </p>
          ))}
        </div>
      )}
      {task.answer && <p className="text-sm font-bold text-ink">Answer: {task.answer}</p>}
      <p className="rounded-md bg-ocean/5 p-3 text-sm leading-6 text-muted">{task.examinerIntent}</p>
    </div>
  );
}
