import { useState } from "react";
import { paragraphLessons } from "../data/mockParagraphs";
import { gptService } from "../services/gptService";
import type { LearningDiagnosis, NextPart, ProgressState, StudyRecord } from "../types/learning";
import { NextPartPanel } from "./NextPartPanel";

interface ParagraphTrainerProps {
  progress: ProgressState;
  onRecord: (record: StudyRecord) => void;
  onNavigate: (view: string) => void;
}

export function ParagraphTrainer({ progress, onRecord, onNavigate }: ParagraphTrainerProps) {
  const paragraph = paragraphLessons[0];
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [summary, setSummary] = useState("");
  const [diagnosis, setDiagnosis] = useState<LearningDiagnosis>();
  const [nextPart, setNextPart] = useState<NextPart>();

  const handleSubmit = async () => {
    const result = await gptService.evaluateParagraph(paragraph, summary);
    setDiagnosis(result.diagnosis);
    setNextPart(result.nextPart);
    onRecord({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      type: "paragraph",
      prompt: paragraph.topic,
      studentAnswer: summary,
      diagnosis: result.diagnosis,
      nextPart: result.nextPart
    });
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold text-ocean">当前任务：读一个段落，找主题句</p>
        <div className="mt-5 space-y-3">
          {paragraph.sentences.map((sentence, index) => (
            <button
              className={`w-full rounded-lg border p-4 text-left text-sm leading-6 ${
                selectedTopic === index ? "border-ocean bg-ocean/5" : "border-line bg-white hover:border-ocean/40"
              }`}
              key={sentence}
              onClick={() => setSelectedTopic(index)}
              type="button"
            >
              <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-paper text-xs font-bold text-muted">
                {index + 1}
              </span>
              {sentence}
              {diagnosis && index === paragraph.topicSentenceIndex && (
                <span className="ml-3 rounded-full bg-leaf/10 px-2 py-1 text-xs font-bold text-leaf">
                  主题句
                </span>
              )}
            </button>
          ))}
        </div>

        {diagnosis && (
          <div className="mt-5 grid gap-3 md:grid-cols-5">
            {paragraph.logicMarks.map((mark, index) => (
              <div key={`${mark}-${index}`} className="rounded-md border border-line bg-paper p-3 text-center">
                <div className="text-xs text-muted">句 {index + 1}</div>
                <div className="mt-1 text-sm font-bold text-ink">{mark}</div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 rounded-lg border border-line p-4">
          <label className="text-sm font-bold text-ink" htmlFor="summary">
            用自己的话总结这个段落
          </label>
          <textarea
            className="mt-3 min-h-24 w-full resize-y rounded-md border border-line p-3 text-sm outline-none focus:border-ocean"
            id="summary"
            onChange={(event) => setSummary(event.target.value)}
            placeholder="例如：这个段落说明好的学习习惯比单纯学习很久更重要。"
            value={summary}
          />
          <button
            className="mt-3 rounded-md bg-ocean px-5 py-3 text-sm font-bold text-white hover:bg-ocean/90"
            onClick={handleSubmit}
            type="button"
          >
            提交并生成下一步
          </button>
        </div>

        {diagnosis && (
          <div className="mt-5 rounded-lg border border-line bg-paper p-4">
            <p className="text-sm font-bold text-ink">老师带你看逻辑</p>
            <p className="mt-2 text-sm leading-6 text-muted">{paragraph.summary}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {paragraph.imitationExpressions.map((item) => (
                <span key={item} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-muted">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      <NextPartPanel
        diagnosis={diagnosis}
        nextPart={nextPart}
        onStartNext={() => onNavigate(nextPart?.type === "writing_application" ? "essay" : "paragraph")}
      />
    </div>
  );
}
