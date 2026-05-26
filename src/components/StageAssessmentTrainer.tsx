import { useState } from "react";
import { stageAssessments } from "../data/mockAssessments";
import { gptService } from "../services/gptService";
import type { AssessmentResult, AssessmentTask, ProgressState, StageAssessment } from "../types/learning";
import { ClickableEnglish } from "./ClickableEnglish";

interface StageAssessmentTrainerProps {
  progress: ProgressState;
  onComplete: (assessment: StageAssessment) => void;
  onNavigate: (view: string) => void;
}

const taskLabels: Record<AssessmentTask["type"], string> = {
  word_in_context_writing: "语境词写作",
  sentence_pattern_writing: "句式表达",
  sentence_annotation: "结构批注",
  meaning_annotation: "语意批注",
  grammar_correction: "语法修正",
  sentence_rewriting: "句子改写",
  style_annotation: "风格批注",
  paragraph_logic_writing: "段落逻辑写作",
  scenario_response: "场景回应",
  short_essay: "短文写作"
};

export function StageAssessmentTrainer({ progress, onComplete, onNavigate }: StageAssessmentTrainerProps) {
  const baseAssessment = stageAssessments[0];
  const [taskIndex, setTaskIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<AssessmentResult>();
  const [isEvaluating, setIsEvaluating] = useState(false);

  const task = baseAssessment.tasks[taskIndex];
  const isLastTask = taskIndex === baseAssessment.tasks.length - 1;
  const progressPercent = Math.round(((taskIndex + 1) / baseAssessment.tasks.length) * 100);

  const setAnswer = (value: string) => {
    setAnswers((current) => ({ ...current, [task.id]: value }));
  };

  const nextTask = () => {
    if (!isLastTask) {
      setTaskIndex((current) => current + 1);
      return;
    }
    void evaluate();
  };

  const evaluate = async () => {
    setIsEvaluating(true);
    const studentAnswers = baseAssessment.tasks.map((item) => ({
      ...item,
      userAnswer: answers[item.id] ?? ""
    }));
    const assessmentResult = await gptService.evaluateStageAssessment({
      studentProfile: {
        grade: "高一",
        level: "基础偏弱",
        interests: ["school_life", "speech", "news_reading"]
      },
      stageAssessment: baseAssessment,
      studentAnswers,
      learningHistory: progress.records
    });
    const completedAssessment: StageAssessment = {
      ...baseAssessment,
      tasks: studentAnswers,
      result: assessmentResult,
      createdAt: new Date().toISOString()
    };
    setResult(assessmentResult);
    onComplete(completedAssessment);
    setIsEvaluating(false);
  };

  if (result) {
    return <AssessmentReport result={result} onNavigate={onNavigate} />;
  }

  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-soft sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
        <aside className="rounded-lg border border-ocean/25 bg-ocean/5 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-ocean">Stage Assessment</p>
          <h1 className="mt-2 text-2xl font-bold text-ink">{baseAssessment.title}</h1>
          <p className="mt-3 text-sm leading-6 text-muted">{baseAssessment.description}</p>
          <div className="mt-5 space-y-3">
            {baseAssessment.targetGoals.map((goal) => (
              <div key={goal.id} className="rounded-md bg-white p-3">
                <p className="text-sm font-bold text-ink">{goal.description}</p>
                <p className="mt-1 text-xs text-muted">{goal.knowledgePoints.join(" / ")}</p>
              </div>
            ))}
          </div>
        </aside>

        <div className="rounded-lg border border-line bg-paper p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-ocean">
                {taskIndex + 1} / {baseAssessment.tasks.length} · {taskLabels[task.type]}
              </p>
              <h2 className="mt-1 text-xl font-bold text-ink">真实场景任务</h2>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-muted">{progressPercent}%</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-ocean" style={{ width: `${progressPercent}%` }} />
          </div>

          <div className="mt-5 rounded-lg bg-white p-5">
            <p className="text-sm font-bold text-ink">场景</p>
            <p className="mt-2 text-sm leading-6 text-muted">{task.scenario}</p>
            {task.inputText && (
              <div className="mt-4 rounded-md bg-paper p-4">
                <p className="text-sm font-bold text-ink">输入材料 · 每个词都可以点击</p>
                <ClickableEnglish className="mt-2 text-lg font-semibold text-ink" text={task.inputText} />
              </div>
            )}
            <p className="mt-4 text-lg font-semibold leading-8 text-ink">{task.prompt}</p>
          </div>

          <div className="mt-5 rounded-lg bg-white p-5">
            <label className="text-sm font-bold text-ink" htmlFor="assessment-answer">
              写出来 / 批注出来 / 解释出来
            </label>
            <textarea
              className="mt-3 min-h-40 w-full resize-y rounded-md border border-line p-3 text-sm outline-none focus:border-ocean"
              id="assessment-answer"
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="不用写成选择题答案。请像真实学习记录一样，把你的英文、批注或解释写出来。"
              value={answers[task.id] ?? ""}
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {task.expectedSkills.map((skill) => (
                  <span key={skill} className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-muted">
                    {skill}
                  </span>
                ))}
              </div>
              <button
                className="rounded-md bg-ocean px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isEvaluating}
                onClick={nextTask}
                type="button"
              >
                {isEvaluating ? "生成阶段报告中" : isLastTask ? "提交阶段考核" : "保存并进入下一题"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AssessmentReport({ onNavigate, result }: { onNavigate: (view: string) => void; result: AssessmentResult }) {
  const plan = result.nextStageRecommendation;
  const scores = [
    ["总分", result.overallScore],
    ["可否进入下一阶段", plan.canMoveForward ? "可以" : "暂缓"],
    ["建议课次", `${plan.estimatedSessions} 次`]
  ];

  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-soft sm:p-6">
      <p className="text-sm font-semibold text-ocean">阶段性结果报告</p>
      <h1 className="mt-2 text-2xl font-bold text-ink">不是只看分数，而是看下一阶段怎么学</h1>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {scores.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-line bg-paper p-4">
            <div className="text-2xl font-bold text-ink">{value}</div>
            <div className="mt-1 text-sm text-muted">{label}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-lg border border-ocean/25 bg-ocean/5 p-5">
        <p className="text-sm font-bold text-ocean">学习总结</p>
        <p className="mt-2 text-sm leading-6 text-muted">{result.learningSummary}</p>
        <p className="mt-3 text-sm leading-6 text-muted">
          <span className="font-semibold text-ink">为什么这样安排：</span>
          {plan.reason}
        </p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <ResultList title="已经掌握" items={result.masteredGoals} empty="还需要更多证据" />
        <ResultList title="基本理解但不稳定" items={result.partiallyMasteredGoals} empty="暂无" />
        <ResultList title="下一步要补" items={result.weakGoals} empty="暂无明显薄弱点" />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <ResultList title="下一阶段主目标" items={plan.mainGoals} />
        <ResultList title="推荐真实场景" items={plan.recommendedScenarioTypes} />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          className="rounded-md bg-ocean px-5 py-3 text-sm font-bold text-white hover:bg-ocean/90"
          onClick={() => onNavigate(plan.canMoveForward ? "paragraph" : "scenario")}
          type="button"
        >
          按计划继续学习
        </button>
        <button
          className="rounded-md border border-line px-5 py-3 text-sm font-bold text-muted hover:border-ocean hover:text-ocean"
          onClick={() => onNavigate("records")}
          type="button"
        >
          查看学习记录
        </button>
      </div>
    </section>
  );
}

function ResultList({ empty, items, title }: { empty?: string; items: string[]; title: string }) {
  return (
    <div className="rounded-lg border border-line p-4">
      <p className="text-sm font-bold text-ink">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.length > 0 ? (
          items.map((item) => (
            <span key={item} className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-muted">
              {item}
            </span>
          ))
        ) : (
          <span className="text-sm text-muted">{empty}</span>
        )}
      </div>
    </div>
  );
}
