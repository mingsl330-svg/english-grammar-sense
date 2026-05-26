import { useEffect, useState } from "react";
import {
  buildDailyVocabularyTargets,
  type DailyVocabularyTarget
} from "../services/dailyVocabularyService";
import type { LearningScenario, LearningVersion } from "../types/learning";

interface DailyVocabularyTargetPanelProps {
  activatedWords: Record<string, string>;
  learningVersion: LearningVersion;
  scenarios: LearningScenario[];
  targetCount: number;
  onTargetsChange: (targets: DailyVocabularyTarget[]) => void;
}

const normalize = (word: string) => word.toLowerCase();

export function DailyVocabularyTargetPanel({
  activatedWords,
  learningVersion,
  onTargetsChange,
  scenarios,
  targetCount
}: DailyVocabularyTargetPanelProps) {
  const [targets, setTargets] = useState<DailyVocabularyTarget[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    void buildDailyVocabularyTargets(scenarios, learningVersion, targetCount).then((nextTargets) => {
      if (cancelled) return;
      setTargets(nextTargets);
      onTargetsChange(nextTargets);
    });
    return () => {
      cancelled = true;
    };
  }, [learningVersion, onTargetsChange, scenarios, targetCount]);

  const completedCount = targets.filter((target) => activatedWords[normalize(target.normalized)]).length;

  return (
    <section className="rounded-lg border border-leaf/25 bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-leaf">Today's word goal</p>
          <h2 className="mt-1 text-xl font-bold text-ink">
            {completedCount}/{targets.length || targetCount} target words activated
          </h2>
        </div>
        <span className="rounded-full bg-leaf/10 px-3 py-1 text-xs font-bold text-leaf">
          Required after scenes
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted">
        These words come from today's sentence scenes. They are not extra homework; they are the vocabulary you need in
        order to understand and use today's expressions.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {targets.map((target, index) => {
          const activated = Boolean(activatedWords[normalize(target.normalized)]);
          const isExpanded = expanded[target.normalized];
          return (
            <article
              className={`rounded-md border p-3 ${activated ? "border-leaf/30 bg-leaf/5" : "border-line bg-paper"}`}
              key={`${target.normalized}-${index}`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-ink">{target.word}</p>
                  {target.phonetic && <p className="text-xs text-muted">/{target.phonetic}/</p>}
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-bold ${activated ? "bg-leaf text-white" : "bg-white text-muted"}`}>
                  {activated ? "Activated" : "Target"}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted">{target.meaning}</p>
              <button
                className="mt-2 text-xs font-bold text-ocean hover:text-ink"
                onClick={() => setExpanded((current) => ({ ...current, [target.normalized]: !isExpanded }))}
                type="button"
              >
                {isExpanded ? "Hide example" : "Show example"}
              </button>
              {isExpanded && (
                <div className="mt-2 rounded-md bg-white p-3 text-xs leading-5 text-muted">
                  <p className="font-semibold text-ink">{target.sourceTitle}</p>
                  <p className="mt-1">{target.sourceSentence}</p>
                  <p className="mt-1">{target.example}</p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
