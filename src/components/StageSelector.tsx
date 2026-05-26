import type { StageId } from "../types/learning";

interface StageSelectorProps {
  activeStage: StageId;
  onStart: (view: string, stage: StageId) => void;
}

const stages: Array<{
  id: StageId;
  name: string;
  goal: string;
  difficulty: string;
  minutes: string;
  view: string;
}> = [
  { id: 1, name: "场景短句", goal: "在真实场景中理解一句话的意图和主干", difficulty: "入门", minutes: "10 分钟", view: "scenario" },
  { id: 2, name: "句子扩展", goal: "理解短句如何加时间、原因和让步信息", difficulty: "基础+", minutes: "12 分钟", view: "expander" },
  { id: 3, name: "长句拆解", goal: "先找主干，再看从句和非谓语结构", difficulty: "中等", minutes: "15 分钟", view: "long" },
  { id: 4, name: "段落理解", goal: "识别主题句、支撑句和逻辑关系", difficulty: "中等+", minutes: "15 分钟", view: "paragraph" },
  { id: 5, name: "短文逻辑", goal: "看清文章结构并迁移到写作", difficulty: "进阶", minutes: "20 分钟", view: "essay" }
];

export function StageSelector({ activeStage, onStart }: StageSelectorProps) {
  return (
    <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-ocean">学习阶段</p>
          <h1 className="mt-2 text-2xl font-bold text-ink">从短句到短文</h1>
        </div>
        <p className="max-w-xl text-sm leading-6 text-muted">
          阶段不是固定路线。每次反馈后，系统会根据诊断结果决定是否进入下一阶段。
        </p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {stages.map((stage) => (
          <article
            key={stage.id}
            className={`rounded-lg border p-5 ${
              activeStage === stage.id ? "border-ocean bg-ocean/5" : "border-line bg-white"
            }`}
          >
            <div className="text-sm font-bold text-ocean">Stage {stage.id}</div>
            <h2 className="mt-2 text-lg font-bold text-ink">{stage.name}</h2>
            <p className="mt-3 min-h-16 text-sm leading-6 text-muted">{stage.goal}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-paper px-3 py-1 text-muted">{stage.difficulty}</span>
              <span className="rounded-full bg-paper px-3 py-1 text-muted">{stage.minutes}</span>
            </div>
            <button
              className="mt-5 w-full rounded-md border border-ocean px-4 py-2 text-sm font-bold text-ocean hover:bg-ocean hover:text-white"
              onClick={() => onStart(stage.view, stage.id)}
              type="button"
            >
              开始
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
