import { useMemo, useState } from "react";
import { learningScenarios } from "../data/mockScenarios";
import type { LookupEntry } from "../services/dictionaryService";
import { gptService } from "../services/gptService";
import type {
  FeedbackResult,
  InteractionStep,
  LearningDiagnosis,
  LearningScenario,
  NextPart,
  OutOfSyllabusWordRecord,
  ProgressState,
  StudyRecord,
  UnknownWordRecord
} from "../types/learning";
import { ClickableEnglish } from "./ClickableEnglish";
import { NextPartPanel } from "./NextPartPanel";

interface ScenarioTrainerProps {
  progress: ProgressState;
  onRecord: (record: StudyRecord) => void;
  onNavigate: (view: string) => void;
  onUnknownWord: (word: Omit<UnknownWordRecord, "firstSeenAt" | "lastSeenAt" | "lookupCount" | "mastered">) => void;
  onOutOfSyllabusWord?: (
    word: Omit<OutOfSyllabusWordRecord, "firstSeenAt" | "lastSeenAt" | "lookupCount" | "optional">
  ) => void;
}

const scenarioLabels: Record<LearningScenario["type"], string> = {
  daily_conversation: "日常对话",
  school_life: "校园交流",
  classroom_discussion: "课堂讨论",
  speech: "演讲表达",
  news_reading: "新闻阅读",
  literary_reading: "文学片段",
  science_article: "科技文章",
  social_issue: "社会议题",
  email_writing: "邮件写作",
  interview: "采访问答",
  debate: "辩论",
  storytelling: "故事续写",
  travel: "旅行沟通",
  application_letter: "申请信"
};

export function ScenarioTrainer({
  onNavigate,
  onOutOfSyllabusWord,
  onRecord,
  onUnknownWord,
  progress
}: ScenarioTrainerProps) {
  const [scenarioIndex, setScenarioIndex] = useState(() => progress.records.length % learningScenarios.length);
  const scenario = learningScenarios[scenarioIndex];
  const [stepIndex, setStepIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [stepFeedback, setStepFeedback] = useState<FeedbackResult>();
  const [diagnosis, setDiagnosis] = useState<LearningDiagnosis>();
  const [nextPart, setNextPart] = useState<NextPart>();
  const [isChecking, setIsChecking] = useState(false);
  const [stepAnswers, setStepAnswers] = useState<Record<string, string>>({});

  const step = scenario.interactionSteps[stepIndex];
  const isLastStep = stepIndex === scenario.interactionSteps.length - 1;

  const progressPercent = useMemo(
    () => Math.round(((stepIndex + 1) / scenario.interactionSteps.length) * 100),
    [scenario.interactionSteps.length, stepIndex]
  );

  const handleLookupEntry = (entry: LookupEntry, sourceSentence: string) => {
    const normalized = entry.word.toLowerCase();
    if (entry.isOutOfSyllabus) {
      onOutOfSyllabusWord?.({
        word: entry.word,
        normalized,
        meaning: entry.meaning,
        phonetic: entry.phonetic,
        sourceSentence,
        reason: entry.syllabusNote ?? "Beyond the high-school core list. Optional learning only."
      });
      return;
    }

    onUnknownWord({
      word: entry.word,
      normalized,
      meaning: entry.meaning,
      partOfSpeech: entry.partOfSpeech,
      phonetic: entry.phonetic,
      sourceSentence
    });
  };

  const submitAnswer = async (value = answer) => {
    setIsChecking(true);
    const result = await gptService.evaluateScenarioResponse({
      scenario,
      stepId: step.id,
      answer: value,
      recentRecords: progress.records
    });
    setStepFeedback(result.feedback);
    setDiagnosis(result.diagnosis);
    setNextPart(isLastStep ? result.nextPart : undefined);
    setStepAnswers((current) => ({ ...current, [step.id]: value }));
    setIsChecking(false);

    if (isLastStep) {
      onRecord({
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        type: "scenario",
        prompt: scenario.title,
        studentAnswer: value,
        feedback: result.feedback,
        diagnosis: result.diagnosis,
        nextPart: result.nextPart
      });
    }
  };

  const goNextStep = () => {
    if (!isLastStep) {
      setStepIndex((current) => getAdaptiveNextStepIndex(current, scenario, diagnosis?.mainProblem));
      setAnswer("");
      setStepFeedback(undefined);
      setDiagnosis(undefined);
      setNextPart(undefined);
      return;
    }
    if (!nextPart) return;
    const routeByType: Record<string, string> = {
      sentence_expansion: "expander",
      long_sentence_analysis: "long",
      paragraph_logic: "paragraph",
      writing_application: "essay",
      review_vocabulary: "scenario",
      review_grammar: "scenario",
      simplify_sentence: "scenario",
      imitation_practice: "scenario",
      continue_same_level: "scenario"
    };
    const nextRoute = routeByType[nextPart.type] ?? "scenario";
    if (nextRoute === "scenario") {
      setScenarioIndex((current) => (current + 1) % learningScenarios.length);
      setStepIndex(0);
      setAnswer("");
      setStepFeedback(undefined);
      setDiagnosis(undefined);
      setNextPart(undefined);
      setStepAnswers({});
    }
    onNavigate(nextRoute);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <section className="space-y-4">
        <ScenarioCard scenario={scenario} />

        <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-ocean">英文材料 · 每个词都可以点击</p>
              <ClickableEnglish
                className="mt-2 text-xl font-bold text-ink"
                onWordLookup={handleLookupEntry}
                text={scenario.languageInput}
              />
            </div>
            <span className="rounded-full bg-paper px-3 py-1 text-xs font-bold text-muted">
              {stepIndex + 1} / {scenario.interactionSteps.length}
            </span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-paper">
            <div className="h-full rounded-full bg-ocean" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-ocean">Step {stepIndex + 1}</p>
              <h2 className="mt-1 text-xl font-bold text-ink">{stepTitle(step)}</h2>
            </div>
            <span className="rounded-full bg-paper px-3 py-1 text-xs font-bold text-muted">
              {step.aiFeedbackMode === "instant" ? "即时反馈" : "提交后反馈"}
            </span>
          </div>

          <p className="mt-4 text-lg font-semibold leading-8 text-ink">{step.prompt}</p>
          {step.teacherHint && (
            <p className="mt-3 rounded-md bg-ocean/5 p-3 text-sm leading-6 text-muted">{step.teacherHint}</p>
          )}

          <ResponseInput
            answer={answer}
            isChecking={isChecking}
            onAnswerChange={setAnswer}
            onChoice={(choice) => {
              setAnswer(choice);
              if (step.aiFeedbackMode === "instant") void submitAnswer(choice);
            }}
            onSubmit={() => void submitAnswer()}
            step={step}
          />

          {stepFeedback && (
            <div className="mt-5 rounded-lg border border-line bg-paper p-4">
              <p className="text-sm font-bold text-ink">回答反馈</p>
              {stepFeedback.aiProvider && (
                <p
                  className={`mt-2 rounded-md px-3 py-2 text-xs font-bold ${
                    stepFeedback.aiProvider === "minimax" ? "bg-leaf/10 text-leaf" : "bg-amber/10 text-amber"
                  }`}
                >
                  AI source: {stepFeedback.aiProvider === "minimax" ? "MiniMax" : "Local fallback"}
                  {stepFeedback.aiStatus ? ` · ${stepFeedback.aiStatus}` : ""}
                </p>
              )}
              <div className="mt-3 grid gap-3">
                <FeedbackRow title="这个问题想让你答什么" value={stepFeedback.expectedAnswer ?? stepFeedback.questionPurpose ?? stepFeedback.reason} />
                <FeedbackRow title="你的回答哪里偏了" value={stepFeedback.studentGap ?? stepFeedback.relevanceJudgement ?? stepFeedback.reason} />
                <FeedbackRow title="现在该怎么修正" value={stepFeedback.correctionFocus ?? stepFeedback.revisedVersion} />
              </div>
              <button
                className="mt-4 rounded-md bg-ocean px-5 py-3 text-sm font-bold text-white hover:bg-ocean/90"
                onClick={goNextStep}
                type="button"
              >
                {isLastStep ? "查看自适应下一步" : "按当前状态继续"}
              </button>
            </div>
          )}
        </div>

        {nextPart && <NextPartPanel diagnosis={diagnosis} nextPart={nextPart} onStartNext={goNextStep} />}
      </section>
    </div>
  );
}

function FeedbackRow({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-md bg-white p-3 text-sm leading-6">
      <p className="font-semibold text-ink">{title}</p>
      <p className="mt-1 text-muted">{value}</p>
    </div>
  );
}

function ScenarioCard({ scenario }: { scenario: LearningScenario }) {
  return (
    <aside className="rounded-lg border border-ocean/25 bg-ocean/5 p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-ocean">{scenarioLabels[scenario.type]}</p>
          <h2 className="mt-2 text-2xl font-bold text-ink">{scenario.title}</h2>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-ocean">
          {scenario.expressionGoal}
        </span>
      </div>
      <div className="mt-4 grid gap-3 text-sm leading-6 text-muted md:grid-cols-3">
        <p className="rounded-md bg-white p-3">
          <span className="font-semibold text-ink">场景：</span>
          {scenario.realWorldContext}
        </p>
        <p className="rounded-md bg-white p-3">
          <span className="font-semibold text-ink">身份：</span>
          {scenario.studentRole}
        </p>
        <p className="rounded-md bg-white p-3">
          <span className="font-semibold text-ink">任务：</span>
          {scenario.taskGoal}
        </p>
      </div>
    </aside>
  );
}

function ResponseInput({
  answer,
  isChecking,
  onAnswerChange,
  onChoice,
  onSubmit,
  step
}: {
  answer: string;
  isChecking: boolean;
  onAnswerChange: (value: string) => void;
  onChoice: (value: string) => void;
  onSubmit: () => void;
  step: InteractionStep;
}) {
  if (step.userInputType === "choice" && step.choices) {
    return (
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {step.choices.map((choice) => (
          <button
            className={`rounded-lg border p-4 text-left text-sm font-semibold ${
              answer === choice ? "border-ocean bg-ocean text-white" : "border-line bg-paper text-ink hover:border-ocean"
            }`}
            key={choice}
            onClick={() => onChoice(choice)}
            type="button"
          >
            {choice}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-5">
      <textarea
        className="min-h-28 w-full resize-y rounded-md border border-line p-3 text-sm outline-none focus:border-ocean"
        onChange={(event) => onAnswerChange(event.target.value)}
        placeholder="先用自己的话回答，不需要写成考试答案。"
        value={answer}
      />
      <button
        className="mt-3 rounded-md bg-ocean px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isChecking || answer.trim().length === 0}
        onClick={onSubmit}
        type="button"
      >
        {isChecking ? "生成反馈中" : "提交这一步"}
      </button>
    </div>
  );
}

function stepTitle(step: InteractionStep) {
  const titles: Record<InteractionStep["type"], string> = {
    context_intro: "进入真实场景",
    comprehension_check: "先理解意思",
    meaning_discovery: "发现语言意图",
    structure_discovery: "自己找表达结构",
    vocabulary_in_context: "在语境里看词",
    guided_response: "场景化模仿",
    free_response: "迁移应用",
    rewrite: "改写表达",
    role_play: "角色回应",
    reflection: "学习反思",
    next_part: "下一步"
  };
  return titles[step.type];
}

function getAdaptiveNextStepIndex(
  current: number,
  scenario: LearningScenario,
  problem?: LearningDiagnosis["mainProblem"]
) {
  const normalNext = Math.min(current + 1, scenario.interactionSteps.length - 1);
  const findAfterCurrent = (type: InteractionStep["type"]) => {
    const found = scenario.interactionSteps.findIndex((step, index) => index > current && step.type === type);
    return found >= 0 ? found : normalNext;
  };

  if (problem === "vocabulary") return findAfterCurrent("vocabulary_in_context");
  if (problem === "sentence_structure") return findAfterCurrent("structure_discovery");
  if (problem === "expression") return findAfterCurrent("guided_response");
  if (problem === "logic") return findAfterCurrent("meaning_discovery");
  return normalNext;
}
