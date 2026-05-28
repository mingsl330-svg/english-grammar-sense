import { ExamTrendEngine } from "../services/examTrendEngine";
import type { ProgressState } from "../types/learning";

interface MonthlyReportPageProps {
  progress: ProgressState;
}

export function MonthlyReportPage({ progress }: MonthlyReportPageProps) {
  const trend = ExamTrendEngine.getMonthlyTrend(new Date(), progress);

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-ocean/20 bg-white p-6 shadow-soft">
        <p className="text-xs font-bold uppercase tracking-wide text-ocean">Monthly Report</p>
        <h1 className="mt-2 text-2xl font-bold text-ink">{trend.title}</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          月报不是固定长期计划，而是本月考向、近期表现和可替换实时信息源共同决定的训练方向。
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {trend.topicFocus.map((topic) => (
          <div className="rounded-lg border border-line bg-white p-5 shadow-soft" key={topic.id}>
            <p className="text-lg font-bold text-ink">{topic.label}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{topic.monthlyUse}</p>
            <p className="mt-3 text-sm font-bold text-ocean">阅读角度</p>
            <p className="mt-1 text-sm text-muted">{topic.readingAngles.join(" / ")}</p>
            <p className="mt-3 text-sm font-bold text-ocean">写作方向</p>
            <p className="mt-1 text-sm text-muted">{topic.writingAngles.join(" / ")}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <p className="text-sm font-bold text-ocean">本月出题组提示</p>
        <div className="mt-3 grid gap-2">
          {trend.examinerNotes.map((note) => (
            <p className="rounded-md bg-paper p-3 text-sm leading-6 text-muted" key={note}>{note}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
