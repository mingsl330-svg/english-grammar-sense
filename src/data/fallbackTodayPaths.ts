import type { TodayPath } from "../types/today-path";

const today = () => new Date().toISOString().slice(0, 10);
const now = () => new Date().toISOString();

export const createFallbackSenseSpaceTodayPath = (userId = "local-user"): TodayPath => ({
  id: `fallback-sense-${today()}`,
  date: today(),
  userId,
  mode: "sense_space",
  theme: "Rainy Day",
  themeCategory: "weather",
  greeting: "今天我们不做题。我们来读一个关于雨天的小故事，学会一个温柔的词，最后写一句自己的心情。",
  estimatedMinutes: 10,
  pressureLevel: "low",
  wordSeed: {
    id: "word-quiet",
    word: "quiet",
    meaningZh: "安静的；平静的",
    themeCategory: "weather",
    collocations: ["a quiet room", "a quiet afternoon", "feel quiet"],
    exampleSentence: "The rain makes the city quiet.",
    writingTransferSentence: "I feel quiet when I listen to the rain."
  },
  sentenceSeed: {
    id: "sentence-rain-quiet",
    sentence: "The rain makes the city quiet.",
    translationZh: "雨让城市安静下来。",
    gentleExplanation: "make + something + adjective 可以表达“让某物变得怎样”。"
  },
  readingSeed: {
    id: "reading-rainy-afternoon",
    title: "A Rainy Afternoon",
    passage:
      "It was a rainy afternoon. Lily sat near the window and listened to the sound of rain. The street became quiet. She opened her notebook and wrote one sentence: I like the world when it slows down.",
    wordCount: 46,
    themeCategory: "weather",
    guidingQuestion: "What does Lily like about the rainy afternoon?",
    keyWords: ["rainy", "window", "quiet", "notebook"],
    summaryZh: "一个下雨的下午，Lily 坐在窗边，感受到世界慢下来的安静。"
  },
  expressionTask: {
    id: "expression-rain",
    promptZh: "下雨天会让你想到什么？试着用一句英文写下来。",
    expectedLength: "one_sentence",
    sentenceFrames: ["Rainy days make me feel ____.", "I like rainy days because ____."]
  },
  steps: [
    { id: "step-1", type: "word_seed", title: "今天的小词", description: "quiet", status: "not_started" },
    {
      id: "step-2",
      type: "sentence_seed",
      title: "今天的一句话",
      description: "The rain makes the city quiet.",
      status: "not_started"
    },
    { id: "step-3", type: "reading_seed", title: "和我一起读", description: "A Rainy Afternoon", status: "not_started" },
    {
      id: "step-4",
      type: "expression_task",
      title: "说一句自己的话",
      description: "写一句关于雨天的英文。",
      status: "not_started"
    }
  ],
  finalCanSay: ["The rain makes the city quiet.", "I feel quiet when I listen to the rain."],
  createdAt: now()
});

export const createFallbackExamExpressionTodayPath = (userId = "local-user"): TodayPath => ({
  id: `fallback-exam-${today()}`,
  date: today(),
  userId,
  mode: "exam_expression",
  theme: "AI in Education",
  themeCategory: "technology",
  greeting: "今天的主题是 AI 与学习。我们会先看 3 个关键词，再读一段高考风格短文，最后用出题组镜头看它可能怎么考。",
  estimatedMinutes: 20,
  pressureLevel: "medium",
  wordSeed: {
    id: "word-efficient",
    word: "efficient",
    meaningZh: "高效的",
    themeCategory: "technology",
    collocations: ["an efficient way", "more efficient learning", "improve efficiency"],
    exampleSentence: "AI can make learning more efficient.",
    writingTransferSentence: "AI can make learning more efficient by offering personalized support."
  },
  sentenceSeed: {
    id: "sentence-ai-learning",
    sentence: "AI has changed the way students learn.",
    translationZh: "AI 已经改变了学生学习的方式。",
    keyStructure: "present perfect tense",
    gentleExplanation: "现在完成时 has changed 表示过去发生的变化对现在仍有影响。",
    upgradedVersion: "AI has significantly changed the way students learn by making learning more personalized and efficient."
  },
  readingSeed: {
    id: "reading-ai-learning-partner",
    title: "Can AI Become a Learning Partner?",
    passage:
      "In recent years, AI tools have entered classrooms and homes. Some students use them to check grammar, explain difficult ideas, or make study plans. However, AI should not replace human thinking. Instead, it can become a learning partner when students use it with clear goals and responsibility.",
    wordCount: 49,
    themeCategory: "technology",
    guidingQuestion: "According to the passage, what role should AI play in learning?",
    keyWords: ["AI tools", "replace", "learning partner", "responsibility"],
    longSentence: "Instead, it can become a learning partner when students use it with clear goals and responsibility.",
    summaryZh: "文章讨论 AI 在学习中的作用：它不应替代人的思考，而应成为有目标使用时的学习伙伴。"
  },
  expressionTask: {
    id: "expression-ai-view",
    promptZh: "用 3 句话表达你对 AI 辅助学习的看法。",
    expectedLength: "three_sentences",
    sentenceFrames: ["AI can help students ____.", "However, students should not ____.", "In my opinion, ____."]
  },
  optionalExamLens: {
    id: "exam-lens-ai-001",
    examFocus: "author_attitude",
    question: "What is the author's attitude towards AI in learning?",
    options: ["A. Completely doubtful.", "B. Blindly supportive.", "C. Balanced and responsible.", "D. Uninterested."],
    answer: "C",
    examinerIntent:
      "本题考查作者态度。文章既承认 AI 的帮助，也提醒不能替代人的思考，因此态度是 balanced and responsible。"
  },
  steps: [
    { id: "step-1", type: "word_seed", title: "主题词汇", description: "efficient", status: "not_started" },
    {
      id: "step-2",
      type: "sentence_seed",
      title: "关键句型",
      description: "AI has changed the way students learn.",
      status: "not_started"
    },
    {
      id: "step-3",
      type: "reading_seed",
      title: "主题阅读",
      description: "Can AI Become a Learning Partner?",
      status: "not_started"
    },
    { id: "step-4", type: "exam_lens", title: "出题组镜头", description: "作者态度题", status: "not_started" },
    { id: "step-5", type: "expression_task", title: "写作迁移", description: "表达你对 AI 学习的看法", status: "not_started" }
  ],
  finalCanSay: [
    "AI can make learning more efficient.",
    "AI has changed the way students learn.",
    "AI should become a learning partner rather than a replacement for human thinking."
  ],
  createdAt: now()
});
