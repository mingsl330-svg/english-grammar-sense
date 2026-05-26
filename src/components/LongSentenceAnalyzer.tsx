import { longSentenceAnalysis } from "../data/mockSentences";
import type { StudyRecord } from "../types/learning";

interface LongSentenceAnalyzerProps {
  onRecord: (record: StudyRecord) => void;
  onNavigate: (view: string) => void;
}

export function LongSentenceAnalyzer({ onRecord, onNavigate }: LongSentenceAnalyzerProps) {
  const analysis = longSentenceAnalysis;

  const finish = () => {
    onRecord({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      type: "long-sentence",
      prompt: analysis.original,
      nextPart: {
        type: "paragraph_logic",
        title: "进入段落逻辑",
        instruction: "长句能先找主干后，可以开始看句子之间如何连接。",
        focus: "主题句和支撑句",
        prompt: "Find the topic sentence in a short paragraph.",
        estimatedMinutes: 10
      }
    });
    onNavigate("paragraph");
  };

  return (
    <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
      <p className="text-sm font-semibold text-ocean">当前任务：先找主干，再看从句</p>
      <div className="mt-5 rounded-lg bg-paper p-5">
        <p className="text-xl font-bold leading-9 text-ink">{analysis.original}</p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-lg border border-ocean/30 bg-ocean/5 p-4">
          <p className="text-sm font-bold text-ocean">先抓主干</p>
          <p className="mt-2 text-lg font-bold text-ink">{analysis.trunk}</p>
          <p className="mt-3 text-sm leading-6 text-muted">
            先知道“谁觉得什么困难”，再把 although 和 because 放回来。
          </p>
        </div>

        <div className="grid gap-3">
          <InfoBlock title="从句" items={analysis.clauses} />
          <InfoBlock title="非谓语结构" items={analysis.nonFinite} />
          <InfoBlock title="连接词" items={analysis.connectors} />
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-line p-4">
          <p className="text-sm font-bold text-ink">顺着英文理解</p>
          <p className="mt-2 text-sm leading-6 text-muted">{analysis.literalChinese}</p>
        </div>
        <div className="rounded-lg border border-line p-4">
          <p className="text-sm font-bold text-ink">更自然的中文</p>
          <p className="mt-2 text-sm leading-6 text-muted">{analysis.naturalChinese}</p>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-line p-4">
        <p className="text-sm font-bold text-ink">简化英文</p>
        <p className="mt-2 text-base text-muted">{analysis.simplifiedEnglish}</p>
        <p className="mt-4 text-sm font-bold text-ink">仿写模板</p>
        <p className="mt-2 text-base text-muted">{analysis.template}</p>
      </div>

      <button
        className="mt-6 rounded-md bg-ocean px-5 py-3 text-sm font-bold text-white hover:bg-ocean/90"
        onClick={finish}
        type="button"
      >
        生成下一步：段落逻辑
      </button>
    </section>
  );
}

function InfoBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-line p-4">
      <p className="text-sm font-bold text-ink">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-muted">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
