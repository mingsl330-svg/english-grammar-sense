import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { sentenceLessons } from "../data/mockSentences";
import { gptService } from "../services/gptService";
import type {
  FeedbackResult,
  LearningDiagnosis,
  NextPart,
  ProgressState,
  StudyRecord
} from "../types/learning";
import { NextPartPanel } from "./NextPartPanel";
import { WordCard } from "./WordCard";

interface SentenceTrainerProps {
  progress: ProgressState;
  onRecord: (record: StudyRecord) => void;
  onNavigate: (view: string) => void;
}

type LearningPhase = "read" | "words" | "sense" | "grammar" | "imitate";

const phases: Array<{ id: LearningPhase; label: string; title: string }> = [
  { id: "read", label: "读句子", title: "先自己读，不急着看语法" },
  { id: "words", label: "查语境词", title: "点不懂的词，看它在这句话里怎么用" },
  { id: "sense", label: "建语感", title: "像老师一样，一步步看句子为什么这样说" },
  { id: "grammar", label: "看结构", title: "只抽出这句话真正需要的语法" },
  { id: "imitate", label: "自己表达", title: "保留句感，换成自己的内容" }
];

export function SentenceTrainer({ progress, onRecord, onNavigate }: SentenceTrainerProps) {
  const [lessonIndex, setLessonIndex] = useState(() => progress.completedSentences % sentenceLessons.length);
  const lesson = sentenceLessons[lessonIndex];
  const [phase, setPhase] = useState<LearningPhase>("read");
  const [activeWord, setActiveWord] = useState(lesson.words[0]?.word ?? "");
  const [activePart, setActivePart] = useState(lesson.structure[0]?.id ?? "");
  const [revealedMeaning, setRevealedMeaning] = useState(false);
  const [senseStepIndex, setSenseStepIndex] = useState(0);
  const [studentSentence, setStudentSentence] = useState("");
  const [feedback, setFeedback] = useState<FeedbackResult>();
  const [diagnosis, setDiagnosis] = useState<LearningDiagnosis>();
  const [nextPart, setNextPart] = useState<NextPart>();
  const [isChecking, setIsChecking] = useState(false);

  const activeWordInfo = lesson.words.find((word) => word.word === activeWord);
  const activeSegment = lesson.structure.find((segment) => segment.id === activePart);
  const currentSenseStep = lesson.senseSteps[senseStepIndex];

  const phaseIndex = phases.findIndex((item) => item.id === phase);
  const currentPhase = phases[phaseIndex];

  const wordLookup = useMemo(
    () => new Map(lesson.words.map((word) => [word.word.toLowerCase(), word.word])),
    [lesson.words]
  );

  const goPhase = (nextPhase: LearningPhase) => {
    setPhase(nextPhase);
    if (nextPhase === "words") setRevealedMeaning(true);
  };

  const handleTokenClick = (normalized?: string, roleId?: string, queryable?: boolean) => {
    if (roleId) setActivePart(roleId);
    if (queryable && normalized) {
      const matchedWord = wordLookup.get(normalized.toLowerCase());
      if (matchedWord) {
        setActiveWord(matchedWord);
        setPhase("words");
      }
    }
  };

  const resetForNextSentence = () => {
    const nextIndex = (lessonIndex + 1) % sentenceLessons.length;
    setLessonIndex(nextIndex);
    setPhase("read");
    setActiveWord(sentenceLessons[nextIndex].words[0]?.word ?? "");
    setActivePart(sentenceLessons[nextIndex].structure[0]?.id ?? "");
    setRevealedMeaning(false);
    setSenseStepIndex(0);
    setStudentSentence("");
    setFeedback(undefined);
    setDiagnosis(undefined);
    setNextPart(undefined);
  };

  const handleSubmit = async () => {
    setIsChecking(true);
    const result = await gptService.evaluateImitation(lesson, studentSentence, progress.records);
    setFeedback(result.feedback);
    setDiagnosis(result.diagnosis);
    setNextPart(result.nextPart);
    onRecord({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      type: "sentence",
      prompt: lesson.english,
      studentAnswer: studentSentence,
      feedback: result.feedback,
      diagnosis: result.diagnosis,
      nextPart: result.nextPart
    });
    setIsChecking(false);
  };

  const handleNext = () => {
    if (!nextPart) return;
    const routeByType: Record<string, string> = {
      sentence_expansion: "expander",
      long_sentence_analysis: "long",
      paragraph_logic: "paragraph",
      writing_application: "essay",
      challenge_level_up: "expander"
    };
    const nextRoute = routeByType[nextPart.type] ?? "sentence";
    if (nextRoute === "sentence") resetForNextSentence();
    onNavigate(nextRoute);
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-lg border border-line bg-white p-5 shadow-soft sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-ocean">当前任务：围绕一句真实英文建立语感</p>
            <h1 className="mt-2 text-2xl font-bold text-ink">{currentPhase.title}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {phases.map((item, index) => (
              <button
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  phase === item.id
                    ? "bg-ocean text-white"
                    : index <= phaseIndex
                      ? "bg-ocean/10 text-ocean"
                      : "bg-paper text-muted"
                }`}
                key={item.id}
                onClick={() => goPhase(item.id)}
                type="button"
              >
                {index + 1}. {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-lg bg-paper p-5">
          <p className="text-sm font-semibold text-muted">{lesson.readingGoal}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {lesson.tokens.map((token, index) => {
              const isActiveWord =
                token.normalized && activeWordInfo?.word.toLowerCase() === token.normalized.toLowerCase();
              const isActiveRole = token.roleId && token.roleId === activePart;
              const isPunctuation = /^[.,!?]$/.test(token.text);
              return (
                <button
                  className={`sentence-token rounded-md border px-3 py-2 text-left text-xl font-bold leading-8 ${
                    isPunctuation
                      ? "border-transparent bg-transparent px-0 text-ink"
                      : isActiveWord || isActiveRole
                        ? "border-ocean bg-ocean text-white"
                        : token.queryable
                          ? "border-line bg-white text-ink hover:border-ocean"
                          : "border-transparent bg-transparent text-ink"
                  }`}
                  disabled={isPunctuation}
                  key={`${token.text}-${index}`}
                  onClick={() => handleTokenClick(token.normalized ?? token.text, token.roleId, token.queryable)}
                  type="button"
                >
                  {token.text}
                </button>
              );
            })}
          </div>
          {revealedMeaning ? (
            <p className="mt-4 text-base text-muted">{lesson.chinese}</p>
          ) : (
            <button
              className="mt-4 rounded-md border border-ocean px-4 py-2 text-sm font-bold text-ocean hover:bg-ocean hover:text-white"
              onClick={() => setRevealedMeaning(true)}
              type="button"
            >
              我读完了，显示中文意思
            </button>
          )}
        </div>

        {phase === "read" && (
          <LearningBlock
            actionLabel="开始查不懂的词"
            onAction={() => goPhase("words")}
            title="阅读时先做这两件事"
          >
            <p>1. 先不要翻译每一个词，试着判断这句话在说一个动作、状态，还是一种习惯。</p>
            <p>2. 遇到不确定的词，直接点句子里的词，看它在当前句子中的意思。</p>
          </LearningBlock>
        )}

        {phase === "words" && (
          <LearningBlock
            actionLabel="继续看句感"
            onAction={() => goPhase("sense")}
            title="语境词，不背孤立释义"
          >
            <div className="grid gap-3 md:grid-cols-[0.85fr_1.15fr]">
              <div className="space-y-3">
                {lesson.words.map((word) => (
                  <WordCard
                    active={activeWord === word.word}
                    key={word.word}
                    onSelect={() => setActiveWord(word.word)}
                    word={word}
                  />
                ))}
              </div>
              <div className="rounded-lg border border-line bg-white p-4">
                <p className="text-sm font-bold text-ink">难易结合</p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  基础词先看它在句子里的功能，高中常用词再看搭配，进阶词才补写作表达。
                </p>
                {activeWordInfo && (
                  <div className="mt-4 rounded-md bg-paper p-3 text-sm leading-6 text-muted">
                    <p className="font-semibold text-ink">这句话里的语感提示</p>
                    <p>{activeWordInfo.senseHint}</p>
                  </div>
                )}
              </div>
            </div>
          </LearningBlock>
        )}

        {phase === "sense" && (
          <LearningBlock
            actionLabel={senseStepIndex === lesson.senseSteps.length - 1 ? "进入语法和用法" : "看下一步"}
            onAction={() => {
              if (senseStepIndex === lesson.senseSteps.length - 1) goPhase("grammar");
              else setSenseStepIndex((value) => value + 1);
            }}
            title="老师式分步展开"
          >
            <div className="rounded-lg border border-ocean/25 bg-ocean/5 p-4">
              <p className="text-sm font-bold text-ocean">{currentSenseStep.title}</p>
              <p className="mt-3 text-lg font-bold leading-8 text-ink">{currentSenseStep.guideQuestion}</p>
              <p className="mt-3 text-sm leading-6 text-muted">{currentSenseStep.explanation}</p>
              <div className="mt-4 rounded-md bg-white p-3 text-sm text-muted">
                {currentSenseStep.microPractice}
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              {lesson.senseSteps.map((step, index) => (
                <button
                  className={`h-2 flex-1 rounded-full ${index <= senseStepIndex ? "bg-ocean" : "bg-line"}`}
                  key={step.id}
                  onClick={() => setSenseStepIndex(index)}
                  type="button"
                  aria-label={`第 ${index + 1} 步`}
                />
              ))}
            </div>
          </LearningBlock>
        )}

        {phase === "grammar" && (
          <LearningBlock actionLabel="开始自己的表达" onAction={() => goPhase("imitate")} title="只讲这句话需要的语法">
            <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-lg border border-line bg-white p-4">
                <p className="text-sm font-bold text-ink">自然语感</p>
                <p className="mt-2 text-sm leading-6 text-muted">{lesson.naturalSense}</p>
              </div>
              <div className="rounded-lg border border-line bg-white p-4">
                <p className="text-sm font-bold text-ink">时态/形式</p>
                <p className="mt-2 text-sm leading-6 text-muted">{lesson.tenseFocus}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-lg border border-line bg-white p-4">
                <p className="text-sm font-bold text-ink">句子主干</p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  主干是 <span className="font-semibold text-ink">{lesson.trunk}</span>。点击句子里的不同部分，可以看它在句子中的作用。
                </p>
                {activeSegment && (
                  <div className="mt-4 rounded-md bg-ocean/5 p-3 text-sm leading-6">
                    <p className="font-semibold text-ocean">{activeSegment.label}</p>
                    <p className="text-muted">{activeSegment.role}</p>
                  </div>
                )}
              </div>
              <div className="rounded-lg border border-line bg-white p-4">
                <p className="text-sm font-bold text-ink">特殊用法</p>
                <div className="mt-3 space-y-2">
                  {lesson.usageNotes.map((note) => (
                    <p key={note} className="rounded-md bg-paper p-3 text-sm leading-6 text-muted">
                      {note}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </LearningBlock>
        )}

        {phase === "imitate" && (
          <LearningBlock title="从理解到自己的表达">
            <div className="rounded-lg border border-line bg-white p-4">
              <label className="text-sm font-bold text-ink" htmlFor="imitation">
                先保留这句话的表达功能，再换自己的内容
              </label>
              <p className="mt-1 text-sm text-muted">{lesson.imitationTask}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {lesson.replacementWords.map((word) => (
                  <button
                    className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-muted hover:bg-ocean/10 hover:text-ocean"
                    key={word}
                    onClick={() => setStudentSentence(`I like ${word}.`)}
                    type="button"
                  >
                    {word}
                  </button>
                ))}
              </div>
              <textarea
                className="mt-3 min-h-24 w-full resize-y rounded-md border border-line p-3 text-sm outline-none focus:border-ocean"
                id="imitation"
                onChange={(event) => setStudentSentence(event.target.value)}
                placeholder="例如：I like reading because it helps me relax."
                value={studentSentence}
              />
              <button
                className="mt-3 rounded-md bg-ocean px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isChecking}
                onClick={handleSubmit}
                type="button"
              >
                {isChecking ? "判断中" : "提交，生成下一步学习"}
              </button>
            </div>
          </LearningBlock>
        )}

        {feedback && (
          <div className="mt-5 rounded-lg border border-line bg-paper p-5">
            <p className="text-sm font-bold text-ink">反馈不是判分，是告诉你下一步怎么练</p>
            <div className="mt-3 space-y-2 text-sm leading-6 text-muted">
              <p>{feedback.reason}</p>
              <p>
                <span className="font-semibold text-ink">修改版：</span>
                {feedback.revisedVersion}
              </p>
              <p>
                <span className="font-semibold text-ink">更自然：</span>
                {feedback.naturalVersion}
              </p>
            </div>
          </div>
        )}
      </section>

      <NextPartPanel diagnosis={diagnosis} nextPart={nextPart} onStartNext={handleNext} />
    </div>
  );
}

function LearningBlock({
  actionLabel,
  children,
  onAction,
  title
}: {
  actionLabel?: string;
  children: ReactNode;
  onAction?: () => void;
  title: string;
}) {
  return (
    <div className="mt-5 rounded-lg border border-line bg-paper p-4 sm:p-5">
      <p className="text-sm font-bold text-ink">{title}</p>
      <div className="mt-3 text-sm leading-6 text-muted">{children}</div>
      {actionLabel && onAction && (
        <button
          className="mt-4 rounded-md bg-ocean px-5 py-3 text-sm font-bold text-white hover:bg-ocean/90"
          onClick={onAction}
          type="button"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
