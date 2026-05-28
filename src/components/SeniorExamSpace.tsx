import { ExamTrendEngine } from "../services/examTrendEngine";
import { buildStudentAbilityProfile } from "../services/studentAbilityProfileService";
import type { ProgressState } from "../types/learning";

interface SeniorExamSpaceProps {
  progress: ProgressState;
  onNavigate: (view: string) => void;
}

const seniorActions = [
  ["主题词汇", "word-sense"],
  ["高考句型", "sentence-builder"],
  ["语篇阅读", "reading-examiner"],
  ["出题组讲评", "reading-examiner"],
  ["写作升级", "guided-writing"],
  ["能力画像", "student-profile"],
  ["模拟测试入口", "exam-simulation"]
] as const;

export function SeniorExamSpace({ onNavigate, progress }: SeniorExamSpaceProps) {
  const trend = ExamTrendEngine.getMonthlyTrend(new Date(), progress);
  const profile = buildStudentAbilityProfile(progress);
  const todayTask = trend.topicFocus[0];

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-ocean/25 bg-white p-6 shadow-soft">
        <p className="text-xs font-bold uppercase tracking-wide text-ocean">高中到大学 · 表达成长空间</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">本月主题进入，今日表达开始</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-muted">
          系统用高考命题逻辑做上层指导，但默认体验不是做卷子，而是从主题词、句子、阅读和表达逐步走向独立写作。
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button className="rounded-md bg-ocean px-5 py-3 text-sm font-bold text-white" onClick={() => onNavigate("daily")} type="button">
            开始今日表达任务
          </button>
          <button
            className="rounded-md border border-ocean px-5 py-3 text-sm font-bold text-ocean hover:bg-ocean hover:text-white"
            onClick={() => onNavigate("monthly-report")}
            type="button"
          >
            查看月度考向
          </button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <p className="text-sm font-bold text-ocean">{trend.title}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {trend.topicFocus.map((topic) => (
              <div className="rounded-md bg-paper p-3" key={topic.id}>
                <p className="font-bold text-ink">{topic.label}</p>
                <p className="mt-1 text-sm leading-6 text-muted">{topic.monthlyUse}</p>
              </div>
            ))}
          </div>
          {todayTask && (
            <p className="mt-4 rounded-md bg-ocean/5 p-3 text-sm leading-6 text-muted">
              今日表达任务：围绕 <span className="font-bold text-ink">{todayTask.label}</span>，先积累主题词，再写出一个能说明观点的升级句。
            </p>
          )}
        </div>

        <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <p className="text-sm font-bold text-ocean">能力画像快照</p>
          <div className="mt-4 space-y-3">
            {[
              ["词汇语境", profile.vocabularyContext],
              ["长难句理解", profile.longSentenceUnderstanding],
              ["观点表达", profile.opinionExpression],
              ["写作组织", profile.writingOrganization]
            ].map(([label, value]) => (
              <div key={label}>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-ink">{label}</span>
                  <span className="text-muted">{value}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-paper">
                  <div className="h-2 rounded-full bg-ocean" style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        {seniorActions.map(([label, view]) => (
          <button
            className="rounded-md border border-line bg-white px-4 py-3 text-left text-sm font-bold text-ink shadow-soft hover:border-ocean hover:text-ocean"
            key={label}
            onClick={() => onNavigate(view)}
            type="button"
          >
            {label}
          </button>
        ))}
      </section>
    </div>
  );
}
