import { learningScenarios } from "./mockScenarios";
import type {
  CheckInMilestonePlan,
  DailyCheckInTask,
  GrammarPoint,
  ReadingTask,
  VocabularyItem,
  WritingTask
} from "../types/learning";

export const checkInMilestonePlans: CheckInMilestonePlan[] = [
  {
    id: "day_7",
    title: "7 天：建立句子感",
    days: 7,
    vocabularyTarget: 120,
    grammarTargets: ["主谓结构", "主谓宾", "主系表", "一般现在时", "一般过去时", "简单状语"],
    sentenceTargets: ["读懂 8-12 词简单句", "判断动作、状态或观点", "找出句子主干"],
    readingTargets: ["读懂真实短句", "在场景中理解关键词"],
    writingTargets: ["写出 5-8 词完整简单句", "用 because 写出简单原因", "用 and / but 连接想法"],
    scenarioTargets: ["daily_conversation", "school_life", "interview"],
    assessmentType: ["word_in_context_writing", "sentence_pattern_writing", "scenario_response"],
    expectedOutcome: "读懂一句简单英文句子，并能模仿写出自己的简单句。"
  },
  {
    id: "day_15",
    title: "15 天：从短句到扩展句",
    days: 15,
    vocabularyTarget: 300,
    grammarTargets: ["时间状语", "地点状语", "原因状语", "because / so / but / although", "to do", "doing"],
    sentenceTargets: ["读懂 12-18 词扩展句", "区分主干和补充信息"],
    readingTargets: ["读懂简短对话或邮件"],
    writingTargets: ["表达做什么 + 在哪里 + 什么时候 + 为什么"],
    scenarioTargets: ["school_life", "email_writing", "daily_conversation"],
    assessmentType: ["sentence_pattern_writing", "sentence_annotation"],
    expectedOutcome: "能把简单句扩展成长一点的场景表达。"
  },
  {
    id: "day_30",
    title: "30 天：基础复合句能力",
    days: 30,
    vocabularyTarget: 700,
    grammarTargets: ["because", "although", "if", "when / while", "that 宾语从句", "whether / if", "被动语态", "比较级"],
    sentenceTargets: ["读懂 20-30 词复合句", "找到主句和从句", "理解因果、转折、条件、让步"],
    readingTargets: ["新闻短句", "观点表达材料"],
    writingTargets: ["写出 1-2 个从句组成的复合句", "完成 3-4 句小段落"],
    scenarioTargets: ["speech", "classroom_discussion", "news_reading", "social_issue"],
    assessmentType: ["meaning_annotation", "paragraph_logic_writing"],
    expectedOutcome: "能看懂并使用 because / although / if 等常见连接结构。"
  },
  {
    id: "day_60",
    title: "60 天：长句拆解与段落理解",
    days: 60,
    vocabularyTarget: 1300,
    grammarTargets: ["定语从句", "宾语从句", "状语从句", "非谓语", "被动语态", "现在完成时", "情态动词"],
    sentenceTargets: ["拆解 30-45 词长句", "识别定语、状语、从句和非谓语"],
    readingTargets: ["阅读 3-5 句小段落", "判断主题句和支撑句"],
    writingTargets: ["写出 5 句左右完整段落", "用 because / although / for example 支撑观点"],
    scenarioTargets: ["news_reading", "science_article", "speech", "email_writing"],
    assessmentType: ["sentence_annotation", "paragraph_logic_writing"],
    expectedOutcome: "能拆解高中阅读长句，并写出基本完整英文段落。"
  },
  {
    id: "day_120",
    title: "120 天：语法主干与阅读写作并行",
    days: 120,
    vocabularyTarget: 2800,
    grammarTargets: ["高中核心语法主干", "三大从句", "非谓语", "强调句", "倒装基础", "逻辑连接词"],
    sentenceTargets: ["处理长难句", "识别代词指代和篇章衔接"],
    readingTargets: ["阅读 200-300 词短文", "完成主旨、细节、推断、词义猜测训练"],
    writingTargets: ["完成 80-120 词短文", "写邮件、建议信、邀请信和简单议论文段落"],
    scenarioTargets: ["news_reading", "social_issue", "email_writing", "application_letter", "literary_reading"],
    assessmentType: ["short_essay", "style_annotation"],
    expectedOutcome: "基本覆盖高中语法主干，能读懂中等难度高中阅读并完成短文表达。"
  },
  {
    id: "day_240",
    title: "240 天：高中英语能力闭环",
    days: 240,
    vocabularyTarget: 4000,
    grammarTargets: ["高中语法完整体系", "虚拟语气", "倒装", "强调", "省略", "主谓一致", "篇章衔接"],
    sentenceTargets: ["理解复杂长难句和隐含含义"],
    readingTargets: ["阅读 300-500 词高中阅读文章", "完成文章结构批注和作者态度判断"],
    writingTargets: ["完成 120-180 词高中作文", "有句式变化和少量风格化表达"],
    scenarioTargets: ["debate", "science_article", "literary_reading", "application_letter", "storytelling"],
    assessmentType: ["short_essay", "style_annotation", "scenario_response"],
    expectedOutcome: "掌握高中核心词汇和语法，能读懂高中阅读材料并完成结构清楚的英文写作。"
  }
];

export const vocabularyItems: VocabularyItem[] = [
  {
    id: "word-improve",
    word: "improve",
    partOfSpeech: ["verb"],
    chineseMeanings: ["提高", "改善"],
    coreMeaning: "make something better",
    usageInContext: "I want to improve my English because it is important for my future.",
    commonCollocations: ["improve English", "improve skills", "improve quickly"],
    exampleSentences: ["Reading can improve students' thinking skills."],
    writingUseCase: "Technology can improve the way students learn.",
    readingUseCase: "A study shows that exercise can improve memory.",
    difficultyLevel: "basic",
    frequencyLevel: 5,
    relatedWords: ["better", "develop"],
    wordFamily: ["improvement"],
    commonMistakes: ["不要说 improve better，improve 已经包含 better 的意思。"],
    scenarioTypes: ["interview", "school_life"]
  },
  {
    id: "word-gradually",
    word: "gradually",
    partOfSpeech: ["adverb"],
    chineseMeanings: ["逐渐地"],
    coreMeaning: "slowly over time",
    usageInContext: "My English gradually improved.",
    commonCollocations: ["gradually improve", "gradually become", "gradually understand"],
    exampleSentences: ["She gradually became more confident."],
    writingUseCase: "My confidence gradually improved through daily practice.",
    difficultyLevel: "core",
    frequencyLevel: 4,
    relatedWords: ["slowly", "step by step"],
    wordFamily: ["gradual"],
    commonMistakes: ["gradually 描述过程，不适合突然发生的变化。"],
    scenarioTypes: ["school_life", "speech"]
  },
  {
    id: "word-distract",
    word: "distract",
    partOfSpeech: ["verb"],
    chineseMeanings: ["使分心"],
    coreMeaning: "take attention away from something important",
    usageInContext: "Smartphones may distract students from their studies.",
    commonCollocations: ["distract sb from sth", "get distracted"],
    exampleSentences: ["Noise can distract me from reading."],
    writingUseCase: "Short videos may distract teenagers from meaningful learning.",
    difficultyLevel: "core",
    frequencyLevel: 3,
    relatedWords: ["attention", "focus"],
    wordFamily: ["distraction", "distracted"],
    commonMistakes: ["常用 distract sb from sth，不说 distract sb to sth。"],
    scenarioTypes: ["speech", "social_issue"]
  }
];

export const grammarPoints: GrammarPoint[] = [
  {
    id: "grammar-because",
    name: "because 原因状语从句",
    category: "logical_connector",
    difficulty: "basic",
    expressionFunction: "学会解释为什么你这样想或这样做。",
    examples: ["I want to join the club because I love reading."],
    scenarioTypes: ["interview", "daily_conversation"],
    prerequisites: []
  },
  {
    id: "grammar-although",
    name: "although 让步状语从句",
    category: "clause",
    difficulty: "intermediate",
    expressionFunction: "学会表达虽然有困难或问题，但仍然有行动或观点。",
    examples: ["Although English is difficult, I still want to learn it well."],
    scenarioTypes: ["speech", "classroom_discussion"],
    prerequisites: ["grammar-because"]
  }
];

export const readingTask: ReadingTask = {
  id: "reading-ai-tools",
  title: "AI 工具与学习",
  topic: "technology and learning",
  wordCount: 42,
  difficulty: "中等",
  text:
    "Some students use AI tools to check their writing. These tools can help them find mistakes quickly, but students still need to think carefully and improve their own ideas.",
  targetVocabulary: ["tools", "check", "mistakes", "improve"],
  targetGrammarPoints: ["but 转折", "still 表达仍然"],
  comprehensionTasks: [
    { id: "main", prompt: "这段话对 AI 工具的态度是什么？", skill: "main_idea" }
  ],
  annotationTasks: [
    { id: "logic", prompt: "找出 help 和 but 后面分别表达什么。", annotationTypes: ["logical_relation"] }
  ],
  logicTasks: [
    { id: "contrast", prompt: "but 前后有什么变化？", logicType: "contrast" }
  ]
};

export const writingTask: WritingTask = {
  id: "writing-because",
  scenario: "你在英语社团打卡区写一句今天的学习目标。",
  writingType: "sentence",
  prompt: "请用 because 写一句：你为什么想提高英语？",
  targetVocabulary: ["improve", "because"],
  targetSentencePatterns: ["I want to ... because ..."],
  targetLogic: ["reason"],
  wordLimit: 25,
  evaluationRubric: {
    grammarAccuracy: 20,
    vocabularyUse: 15,
    sentenceVariety: 10,
    logicClarity: 20,
    coherence: 10,
    taskCompletion: 15,
    naturalness: 10
  }
};

export const dailyCheckInTask: DailyCheckInTask = {
  id: "daily-checkin-day-1",
  dayNumber: 1,
  milestone: "day_7",
  vocabularyTasks: vocabularyItems,
  grammarFocus: [grammarPoints[0]],
  scenarioTask: learningScenarios[0],
  sentencePractice: [
    {
      id: "sentence-improve",
      text: "I want to improve my English because I hope to study abroad one day.",
      chinese: "我想提高英语，因为我希望将来有一天出国学习。",
      focus: "目标 + 原因"
    },
    {
      id: "sentence-gradual",
      text: "My English gradually improved through daily practice.",
      chinese: "我的英语通过每日练习逐渐提高。",
      focus: "gradually 描述慢慢变化"
    }
  ],
  readingTask,
  writingTask,
  reviewTasks: [
    {
      id: "review-because",
      source: "最近场景任务",
      prompt: "回看 because：它后面应该说明原因，而不是重复前面的动作。"
    }
  ],
  estimatedMinutes: 30
};
