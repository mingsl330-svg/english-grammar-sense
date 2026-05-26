import { useCallback, useEffect, useMemo, useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { DailyLearningSession, DailySummary, type DailySessionState } from "./components/DailyLearningSession";
import { DailyWarmupReview, shouldShowDailyWarmup } from "./components/DailyWarmupReview";
import { EssayLogicTrainer } from "./components/EssayLogicTrainer";
import { LongSentenceAnalyzer } from "./components/LongSentenceAnalyzer";
import { MiniMaxSettingsPage } from "./components/MiniMaxSettingsPage";
import { ParagraphTrainer } from "./components/ParagraphTrainer";
import { ProgressPanel } from "./components/ProgressPanel";
import { ScenarioTrainer } from "./components/ScenarioTrainer";
import { SentenceExpander } from "./components/SentenceExpander";
import { SentenceTrainer } from "./components/SentenceTrainer";
import { StageAssessmentTrainer } from "./components/StageAssessmentTrainer";
import { StageSelector } from "./components/StageSelector";
import { VocabularyReviewTrainer } from "./components/VocabularyReviewTrainer";
import { getLearningVersionConfig, learningVersionConfigs } from "./data/learningVersions";
import { progressService } from "./services/progressService";
import type {
  CheckInReport,
  DailyReviewCompletion,
  LearningVersion,
  OutOfSyllabusWordRecord,
  ProgressState,
  StageAssessment,
  StageId,
  StudyRecord,
  UnknownWordRecord
} from "./types/learning";

const VERSION_STORAGE_KEY = "english-grammar-sense-learning-version";

const loadLearningVersion = (): LearningVersion => {
  const stored = localStorage.getItem(VERSION_STORAGE_KEY);
  return stored === "primary_junior" ? "primary_junior" : "high_school";
};

export function App() {
  const [view, setView] = useState("daily");
  const [learningVersion, setLearningVersion] = useState<LearningVersion>(() => loadLearningVersion());
  const [progress, setProgress] = useState<ProgressState>(() => progressService.load(loadLearningVersion()));
  const [dailyCompletionReport, setDailyCompletionReport] = useState<CheckInReport>();
  const [dailySessionState, setDailySessionState] = useState<DailySessionState>();
  const versionConfig = getLearningVersionConfig(learningVersion);

  const resetProgressToDayOne = () => {
    setDailyCompletionReport(undefined);
    setDailySessionState(undefined);
    setProgress(progressService.reset(learningVersion));
    setView("daily");
  };

  const switchLearningVersion = (nextVersion: LearningVersion) => {
    localStorage.setItem(VERSION_STORAGE_KEY, nextVersion);
    setLearningVersion(nextVersion);
    setDailyCompletionReport(undefined);
    setDailySessionState(undefined);
    setProgress(progressService.load(nextVersion));
    setView("daily");
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("reset") !== "1") return;
    resetProgressToDayOne();
    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  useEffect(() => {
    progressService.save(progress, learningVersion);
  }, [learningVersion, progress]);

  const handleRecord = (record: StudyRecord) => {
    setProgress((current) => progressService.addRecord(current, record));
  };

  const handleStageStart = (nextView: string, stage: StageId) => {
    setProgress((current) => ({ ...current, currentStage: stage }));
    setView(nextView);
  };

  const handleAssessmentComplete = (assessment: StageAssessment) => {
    setProgress((current) => progressService.addStageAssessment(current, assessment));
  };

  const handleUnknownWord = (
    word: Omit<UnknownWordRecord, "firstSeenAt" | "lastSeenAt" | "lookupCount" | "mastered">
  ) => {
    setProgress((current) => progressService.addUnknownWord(current, word));
  };

  const handleOutOfSyllabusWord = (
    word: Omit<OutOfSyllabusWordRecord, "firstSeenAt" | "lastSeenAt" | "lookupCount" | "optional">
  ) => {
    setProgress((current) => progressService.addOutOfSyllabusWord(current, word));
  };

  const handleVocabularyReviewPass = (normalizedWords: string[]) => {
    setProgress((current) => progressService.masterUnknownWords(current, normalizedWords));
    setView("daily");
  };

  const handleCheckInReport = (report: CheckInReport) => {
    setDailySessionState(undefined);
    setDailyCompletionReport(report);
    setProgress((current) => progressService.addCheckInReport(current, report));
  };

  const handleDailyReviewComplete = (completion: DailyReviewCompletion) => {
    setProgress((current) => progressService.completeDailyReview(current, completion));
  };

  const handleDailySessionStateChange = useCallback((state: DailySessionState) => {
    setDailySessionState(state);
  }, []);

  const content = useMemo(() => {
    const activeUnknownWords = progress.unknownWords.filter((word) => !word.mastered);
    if (view === "daily" && dailyCompletionReport) {
      return (
        <DailySummary
          onFinishToday={() => {
            setDailyCompletionReport(undefined);
            setDailySessionState(undefined);
            setView("records");
          }}
          onStartNextDay={() => {
            setDailyCompletionReport(undefined);
            setDailySessionState(undefined);
            setView("daily");
          }}
          report={dailyCompletionReport}
        />
      );
    }
    if (view === "daily" && shouldShowDailyWarmup(progress)) {
      return <DailyWarmupReview learningVersion={learningVersion} onComplete={handleDailyReviewComplete} progress={progress} />;
    }
    if ((view === "daily" || view === "scenario") && activeUnknownWords.length >= versionConfig.vocabularyReviewTrigger) {
      return (
        <VocabularyReviewTrainer
          learningVersion={learningVersion}
          onPass={handleVocabularyReviewPass}
          outOfSyllabusWords={progress.outOfSyllabusWords}
          targetCount={versionConfig.vocabularyReviewTrigger}
          words={activeUnknownWords}
        />
      );
    }
    if (view === "daily") {
      return (
        <DailyLearningSession
          initialState={dailySessionState}
          learningVersion={learningVersion}
          onOutOfSyllabusWord={handleOutOfSyllabusWord}
          onReport={handleCheckInReport}
          onSessionStateChange={handleDailySessionStateChange}
          onUnknownWord={handleUnknownWord}
          progress={progress}
        />
      );
    }
    if (view === "dashboard") {
      return <Dashboard onNavigate={setView} progress={progress} />;
    }
    if (view === "stages") {
      return <StageSelector activeStage={progress.currentStage} onStart={handleStageStart} />;
    }
    if (view === "scenario") {
      return (
        <ScenarioTrainer
          onNavigate={setView}
          onOutOfSyllabusWord={handleOutOfSyllabusWord}
          onRecord={handleRecord}
          onUnknownWord={handleUnknownWord}
          progress={progress}
        />
      );
    }
    if (view === "assessment") {
      return (
        <StageAssessmentTrainer
          onComplete={handleAssessmentComplete}
          onNavigate={setView}
          progress={progress}
        />
      );
    }
    if (view === "sentence") {
      return <SentenceTrainer onNavigate={setView} onRecord={handleRecord} progress={progress} />;
    }
    if (view === "expander") {
      return <SentenceExpander onNavigate={setView} onRecord={handleRecord} />;
    }
    if (view === "long") {
      return <LongSentenceAnalyzer onNavigate={setView} onRecord={handleRecord} />;
    }
    if (view === "paragraph") {
      return <ParagraphTrainer onNavigate={setView} onRecord={handleRecord} progress={progress} />;
    }
    if (view === "essay") {
      return <EssayLogicTrainer onRecord={handleRecord} />;
    }
    if (view === "settings") {
      return <MiniMaxSettingsPage onBack={() => setView("daily")} />;
    }
    return <ProgressPanel onReset={resetProgressToDayOne} progress={progress} />;
  }, [
    dailyCompletionReport,
    dailySessionState,
    handleDailySessionStateChange,
    learningVersion,
    progress,
    versionConfig.vocabularyReviewTrigger,
    view
  ]);

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-white/95">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ocean">Scenario English Coach</p>
            <h1 className="text-lg font-bold text-ink">从一个真实场景开始学习 · {versionConfig.label}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(learningVersionConfigs) as LearningVersion[]).map((version) => (
              <button
                className={`rounded-md px-3 py-2 text-sm font-semibold ${
                  learningVersion === version ? "bg-leaf text-white" : "border border-line text-muted hover:border-leaf hover:text-leaf"
                }`}
                key={version}
                onClick={() => switchLearningVersion(version)}
                type="button"
              >
                {learningVersionConfigs[version].shortLabel}
              </button>
            ))}
            <button
              className={`rounded-md px-3 py-2 text-sm font-semibold ${
                view === "daily" ? "bg-ocean text-white" : "text-muted hover:bg-paper hover:text-ink"
              }`}
              onClick={() => setView("daily")}
              type="button"
            >
              今日任务
            </button>
            <button
              className={`rounded-md px-3 py-2 text-sm font-semibold ${
                view === "records" ? "bg-ocean text-white" : "text-muted hover:bg-paper hover:text-ink"
              }`}
              onClick={() => setView("records")}
              type="button"
            >
              学习记录
            </button>
            <button
              className={`rounded-md px-3 py-2 text-sm font-semibold ${
                view === "settings" ? "bg-ocean text-white" : "text-muted hover:bg-paper hover:text-ink"
              }`}
              onClick={() => setView("settings")}
              type="button"
            >
              设置
            </button>
            <button
              className="rounded-md border border-line px-3 py-2 text-sm font-semibold text-muted hover:border-rose hover:text-rose"
              onClick={resetProgressToDayOne}
              type="button"
            >
              重置任务
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6">{content}</main>
    </div>
  );
}
