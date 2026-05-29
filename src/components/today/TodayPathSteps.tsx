import { useState } from "react";
import type { TodayPath, TodayPathStep } from "../../types/today-path";
import { ExamLensCard } from "./ExamLensCard";
import { ExpressionTaskCard } from "./ExpressionTaskCard";
import { ReadingSeedCard } from "./ReadingSeedCard";
import { SentenceSeedCard } from "./SentenceSeedCard";
import { WordSeedCard } from "./WordSeedCard";

interface TodayPathStepsProps {
  path: TodayPath;
}

export function TodayPathSteps({ path }: TodayPathStepsProps) {
  const visibleSteps = path.mode === "sense_space" ? path.steps.filter((step) => step.type !== "exam_lens") : path.steps;
  const [openStepId, setOpenStepId] = useState(visibleSteps[0]?.id ?? "");

  if (!visibleSteps.length) {
    return (
      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <p className="font-bold text-ink">今天的路径还没有准备好</p>
        <p className="mt-2 text-sm text-muted">系统会使用 fallback 路径重新生成。</p>
      </section>
    );
  }

  const renderStep = (step: TodayPathStep) => {
    if (step.type === "word_seed") return <WordSeedCard word={path.wordSeed} />;
    if (step.type === "sentence_seed") return <SentenceSeedCard sentence={path.sentenceSeed} />;
    if (step.type === "reading_seed") return <ReadingSeedCard reading={path.readingSeed} showQuestion={path.mode === "exam_expression"} />;
    if (step.type === "expression_task") return <ExpressionTaskCard task={path.expressionTask} />;
    if (step.type === "exam_lens" && path.optionalExamLens) return <ExamLensCard task={path.optionalExamLens} />;
    return <p className="text-sm text-muted">这个步骤暂时没有内容。</p>;
  };

  return (
    <section className="space-y-3">
      {visibleSteps.map((step, index) => {
        const isOpen = openStepId === step.id;
        return (
          <div className="rounded-lg border border-line bg-white shadow-soft" key={step.id}>
            <button
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              onClick={() => setOpenStepId(isOpen ? "" : step.id)}
              type="button"
            >
              <span>
                <span className="text-xs font-bold uppercase tracking-wide text-muted">Step {index + 1}</span>
                <span className="mt-1 block text-base font-bold text-ink">{step.title}</span>
                <span className="mt-1 block text-sm text-muted">{step.description}</span>
              </span>
              <span className="rounded-md bg-paper px-3 py-2 text-sm font-bold text-muted">{isOpen ? "收起" : "打开"}</span>
            </button>
            {isOpen && <div className="border-t border-line px-5 py-4">{renderStep(step)}</div>}
          </div>
        );
      })}
    </section>
  );
}
