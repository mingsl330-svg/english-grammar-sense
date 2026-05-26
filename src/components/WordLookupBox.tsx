import { useEffect, useState } from "react";
import { lookupWord, type LookupEntry } from "../services/dictionaryService";
import type { LearningVersion } from "../types/learning";

interface WordLookupBoxProps {
  sourceSentence: string;
  learningVersion?: LearningVersion;
  onLookup: (entry: LookupEntry, sourceSentence: string) => void;
}

export function WordLookupBox({ learningVersion = "high_school", onLookup, sourceSentence }: WordLookupBoxProps) {
  const [query, setQuery] = useState("");
  const [entry, setEntry] = useState<LookupEntry>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setQuery("");
    setEntry(undefined);
    setIsLoading(false);
  }, [sourceSentence]);

  const submit = async () => {
    const word = query.trim();
    if (!word) return;
    setIsLoading(true);
    const result = await lookupWord(word, learningVersion);
    setEntry(result);
    onLookup(result, sourceSentence);
    setIsLoading(false);
  };

  return (
    <aside className="rounded-lg border border-line bg-white p-4 shadow-soft">
      <p className="text-xs font-bold uppercase tracking-wide text-ocean">Word Lookup</p>
      <div className="mt-3 flex gap-2">
        <input
          className="min-w-0 flex-1 rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-ocean"
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") void submit();
          }}
          placeholder="Type a word"
          value={query}
        />
        <button
          className="rounded-md bg-ocean px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
          disabled={isLoading || query.trim().length === 0}
          onClick={() => void submit()}
          type="button"
        >
          Look up
        </button>
      </div>
      {entry && (
        <div className="mt-4 rounded-md bg-paper p-3 text-sm leading-6 text-muted">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="text-lg font-bold text-ink">{entry.word}</p>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-muted">
              {entry.partOfSpeech} · {entry.level}
            </span>
          </div>
          {entry.phonetic && <p className="mt-1 text-xs">/{entry.phonetic}/</p>}
          {entry.syllabusNote && (
            <p
              className={`mt-2 rounded-md px-3 py-2 text-xs font-semibold ${
                entry.isOutOfSyllabus ? "bg-amber/10 text-amber" : "bg-leaf/10 text-leaf"
              }`}
            >
              {entry.syllabusNote}
            </p>
          )}
          <p className="mt-2">
            <span className="font-semibold text-ink">Meaning:</span> {entry.meaning}
          </p>
          <p className="mt-1">
            <span className="font-semibold text-ink">In context:</span> {entry.contextMeaning}
          </p>
          <p className="mt-1">
            <span className="font-semibold text-ink">Example:</span> {entry.example}
          </p>
        </div>
      )}
    </aside>
  );
}
