import { useState } from "react";
import { essayLessons } from "../data/mockEssays";
import type { StudyRecord } from "../types/learning";

interface EssayLogicTrainerProps {
  onRecord: (record: StudyRecord) => void;
}

export function EssayLogicTrainer({ onRecord }: EssayLogicTrainerProps) {
  const essay = essayLessons[0];
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    setSubmitted(true);
    onRecord({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      type: "essay",
      prompt: essay.title,
      studentAnswer: answer,
      nextPart: {
        type: "writing_application",
        title: "继续写作应用",
        instruction: "把文章结构迁移到另一个话题，先写四句骨架。",
        focus: "观点、例子、转折、总结",
        prompt: essay.writingTask,
        estimatedMinutes: 12
      }
    });
  };

  return (
    <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
      <p className="text-sm font-semibold text-ocean">当前任务：看清一篇短文的结构</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink">{essay.title}</h1>
        <span className="rounded-full bg-paper px-3 py-1 text-sm font-bold text-muted">{essay.type}</span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {essay.paragraphs.map((paragraph, index) => (
            <article key={paragraph} className="rounded-lg border border-line p-4">
              <div className="text-xs font-bold text-ocean">Paragraph {index + 1}</div>
              <p className="mt-2 text-sm leading-7 text-ink">{paragraph}</p>
            </article>
          ))}
        </div>
        <aside className="space-y-3">
          <Panel title="文章结构" items={essay.structure} />
          <Panel title="关键词" items={essay.keywords} />
          <Panel title="段落逻辑" items={essay.logic} />
        </aside>
      </div>

      <div className="mt-5 rounded-lg border border-line p-4">
        <p className="text-sm font-bold text-ink">问题练习</p>
        <div className="mt-3 space-y-2">
          {essay.questions.map((question) => (
            <p key={question} className="text-sm text-muted">
              {question}
            </p>
          ))}
        </div>
        <label className="mt-4 block text-sm font-bold text-ink" htmlFor="essay-answer">
          写作模仿
        </label>
        <textarea
          className="mt-3 min-h-24 w-full resize-y rounded-md border border-line p-3 text-sm outline-none focus:border-ocean"
          id="essay-answer"
          onChange={(event) => setAnswer(event.target.value)}
          placeholder={essay.writingTask}
          value={answer}
        />
        <button
          className="mt-3 rounded-md bg-ocean px-5 py-3 text-sm font-bold text-white hover:bg-ocean/90"
          onClick={submit}
          type="button"
        >
          保存写作练习
        </button>
      </div>

      {submitted && (
        <div className="mt-5 rounded-lg border border-ocean/25 bg-ocean/5 p-4 text-sm leading-6 text-muted">
          GPT 反馈预留：这里会根据观点是否清楚、论据是否支撑观点、连接词是否自然，生成下一步写作任务。
        </div>
      )}
    </section>
  );
}

function Panel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-line p-4">
      <p className="text-sm font-bold text-ink">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-muted">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
