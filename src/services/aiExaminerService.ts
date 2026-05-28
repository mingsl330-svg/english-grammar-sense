import { GrammarPointDB, TopicClusterDB, WordBank } from "../data/gaokaoDatabases";
import { ExamTrendEngine } from "./examTrendEngine";
import type {
  AiGenerationRecord,
  ExaminerReview,
  GaokaoExamTask,
  GaokaoLearningPathStage,
  GaokaoTopicId,
  MonthlyExamTrend
} from "../types/gaokao";

export interface AiExaminerProvider {
  id: string;
  family: "openai" | "claude" | "deepseek" | "qwen" | "doubao" | "kimi" | "ollama" | "minimax" | "local";
  generateTask(input: GenerateExamTaskInput): Promise<GaokaoExamTask>;
}

export interface GenerateExamTaskInput {
  stage: GaokaoLearningPathStage;
  trend: MonthlyExamTrend;
  topicId?: GaokaoTopicId;
  studentAnswer?: string;
}

const STORAGE_KEY = "english-grammar-sense-gaokao-ai-records";

const stageLabel: Record<GaokaoLearningPathStage, string> = {
  word_sense: "Word Sense",
  sentence_builder: "Sentence Builder",
  reading_examiner: "Reading Examiner",
  guided_writing: "Guided Writing",
  independent_writing: "Independent Writing",
  exam_simulation: "Exam Simulation"
};

const abilityForStage: Record<GaokaoLearningPathStage, string> = {
  word_sense: "词汇语境能力 + 写作迁移",
  sentence_builder: "语法输出能力 + 句子升级",
  reading_examiner: "长难句理解能力 + 阅读推理能力",
  guided_writing: "审题能力 + 写作组织能力",
  independent_writing: "观点表达能力 + 语言自然度 + 高考题型适应度",
  exam_simulation: "阅读推理能力 + 语篇结构能力 + 高考题型适应度"
};

export const gaokaoExamTaskJsonSchema = {
  type: "object",
  required: ["id", "stage", "topicId", "title", "prompt", "targetWords", "grammarIds", "examinerReview"],
  properties: {
    id: { type: "string" },
    stage: {
      type: "string",
      enum: ["word_sense", "sentence_builder", "reading_examiner", "guided_writing", "independent_writing", "exam_simulation"]
    },
    topicId: { type: "string" },
    title: { type: "string" },
    prompt: { type: "string" },
    sourceText: { type: "string" },
    options: { type: "array", items: { type: "string" } },
    correctAnswer: { type: "string" },
    targetWords: { type: "array", items: { type: "string" } },
    grammarIds: { type: "array", items: { type: "string" } },
    writingScaffold: { type: "array", items: { type: "string" } },
    examinerReview: {
      type: "object",
      required: [
        "assessedAbility",
        "examinerIntent",
        "answerEvidence",
        "distractorDesign",
        "commonMistakes",
        "writingTransfer",
        "nextTraining"
      ]
    }
  }
} as const;

const promptFor = (input: GenerateExamTaskInput) =>
  [
    "You are a simulated Chinese Gaokao English examiner group.",
    "Generate original material only. Do not copy any real exam question.",
    `Stage: ${input.stage}`,
    `Monthly trend: ${input.trend.title}`,
    `Topic focus: ${input.trend.topicFocus.map((topic) => topic.label).join(", ")}`,
    `Grammar focus: ${input.trend.grammarFocus.map((grammar) => grammar.name).join(", ")}`,
    input.studentAnswer ? `Student answer: ${input.studentAnswer}` : "Student answer: none yet"
  ].join("\n");

const buildReview = (stage: GaokaoLearningPathStage, topicLabel: string, grammarName: string): ExaminerReview => ({
  assessedAbility: abilityForStage[stage],
  examinerIntent: `Use ${topicLabel} to test whether the learner can move from meaning to structure and output.`,
  answerEvidence: `The answer should be supported by the sentence meaning, the topic context, and the grammar function: ${grammarName}.`,
  distractorDesign:
    "Distractors are designed around shallow translation, missing contrast, over-generalization, or ignoring the writer's purpose.",
  commonMistakes: [
    "Translate isolated words without reading the whole sentence.",
    "Choose an option that sounds familiar but does not match the sentence logic.",
    "Use grammar names in writing without turning them into real meaning."
  ],
  writingTransfer: `Reuse the topic words and ${grammarName} to write one sentence about a real school or social situation.`,
  nextTraining: "Go one step forward: word in context -> sentence upgrade -> reading evidence -> writing transfer."
});

const localProvider: AiExaminerProvider = {
  id: "local-gaokao-examiner",
  family: "local",
  async generateTask(input) {
    const topic = input.topicId
      ? TopicClusterDB.find((item) => item.id === input.topicId) ?? input.trend.topicFocus[0]
      : input.trend.topicFocus[0];
    const grammar =
      input.trend.grammarFocus.find((item) => item.linkedTopicIds.includes(topic.id)) ?? input.trend.grammarFocus[0] ?? GrammarPointDB[0];
    const words = WordBank.filter((word) => word.topicIds.includes(topic.id)).slice(0, 3);
    const targetWords = words.length ? words.map((word) => word.word) : input.trend.wordFocus.slice(0, 3).map((word) => word.word);
    const review = buildReview(input.stage, topic.label, grammar.name);
    const baseSentence =
      input.stage === "word_sense"
        ? `Use "${targetWords[0] ?? "responsibility"}" in a Gaokao context and explain its collocation.`
        : input.stage === "sentence_builder"
          ? `Upgrade this idea with ${grammar.name}: Students should join meaningful activities.`
          : input.stage === "reading_examiner"
            ? `Read the passage and choose the option best supported by evidence.`
            : input.stage === "guided_writing"
              ? `Plan a short application-writing paragraph about ${topic.label}.`
              : input.stage === "exam_simulation"
                ? `Complete one short original Gaokao-style task about ${topic.label}, then read the examiner review.`
                : `Write independently about ${topic.label}, then revise for evidence, structure, and naturalness.`;

    return {
      id: `${input.stage}-${input.trend.monthKey}-${topic.id}`,
      stage: input.stage,
      topicId: topic.id,
      title: `${stageLabel[input.stage]} · ${topic.label}`,
      prompt: baseSentence,
      sourceText:
        input.stage === "reading_examiner" || input.stage === "exam_simulation"
          ? `As ${topic.label.toLowerCase()} becomes a familiar topic in school reading, students need to identify not only facts, but also the writer's purpose and the evidence behind each claim.`
          : undefined,
      options:
        input.stage === "reading_examiner" || input.stage === "exam_simulation"
          ? [
              "The writer connects the topic with a practical learning or social need.",
              "The writer only lists facts without showing any attitude.",
              "The writer changes the topic and gives no evidence."
            ]
          : undefined,
      correctAnswer:
        input.stage === "reading_examiner" || input.stage === "exam_simulation"
          ? "The writer connects the topic with a practical learning or social need."
          : undefined,
      targetWords,
      grammarIds: [grammar.id],
      writingScaffold:
        input.stage === "guided_writing" || input.stage === "independent_writing"
          ? ["topic sentence", "one concrete detail", "one upgraded sentence pattern", "clear closing action"]
          : undefined,
      examinerReview: review
    };
  }
};

export const aiExaminerProviderRegistry = {
  active: localProvider.id,
  availableFamilies: ["openai", "claude", "deepseek", "qwen", "doubao", "kimi", "ollama", "minimax", "local"] as const,
  providers: [localProvider]
};

export const validateExamTask = (task: GaokaoExamTask) => {
  const errors: string[] = [];
  if (!task.id) errors.push("id is required");
  if (!task.stage) errors.push("stage is required");
  if (!task.topicId) errors.push("topicId is required");
  if (!task.prompt) errors.push("prompt is required");
  if (!task.examinerReview?.examinerIntent) errors.push("examinerReview.examinerIntent is required");
  if (!task.examinerReview?.answerEvidence) errors.push("examinerReview.answerEvidence is required");
  if (!task.examinerReview?.distractorDesign) errors.push("examinerReview.distractorDesign is required");
  return { ok: errors.length === 0, errors };
};

export const examGenerationStore = {
  load(): AiGenerationRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AiGenerationRecord[]) : [];
    } catch {
      return [];
    }
  },
  save(record: AiGenerationRecord) {
    const records = [record, ...this.load()].slice(0, 120);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }
};

export const aiExaminerService = {
  provider: localProvider as AiExaminerProvider,
  async generateAndRecord(input: Omit<GenerateExamTaskInput, "trend"> & { trend?: MonthlyExamTrend }) {
    const trend = input.trend ?? ExamTrendEngine.getMonthlyTrend();
    const fullInput: GenerateExamTaskInput = { ...input, trend };
    const generatedTask = await this.provider.generateTask(fullInput);
    const validation = validateExamTask(generatedTask);
    const record: AiGenerationRecord = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      provider: this.provider.id,
      prompt: promptFor(fullInput),
      input: {
        stage: input.stage,
        monthKey: trend.monthKey,
        topicId: generatedTask.topicId,
        studentAnswer: input.studentAnswer
      },
      generatedTask,
      studentAnswer: input.studentAnswer,
      examinerReview: generatedTask.examinerReview,
      validation
    };
    examGenerationStore.save(record);
    return record;
  }
};
