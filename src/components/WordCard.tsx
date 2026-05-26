import type { WordExplanation } from "../types/learning";

interface WordCardProps {
  word: WordExplanation;
  active: boolean;
  onSelect: () => void;
}

export function WordCard({ word, active, onSelect }: WordCardProps) {
  return (
    <button
      className={`rounded-lg border p-4 text-left transition ${
        active ? "border-ocean bg-ocean/5" : "border-line bg-white hover:border-ocean/40"
      }`}
      onClick={onSelect}
      type="button"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-lg font-bold text-ink">{word.word}</span>
        <span className="text-xs font-semibold text-muted">
          {word.partOfSpeech} · {word.difficulty}
        </span>
      </div>
      <p className="mt-2 text-sm text-muted">{word.inContext}</p>
      {active && (
        <div className="mt-3 space-y-2 border-t border-line pt-3 text-sm leading-6 text-muted">
          <p>
            <span className="font-semibold text-ink">中文：</span>
            {word.meaning}
          </p>
          <p>
            <span className="font-semibold text-ink">语感：</span>
            {word.senseHint}
          </p>
          <p>
            <span className="font-semibold text-ink">搭配：</span>
            {word.collocation}
          </p>
          <p>
            <span className="font-semibold text-ink">例句：</span>
            {word.simpleExample}
          </p>
          <p>
            <span className="font-semibold text-ink">写作可用：</span>
            {word.writingExample}
          </p>
        </div>
      )}
    </button>
  );
}
