import { useState } from "react";
import { expansionSteps } from "../data/mockSentences";
import type { StudyRecord } from "../types/learning";

interface SentenceExpanderProps {
  onRecord: (record: StudyRecord) => void;
  onNavigate: (view: string) => void;
}

export function SentenceExpander({ onRecord, onNavigate }: SentenceExpanderProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = expansionSteps[stepIndex];
  const isLast = stepIndex === expansionSteps.length - 1;

  const handleNext = () => {
    if (!isLast) {
      setStepIndex((value) => value + 1);
      return;
    }
    onRecord({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      type: "expansion",
      prompt: step.text,
      nextPart: {
        type: "long_sentence_analysis",
        title: "进入长句拆解",
        instruction: "你已经看完一个句子如何变长，下一步把长句拆回主干。",
        focus: "主干、从句、原因关系",
        prompt: "Find the trunk in a long sentence.",
        estimatedMinutes: 8
      }
    });
    onNavigate("long");
  };

  return (
    <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-ocean">当前任务：看短句如何一步步变长</p>
          <h1 className="mt-2 text-2xl font-bold text-ink">第 {stepIndex + 1} 步</h1>
        </div>
        <span className="rounded-full bg-paper px-3 py-1 text-sm font-bold text-muted">
          {stepIndex + 1} / {expansionSteps.length}
        </span>
      </div>

      <div className="mt-6 rounded-lg bg-paper p-5">
        <p className="text-2xl font-bold leading-10 text-ink">{step.text}</p>
        <p className="mt-3 text-base text-muted">{step.chinese}</p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-line p-4">
          <p className="text-sm font-bold text-ink">这一步增加了什么</p>
          <p className="mt-2 text-sm leading-6 text-muted">{step.added}</p>
        </div>
        <div className="rounded-lg border border-line p-4">
          <p className="text-sm font-bold text-ink">它在句子中的作用</p>
          <p className="mt-2 text-sm leading-6 text-muted">{step.role}</p>
        </div>
        <div className="rounded-lg border border-line p-4">
          <p className="text-sm font-bold text-ink">为什么放这里</p>
          <p className="mt-2 text-sm leading-6 text-muted">{step.positionReason}</p>
        </div>
        <div className="rounded-lg border border-line p-4">
          <p className="text-sm font-bold text-ink">学生可以这样模仿</p>
          <p className="mt-2 text-sm leading-6 text-muted">{step.imitation}</p>
        </div>
      </div>

      <button
        className="mt-6 rounded-md bg-ocean px-5 py-3 text-sm font-bold text-white hover:bg-ocean/90"
        onClick={handleNext}
        type="button"
      >
        {isLast ? "生成下一步：长句拆解" : "看下一步扩展"}
      </button>
    </section>
  );
}
