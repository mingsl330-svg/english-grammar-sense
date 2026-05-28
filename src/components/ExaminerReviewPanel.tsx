import type { ExaminerReview } from "../types/gaokao";

interface ExaminerReviewPanelProps {
  review: ExaminerReview;
}

export function ExaminerReviewPanel({ review }: ExaminerReviewPanelProps) {
  const items = [
    ["考查能力", review.assessedAbility],
    ["命题意图", review.examinerIntent],
    ["正确答案依据", review.answerEvidence],
    ["干扰项设计", review.distractorDesign],
    ["写作迁移", review.writingTransfer],
    ["下一步训练", review.nextTraining]
  ];

  return (
    <section className="rounded-lg border border-ocean/20 bg-white p-5 shadow-soft">
      <p className="text-sm font-bold text-ocean">AI 出题组讲评</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {items.map(([label, value]) => (
          <div className="rounded-md border border-line bg-paper p-3" key={label}>
            <p className="text-xs font-bold uppercase tracking-wide text-muted">{label}</p>
            <p className="mt-1 text-sm leading-6 text-ink">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-md border border-amber/20 bg-amber/10 p-3">
        <p className="text-xs font-bold uppercase tracking-wide text-amber">常见错误</p>
        <ul className="mt-2 space-y-1 text-sm leading-6 text-muted">
          {review.commonMistakes.map((mistake) => (
            <li key={mistake}>{mistake}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
