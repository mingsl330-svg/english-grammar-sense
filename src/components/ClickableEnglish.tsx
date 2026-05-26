import { useEffect, useState } from "react";
import { lookupWord, type LookupEntry } from "../services/dictionaryService";
import type { LearningVersion } from "../types/learning";

interface ClickableEnglishProps {
  text: string;
  className?: string;
  learningVersion?: LearningVersion;
  onWordLookup?: (entry: LookupEntry, sourceSentence: string) => void;
}

export function ClickableEnglish({ className = "", learningVersion = "high_school", onWordLookup, text }: ClickableEnglishProps) {
  const [entry, setEntry] = useState<LookupEntry>();
  const [loadingWord, setLoadingWord] = useState("");
  const parts = text.match(/[A-Za-z]+(?:'[A-Za-z]+)?|[^A-Za-z]+/g) ?? [text];

  useEffect(() => {
    setEntry(undefined);
    setLoadingWord("");
  }, [text]);

  const handleLookup = async (part: string) => {
    setLoadingWord(part);
    const result = await lookupWord(part, learningVersion);
    setEntry(result);
    onWordLookup?.(result, text);
    setLoadingWord("");
  };

  return (
    <div className={className}>
      <p className="leading-9">
        {parts.map((part, index) => {
          const isWord = /^[A-Za-z]/.test(part);
          if (!isWord) return <span key={`${part}-${index}`}>{part}</span>;
          return (
            <button
              className="rounded px-1 font-semibold text-ink underline decoration-ocean/30 underline-offset-4 hover:bg-ocean/10 hover:text-ocean"
              key={`${part}-${index}`}
              onClick={() => void handleLookup(part)}
              type="button"
            >
              {part}
            </button>
          );
        })}
      </p>
      {entry && (
        <div className="mt-4 rounded-lg border border-ocean/25 bg-white p-4 text-sm leading-6 shadow-soft">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="text-lg font-bold text-ink">{entry.word}</p>
            <span className="rounded-full bg-paper px-3 py-1 text-xs font-bold text-muted">
              {entry.partOfSpeech} · {entry.level}
            </span>
          </div>
          {entry.phonetic && <p className="mt-1 text-xs text-muted">/{entry.phonetic}/</p>}
          {entry.syllabusNote && (
            <p
              className={`mt-2 rounded-md px-3 py-2 text-xs font-semibold ${
                entry.isOutOfSyllabus ? "bg-amber/10 text-amber" : "bg-leaf/10 text-leaf"
              }`}
            >
              {entry.syllabusNote}
            </p>
          )}
          <p className="mt-2 text-muted">
            <span className="font-semibold text-ink">Meaning:</span>{" "}
            {entry.meaning}
          </p>
          <p className="mt-1 text-muted">
            <span className="font-semibold text-ink">In context:</span>{" "}
            {entry.contextMeaning}
          </p>
          <p className="mt-1 text-muted">
            <span className="font-semibold text-ink">Tags:</span>{" "}
            {entry.collocation}
          </p>
          <p className="mt-1 text-muted">
            <span className="font-semibold text-ink">Example:</span>{" "}
            {entry.example}
          </p>
        </div>
      )}
      {loadingWord && !entry && (
        <div className="mt-4 rounded-lg border border-line bg-white p-4 text-sm text-muted shadow-soft">
          Loading local dictionary: {loadingWord}
        </div>
      )}
    </div>
  );
}
