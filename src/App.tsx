import { useCallback, useEffect, useMemo, useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { DailyLearningSession, DailySummary, type DailySessionState } from "./components/DailyLearningSession";
import { DailyWarmupReview, shouldShowDailyWarmup } from "./components/DailyWarmupReview";
import { EssayLogicTrainer } from "./components/EssayLogicTrainer";
import { LearnerProfileSwitcher } from "./components/LearnerProfileSwitcher";
import { LongSentenceAnalyzer } from "./components/LongSentenceAnalyzer";
import { MiniMaxSettingsPage } from "./components/MiniMaxSettingsPage";
import { ParagraphTrainer } from "./components/ParagraphTrainer";
import { PlacementAssessment } from "./components/PlacementAssessment";
import { ProgressPanel } from "./components/ProgressPanel";
import { ScenarioTrainer } from "./components/ScenarioTrainer";
import { SentenceExpander } from "./components/SentenceExpander";
import { SentenceTrainer } from "./components/SentenceTrainer";
import { StageAssessmentTrainer } from "./components/StageAssessmentTrainer";
import { StageSelector } from "./components/StageSelector";
import { VocabularyReviewTrainer } from "./components/VocabularyReviewTrainer";
import { getLearningVersionConfig, learningVersionConfigs } from "./data/learningVersions";
import { learnerProfileService, type LearnerProfile } from "./services/learnerProfileService";
import { progressService } from "./services/progressService";
import type {
  CheckInReport,
  DailyReviewCompletion,
  LearningVersion,
  OutOfSyllabusWordRecord,
  PlacementResult,
  ProgressState,
  StageAssessment,
  StageId,
  StudyRecord,
  UnknownWordRecord
} from "./types/learning";

export function App() {
  const [learnerState, setLearnerState] = useState(() => learnerProfileService.load());
  const activeProfile = learnerState.activeProfile;
  const [view, setView] = useState("daily");
  const [learningVersion, setLearningVersion] = useState<LearningVersion>(() => activeProfile.learningVersion);
  const [progress, setProgress] = useState<ProgressState>(() =>
    progressService.load(activeProfile.learningVersion, activeProfile.id)
  );
  const [dailyCompletionReport, setDailyCompletionReport] = useState<CheckInReport>();
  const [dailySessionState, setDailySessionState] = useState<DailySessionState>();
  const versionConfig = getLearningVersionConfig(learningVersion);

  const resetProgressToDayOne = () => {
    setDailyCompletionReport(undefined);
    setDailySessionState(undefined);
    setProgress(progressService.reset(learningVersion, activeProfile.id));
    setView("daily");
  };

  const switchLearningVersion = (nextVersion: LearningVersion) => {
    const nextLearnerState = learnerProfileService.updateActive({ learningVersion: nextVersion });
    setLearnerState(nextLearnerState);
    setLearningVersion(nextVersion);
    setDailyCompletionReport(undefined);
    setDailySessionState(undefined);
    setProgress(progressService.load(nextVersion, nextLearnerState.activeProfile.id));
    setView("daily");
  };

  const selectLearnerProfile = (profileId: string, accessCode?: string) => {
    try {
      const nextLearnerState = learnerProfileService.activate(profileId, accessCode);
      setLearnerState(nextLearnerState);
      setLearningVersion(nextLearnerState.activeProfile.learningVersion);
      setDailyCompletionReport(undefined);
      setDailySessionState(undefined);
      setProgress(progressService.load(nextLearnerState.activeProfile.learningVersion, nextLearnerState.activeProfile.id));
      setView("daily");
      return true;
    } catch {
      return false;
    }
  };

  const createLearnerProfile = (displayName: string, version: LearningVersion, accessCode: string) => {
    const nextLearnerState = learnerProfileService.create({ displayName, learningVersion: version, accessCode });
    setLearnerState(nextLearnerState);
    setLearningVersion(version);
    setDailyCompletionReport(undefined);
    setDailySessionState(undefined);
    setProgress(progressService.load(version, nextLearnerState.activeProfile.id));
    setView("daily");
  };

  const setActiveLearnerAccessCode = (accessCode: string) => {
    const nextLearnerState = learnerProfileService.updateActiveAccessCode(accessCode);
    setLearnerState(nextLearnerState);
  };

  const updateActiveLearnerProfile = (input: Partial<Pick<LearnerProfile, "displayName" | "studyPace">>) => {
    setLearnerState(learnerProfileService.updateActive(input));
  };

  const handlePlacementComplete = (result: PlacementResult) => {
    const nextLearnerState = learnerProfileService.updateActive({
      learningVersion: result.learningVersion,
      placement: result,
      studyPace: result.studyPace
    });
    const placementProgress = progressService.applyPlacementResult(
      progressService.load(result.learningVersion, nextLearnerState.activeProfile.id),
      result
    );

    setLearnerState(nextLearnerState);
    setLearningVersion(result.learningVersion);
    setDailyCompletionReport(undefined);
    setDailySessionState(undefined);
    setProgress(placementProgress);
    setView("daily");
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("reset") !== "1") return;
    resetProgressToDayOne();
    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  useEffect(() => {
    progressService.save(progress, learningVersion, activeProfile.id);
  }, [activeProfile.id, learningVersion, progress]);

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
    if (view === "daily" && !activeProfile.placement) {
      return (
        <PlacementAssessment
          learnerName={activeProfile.displayName}
          learningVersion={learningVersion}
          onComplete={handlePlacementComplete}
        />
      );
    }
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
          placementResult={activeProfile.placement}
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
    activeProfile.displayName,
    activeProfile.placement,
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
            <h1 className="text-lg font-bold text-ink">
              从一个真实场景开始学习 · {activeProfile.displayName} · {versionConfig.label}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <LearnerProfileSwitcher
              activeProfile={activeProfile}
              onCreate={createLearnerProfile}
              onSelect={selectLearnerProfile}
              onSetAccessCode={setActiveLearnerAccessCode}
              onUpdateActive={updateActiveLearnerProfile}
              profiles={learnerState.profiles}
            />
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
