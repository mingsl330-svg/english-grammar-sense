import type { ProgressState, StageId } from "../types/learning";

interface DashboardProps {
  progress: ProgressState;
  onNavigate: (view: string) => void;
}

const stageName: Record<StageId, string> = {
  1: "基础短句",
  2: "句子扩展",
  3: "长句拆解",
  4: "段落理解",
  5: "短文逻辑"
};

export function Dashboard({ progress, onNavigate }: DashboardProps) {
  const today = progress.records.filter(
    (record) => new Date(record.date).toDateString() === new Date().toDateString()
  );

  return (
    <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold text-ocean">今日学习</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink sm:text-3xl">{stageName[progress.currentStage]}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              今天从一个真实场景开始：先理解说话人想表达什么，再发现句子结构，最后换到自己的场景里使用。
            </p>
          </div>
          <button
            className="rounded-md bg-ocean px-5 py-3 text-sm font-bold text-white hover:bg-ocean/90"
            onClick={() => onNavigate("scenario")}
            type="button"
          >
            进入场景学习
          </button>
          <button
            className="rounded-md border border-ocean px-5 py-3 text-sm font-bold text-ocean hover:bg-ocean hover:text-white"
            onClick={() => onNavigate("assessment")}
            type="button"
          >
            阶段考核
          </button>
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold text-ocean">今日任务</p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-md bg-paper p-3">
            <div className="font-bold text-ink">{progress.dailyTargets.shortSentences}</div>
            <div className="text-muted">场景句</div>
          </div>
          <div className="rounded-md bg-paper p-3">
            <div className="font-bold text-ink">{progress.dailyTargets.expandedSentences}</div>
            <div className="text-muted">扩展句</div>
          </div>
          <div className="rounded-md bg-paper p-3">
            <div className="font-bold text-ink">{progress.dailyTargets.longSentences}</div>
            <div className="text-muted">长句</div>
          </div>
          <div className="rounded-md bg-paper p-3">
            <div className="font-bold text-ink">{progress.dailyTargets.words}</div>
            <div className="text-muted">重点词</div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white p-6 shadow-soft lg:col-span-2">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["已完成句子", progress.completedSentences],
            ["已掌握单词", progress.masteredWords.length],
            ["已训练语法点", progress.trainedGrammarPoints.length],
            ["阶段报告", progress.stageAssessments.length]
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-line p-4">
              <div className="text-2xl font-bold text-ink">{value}</div>
              <div className="mt-1 text-sm text-muted">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white p-6 shadow-soft lg:col-span-2">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-ocean">最近学习记录</p>
          <button
            className="text-sm font-semibold text-ocean hover:underline"
            onClick={() => onNavigate("records")}
            type="button"
          >
            查看全部
          </button>
        </div>
        <div className="mt-4 grid gap-3">
          {progress.records.slice(0, 3).map((record) => (
            <div key={record.id} className="rounded-md border border-line p-4">
              <div className="text-sm font-semibold text-ink">{record.prompt}</div>
              <div className="mt-2 text-sm text-muted">
                {record.diagnosis
                  ? `下一步：${record.nextPart?.title ?? record.feedback?.nextStep}`
                  : "已记录基础学习"}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
