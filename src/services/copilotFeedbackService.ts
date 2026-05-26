export type CopilotFeedbackType = "bug" | "feature" | "confusion" | "learning_help";

export interface CopilotFeedbackEvent {
  id: string;
  type: CopilotFeedbackType;
  rawInput: string;
  normalizedIntent: string;
  context: string;
  createdAt: string;
}

const STORAGE_KEY = "english-grammar-sense-copilot-feedback-events";

const classifyFeedback = (input: string): CopilotFeedbackType | undefined => {
  const text = input.toLowerCase();
  if (/bug|error|wrong|broken|cannot|can't|卡|错|不能|无法|坏|问题/.test(text)) return "bug";
  if (/feature|hope|wish|should|建议|希望|功能|能不能|可不可以/.test(text)) return "feature";
  if (/confusing|confused|don't understand|看不懂|不懂|太难|不会|什么意思/.test(text)) return "confusion";
  return undefined;
};

export const saveCopilotFeedbackIfNeeded = (input: {
  rawInput: string;
  normalizedIntent: string;
  context: string;
}) => {
  const type = classifyFeedback(input.rawInput);
  if (!type) return undefined;
  const event: CopilotFeedbackEvent = {
    id: crypto.randomUUID(),
    type,
    rawInput: input.rawInput,
    normalizedIntent: input.normalizedIntent,
    context: input.context,
    createdAt: new Date().toISOString()
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const current = raw ? (JSON.parse(raw) as CopilotFeedbackEvent[]) : [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify([event, ...current].slice(0, 300)));
  } catch {
    return event;
  }

  return event;
};
