import { useMemo, useState } from "react";
import { GrammarPointDB, TopicClusterDB, WordBank } from "../data/gaokaoDatabases";
import { aiExaminerService } from "../services/aiExaminerService";
import { ExamTrendEngine } from "../services/examTrendEngine";
import type { AiGenerationRecord, GaokaoLearningPathStage } from "../types/gaokao";
import type { LearningVersion, ProgressState } from "../types/learning";
import { ExaminerReviewPanel } from "./ExaminerReviewPanel";

interface GaokaoLearningPathPageProps {
  stage: GaokaoLearningPathStage;
  learningVersion: LearningVersion;
  progress: ProgressState;
}

const stageMeta: Record<GaokaoLearningPathStage, { title: string; subtitle: string; gentleTitle: string }> = {
  word_sense: {
    title: "Word Sense · 主题词汇",
    gentleTitle: "今日小词",
    subtitle: "主题词汇、高考语境、搭配、写作迁移"
  },
  sentence_builder: {
    title: "Sentence Builder · 高考句型",
    gentleTitle: "我会说一句",
    subtitle: "造句、扩句、语法嵌入、句子升级"
  },
  reading_examiner: {
    title: "Reading Examiner · 语篇阅读",
    gentleTitle: "和我一起读",
    subtitle: "阅读证据、长难句、题型训练、出题组讲评"
  },
  guided_writing: {
    title: "Guided Writing · 写作支架",
    gentleTitle: "英文小日记",
    subtitle: "审题、要点、句型支架、辅助成文"
  },
  independent_writing: {
    title: "Independent Writing · 独立写作",
    gentleTitle: "英语树洞",
    subtitle: "独立表达、高考评分、二次修改"
  },
  exam_simulation: {
    title: "Exam Simulation · 模拟测试入口",
    gentleTitle: "轻量挑战",
    subtitle: "独立入口，不作为每日默认体验；用于阶段性题型适应和讲评迁移"
  }
};

export function GaokaoLearningPathPage({ learningVersion, progress, stage }: GaokaoLearningPathPageProps) {
  const trend = useMemo(() => ExamTrendEngine.getMonthlyTrend(new Date(), progress), [progress]);
  const [answer, setAnswer] = useState("");
  const [record, setRecord] = useState<AiGenerationRecord>();
  const [loading, setLoading] = useState(false);
  const isJunior = learningVersion === "primary_junior";
  const meta = stageMeta[stage];
  const topic = trend.topicFocus[0] ?? TopicClusterDB[0];
  const words = WordBank.filter((word) => word.topicIds.includes(topic.id)).slice(0, 4);
  const grammar = GrammarPointDB.filter((point) => point.linkedTopicIds.includes(topic.id)).slice(0, 3);

  const generate = async () => {
    setLoading(true);
    const next = await aiExaminerService.generateAndRecord({
      stage,
      topicId: topic.id,
      studentAnswer: answer,
      trend
    });
    setRecord(next);
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className={`text-xs font-bold uppercase tracking-wide ${isJunior ? "text-leaf" : "text-ocean"}`}>
          {isJunior ? "语言感知路径" : "中国高考英语出题组模拟系统"}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-ink">{isJunior ? meta.gentleTitle : meta.title}</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          {isJunior ? "先把英文变成生活里的声音、画面和一句自己的表达。" : meta.subtitle}
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <p className="text-sm font-bold text-ink">{topic.label}</p>
          <p className="mt-2 text-sm leading-6 text-muted">{topic.monthlyUse}</p>
          <div className="mt-4 grid gap-2">
            {words.map((word) => (
              <div className="rounded-md bg-paper p-3" key={word.word}>
                <p className="font-bold text-ink">{word.word}</p>
                <p className="mt-1 text-sm text-muted">{word.collocations.join(" / ")}</p>
                <p className="mt-1 text-sm text-muted">{word.writingTransfer}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <p className="text-sm font-bold text-ink">{isJunior ? "今天想说什么" : "结构化生成输入"}</p>
          <div className="mt-3 grid gap-3">
            {grammar.map((point) => (
              <div className="rounded-md border border-line p-3" key={point.id}>
                <p className="font-bold text-ink">{point.name}</p>
                <p className="mt-1 text-sm leading-6 text-muted">{isJunior ? point.sentenceUse : point.examFunction}</p>
              </div>
            ))}
          </div>
          <textarea
            className="mt-4 min-h-28 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-ocean"
            onChange={(event) => setAnswer(event.target.value)}
            placeholder={isJunior ? "可以写中文，也可以写简单英文。比如：我今天想说我有点紧张。" : "输入学生答案或训练需求，系统会保存输入和讲评记录。"}
            value={answer}
          />
          <button
            className={`mt-3 rounded-md px-5 py-3 text-sm font-bold text-white ${isJunior ? "bg-leaf" : "bg-ocean"}`}
            disabled={loading}
            onClick={() => void generate()}
            type="button"
          >
            {loading ? "生成中" : isJunior ? "帮我变成一句英文" : "生成出题组任务与讲评"}
          </button>
        </div>
      </section>

      {record && (
        <>
          <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <p className="text-sm font-bold text-ink">{record.generatedTask.title}</p>
            <p className="mt-2 text-base leading-7 text-muted">{record.generatedTask.prompt}</p>
            {record.generatedTask.sourceText && <p className="mt-3 rounded-md bg-paper p-3 text-sm leading-6 text-muted">{record.generatedTask.sourceText}</p>}
            {record.generatedTask.options && (
              <div className="mt-3 grid gap-2">
                {record.generatedTask.options.map((option) => (
                  <p className="rounded-md border border-line px-3 py-2 text-sm text-muted" key={option}>{option}</p>
                ))}
              </div>
            )}
            <p className="mt-3 text-xs font-semibold text-muted">
              结构化记录已保存：prompt、输入参数、生成结果、学生答案、讲评结果、校验状态。
            </p>
          </section>
          {!isJunior && <ExaminerReviewPanel review={record.examinerReview} />}
        </>
      )}
    </div>
  );
}
