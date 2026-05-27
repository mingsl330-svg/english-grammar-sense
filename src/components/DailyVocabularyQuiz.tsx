import { useMemo, useState } from "react";
import type { DailyVocabularyTarget } from "../services/dailyVocabularyService";
import { AudioButton } from "./AudioButton";

interface DailyVocabularyQuizProps {
  targets: DailyVocabularyTarget[];
  onPass: () => void;
}

type QuizMode = "meaning" | "spelling";

interface QuizQuestion {
  target: DailyVocabularyTarget;
  mode: QuizMode;
  options?: string[];
}

const normalizeText = (text: string) => text.trim().toLowerCase().replace(/[^a-z]/g, "");

const shortMeaning = (meaning: string) => meaning.split(/[；;\n]/)[0]?.trim() || meaning.slice(0, 32);

const buildQuestions = (targets: DailyVocabularyTarget[]): QuizQuestion[] => {
  const quizTargets = targets.slice(0, Math.min(6, targets.length));
  return quizTargets.map((target, index) => {
    if (index % 2 === 0) {
      const distractors = targets
        .filter((item) => item.normalized !== target.normalized)
        .slice(index, index + 3)
        .map((item) => shortMeaning(item.meaning));
      const options = [shortMeaning(target.meaning), ...distractors].slice(0, 4);
      return {
        target,
        mode: "meaning",
        options: [...options].sort((a, b) => a.localeCompare(b))
      };
    }
    return { target, mode: "spelling" };
  });
};

const spellingHint = (word: string) => {
  if (word.length <= 3) return `${word[0] ?? ""}_`;
  return `${word[0]}${"_".repeat(Math.max(1, word.length - 2))}${word[word.length - 1]}`;
};

export function DailyVocabularyQuiz({ onPass, targets }: DailyVocabularyQuizProps) {
  const questions = useMemo(() => buildQuestions(targets), [targets]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const passedCount = questions.filter((question) => {
    const answer = answers[question.target.normalized] ?? "";
    if (question.mode === "meaning") return answer === shortMeaning(question.target.meaning);
    return normalizeText(answer) === normalizeText(question.target.word);
  }).length;
  const passed = questions.length > 0 && passedCount === questions.length;

  const check = () => {
    setChecked(true);
    if (passed) onPass();
  };

  if (targets.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-paper p-4 text-sm leading-6 text-muted">
        No target words were saved for this day. Future sessions will save today's word goal before the quiz.
      </div>
    );
  }

  return (
    <section className="rounded-lg border border-leaf/25 bg-leaf/5 p-4">
      <p className="text-sm font-bold text-ink">Word goal check</p>
      <p className="mt-2 text-sm leading-6 text-muted">
        Finish this short mixed check before moving to the next day. Early-stage spelling questions show a hint.
      </p>

      <div className="mt-4 grid gap-3">
        {questions.map((question, index) => {
          const key = question.target.normalized;
          const answer = answers[key] ?? "";
          const isCorrect =
            question.mode === "meaning"
              ? answer === shortMeaning(question.target.meaning)
              : normalizeText(answer) === normalizeText(question.target.word);
          return (
            <article className="rounded-md border border-line bg-white p-3" key={`${key}-${question.mode}`}>
              <p className="text-xs font-bold uppercase tracking-wide text-leaf">Word {index + 1}</p>
              {question.mode === "meaning" ? (
                <>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-ink">Choose the meaning of "{question.target.word}".</p>
                    <AudioButton label="Play word" text={question.target.word} />
                    <AudioButton label="Play sentence" text={question.target.sourceSentence || question.target.example} />
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {question.options?.map((option) => (
                      <button
                        className={`rounded-md border px-3 py-2 text-left text-sm ${
                          answer === option ? "border-ocean bg-ocean text-white" : "border-line bg-paper text-muted hover:border-ocean"
                        }`}
                        key={option}
                        onClick={() => setAnswers((current) => ({ ...current, [key]: option }))}
                        type="button"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-ink">Write the English word for: {shortMeaning(question.target.meaning)}</p>
                    <AudioButton label="Play word" text={question.target.word} />
                    <AudioButton label="Play sentence" text={question.target.sourceSentence || question.target.example} />
                  </div>
                  <p className="mt-1 text-xs text-muted">Hint: {spellingHint(question.target.word)}</p>
                  <input
                    className="mt-3 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-ocean"
                    onChange={(event) => setAnswers((current) => ({ ...current, [key]: event.target.value }))}
                    placeholder={spellingHint(question.target.word)}
                    value={answer}
                  />
                </>
              )}
              {checked && (
                <p className={`mt-2 text-sm font-bold ${isCorrect ? "text-leaf" : "text-rose"}`}>
                  {isCorrect ? "Correct" : `Answer: ${question.target.word} · ${shortMeaning(question.target.meaning)}`}
                </p>
              )}
            </article>
          );
        })}
      </div>

      <button
        className="mt-4 rounded-md bg-leaf px-5 py-3 text-sm font-bold text-white hover:bg-leaf/90"
        onClick={check}
        type="button"
      >
        Check word goal
      </button>
      {checked && (
        <p className={`mt-3 text-sm font-bold ${passed ? "text-leaf" : "text-rose"}`}>
          Result: {passedCount}/{questions.length}. {passed ? "Word goal completed." : "Review the missed words and try again."}
        </p>
      )}
    </section>
  );
}
