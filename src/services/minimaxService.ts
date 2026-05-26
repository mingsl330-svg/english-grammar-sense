import type {
  FeedbackResult,
  LearningDiagnosis,
  LearningScenario,
  NextPart,
  NextPartType,
  StudyRecord
} from "../types/learning";
import { minimaxSettingsService } from "./minimaxSettingsService";
import type { MiniMaxSettings } from "./minimaxSettingsService";

interface MiniMaxMessage {
  role: "system" | "user";
  content: string;
}

interface MiniMaxChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

interface MiniMaxSimpleAnalysis {
  sentencePattern?: string;
  grammarFocus?: string;
  correctIdea?: string;
  studentIssue?: string;
  shortFeedback?: string;
}

export interface MiniMaxConnectionResult {
  ok: boolean;
  endpoint: string;
  mode: "direct" | "proxy" | "not_configured";
  status?: number;
  message: string;
}

const getConfig = (settingsOverride?: MiniMaxSettings) => {
  const env = import.meta.env;
  const localSettings = settingsOverride ?? minimaxSettingsService.load();
  return {
    apiKey: localSettings.apiKey || (env.VITE_MINIMAX_API_KEY as string | undefined),
    apiUrl:
      localSettings.apiUrl ||
      (env.VITE_MINIMAX_API_URL as string | undefined) ||
      "https://api.minimaxi.com/v1/chat/completions",
    model: localSettings.model || (env.VITE_MINIMAX_MODEL as string | undefined) || "MiniMax-M2.7",
    proxyUrl: localSettings.proxyUrl || (env.VITE_MINIMAX_PROXY_URL as string | undefined)
  };
};

const stripThinkBlock = (content: string) => content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

const parseJsonFromModel = <T>(content: string): T | undefined => {
  const clean = stripThinkBlock(content).replace(/^```json\s*|\s*```$/g, "").trim();
  try {
    return JSON.parse(clean) as T;
  } catch {
    const match = clean.match(/\{[\s\S]*\}/);
    if (!match) return undefined;
    try {
      return JSON.parse(match[0]) as T;
    } catch {
      return undefined;
    }
  }
};

const requestMiniMax = async (messages: MiniMaxMessage[], settingsOverride?: MiniMaxSettings) => {
  const config = getConfig(settingsOverride);
  const endpoint = config.proxyUrl || config.apiUrl;
  if (!config.proxyUrl && !config.apiKey) {
    return {
      ok: false,
      endpoint,
      mode: "not_configured" as const,
      message: "MiniMax API key is not configured."
    };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (!config.proxyUrl && config.apiKey) {
    headers.Authorization = `Bearer ${config.apiKey}`;
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: 0.2,
        max_completion_tokens: 900
      })
    });
    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      return {
        ok: false,
        endpoint,
        mode: config.proxyUrl ? ("proxy" as const) : ("direct" as const),
        status: response.status,
        message: errorText || `MiniMax request failed with HTTP ${response.status}.`
      };
    }
    const data = (await response.json()) as MiniMaxChatResponse;
    return {
      ok: true,
      endpoint,
      mode: config.proxyUrl ? ("proxy" as const) : ("direct" as const),
      status: response.status,
      message: data.choices?.[0]?.message?.content ?? ""
    };
  } catch (error) {
    return {
      ok: false,
      endpoint,
      mode: config.proxyUrl ? ("proxy" as const) : ("direct" as const),
      message:
        error instanceof TypeError
          ? "Network request failed. If this is a direct browser call, MiniMax may be blocked by CORS; use a backend proxy."
          : error instanceof Error
            ? error.message
            : "MiniMax request failed."
    };
  }
};

const fallbackSimpleAnalysisFromText = (rawContent: string): MiniMaxSimpleAnalysis => {
  const rawText = stripThinkBlock(rawContent).trim();
  return {
    sentencePattern: "MiniMax returned a text explanation.",
    grammarFocus: "Read the model feedback below.",
    correctIdea: rawText,
    studentIssue: rawText,
    shortFeedback: rawText
  };
};

const buildMiniMaxResult = (input: {
  scenario: LearningScenario;
  stepId: string;
  step: LearningScenario["interactionSteps"][number];
  answer: string;
  analysis: MiniMaxSimpleAnalysis;
  structured: boolean;
  createNextPart: (type: NextPartType) => NextPart;
}): { feedback: FeedbackResult; diagnosis: LearningDiagnosis; nextPart?: NextPart } => {
  const recommendedNextPart: NextPartType =
    input.step.type === "guided_response" || input.step.type === "free_response"
      ? "imitation_practice"
      : "continue_same_level";
  const expectedAnswer = input.step.correctOption ?? input.step.successCriteria.join("; ") ?? input.scenario.expressionGoal;
  const shortFeedback = input.analysis.shortFeedback || input.analysis.studentIssue || input.analysis.correctIdea || "";
  const studentIssue = input.analysis.studentIssue || "Your answer needs to connect more directly with the question purpose.";
  const correctIdea = input.analysis.correctIdea || expectedAnswer;
  const grammarFocus = input.analysis.grammarFocus || input.scenario.hiddenGrammarPoints[0] || input.scenario.expressionGoal;
  const sentencePattern = input.analysis.sentencePattern || input.scenario.expressionGoal;
  const feedback: FeedbackResult = {
    isGrammarCorrect: true,
    isNatural: true,
    errorPosition: "sentence pattern and answer relevance",
    reason: shortFeedback,
    aiProvider: "minimax",
    aiStatus: input.structured
      ? `MiniMax simple sentence analysis · ${getConfig().model}`
      : "MiniMax returned text; the app used it as simple sentence feedback.",
    questionPurpose: getStepPurpose(input.step.type),
    relevanceJudgement: shortFeedback,
    purposeAlignmentScore: 70,
    expectedAnswer: correctIdea,
    studentGap: studentIssue,
    correctionFocus: `Pattern: ${sentencePattern}. Focus: ${grammarFocus}.`,
    revisedVersion: input.answer,
    naturalVersion: input.scenario.targetExpressions[0],
    encouragement: "This feedback came from MiniMax sentence analysis.",
    nextStep: recommendedNextPart
  };
  const diagnosis: LearningDiagnosis = {
    taskId: `${input.scenario.id}:${input.stepId}`,
    comprehensionScore: 70,
    vocabularyScore: 70,
    grammarScore: 70,
    sentenceStructureScore: 70,
    expressionScore: 70,
    logicScore: 70,
    mainProblem: "logic",
    errorPatterns: [studentIssue],
    masteredPoints: [],
    weakPoints: [grammarFocus],
    recommendedNextPart,
    reason: shortFeedback
  };
  return {
    feedback,
    diagnosis,
    nextPart: input.createNextPart(recommendedNextPart)
  };
};

const getStepPurpose = (type?: string) => {
  if (type === "context_intro") return "Judge the real scene and speaker purpose.";
  if (type === "comprehension_check") return "Understand the main meaning without full translation.";
  if (type === "meaning_discovery") return "Find what this expression does in the sentence.";
  if (type === "structure_discovery") return "See how sentence chunks support meaning.";
  if (type === "vocabulary_in_context") return "Understand the word in this exact context.";
  if (type === "guided_response") return "Use the expression pattern for a real response.";
  if (type === "free_response") return "Transfer the expression to a new scene.";
  return "Complete one concrete language action in the scene.";
};

export const minimaxService = {
  async testConnection(settings: MiniMaxSettings): Promise<MiniMaxConnectionResult> {
    const result = await requestMiniMax(
      [
        {
          role: "system",
          content: "Return only valid JSON. Do not use markdown."
        },
        {
          role: "user",
          content: "Return exactly this JSON: {\"ok\":true,\"provider\":\"minimax\"}"
        }
      ],
      settings
    );
    if (!result.ok) return result;
    const parsed = parseJsonFromModel<{ ok?: boolean; provider?: string }>(result.message);
    if (parsed?.ok) {
      return {
        ok: true,
        endpoint: result.endpoint,
        mode: result.mode,
        status: result.status,
        message: "MiniMax connection succeeded."
      };
    }
    return {
      ok: false,
      endpoint: result.endpoint,
      mode: result.mode,
      status: result.status,
      message: "MiniMax responded, but the response was not valid JSON for this app."
    };
  },

  async evaluateScenarioResponse(input: {
    scenario: LearningScenario;
    stepId: string;
    answer: string;
    recentRecords?: StudyRecord[];
    createNextPart: (type: NextPartType) => NextPart;
  }): Promise<{ feedback: FeedbackResult; diagnosis: LearningDiagnosis; nextPart?: NextPart } | undefined> {
    const step = input.scenario.interactionSteps.find((item) => item.id === input.stepId);
    if (!step) return undefined;

    const messages: MiniMaxMessage[] = [
      {
        role: "system",
        content:
          "You are an English learning coach for Chinese high-school students. Evaluate the student's answer. Return ONLY valid JSON. Do not use markdown."
      },
      {
        role: "user",
        content: JSON.stringify({
          task: "Give simple sentence-pattern feedback for a high-school English learner.",
          outputRule: "Return only JSON. No markdown. No extra explanation outside JSON.",
          outputSchema: {
            sentencePattern: "one short phrase naming the sentence pattern",
            grammarFocus: "one grammar or usage point in this sentence",
            correctIdea: "what the correct answer should notice",
            studentIssue: "where the student's answer misses the question purpose",
            shortFeedback: "2 short sentences, student-facing"
          },
          sentence: input.scenario.languageInput,
          expressionGoal: input.scenario.expressionGoal,
          targetExpression: input.scenario.targetExpressions[0],
          step: {
            type: step.type,
            prompt: step.prompt,
            purpose: getStepPurpose(step.type),
            successCriteria: step.successCriteria,
            correctOption: step.correctOption
          },
          studentAnswer: input.answer
        })
      }
    ];

    const modelResult = await requestMiniMax(messages);
    if (!modelResult.ok || !modelResult.message) return undefined;
    const analysis = parseJsonFromModel<MiniMaxSimpleAnalysis>(modelResult.message);
    return buildMiniMaxResult({
      scenario: input.scenario,
      stepId: input.stepId,
      step,
      answer: input.answer,
      analysis: analysis ?? fallbackSimpleAnalysisFromText(modelResult.message),
      structured: Boolean(analysis),
      createNextPart: input.createNextPart
    });
  }
};
