import { useMemo, useState } from "react";
import type { LearningVersion, OutOfSyllabusWordRecord, UnknownWordRecord } from "../types/learning";
import {
  evaluateReviewSentence,
  getVocabularyReviewEntry,
  type ReviewSentenceResult
} from "../services/vocabularyReviewService";
import { ClickableEnglish } from "./ClickableEnglish";

interface VocabularyReviewTrainerProps {
  words: UnknownWordRecord[];
  outOfSyllabusWords?: OutOfSyllabusWordRecord[];
  learningVersion?: LearningVersion;
  targetCount?: number;
  onPass: (normalizedWords: string[]) => void;
}

const speakWord = (word: string) => {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  utterance.rate = 0.82;
  window.speechSynthesis.speak(utterance);
};

const wordForms = (word: string) => {
  const base = word.toLowerCase();
  const forms = new Set([base, `${base}s`, `${base}ed`, `${base}ing`]);
  if (base.endsWith("e")) {
    forms.add(`${base}d`);
    forms.add(`${base.slice(0, -1)}ing`);
  }
  if (base.endsWith("y")) {
    forms.add(`${base.slice(0, -1)}ies`);
    forms.add(`${base.slice(0, -1)}ied`);
  }
  const irregulars: Record<string, string[]> = {
    find: ["found"],
    go: ["went", "going"],
    help: ["helps", "helped"],
    learn: ["learned", "learnt"],
    play: ["played"],
    see: ["saw"],
    stand: ["stood"],
    stay: ["stays", "stayed"]
  };
  irregulars[base]?.forEach((form) => forms.add(form));
  return forms;
};

const sentenceContainsWord = (sentence: string, word: string) => {
  const tokens = sentence.toLowerCase().match(/[a-z']+/g) ?? [];
  const forms = wordForms(word);
  return tokens.some((token) => forms.has(token));
};

const hasReliableSourceSentence = (word: UnknownWordRecord) => {
  if (!word.sourceSentence) return false;
  return sentenceContainsWord(word.sourceSentence, word.normalized) || sentenceContainsWord(word.sourceSentence, word.word);
};

export function VocabularyReviewTrainer({
  learningVersion = "high_school",
  onPass,
  outOfSyllabusWords = [],
  targetCount = 10,
  words
}: VocabularyReviewTrainerProps) {
  const reviewWords = useMemo(() => words.filter((word) => !word.mastered).slice(0, targetCount), [targetCount, words]);
  const optionalWords = useMemo(
    () => Array.from(new Map(outOfSyllabusWords.map((word) => [word.normalized, word])).values()).slice(-20),
    [outOfSyllabusWords]
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [answerResults, setAnswerResults] = useState<Record<string, ReviewSentenceResult>>({});
  const [result, setResult] = useState<{ passed: boolean; passedCount: number; message: string }>();

  const evaluate = () => {
    const nextResults: Record<string, ReviewSentenceResult> = {};
    let passedCount = 0;
    for (const word of reviewWords) {
      const wordResult = evaluateReviewSentence(word, answers[word.normalized] ?? "", learningVersion);
      nextResults[word.normalized] = wordResult;
      if (wordResult.passed) passedCount += 1;
    }
    const passed = passedCount === reviewWords.length;
    setAnswerResults(nextResults);
    setResult({
      passed,
      passedCount,
      message: passed
        ? "Passed. You can use every review word in a complete sentence."
        : "Not passed yet. Check the corrected sentences below, then rewrite the weak ones."
    });
    if (passed) onPass(reviewWords.map((word) => word.normalized));
  };

  return (
    <section className="mx-auto max-w-5xl rounded-lg border border-ocean/25 bg-white p-5 shadow-soft sm:p-6">
      <p className="text-sm font-semibold text-ocean">Vocabulary Review</p>
      <h1 className="mt-2 text-2xl font-bold text-ink">{reviewWords.length} activated words need active use</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        A looked-up word has interrupted comprehension. Write one complete sentence for each word. The system checks
        whether your sentence matches the review goal, not just whether the word appears.
      </p>

      {optionalWords.length > 0 && (
        <div className="mt-5 rounded-lg border border-amber/25 bg-amber/10 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-amber">Optional beyond-core words from this round</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {optionalWords.map((word) => (
              <div className="rounded-md bg-white px-3 py-2 text-sm leading-6" key={word.normalized}>
                <span className="font-bold text-ink">{word.word}</span>
                <span className="mx-2 text-muted">·</span>
                {word.phonetic && (
                  <>
                    <span className="text-muted">/{word.phonetic}/</span>
                    <span className="mx-2 text-muted">·</span>
                  </>
                )}
                <span className="text-muted">{word.meaning}</span>
                <button
                  className="ml-2 rounded-md border border-amber/30 px-2 py-1 text-xs font-bold text-amber hover:bg-amber/10"
                  onClick={() => speakWord(word.word)}
                  type="button"
                >
                  Listen
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 grid gap-4">
        {reviewWords.map((word, index) => {
          const reviewEntry = getVocabularyReviewEntry(word, learningVersion);
          const wordResult = answerResults[word.normalized];
          const reliableSourceSentence = hasReliableSourceSentence(word);

          return (
            <article key={word.normalized} className="rounded-lg border border-line bg-paper p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-ocean">Word {index + 1}</span>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-ink">{word.word}</h2>
                    {word.phonetic && <span className="text-sm font-semibold text-muted">/{word.phonetic}/</span>}
                    <button
                      className="rounded-md border border-ocean/30 px-2 py-1 text-xs font-bold text-ocean hover:bg-ocean/10"
                      onClick={() => speakWord(word.word)}
                      type="button"
                    >
                      Listen
                    </button>
                  </div>
                  {word.partOfSpeech && <p className="mt-1 text-xs font-semibold text-muted">{word.partOfSpeech}</p>}
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-muted">
                  looked up {word.lookupCount} times
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted">
                <span className="font-semibold text-ink">Meaning: </span>
                {word.meaning}
              </p>

              <div className="mt-3 rounded-md bg-white p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-muted">Original scene sentence</p>
                {reliableSourceSentence ? (
                  <ClickableEnglish className="mt-2 text-sm text-ink" text={word.sourceSentence} />
                ) : (
                  <p className="mt-2 text-sm leading-6 text-muted">
                    The original sentence for this word was not preserved correctly. Use the examples below for this
                    review, and future lookups will keep the scene sentence.
                  </p>
                )}
              </div>

              <div className="mt-3 grid gap-2 md:grid-cols-3">
                {reviewEntry.examples.map((example) => (
                  <div key={example.sentence} className="rounded-md border border-line bg-white p-3">
                    <p className="text-xs font-bold text-ocean">{example.focus}</p>
                    <p className="mt-2 text-sm font-semibold leading-5 text-ink">{example.sentence}</p>
                    <p className="mt-2 text-xs leading-5 text-muted">{example.explanation}</p>
                  </div>
                ))}
              </div>

              <label className="mt-4 block text-sm font-bold text-ink" htmlFor={`review-${word.normalized}`}>
                Write your own complete sentence with {word.word}
              </label>
              <textarea
                className="mt-2 min-h-20 w-full resize-y rounded-md border border-line bg-white p-3 text-sm outline-none focus:border-ocean"
                id={`review-${word.normalized}`}
                onChange={(event) => {
                  setAnswers((current) => ({ ...current, [word.normalized]: event.target.value }));
                  setAnswerResults((current) => {
                    const { [word.normalized]: _removed, ...rest } = current;
                    return rest;
                  });
                }}
                placeholder={reviewEntry.correctedSentence}
                value={answers[word.normalized] ?? ""}
              />

              {wordResult && (
                <div
                  className={`mt-3 rounded-md p-3 text-sm leading-6 ${
                    wordResult.passed ? "bg-leaf/10 text-leaf" : "bg-rose/10 text-rose"
                  }`}
                >
                  <p className="font-bold">{wordResult.passed ? "Accepted" : "Needs revision"}</p>
                  <p>{wordResult.explanation}</p>
                  {wordResult.notes && wordResult.notes.length > 0 && (
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {wordResult.notes.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  )}
                  {!wordResult.passed && (
                    <>
                      <ul className="mt-2 list-disc space-y-1 pl-5">
                        {wordResult.issues.map((issue) => (
                          <li key={issue}>{issue}</li>
                        ))}
                      </ul>
                      <p className="mt-2 font-semibold text-ink">Fully correct sentence:</p>
                      <p className="text-ink">{wordResult.correctedSentence}</p>
                    </>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>

      <div className="mt-5 rounded-lg border border-line bg-paper p-4">
        <p className="text-sm font-bold text-ink">Pass rule</p>
        <p className="mt-2 text-sm leading-6 text-muted">
          All {reviewWords.length} review words must appear in complete, natural sentences. After passing, these words
          move into mastered vocabulary and the main scene flow resumes.
        </p>
        <button
          className="mt-4 rounded-md bg-ocean px-5 py-3 text-sm font-bold text-white hover:bg-ocean/90"
          onClick={evaluate}
          type="button"
        >
          Submit review check
        </button>
        {result && (
          <div className={`mt-4 rounded-md p-3 text-sm leading-6 ${result.passed ? "bg-leaf/10 text-leaf" : "bg-rose/10 text-rose"}`}>
            <p className="font-bold">
              Passed sentences: {result.passedCount}/{reviewWords.length}
            </p>
            <p>{result.message}</p>
          </div>
        )}
      </div>
    </section>
  );
}
