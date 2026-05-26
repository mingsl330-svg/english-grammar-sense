import { useMemo, useState } from "react";
import { getLearningVersionConfig } from "../data/learningVersions";
import type { CheckInMilestone, CheckInReport, DailyReviewCompletion, LearningVersion, ProgressState } from "../types/learning";

interface DailyWarmupReviewProps {
  learningVersion?: LearningVersion;
  progress: ProgressState;
  onComplete: (completion: DailyReviewCompletion) => void;
}

const milestoneDays: Record<number, CheckInMilestone> = {
  7: "day_7",
  15: "day_15",
  30: "day_30",
  60: "day_60",
  120: "day_120",
  240: "day_240"
};

const pickRotating = (items: string[], limit: number, seed: number) => {
  const unique = Array.from(new Set(items.filter(Boolean)));
  if (unique.length <= limit) return unique;
  return Array.from({ length: limit }, (_, index) => unique[(seed + index) % unique.length]);
};

const rotateOptions = (options: string[], seed: number) => {
  const offset = seed % options.length;
  return [...options.slice(offset), ...options.slice(0, offset)];
};

export function shouldShowDailyWarmup(progress: ProgressState) {
  const dayNumber = progress.longTermProgress.currentDay;
  if (dayNumber <= 1) return false;
  if (!progress.checkInReports.some((report) => report.dayNumber === dayNumber - 1)) return false;
  return !progress.dailyReviewCompletions.some((completion) => completion.dayNumber === dayNumber);
}

export function DailyWarmupReview({ learningVersion = "high_school", onComplete, progress }: DailyWarmupReviewProps) {
  const [milestoneAnswer, setMilestoneAnswer] = useState("");
  const [milestoneChecked, setMilestoneChecked] = useState(false);
  const dayNumber = progress.longTermProgress.currentDay;
  const versionConfig = getLearningVersionConfig(learningVersion);
  const previousReport = progress.checkInReports.find((report) => report.dayNumber === dayNumber - 1);
  const milestone = milestoneDays[dayNumber];
  const reviewReports = buildReviewReports(progress.checkInReports, dayNumber, milestone);
  const limits =
    learningVersion === "primary_junior"
      ? { words: milestone ? 6 : 4, mistakes: milestone ? 3 : 2, grammar: milestone ? 4 : 3 }
      : { words: milestone ? 10 : 6, mistakes: milestone ? 5 : 3, grammar: milestone ? 6 : 4 };
  const reviewWords = pickRotating(
    reviewReports.flatMap((report) => report.newWordsLearned),
    limits.words,
    dayNumber
  );
  const reviewMistakes = pickRotating(
    reviewReports.flatMap((report) => report.mistakesEncountered ?? [report.mainMistake]),
    limits.mistakes,
    dayNumber + 3
  );
  const grammarFocus = pickRotating(
    reviewReports.flatMap((report) => report.grammarPracticed),
    limits.grammar,
    dayNumber + 6
  );
  const milestoneTask = useMemo(
    () => (milestone ? buildMilestoneTask({ dayNumber, grammarFocus, learningVersion, reviewMistakes, reviewWords }) : undefined),
    [dayNumber, grammarFocus, learningVersion, milestone, reviewMistakes, reviewWords]
  );

  const complete = () => {
    onComplete({
      dayNumber,
      completedAt: new Date().toISOString(),
      reviewWords,
      reviewMistakes,
      milestone
    });
  };

  return (
    <section className="mx-auto max-w-5xl rounded-lg border border-ocean/25 bg-white p-5 shadow-soft sm:p-6">
      <p className="text-sm font-semibold text-ocean">
        {milestone ? `Milestone Review · ${milestone.replace("_", " ")}` : "Daily Warm-up"}
      </p>
      <h1 className="mt-2 text-2xl font-bold text-ink">Day {dayNumber} starts with yesterday's traces</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Before the next {versionConfig.sceneTarget}-scene mission starts, quickly reactivate a small set of words,
        sentence patterns, and errors archived from recent learning. This keeps the 240-day path cumulative without
        pushing too much review into one milestone.
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <ReviewBlock
          accent="text-ocean"
          items={reviewWords}
          title={milestone ? "Random words from recent days" : "Yesterday's activated words"}
        />
        <ReviewBlock
          accent="text-rose"
          items={reviewMistakes}
          title={milestone ? "Random weak points" : "Mistakes to avoid today"}
        />
        <ReviewBlock
          accent="text-leaf"
          items={grammarFocus}
          title={milestone ? "Grammar patterns to recycle" : "Patterns to reuse"}
        />
      </div>

      {previousReport && (
        <div className="mt-5 rounded-lg border border-line bg-paper p-4">
          <p className="text-sm font-bold text-ink">Archived Day {previousReport.dayNumber}</p>
          <p className="mt-2 text-sm leading-6 text-muted">{previousReport.nextDayFocus}</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <MiniList title="Final outputs" items={previousReport.writingOutput} />
            <MiniList title="Assessment seed" items={[previousReport.assessmentPrompt ?? "Random review task"]} />
          </div>
        </div>
      )}

      {milestoneTask && (
        <div className="mt-5 rounded-lg border border-amber/25 bg-amber/10 p-4">
          <p className="text-sm font-bold text-ink">Milestone quick check</p>
          <p className="mt-2 text-sm leading-6 text-muted">{milestoneTask.prompt}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {milestoneTask.options.map((option) => (
              <button
                className={`rounded-md border px-3 py-2 text-left text-sm font-semibold leading-5 ${
                  milestoneAnswer === option ? "border-amber bg-white text-ink" : "border-line bg-white/70 text-muted hover:border-amber"
                }`}
                key={option}
                onClick={() => {
                  setMilestoneAnswer(option);
                  setMilestoneChecked(false);
                }}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
          {milestoneChecked && (
            <div
              className={`mt-3 rounded-md p-3 text-sm leading-6 ${
                milestoneAnswer === milestoneTask.correctOption ? "bg-leaf/10 text-leaf" : "bg-rose/10 text-rose"
              }`}
            >
              <p className="font-bold">
                {milestoneAnswer === milestoneTask.correctOption ? "Accepted" : `Correct option: ${milestoneTask.correctOption}`}
              </p>
              <p className="mt-1 text-muted">{milestoneTask.explanation}</p>
            </div>
          )}
          <button
            className="mt-3 rounded-md border border-amber px-4 py-2 text-sm font-bold text-amber disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!milestoneAnswer}
            onClick={() => setMilestoneChecked(true)}
            type="button"
          >
            Check milestone answer
          </button>
        </div>
      )}

      <div className="mt-5 rounded-lg border border-ocean/25 bg-ocean/5 p-4">
        <p className="text-sm font-bold text-ink">Warm-up check</p>
        <p className="mt-2 text-sm leading-6 text-muted">
          Say these words and patterns once, notice the weak point, then start today's scenes. Later this can become a
          stricter GPT-scored review, but the archive and milestone loop are already in place.
        </p>
        <button
          className="mt-4 rounded-md bg-ocean px-5 py-3 text-sm font-bold text-white hover:bg-ocean/90"
          disabled={Boolean(milestoneTask && !milestoneChecked)}
          onClick={complete}
          type="button"
        >
          Start Day {dayNumber} mission
        </button>
      </div>
    </section>
  );
}

function buildReviewReports(reports: CheckInReport[], dayNumber: number, milestone?: CheckInMilestone) {
  if (!milestone) {
    return reports.filter((report) => report.dayNumber === dayNumber - 1);
  }
  const windowSize = milestone === "day_7" ? 6 : milestone === "day_15" ? 14 : 30;
  return reports
    .filter((report) => report.dayNumber < dayNumber && report.dayNumber >= dayNumber - windowSize)
    .sort((a, b) => b.dayNumber - a.dayNumber);
}

function buildMilestoneTask({
  dayNumber,
  grammarFocus,
  learningVersion,
  reviewMistakes,
  reviewWords
}: {
  dayNumber: number;
  grammarFocus: string[];
  learningVersion: LearningVersion;
  reviewMistakes: string[];
  reviewWords: string[];
}) {
  const word = reviewWords[dayNumber % Math.max(1, reviewWords.length)] ?? "today's key word";
  const grammar = grammarFocus[(dayNumber + 1) % Math.max(1, grammarFocus.length)] ?? "today's sentence pattern";
  const mistake = reviewMistakes[(dayNumber + 2) % Math.max(1, reviewMistakes.length)] ?? "a recent weak point";
  const isJunior = learningVersion === "primary_junior";
  const taskType = dayNumber % 3;

  if (taskType === 0) {
    const correctOption = `Use "${word}" in a new real sentence`;
    return {
      prompt: `Choose the best way to restart today's mission with the word "${word}".`,
      options: rotateOptions([
        correctOption,
        `Only read "${word}" silently`,
        `Skip "${word}" because it appeared before`
      ], dayNumber),
      correctOption,
      explanation:
        "A milestone should check active use, not passive recognition. The word comes back only in a small task so review stays light."
    };
  }

  if (taskType === 1) {
    const correctOption = "Reuse the pattern in a fresh context";
    return {
      prompt: `Which action best reviews this pattern: ${grammar}?`,
      options: rotateOptions([
        correctOption,
        "Copy yesterday's whole sentence",
        "Translate every word before reading"
      ], dayNumber),
      correctOption,
      explanation:
        "The goal is transfer. A familiar pattern should move into a new scene, not stay as a copied sentence."
    };
  }

  const correctOption = isJunior ? "Read one shorter sentence first" : "Compare the target structure with a nearby wrong choice";
  return {
    prompt: `A recent weak point was: ${mistake}. What should today's first step do?`,
    options: rotateOptions(
      isJunior
        ? [correctOption, "Jump to a long paragraph", "Ignore the mistake"]
        : [correctOption, "Memorize a grammar title only", "Start a harder passage immediately"],
      dayNumber
    ),
    correctOption,
    explanation: isJunior
      ? "For younger learners, the system should reduce sentence load first, then rebuild confidence through a clear scene."
      : "For high-school learners, contrast practice is the fastest way to fix a repeated structure mistake without adding too much review."
  };
}

function ReviewBlock({
  accent,
  items,
  title
}: {
  accent: string;
  items: string[];
  title: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-paper p-4">
      <p className={`text-sm font-bold ${accent}`}>{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.length > 0 ? (
          items.map((item) => (
            <span key={item} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-muted">
              {item}
            </span>
          ))
        ) : (
          <span className="text-sm text-muted">No archive yet</span>
        )}
      </div>
    </div>
  );
}

function MiniList({ items, title }: { items: string[]; title: string }) {
  return (
    <div className="rounded-md bg-white p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-muted">{title}</p>
      <div className="mt-2 space-y-1">
        {items.map((item) => (
          <p key={item} className="text-sm leading-6 text-ink">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}
