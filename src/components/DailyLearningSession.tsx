import { useCallback, useEffect, useMemo, useState } from "react";
import { getChallengeScenarioPool, getDailyScenarioPool } from "../data/dailyScenarioPool";
import { getLearningVersionConfig } from "../data/learningVersions";
import { stageAssessments } from "../data/mockAssessments";
import { buildAdaptiveScenarioPool } from "../services/adaptiveScenarioService";
import type { DailyVocabularyTarget } from "../services/dailyVocabularyService";
import type { LookupEntry } from "../services/dictionaryService";
import { gptService } from "../services/gptService";
import { getDailyLearningPlan, type DailyLearningPlan } from "../services/learningPlanService";
import type {
  CheckInReport,
  FeedbackResult,
  LearningDiagnosis,
  LearningScenario,
  LearningVersion,
  OutOfSyllabusWordRecord,
  PlacementResult,
  ProgressState,
  ScenarioSourceCategory,
  UnknownWordRecord
} from "../types/learning";
import { AudioButton } from "./AudioButton";
import { ClickableEnglish } from "./ClickableEnglish";
import { DailyVocabularyQuiz } from "./DailyVocabularyQuiz";
import { DailyVocabularyTargetPanel } from "./DailyVocabularyTargetPanel";
import { LearningCopilot } from "./LearningCopilot";

interface DailyLearningSessionProps {
  progress: ProgressState;
  learningVersion: LearningVersion;
  placementResult?: PlacementResult;
  initialState?: DailySessionState;
  onSessionStateChange?: (state: DailySessionState) => void;
  onReport: (report: CheckInReport) => void;
  onUnknownWord: (word: Omit<UnknownWordRecord, "firstSeenAt" | "lastSeenAt" | "lookupCount" | "mastered">) => void;
  onOutOfSyllabusWord: (
    word: Omit<OutOfSyllabusWordRecord, "firstSeenAt" | "lastSeenAt" | "lookupCount" | "optional">
  ) => void;
}

export interface DailySessionState {
  scenarioIndex: number;
  answer: string;
  feedback?: FeedbackResult;
  diagnosis?: LearningDiagnosis;
  activatedWords: Record<string, string>;
  completed: Array<{ scenario: LearningScenario; answer: string; diagnosis?: LearningDiagnosis }>;
}

const sourceLabels: Record<ScenarioSourceCategory, string> = {
  recent_hot_topic: "Recent hot topic",
  classic_movie_scene: "Classic movie scene",
  inspirational_speech: "Inspirational speech",
  chinese_traditional_culture: "Chinese traditional culture",
  daily_life: "Daily life",
  gaokao_focus: "Gaokao focus",
  classic_english_literature: "Classic English literature & story"
};

const sourceLabelFor = (category: ScenarioSourceCategory, learningVersion: LearningVersion) => {
  if (learningVersion === "primary_junior" && category === "gaokao_focus") return "Entrance exam focus";
  return sourceLabels[category];
};

export function DailyLearningSession({
  initialState,
  learningVersion,
  onOutOfSyllabusWord,
  onReport,
  onSessionStateChange,
  onUnknownWord,
  placementResult,
  progress
}: DailyLearningSessionProps) {
  const [scenarioIndex, setScenarioIndex] = useState(initialState?.scenarioIndex ?? 0);
  const [answer, setAnswer] = useState(initialState?.answer ?? "");
  const [feedback, setFeedback] = useState<FeedbackResult | undefined>(initialState?.feedback);
  const [diagnosis, setDiagnosis] = useState<LearningDiagnosis | undefined>(initialState?.diagnosis);
  const [isChecking, setIsChecking] = useState(false);
  const [activatedWords, setActivatedWords] = useState<Record<string, string>>(initialState?.activatedWords ?? {});
  const [completed, setCompleted] = useState<Array<{ scenario: LearningScenario; answer: string; diagnosis?: LearningDiagnosis }>>(
    initialState?.completed ?? []
  );
  const [dailyVocabularyTargets, setDailyVocabularyTargets] = useState<DailyVocabularyTarget[]>([]);
  const [report, setReport] = useState<CheckInReport>();
  const versionConfig = getLearningVersionConfig(learningVersion);
  const dailyPlan = useMemo(
    () => getDailyLearningPlan(progress, learningVersion, placementResult),
    [learningVersion, placementResult, progress]
  );

  useEffect(() => {
    onSessionStateChange?.({
      scenarioIndex,
      answer,
      feedback,
      diagnosis,
      activatedWords,
      completed
    });
  }, [activatedWords, answer, completed, diagnosis, feedback, onSessionStateChange, scenarioIndex]);

  const dailyScenarioPool = useMemo(
    () =>
      buildAdaptiveScenarioPool({
        basePool: getDailyScenarioPool(progress.longTermProgress.currentDay, learningVersion),
        learningVersion,
        placement: placementResult,
        progress
      }),
    [learningVersion, placementResult, progress]
  );
  const challengeScenarioPool = useMemo(
    () => getChallengeScenarioPool(progress.longTermProgress.currentDay, learningVersion),
    [learningVersion, progress.longTermProgress.currentDay]
  );
  const scenarioPool = scenarioIndex < dailyScenarioPool.length ? dailyScenarioPool : challengeScenarioPool;
  const plannedDailyScenarios = useMemo(
    () => dailyScenarioPool.slice(0, dailyPlan.sentenceTarget),
    [dailyPlan.sentenceTarget, dailyScenarioPool]
  );
  const scenario = scenarioPool[scenarioIndex % scenarioPool.length];
  const step = scenario.interactionSteps[0];
  const scenarioCount = completed.length;
  const wordCount = Object.keys(activatedWords).length;
  const needsChallenge = scenarioCount >= dailyPlan.sentenceTarget && dailyVocabularyTargets.length < dailyPlan.wordTarget;
  const handleDailyVocabularyTargetsChange = useCallback((targets: DailyVocabularyTarget[]) => {
    setDailyVocabularyTargets(targets);
  }, []);

  const randomAssessment = useMemo(() => {
    const tasks = stageAssessments[0].tasks;
    const seed = (progress.longTermProgress.currentDay + completed.length + wordCount) % tasks.length;
    return tasks[seed];
  }, [completed.length, progress.longTermProgress.currentDay, wordCount]);

  const handleLookupEntry = (entry: LookupEntry, sourceSentence: string) => {
    const normalized = entry.word.toLowerCase();
    if (entry.isOutOfSyllabus) {
      onOutOfSyllabusWord({
        word: entry.word,
        normalized,
        meaning: entry.meaning,
        phonetic: entry.phonetic,
        sourceSentence,
        reason: entry.syllabusNote ?? "Beyond the high-school core list. Optional learning only."
      });
      return;
    }

    const nextActivatedWords = { ...activatedWords, [normalized]: entry.word };
    setActivatedWords(nextActivatedWords);
    onSessionStateChange?.({
      scenarioIndex,
      answer,
      feedback,
      diagnosis,
      activatedWords: nextActivatedWords,
      completed
    });
      onUnknownWord({
        word: entry.word,
        normalized,
        meaning: entry.meaning,
        partOfSpeech: entry.partOfSpeech,
        phonetic: entry.phonetic,
        sourceSentence
      });
  };

  const submit = async () => {
    if (step.correctOption && answer === step.correctOption) {
      nextScenario();
      return;
    }
    setIsChecking(true);
    const result = await gptService.evaluateScenarioResponse({
      scenario,
      stepId: step.id,
      answer,
      recentRecords: progress.records
    });
    setFeedback(result.feedback);
    setDiagnosis(result.diagnosis);
    setIsChecking(false);
  };

  const nextScenario = () => {
    const nextCompleted = [...completed, { scenario, answer, diagnosis }];
    const nextScenarioCount = nextCompleted.length;
    const canFinish = nextScenarioCount >= dailyPlan.sentenceTarget;
    if (canFinish) {
      const generatedReport = buildReport({
        activatedWords,
        completed: nextCompleted,
        dailyVocabularyTargets,
        dailyPlan,
        progress,
        assessmentPrompt: randomAssessment.prompt
      });
      setReport(generatedReport);
      onReport(generatedReport);
      return;
    }
    setCompleted(nextCompleted);
    setScenarioIndex((current) => current + 1);
    setAnswer("");
    setFeedback(undefined);
    setDiagnosis(undefined);
  };

  const startNextDay = () => {
    setScenarioIndex(0);
    setAnswer("");
    setFeedback(undefined);
    setDiagnosis(undefined);
    setIsChecking(false);
    setActivatedWords({});
    setCompleted([]);
    setReport(undefined);
  };

  if (report) {
    return <DailySummary learningVersion={learningVersion} onStartNextDay={startNextDay} report={report} />;
  }

  return (
    <section className="mx-auto max-w-6xl space-y-4">
      <div className="rounded-lg border border-ocean/25 bg-white p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-ocean">
              Day {progress.longTermProgress.currentDay} · Week {dailyPlan.weekNumber} Mission
            </p>
            <h1 className="mt-1 text-2xl font-bold text-ink">{dailyPlan.missionTitle}</h1>
            <p className="mt-2 text-sm leading-6 text-muted">{dailyPlan.missionDescription}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full bg-paper px-3 py-1 text-muted">
              Scenes {Math.min(scenarioCount, dailyPlan.sentenceTarget)} / {dailyPlan.sentenceTarget}
            </span>
            <span className={`rounded-full px-3 py-1 ${wordCount >= dailyPlan.wordTarget ? "bg-leaf/10 text-leaf" : "bg-paper text-muted"}`}>
              New words {wordCount} / {dailyPlan.wordTarget}
            </span>
            <span className="rounded-full bg-ocean/10 px-3 py-1 text-ocean">
              {dailyPlan.difficultyMode}
            </span>
          </div>
        </div>
        {needsChallenge && (
          <p className="mt-3 rounded-md bg-amber/10 p-3 text-sm leading-6 text-amber">
            {dailyPlan.challengeHint}
          </p>
        )}
        <p className="mt-3 rounded-md bg-paper p-3 text-sm leading-6 text-muted">
          Weekly adjustment: {dailyPlan.weeklyAdjustment}
        </p>
      </div>

      <DailyVocabularyTargetPanel
        activatedWords={activatedWords}
        learningVersion={learningVersion}
        onTargetsChange={handleDailyVocabularyTargetsChange}
        scenarios={plannedDailyScenarios}
        targetCount={dailyPlan.wordTarget}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="space-y-4">
          <div className="rounded-lg border border-ocean/25 bg-ocean/5 p-5 shadow-soft">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-ocean">
                {scenario.type}
              </span>
              {scenario.sourceCategory && (
                <span className="rounded-full bg-ocean px-3 py-1 text-xs font-bold text-white">
                  {sourceLabelFor(scenario.sourceCategory, learningVersion)}
                </span>
              )}
            </div>
            <h2 className="mt-2 text-2xl font-bold text-ink">{scenario.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{scenario.realWorldContext}</p>
            {scenario.sourceNote && <p className="mt-2 text-xs font-semibold text-ocean">{scenario.sourceNote}</p>}
            <p className="mt-2 text-sm leading-6 text-muted">
              <span className="font-semibold text-ink">Expression goal:</span>{" "}
              {scenario.expressionGoal}
            </p>
          </div>

          <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-wide text-ocean">
                {versionConfig.inputHint}
              </p>
              <AudioButton label="Play sentence" text={scenario.languageInput} />
            </div>
            <ClickableEnglish
              className="mt-2 text-xl font-bold text-ink"
              learningVersion={learningVersion}
              onWordLookup={handleLookupEntry}
              text={scenario.languageInput}
            />
          </div>

          <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <p className="text-sm font-bold text-ocean">Scene Interaction</p>
            <p className="mt-3 text-lg font-semibold leading-8 text-ink">{step.prompt}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {(step.optionTags ?? step.choices ?? step.successCriteria).map((option) => (
                <button
                  className={`rounded-lg border p-4 text-left text-sm font-semibold leading-6 ${
                    answer === option ? "border-ocean bg-ocean text-white" : "border-line bg-paper text-ink hover:border-ocean"
                  }`}
                  key={option}
                  onClick={() => setAnswer(option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
            {!feedback ? (
              <button
                className="mt-3 rounded-md bg-ocean px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                disabled={answer.trim().length === 0 || isChecking}
                onClick={() => void submit()}
                type="button"
              >
                {isChecking ? "Checking" : "Submit"}
              </button>
            ) : (
              <div className="mt-4 rounded-lg border border-line bg-paper p-4">
                <p className="text-sm font-bold text-ink">Correction</p>
                {feedback.aiProvider === "minimax" ? (
                  <>
                    <FeedbackLine title="Correct idea" value={feedback.expectedAnswer ?? feedback.reason} />
                    <FeedbackLine title="Sentence pattern" value={feedback.correctionFocus ?? feedback.reason} />
                    <FeedbackLine tone="error" title="Your answer missed" value={feedback.studentGap ?? feedback.reason} />
                    <FeedbackLine title="MiniMax feedback" value={feedback.relevanceJudgement ?? feedback.reason} />
                  </>
                ) : (
                  <>
                    {feedback.aiProvider && (
                      <p className="mt-2 rounded-md bg-amber/10 px-3 py-2 text-xs font-bold text-amber">
                        AI source: Local fallback
                        {feedback.aiStatus ? ` · ${feedback.aiStatus}` : ""}
                      </p>
                    )}
                    <FeedbackLine title="Correct option" value={step.correctOption ?? feedback.expectedAnswer ?? feedback.reason} />
                    <FeedbackLine
                      title="Why it is correct"
                      value={
                        step.correctOption
                          ? step.optionExplanations?.[step.correctOption] ?? "It matches the scene goal."
                          : feedback.correctionFocus ?? feedback.reason
                      }
                    />
                    <FeedbackLine
                      tone="error"
                      title="Why your choice is not enough"
                      value={step.optionExplanations?.[answer] ?? feedback.studentGap ?? feedback.reason}
                    />
                  </>
                )}
                <button
                  className="mt-4 rounded-md bg-ocean px-5 py-3 text-sm font-bold text-white hover:bg-ocean/90"
                  onClick={nextScenario}
                  type="button"
                >
                  {scenarioCount + 1 >= dailyPlan.sentenceTarget ? "Generate summary" : "Next scene"}
                </button>
              </div>
            )}
          </div>
        </div>

        <LearningCopilot
          className="lg:sticky lg:top-4"
          contextLabel={scenario.title}
          currentPrompt={step.prompt}
          learningVersion={learningVersion}
          onLookup={handleLookupEntry}
          recentReport={progress.checkInReports[0]}
          sourceSentence={scenario.languageInput}
          unknownWords={progress.unknownWords.filter((word) => !word.mastered)}
        />
      </div>
    </section>
  );
}

function FeedbackLine({ title, value, tone = "default" }: { title: string; value: string; tone?: "default" | "error" }) {
  return (
    <div
      className={`mt-3 rounded-md border p-3 text-sm leading-6 ${
        tone === "error" ? "border-rose/25 bg-rose/10" : "border-transparent bg-white"
      }`}
    >
      <p className={`font-semibold ${tone === "error" ? "text-rose" : "text-ink"}`}>{title}</p>
      <p className="mt-1 text-muted">{value}</p>
    </div>
  );
}

function buildReport(input: {
  activatedWords: Record<string, string>;
  completed: Array<{ scenario: LearningScenario; answer: string; diagnosis?: LearningDiagnosis }>;
  dailyVocabularyTargets: DailyVocabularyTarget[];
  dailyPlan: DailyLearningPlan;
  progress: ProgressState;
  assessmentPrompt: string;
}): CheckInReport {
  const grammar = Array.from(new Set(input.completed.flatMap((item) => item.scenario.hiddenGrammarPoints))).slice(0, 8);
  const grammarReviewExamples = buildGrammarReviewExamples(grammar, input.completed);
  const mistakes = input.completed.flatMap((item) => {
    const step = item.scenario.interactionSteps[0];
    const wrongChoice =
      step.correctOption && item.answer && item.answer !== step.correctOption
        ? [`${item.scenario.title}: chose "${item.answer}", target was "${step.correctOption}"`]
        : [];
    const weakPoints = item.diagnosis?.weakPoints ?? [];
    return [...wrongChoice, ...weakPoints];
  });
  const weak = input.completed.find((item) => item.diagnosis?.mainProblem !== "none")?.diagnosis?.mainProblem;
  const reviewQueue = Array.from(
    new Set([...Object.values(input.activatedWords), ...grammar.slice(0, 5), ...mistakes.slice(0, 5)])
  ).slice(0, 18);
  const targetWords = input.dailyVocabularyTargets.length > 0
    ? input.dailyVocabularyTargets
    : Object.values(input.activatedWords).map((word) => ({
        word,
        normalized: word.toLowerCase(),
        meaning: "Review this word from today's sentence.",
        example: "Use this word in one real sentence.",
        sourceSentence: "",
        sourceTitle: "Today's learning"
      }));
  const reviewWords = targetWords.map((target) => target.word).slice(0, 8);
  return {
    id: crypto.randomUUID(),
    dayNumber: input.progress.longTermProgress.currentDay,
    completedTasks: input.completed.map((item) => item.scenario.title),
    newWordsLearned: reviewWords,
    dailyVocabularyTargets: targetWords,
    grammarPracticed: grammar,
    grammarReviewExamples,
    writingOutput: input.completed.map((item) => item.answer).filter(Boolean).slice(-3),
    mainMistake: weak ? `Main issue: ${weak}` : "Main issue: answers mostly matched scene goals",
    mistakesEncountered: mistakes.length > 0 ? Array.from(new Set(mistakes)).slice(0, 12) : ["No major repeated mistake today"],
    bestImprovement: `Completed ${input.completed.length}/${input.dailyPlan.sentenceTarget} real scenes and actively activated new words while reading.`,
    nextDayFocus: `${input.dailyPlan.nextDayFocus} ${input.dailyPlan.weeklyAdjustment}`,
    streakCount: input.progress.longTermProgress.streakCount + 1,
    scenarioCount: input.completed.length,
    assessmentPrompt: input.assessmentPrompt,
    milestoneAssessmentFocus: Array.from(new Set([...grammar, ...Object.values(input.activatedWords).slice(0, 5)])),
    reviewQueue,
    nextDayReviewPlan: {
      reviewWords,
      grammarFocus: grammar.slice(0, 5),
      firstReviewPrompt:
        reviewWords.length > 0
          ? `Before new scenes, use "${reviewWords[0]}" in one short sentence and reread one pattern from today.`
          : "Before new scenes, reuse one pattern from today in a short sentence.",
      newSceneFocus:
        mistakes.length > 0
          ? `New scenes should target: ${Array.from(new Set(mistakes)).slice(0, 2).join("; ")}.`
          : input.dailyPlan.nextDayFocus
    }
  };
}

function buildGrammarReviewExamples(
  grammar: string[],
  completed: Array<{ scenario: LearningScenario; answer: string; diagnosis?: LearningDiagnosis }>
) {
  return grammar.slice(0, 6).map((point) => {
    const sourceScenario = completed.find((item) => item.scenario.hiddenGrammarPoints.includes(point))?.scenario;
    return {
      grammar: point,
      sourceSentence: sourceScenario?.languageInput ?? "",
      simpleExample: simpleExampleForGrammar(point, sourceScenario?.languageInput),
      tryThis: tryThisForGrammar(point)
    };
  });
}

function simpleExampleForGrammar(point: string, fallback?: string) {
  const normalized = point.toLowerCase();
  if (normalized.includes("because")) return "I stayed after class because I wanted to ask one more question.";
  if (normalized.includes("although")) return "Although the sentence was long, I found the main idea first.";
  if (normalized.includes("who")) return "A friend who explains slowly can help me understand the task.";
  if (normalized.includes("can i")) return "Can I borrow your notebook for a minute?";
  if (normalized.includes("would like")) return "I would like some water because I am thirsty.";
  if (normalized.includes("can't")) return "I can't find my English book.";
  if (normalized.includes("going to")) return "I am going to review three words tonight.";
  if (normalized.includes("should")) return "I should read the sentence carefully before I answer.";
  if (normalized.includes("if")) return "If I do not know a word, I can ask the Copilot first.";
  if (normalized.includes("when")) return "I feel more confident when I understand the scene.";
  if (normalized.includes("will")) return "I will try the sentence again tomorrow.";
  return fallback ?? "I can use this pattern in a real sentence.";
}

function tryThisForGrammar(point: string) {
  const normalized = point.toLowerCase();
  if (normalized.includes("because")) return "Write one reason for a real school problem with because.";
  if (normalized.includes("although")) return "Write one sentence that admits a problem and still keeps the main idea.";
  if (normalized.includes("who")) return "Write one sentence about a person, then add who to explain that person.";
  if (normalized.includes("can")) return "Ask for help or permission in one polite sentence.";
  if (normalized.includes("will") || normalized.includes("going to")) return "Say one real next action you will do after learning.";
  return "Write one short sentence from your own life with this pattern.";
}

export function DailySummary({
  learningVersion = "high_school",
  onFinishToday,
  onReviewWords,
  onStartNextDay,
  report
}: {
  learningVersion?: LearningVersion;
  onFinishToday?: () => void;
  onReviewWords?: () => void;
  onStartNextDay: () => void;
  report: CheckInReport;
}) {
  const [wordGoalPassed, setWordGoalPassed] = useState(!report.dailyVocabularyTargets?.length);
  return (
    <section className="mx-auto max-w-5xl rounded-lg border border-line bg-white p-5 shadow-soft sm:p-6">
      <p className="text-sm font-semibold text-ocean">Daily Summary</p>
      <h1 className="mt-2 text-2xl font-bold text-ink">Day {report.dayNumber} completed</h1>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <Metric label="Scenes" value={`${report.scenarioCount ?? report.completedTasks.length}`} />
        <Metric label="New words" value={`${report.newWordsLearned.length}`} />
        <Metric label="Streak" value={`${report.streakCount}`} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <ListBlock title="New words" items={report.newWordsLearned} />
        <ListBlock title="Repeated grammar / expressions" items={report.grammarPracticed} />
        <ListBlock title="Archived mistakes" items={report.mistakesEncountered ?? []} />
        <ListBlock title="Tomorrow warm-up queue" items={report.reviewQueue ?? []} />
        <ListBlock title="Milestone assessment will use" items={report.milestoneAssessmentFocus ?? []} />
        <ListBlock title="Final outputs" items={report.writingOutput} />
      </div>

      <div className="mt-5 rounded-lg border border-leaf/25 bg-leaf/5 p-4">
        <p className="text-sm font-bold text-ink">Actionable review plan</p>
        <p className="mt-2 text-sm leading-6 text-muted">
          {report.nextDayReviewPlan?.firstReviewPrompt ?? "Start the next day by reusing one word and one pattern from today."}
        </p>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {(report.grammarReviewExamples ?? []).slice(0, 4).map((item) => (
            <div className="rounded-md border border-line bg-white p-3" key={`${item.grammar}-${item.simpleExample}`}>
              <p className="text-xs font-bold uppercase tracking-wide text-leaf">{item.grammar}</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-ink">{item.simpleExample}</p>
              <p className="mt-1 text-xs leading-5 text-muted">{item.tryThis}</p>
            </div>
          ))}
        </div>
        {report.nextDayReviewPlan?.newSceneFocus && (
          <p className="mt-3 rounded-md bg-white p-3 text-sm leading-6 text-muted">
            New scenes after review: {report.nextDayReviewPlan.newSceneFocus}
          </p>
        )}
      </div>

      <DailyVocabularyQuiz
        onPass={() => setWordGoalPassed(true)}
        targets={(report.dailyVocabularyTargets ?? []).map((target) => ({
          ...target,
          sourceTitle: "Daily word goal"
        }))}
      />

      <LearningCopilot
        contextLabel="Daily summary"
        currentPrompt={report.nextDayFocus}
        learningVersion={learningVersion}
        recentReport={report}
        sourceSentence={report.writingOutput[0] ?? report.completedTasks[0]}
      />

      <div className="mt-5 rounded-lg border border-ocean/25 bg-ocean/5 p-4 text-sm leading-6 text-muted">
        <p><span className="font-semibold text-ink">Main issue:</span> {report.mainMistake}</p>
        <p className="mt-2"><span className="font-semibold text-ink">Tomorrow focus:</span> {report.nextDayFocus}</p>
      </div>

      <div className="mt-5 rounded-lg border border-line bg-paper p-4">
        <p className="text-sm font-bold text-ink">Random assessment prompt</p>
        <p className="mt-2 text-sm leading-6 text-muted">{report.assessmentPrompt}</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          className="rounded-md bg-ocean px-5 py-3 text-sm font-bold text-white hover:bg-ocean/90 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!wordGoalPassed}
          onClick={onStartNextDay}
          type="button"
        >
          Continue Day {report.dayNumber + 1}
        </button>
        {!wordGoalPassed && (
          <span className="self-center text-sm font-semibold text-muted">
            Complete the word goal check before the next day.
          </span>
        )}
        {onReviewWords && report.newWordsLearned.length > 0 && (
          <button
            className="rounded-md bg-leaf px-5 py-3 text-sm font-bold text-white hover:bg-leaf/90"
            onClick={onReviewWords}
            type="button"
          >
            Review today's words
          </button>
        )}
        {onFinishToday && (
          <button
            className="rounded-md border border-line bg-white px-5 py-3 text-sm font-bold text-muted hover:border-ocean hover:text-ocean"
            onClick={onFinishToday}
            type="button"
          >
            Finish today's learning
          </button>
        )}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-paper p-4">
      <div className="text-2xl font-bold text-ink">{value}</div>
      <div className="mt-1 text-sm text-muted">{label}</div>
    </div>
  );
}

function ListBlock({ items, title }: { items: string[]; title: string }) {
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
          <span className="text-sm text-muted">None yet</span>
        )}
      </div>
    </div>
  );
}
