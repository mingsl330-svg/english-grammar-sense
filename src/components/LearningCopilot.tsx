import { type FormEvent, useEffect, useMemo, useState } from "react";
import { lookupWord, type LookupEntry } from "../services/dictionaryService";
import { saveCopilotFeedbackIfNeeded } from "../services/copilotFeedbackService";
import type { CheckInReport, LearningVersion, UnknownWordRecord } from "../types/learning";

interface LearningCopilotProps {
  learningVersion: LearningVersion;
  sourceSentence?: string;
  currentPrompt?: string;
  contextLabel?: string;
  recentReport?: CheckInReport;
  unknownWords?: UnknownWordRecord[];
  onLookup?: (entry: LookupEntry, sourceSentence: string) => void;
}

interface CopilotMessage {
  id: string;
  role: "learner" | "copilot";
  text: string;
}

const containsChinese = (text: string) => /[\u4e00-\u9fff]/.test(text);

const looksLikeSingleWord = (text: string) => /^[a-zA-Z][a-zA-Z'-]{1,24}$/.test(text.trim());

const normalizeIntent = (text: string) => {
  const lower = text.toLowerCase();
  if (/bug|error|wrong|broken|卡|错|无法|不能/.test(lower)) return "I want to report a bug.";
  if (/feature|suggest|hope|wish|建议|希望|功能/.test(lower)) return "I want to suggest a product improvement.";
  if (/word|meaning|vocabulary|单词|意思|词/.test(lower)) return "I need help with a word.";
  if (/translate|sentence|prompt|题目|句子|翻译|看不懂/.test(lower)) return "I need the task explained in easier English.";
  if (/grammar|pattern|语法|结构/.test(lower)) return "I need help with the sentence pattern.";
  return "I need help with this learning task.";
};

const simpleSentenceHelp = (sourceSentence?: string, currentPrompt?: string) => {
  if (!sourceSentence && !currentPrompt) {
    return "Tell me the word or sentence that blocks you. I will explain it in easy English.";
  }
  return [
    sourceSentence ? `Easy sentence: ${sourceSentence}` : undefined,
    currentPrompt ? `Task in simple English: ${currentPrompt}` : undefined,
    "First find the speaker's real need. Then choose or write the answer."
  ].filter(Boolean).join("\n");
};

const grammarHelp = (report?: CheckInReport, sourceSentence?: string) => {
  const example = report?.grammarReviewExamples?.[0];
  if (example) {
    return [
      `Pattern: ${example.grammar}`,
      `Easy example: ${example.simpleExample}`,
      `Try this: ${example.tryThis}`
    ].join("\n");
  }
  if (sourceSentence) {
    return `Look at the sentence as a message first: "${sourceSentence}"\nAsk: What job does this sentence do in the scene?`;
  }
  return "Tell me the sentence pattern. I will give one easy example and one try-it sentence.";
};

const reviewHelp = (report?: CheckInReport, unknownWords?: UnknownWordRecord[]) => {
  const words = report?.newWordsLearned.length ? report.newWordsLearned : unknownWords?.map((word) => word.word) ?? [];
  const grammar = report?.grammarPracticed ?? [];
  return [
    words.length ? `Review words: ${words.slice(0, 6).join(", ")}` : "No saved review words yet.",
    grammar.length ? `Review patterns: ${grammar.slice(0, 3).join("; ")}` : "No saved pattern yet.",
    report?.nextDayReviewPlan?.firstReviewPrompt ?? "Before new scenes, use one old word in one short sentence."
  ].join("\n");
};

export function LearningCopilot({
  contextLabel = "Current learning task",
  currentPrompt,
  learningVersion,
  onLookup,
  recentReport,
  sourceSentence,
  unknownWords = []
}: LearningCopilotProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const quickActions = useMemo(
    () => [
      "Explain this task in easy English.",
      "Which word should I learn first?",
      "Give me one example like this.",
      "What should I review tomorrow?"
    ],
    []
  );

  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "copilot",
        text: "Hi. I can help inside this task. Ask in Chinese or English. I will turn it into simple English and keep you in the learning flow."
      }
    ]);
  }, [contextLabel, sourceSentence]);

  const reply = async (rawInput: string) => {
    const trimmed = rawInput.trim();
    if (!trimmed) return;
    const normalizedIntent = normalizeIntent(trimmed);
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: "learner", text: trimmed }]);
    setIsLoading(true);

    let answer = containsChinese(trimmed) ? `Your request in English: ${normalizedIntent}\n\n` : "";
    const lower = trimmed.toLowerCase();

    if (looksLikeSingleWord(trimmed) || /word|meaning|单词|意思|词/.test(lower)) {
      const word = looksLikeSingleWord(trimmed)
        ? trimmed
        : (trimmed.match(/[a-zA-Z][a-zA-Z'-]{1,24}/)?.[0] ?? unknownWords[0]?.word ?? "");
      if (word) {
        const entry = await lookupWord(word, learningVersion);
        onLookup?.(entry, sourceSentence ?? entry.example);
        answer += [
          `${entry.word}: ${entry.meaning}`,
          entry.phonetic ? `Sound: /${entry.phonetic}/` : undefined,
          `Easy use: ${entry.example}`,
          `Level note: ${entry.syllabusNote ?? entry.level}`
        ].filter(Boolean).join("\n");
      } else {
        answer += "Tell me the English word. I will explain it in easy English.";
      }
    } else if (/review|tomorrow|复习|明天/.test(lower)) {
      answer += reviewHelp(recentReport, unknownWords);
    } else if (/grammar|pattern|语法|结构/.test(lower)) {
      answer += grammarHelp(recentReport, sourceSentence);
    } else {
      answer += simpleSentenceHelp(sourceSentence, currentPrompt);
    }

    const feedbackEvent = saveCopilotFeedbackIfNeeded({
      rawInput: trimmed,
      normalizedIntent,
      context: contextLabel
    });
    if (feedbackEvent) {
      answer += `\n\nFeedback saved: ${feedbackEvent.type}. I will keep it as a product signal.`;
    }

    setMessages((current) => [...current, { id: crypto.randomUUID(), role: "copilot", text: answer }]);
    setIsLoading(false);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = input;
    setInput("");
    void reply(value);
  };

  return (
    <aside className="rounded-lg border border-ocean/25 bg-white p-4 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-ocean">Learning Copilot</p>
          <p className="mt-1 text-sm font-semibold text-ink">{contextLabel}</p>
        </div>
        <span className="rounded-full bg-ocean/10 px-3 py-1 text-xs font-bold text-ocean">
          English only
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {quickActions.map((action) => (
          <button
            className="rounded-md border border-line bg-paper px-3 py-2 text-left text-xs font-semibold text-muted hover:border-ocean hover:text-ocean"
            key={action}
            onClick={() => void reply(action)}
            type="button"
          >
            {action}
          </button>
        ))}
      </div>

      <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
        {messages.map((message) => (
          <div
            className={`rounded-md p-3 text-sm leading-6 ${
              message.role === "copilot" ? "bg-ocean/5 text-muted" : "bg-paper text-ink"
            }`}
            key={message.id}
          >
            <p className="text-xs font-bold uppercase tracking-wide text-ocean">
              {message.role === "copilot" ? "Copilot" : "You"}
            </p>
            <p className="mt-1 whitespace-pre-line">{message.text}</p>
          </div>
        ))}
      </div>

      <form className="mt-4 flex gap-2" onSubmit={submit}>
        <input
          className="min-w-0 flex-1 rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-ocean"
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about a word, sentence, task, or bug"
          value={input}
        />
        <button
          className="rounded-md bg-ocean px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isLoading || input.trim().length === 0}
          type="submit"
        >
          {isLoading ? "..." : "Ask"}
        </button>
      </form>
    </aside>
  );
}
