import { nextPartLabels } from "../services/gptService";
import type { LearningDiagnosis, NextPart } from "../types/learning";

interface NextPartPanelProps {
  diagnosis?: LearningDiagnosis;
  nextPart?: NextPart;
  onStartNext?: () => void;
}

const problemText: Record<LearningDiagnosis["mainProblem"], string> = {
  vocabulary: "词汇理解",
  grammar: "语法形式",
  sentence_structure: "句子主干",
  expression: "表达自然度",
  logic: "逻辑关系",
  careless: "细节疏忽",
  none: "暂无明显问题"
};

export function NextPartPanel({ diagnosis, nextPart, onStartNext }: NextPartPanelProps) {
  if (!diagnosis || !nextPart) {
    return (
      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <p className="text-sm font-semibold text-ocean">下一步</p>
        <p className="mt-2 text-sm leading-6 text-muted">
          完成当前任务后，系统会根据答案生成诊断和下一步练习。
        </p>
      </section>
    );
  }

  const scores = [
    ["理解", diagnosis.comprehensionScore],
    ["词汇", diagnosis.vocabularyScore],
    ["语法", diagnosis.grammarScore],
    ["主干", diagnosis.sentenceStructureScore],
    ["表达", diagnosis.expressionScore],
    ...(diagnosis.logicScore === undefined ? [] : [["逻辑", diagnosis.logicScore] as [string, number]])
  ] as [string, number][];

  return (
    <section className="rounded-lg border border-ocean/25 bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ocean">诊断结果</p>
          <h3 className="mt-1 text-lg font-bold text-ink">{nextPart.title}</h3>
        </div>
        <span className="rounded-full bg-ocean/10 px-3 py-1 text-xs font-bold text-ocean">
          {nextPartLabels[nextPart.type]}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {scores.map(([label, score]) => (
          <div key={label} className="rounded-md border border-line bg-paper px-3 py-2">
            <div className="text-xs text-muted">{label}</div>
            <div className="mt-1 text-lg font-bold text-ink">{score}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-3 text-sm leading-6">
        <p>
          <span className="font-semibold text-ink">主要问题：</span>
          <span className="text-muted">{problemText[diagnosis.mainProblem]}</span>
        </p>
        <p>
          <span className="font-semibold text-ink">为什么这样安排：</span>
          <span className="text-muted">{diagnosis.reason}</span>
        </p>
        <p>
          <span className="font-semibold text-ink">下一步只练：</span>
          <span className="text-muted">{nextPart.focus}</span>
        </p>
      </div>

      {diagnosis.weakPoints.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {diagnosis.weakPoints.map((point) => (
            <span key={point} className="rounded-full bg-rose/10 px-3 py-1 text-xs font-semibold text-rose">
              {point}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 rounded-md bg-paper p-4">
        <p className="text-sm font-semibold text-ink">{nextPart.instruction}</p>
        <p className="mt-2 text-sm text-muted">{nextPart.prompt}</p>
      </div>

      {onStartNext && (
        <button
          className="mt-4 w-full rounded-md bg-ocean px-4 py-3 text-sm font-bold text-white hover:bg-ocean/90"
          onClick={onStartNext}
          type="button"
        >
          开始下一步
        </button>
      )}
    </section>
  );
}
