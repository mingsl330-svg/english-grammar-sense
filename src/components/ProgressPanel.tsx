import { nextPartLabels } from "../services/gptService";
import type { ProgressState } from "../types/learning";

interface ProgressPanelProps {
  progress: ProgressState;
  onReset: () => void;
}

export function ProgressPanel({ progress, onReset }: ProgressPanelProps) {
  return (
    <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-ocean">学习记录</p>
          <h1 className="mt-2 text-2xl font-bold text-ink">今天学了什么，下一步练什么</h1>
        </div>
        <button
          className="rounded-md border border-line px-4 py-2 text-sm font-bold text-muted hover:border-rose hover:text-rose"
          onClick={onReset}
          type="button"
        >
          重置记录
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Metric label="240 天路径" value={`Day ${progress.longTermProgress.currentDay}/240`} />
        <Metric label="已归档日报" value={`${progress.checkInReports.length}`} />
        <Metric label="开课前复习" value={`${progress.dailyReviewCompletions.length}`} />
        <Metric label="仿写正确率" value={`${progress.imitationAccuracy}%`} />
        <Metric label="长句理解" value={`${progress.longSentenceAccuracy}%`} />
        <Metric label="段落总结" value={`${progress.paragraphSummaryQuality}%`} />
      </div>

      <div className="mt-6 rounded-lg border border-ocean/25 bg-ocean/5 p-5">
        <p className="text-sm font-bold text-ocean">240-day learning path</p>
        <div className="mt-4 grid gap-3 md:grid-cols-6">
          {[7, 15, 30, 60, 120, 240].map((day) => (
            <div key={day} className="rounded-lg bg-white p-3">
              <p className="text-lg font-bold text-ink">Day {day}</p>
              <p className="mt-1 text-xs leading-5 text-muted">
                {progress.longTermProgress.currentDay >= day ? "Milestone active or completed" : "Random archive review"}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="rounded-lg border border-line p-4">
          <p className="text-sm font-bold text-ink">常错语法点</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {progress.weakGrammarPoints.map((point) => (
              <span key={point} className="rounded-full bg-rose/10 px-3 py-1 text-xs font-semibold text-rose">
                {point}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-line p-4">
          <p className="text-sm font-bold text-ink">已掌握单词</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {progress.masteredWords.map((word) => (
              <span key={word} className="rounded-full bg-leaf/10 px-3 py-1 text-xs font-semibold text-leaf">
                {word}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-line p-4">
        <p className="text-sm font-bold text-ink">生词累计</p>
        <p className="mt-2 text-sm text-muted">
          未掌握生词 {progress.unknownWords.filter((word) => !word.mastered).length} 个；满 10 个会自动进入专项复习。
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {progress.unknownWords
            .filter((word) => !word.mastered)
            .slice(0, 20)
            .map((word) => (
              <span key={word.normalized} className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-muted">
                {word.word}
              </span>
            ))}
        </div>
      </div>

      {progress.stageAssessments.length > 0 && (
        <div className="mt-6 rounded-lg border border-ocean/25 bg-ocean/5 p-5">
          <p className="text-sm font-bold text-ocean">阶段性变化</p>
          <div className="mt-4 space-y-3">
            {progress.stageAssessments.map((assessment) => (
              <article key={`${assessment.id}-${assessment.createdAt}`} className="rounded-lg bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-ink">{assessment.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted">{assessment.result?.learningSummary}</p>
                  </div>
                  <span className="rounded-full bg-paper px-3 py-1 text-xs font-bold text-muted">
                    {assessment.result?.overallScore ?? "-"} 分
                  </span>
                </div>
                {assessment.result && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {assessment.result.nextStageRecommendation.mainGoals.map((goal) => (
                      <span key={goal} className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-muted">
                        {goal}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 rounded-lg border border-line p-4">
        <p className="text-sm font-bold text-ink">每日任务归档</p>
        <div className="mt-4 space-y-3">
          {progress.checkInReports.length > 0 ? (
            progress.checkInReports.slice(0, 12).map((report) => (
              <article key={report.id} className="rounded-lg bg-paper p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-ink">Day {report.dayNumber}</p>
                    <p className="mt-2 text-sm leading-6 text-muted">{report.nextDayFocus}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-muted">
                    {report.scenarioCount ?? report.completedTasks.length} scenes
                  </span>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <ArchiveList title="Words" items={report.newWordsLearned} />
                  <ArchiveList title="Mistakes" items={report.mistakesEncountered ?? [report.mainMistake]} />
                  <ArchiveList title="Next review" items={report.reviewQueue ?? report.milestoneAssessmentFocus ?? []} />
                </div>
              </article>
            ))
          ) : (
            <p className="text-sm text-muted">No daily archive yet.</p>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {progress.records.map((record) => (
          <article key={record.id} className="rounded-lg border border-line p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-ink">{record.prompt}</p>
                {record.studentAnswer && <p className="mt-2 text-sm text-muted">学生回答：{record.studentAnswer}</p>}
              </div>
              <span className="rounded-full bg-paper px-3 py-1 text-xs font-bold text-muted">
                {new Date(record.date).toLocaleDateString()}
              </span>
            </div>
            {record.diagnosis && (
              <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
                <div className="rounded-md bg-paper p-3">理解：{record.diagnosis.comprehensionScore}</div>
                <div className="rounded-md bg-paper p-3">主要问题：{record.diagnosis.mainProblem}</div>
                <div className="rounded-md bg-paper p-3">
                  下一步：{nextPartLabels[record.diagnosis.recommendedNextPart]}
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function ArchiveList({ items, title }: { items: string[]; title: string }) {
  return (
    <div className="rounded-md bg-white p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-muted">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.slice(0, 8).map((item) => (
          <span key={item} className="rounded-full bg-paper px-2 py-1 text-xs font-semibold text-muted">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-paper p-4">
      <div className="text-2xl font-bold text-ink">{value}</div>
      <div className="mt-1 text-sm text-muted">{label}</div>
    </div>
  );
}
