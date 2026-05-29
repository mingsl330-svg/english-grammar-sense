# English Grammar Sense 工程升级执行文档

## 版本信息

```text
Version: 1.0
Target Site: https://english-grammar-sense.vercel.app/
Project Goal: 将现有英语学习网页升级为 AI 主动引导式语言感知学习系统
Execution Mode: 严格按本文档执行，不允许自由重构产品方向
```

---

## 0. 总执行原则

### 0.1 不允许 Codex 自由设计

Codex 必须遵守以下规则：

```text
1. 不重新定义产品。
2. 不改变核心学习路径。
3. 不把网站改成题库。
4. 不把网站改成传统课件。
5. 不新增未经定义的复杂系统。
6. 不改变现有技术栈，除非现有项目无法支持。
7. 不删除已有功能，除非明确标记为 deprecated。
8. 所有新增功能必须通过明确 route、component、type、data、state 实现。
9. 所有 AI 输出必须结构化，不能直接把大段自然语言无约束显示到页面。
10. 所有页面都必须有 loading、empty、error、fallback 状态。
```

### 0.2 本次升级的核心判断

本次升级不是把系统变得“功能更多”，而是把体验从：

```text
用户自己找功能学习
```

改成：

```text
系统每天主动带用户走一条语言路径
```

最终目标：

```text
每天发现一个词
每天读懂一点世界
每天说出一句自己
长期自然走向阅读能力、写作能力和考试能力
```

---

## 1. 产品升级目标

当前网站需要升级为：

> **一个由 AI 主动引导的英语语言感知学习空间。**

底层学习主线固定为：

```text
Word → Sentence → Reading → Guided Writing → Independent Writing
```

中文理解：

```text
单词感知 → 句子表达 → 伴读 / 阅读 → 辅助写作 → 独立写作
```

新的产品体验不是让用户自己点一堆功能，而是系统每天自动生成一条：

```text
Today Path
```

即：

```text
今日语言路径
```

用户每天进入后，只需要沿着系统给出的路径学习。

---

## 2. 双模式前端结构

整个应用必须分成两个主学习模式：

```ts
type LearningMode = "sense_space" | "exam_expression";
```

### 2.1 sense_space

适用对象：

```text
小学到初中
```

目标：

```text
建立语感、兴趣、表达安全感
```

前端气质：

```text
轻松、温暖、低压力、生活化、陪伴感
```

禁止默认展示：

```text
高考
刷题
试卷
错题本
排名
扣分
考试倒计时
```

核心入口：

```text
Today Path
Read With Me
English Tree Hole
My Little Voice
Real World English
```

### 2.2 exam_expression

适用对象：

```text
高中到大学
```

目标：

```text
系统提升考试能力与真实表达能力
```

前端气质：

```text
清晰、系统、有目标、不压迫
```

允许展示：

```text
月度考向
主题词汇
语篇阅读
写作升级
出题组镜头
能力画像
模拟测试入口
```

但默认首页不能是试卷。默认入口仍然是：

```text
Today Path
```

高考相关内容通过：

```text
Exam Lens
```

作为可选模块出现。

---

## 3. 路由结构

必须新增或调整以下路由。

```text
/
  首页模式选择与今日入口

/today
  今日语言路径主页面

/read-with-me
  伴读页面

/tree-hole
  英文树洞页面

/my-voice
  用户表达作品集

/theme-journey
  高中主题旅程页面

/exam-lens
  出题组镜头页面

/growth
  成长报告页面

/settings
  学习模式、年级、压力偏好、AI 陪伴风格设置
```

如果现有项目已有相似路由，可以映射到现有结构，但最终用户可访问路径必须符合以上结构。

---

## 4. 全局数据类型

新增：

```text
/src/types/learning.ts
```

写入以下类型：

```ts
export type LearningStage =
  | "primary"
  | "middle"
  | "high"
  | "college";

export type LearningMode =
  | "sense_space"
  | "exam_expression";

export type PressureLevel =
  | "low"
  | "medium"
  | "high";

export type AICompanionStyle =
  | "gentle_friend"
  | "reading_partner"
  | "language_coach"
  | "examiner"
  | "academic_editor";

export type ThemeCategory =
  | "daily_life"
  | "school_life"
  | "family"
  | "friendship"
  | "emotion"
  | "nature"
  | "weather"
  | "chinese_culture"
  | "western_culture"
  | "technology"
  | "environment"
  | "personal_growth"
  | "philosophy"
  | "social_responsibility";

export type TaskStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "skipped";
```

---

## 5. 用户学习画像类型

新增：

```text
/src/types/profile.ts
```

```ts
import type {
  LearningStage,
  LearningMode,
  PressureLevel,
  AICompanionStyle,
  ThemeCategory,
} from "./learning";

export type UserLearningProfile = {
  userId: string;

  stage: LearningStage;
  mode: LearningMode;

  ageGroupLabel: string;

  learningGoal:
    | "build_language_sense"
    | "improve_school_english"
    | "prepare_gaokao"
    | "improve_writing"
    | "academic_expression";

  pressurePreference: PressureLevel;
  aiCompanionStyle: AICompanionStyle;

  showExamLabels: boolean;
  showScores: boolean;
  showGaokaoDirection: boolean;

  preferredThemes: ThemeCategory[];

  vocabularyLevel: number;
  sentenceComplexity: number;
  readingLength: number;
  grammarComplexity: number;
  writingIndependence: number;
  abstractThinkingLevel: number;

  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;
};
```

默认 profile：

```ts
export const defaultSenseSpaceProfile: UserLearningProfile = {
  userId: "local-user",
  stage: "middle",
  mode: "sense_space",
  ageGroupLabel: "小学到初中",
  learningGoal: "build_language_sense",
  pressurePreference: "low",
  aiCompanionStyle: "gentle_friend",
  showExamLabels: false,
  showScores: false,
  showGaokaoDirection: false,
  preferredThemes: ["daily_life", "school_life", "emotion", "nature"],
  vocabularyLevel: 2,
  sentenceComplexity: 2,
  readingLength: 150,
  grammarComplexity: 1,
  writingIndependence: 1,
  abstractThinkingLevel: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const defaultExamExpressionProfile: UserLearningProfile = {
  userId: "local-user",
  stage: "high",
  mode: "exam_expression",
  ageGroupLabel: "高中到大学",
  learningGoal: "prepare_gaokao",
  pressurePreference: "medium",
  aiCompanionStyle: "examiner",
  showExamLabels: true,
  showScores: true,
  showGaokaoDirection: true,
  preferredThemes: [
    "chinese_culture",
    "technology",
    "environment",
    "personal_growth",
  ],
  vocabularyLevel: 4,
  sentenceComplexity: 4,
  readingLength: 350,
  grammarComplexity: 4,
  writingIndependence: 3,
  abstractThinkingLevel: 3,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
```

---

## 6. Today Path 核心数据结构

新增：

```text
/src/types/today-path.ts
```

```ts
import type {
  LearningMode,
  PressureLevel,
  ThemeCategory,
  TaskStatus,
} from "./learning";

export type WordSeed = {
  id: string;
  word: string;
  meaningZh: string;
  meaningEn?: string;
  phonetic?: string;
  themeCategory: ThemeCategory;
  collocations: string[];
  exampleSentence: string;
  writingTransferSentence?: string;
};

export type SentenceSeed = {
  id: string;
  sentence: string;
  translationZh: string;
  keyStructure?: string;
  gentleExplanation: string;
  upgradedVersion?: string;
};

export type ReadingSeed = {
  id: string;
  title: string;
  passage: string;
  wordCount: number;
  themeCategory: ThemeCategory;
  guidingQuestion: string;
  keyWords: string[];
  longSentence?: string;
  summaryZh: string;
};

export type ExpressionTask = {
  id: string;
  promptZh: string;
  promptEn?: string;
  expectedLength:
    | "one_sentence"
    | "three_sentences"
    | "short_paragraph"
    | "full_writing";
  sentenceFrames?: string[];
};

export type ExamLensTask = {
  id: string;
  examFocus:
    | "main_idea"
    | "detail"
    | "inference"
    | "author_attitude"
    | "grammar_filling"
    | "writing_transfer";
  question: string;
  options?: string[];
  answer?: string;
  examinerIntent: string;
};

export type TodayPathStep = {
  id: string;
  type:
    | "word_seed"
    | "sentence_seed"
    | "reading_seed"
    | "expression_task"
    | "exam_lens";
  title: string;
  description: string;
  status: TaskStatus;
};

export type TodayPath = {
  id: string;
  date: string;
  userId: string;

  mode: LearningMode;
  theme: string;
  themeCategory: ThemeCategory;

  greeting: string;
  estimatedMinutes: 5 | 10 | 15 | 20 | 25;
  pressureLevel: PressureLevel;

  wordSeed: WordSeed;
  sentenceSeed: SentenceSeed;
  readingSeed: ReadingSeed;
  expressionTask: ExpressionTask;
  optionalExamLens?: ExamLensTask;

  steps: TodayPathStep[];

  finalCanSay: string[];
  createdAt: string;
};
```

---

## 7. Today Path 生成逻辑

新增：

```text
/src/lib/today-path/generateTodayPath.ts
```

函数签名：

```ts
import type { UserLearningProfile } from "@/types/profile";
import type { TodayPath } from "@/types/today-path";

export async function generateTodayPath(
  profile: UserLearningProfile
): Promise<TodayPath> {
  // Implementation details below
}
```

### 7.1 非 AI fallback 逻辑

在 AI 接口不可用时，必须返回本地 fallback 数据。

新增：

```text
/src/data/fallbackTodayPaths.ts
```

包含至少两个 fallback。

#### fallbackSenseSpaceTodayPath

```ts
export const fallbackSenseSpaceTodayPath: TodayPath = {
  id: "fallback-sense-001",
  date: new Date().toISOString().slice(0, 10),
  userId: "local-user",
  mode: "sense_space",
  theme: "Rainy Day",
  themeCategory: "weather",
  greeting:
    "今天我们不做题。我们来读一个关于雨天的小故事，学会一个温柔的词，最后写一句自己的心情。",
  estimatedMinutes: 10,
  pressureLevel: "low",
  wordSeed: {
    id: "word-quiet",
    word: "quiet",
    meaningZh: "安静的；平静的",
    themeCategory: "weather",
    collocations: ["a quiet room", "a quiet afternoon", "feel quiet"],
    exampleSentence: "The rain makes the city quiet.",
    writingTransferSentence: "I feel quiet when I listen to the rain.",
  },
  sentenceSeed: {
    id: "sentence-rain-quiet",
    sentence: "The rain makes the city quiet.",
    translationZh: "雨让城市安静下来。",
    gentleExplanation:
      "make + something + adjective 可以表达“让某物变得怎样”。",
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
    summaryZh: "一个下雨的下午，Lily 坐在窗边，感受到世界慢下来的安静。",
  },
  expressionTask: {
    id: "expression-rain",
    promptZh: "下雨天会让你想到什么？试着用一句英文写下来。",
    expectedLength: "one_sentence",
    sentenceFrames: [
      "Rainy days make me feel ____.",
      "I like rainy days because ____.",
    ],
  },
  steps: [
    {
      id: "step-1",
      type: "word_seed",
      title: "今天的小词",
      description: "quiet",
      status: "not_started",
    },
    {
      id: "step-2",
      type: "sentence_seed",
      title: "今天的一句话",
      description: "The rain makes the city quiet.",
      status: "not_started",
    },
    {
      id: "step-3",
      type: "reading_seed",
      title: "和我一起读",
      description: "A Rainy Afternoon",
      status: "not_started",
    },
    {
      id: "step-4",
      type: "expression_task",
      title: "说一句自己的话",
      description: "写一句关于雨天的英文。",
      status: "not_started",
    },
  ],
  finalCanSay: [
    "The rain makes the city quiet.",
    "I feel quiet when I listen to the rain.",
  ],
  createdAt: new Date().toISOString(),
};
```

#### fallbackExamExpressionTodayPath

```ts
export const fallbackExamExpressionTodayPath: TodayPath = {
  id: "fallback-exam-001",
  date: new Date().toISOString().slice(0, 10),
  userId: "local-user",
  mode: "exam_expression",
  theme: "AI in Education",
  themeCategory: "technology",
  greeting:
    "今天的主题是 AI 与学习。我们会先看 3 个关键词，再读一段高考风格短文，最后用出题组镜头看它可能怎么考。",
  estimatedMinutes: 20,
  pressureLevel: "medium",
  wordSeed: {
    id: "word-efficient",
    word: "efficient",
    meaningZh: "高效的",
    themeCategory: "technology",
    collocations: [
      "an efficient way",
      "more efficient learning",
      "improve efficiency",
    ],
    exampleSentence: "AI can make learning more efficient.",
    writingTransferSentence:
      "AI can make learning more efficient by offering personalized support.",
  },
  sentenceSeed: {
    id: "sentence-ai-learning",
    sentence: "AI has changed the way students learn.",
    translationZh: "AI 已经改变了学生学习的方式。",
    keyStructure: "present perfect tense",
    gentleExplanation:
      "现在完成时 has changed 表示过去发生的变化对现在仍有影响。",
    upgradedVersion:
      "AI has significantly changed the way students learn by making learning more personalized and efficient.",
  },
  readingSeed: {
    id: "reading-ai-learning-partner",
    title: "Can AI Become a Learning Partner?",
    passage:
      "In recent years, AI tools have entered classrooms and homes. Some students use them to check grammar, explain difficult ideas, or make study plans. However, AI should not replace human thinking. Instead, it can become a learning partner when students use it with clear goals and responsibility.",
    wordCount: 49,
    themeCategory: "technology",
    guidingQuestion:
      "According to the passage, what role should AI play in learning?",
    keyWords: ["AI tools", "replace", "learning partner", "responsibility"],
    longSentence:
      "Instead, it can become a learning partner when students use it with clear goals and responsibility.",
    summaryZh:
      "文章讨论 AI 在学习中的作用：它不应替代人的思考，而应成为有目标使用时的学习伙伴。",
  },
  expressionTask: {
    id: "expression-ai-view",
    promptZh: "用 3 句话表达你对 AI 辅助学习的看法。",
    expectedLength: "three_sentences",
    sentenceFrames: [
      "AI can help students ____.",
      "However, students should not ____.",
      "In my opinion, ____.",
    ],
  },
  optionalExamLens: {
    id: "exam-lens-ai-001",
    examFocus: "author_attitude",
    question: "What is the author's attitude towards AI in learning?",
    options: [
      "A. Completely doubtful.",
      "B. Blindly supportive.",
      "C. Balanced and responsible.",
      "D. Uninterested.",
    ],
    answer: "C",
    examinerIntent:
      "本题考查作者态度。文章既承认 AI 的帮助，也提醒不能替代人的思考，因此态度是 balanced and responsible。",
  },
  steps: [
    {
      id: "step-1",
      type: "word_seed",
      title: "主题词汇",
      description: "efficient",
      status: "not_started",
    },
    {
      id: "step-2",
      type: "sentence_seed",
      title: "关键句型",
      description: "AI has changed the way students learn.",
      status: "not_started",
    },
    {
      id: "step-3",
      type: "reading_seed",
      title: "主题阅读",
      description: "Can AI Become a Learning Partner?",
      status: "not_started",
    },
    {
      id: "step-4",
      type: "exam_lens",
      title: "出题组镜头",
      description: "作者态度题",
      status: "not_started",
    },
    {
      id: "step-5",
      type: "expression_task",
      title: "写作迁移",
      description: "表达你对 AI 学习的看法",
      status: "not_started",
    },
  ],
  finalCanSay: [
    "AI can make learning more efficient.",
    "AI has changed the way students learn.",
    "AI should become a learning partner rather than a replacement for human thinking.",
  ],
  createdAt: new Date().toISOString(),
};
```

---

## 8. 本地状态管理

新增：

```text
/src/store/useLearningStore.ts
```

如果项目已使用 Zustand，则使用 Zustand。否则使用 React Context，但优先 Zustand。

```ts
import { create } from "zustand";
import type { UserLearningProfile } from "@/types/profile";
import type { TodayPath } from "@/types/today-path";

type LearningState = {
  profile: UserLearningProfile | null;
  todayPath: TodayPath | null;
  isLoadingTodayPath: boolean;
  error: string | null;

  setProfile: (profile: UserLearningProfile) => void;
  setTodayPath: (path: TodayPath) => void;
  setLoadingTodayPath: (value: boolean) => void;
  setError: (message: string | null) => void;
};

export const useLearningStore = create<LearningState>((set) => ({
  profile: null,
  todayPath: null,
  isLoadingTodayPath: false,
  error: null,

  setProfile: (profile) => set({ profile }),
  setTodayPath: (path) => set({ todayPath: path }),
  setLoadingTodayPath: (value) => set({ isLoadingTodayPath: value }),
  setError: (message) => set({ error: message }),
}));
```

必须持久化到 localStorage。

如果当前项目没有持久化方案，则新增：

```text
/src/lib/storage/learningStorage.ts
```

包含：

```ts
export function saveLearningProfile(profile: UserLearningProfile): void;
export function loadLearningProfile(): UserLearningProfile | null;
export function saveTodayPath(path: TodayPath): void;
export function loadTodayPath(date: string): TodayPath | null;
```

---

## 9. 页面具体实现

### 9.1 `/` 首页

文件位置根据项目结构判断：

Next.js App Router：

```text
/src/app/page.tsx
```

React Router：

```text
/src/pages/Home.tsx
```

首页必须包含：

```text
1. 产品一句话说明
2. 两个模式入口
3. 今日路径入口
4. 已有 profile 时直接显示 Continue Today
```

固定文案：

主标题：

```text
每天一点英语，慢慢把世界说出来
```

副标题：

```text
从一个词、一句话、一段小阅读开始，让英语从学习任务变成每天都可以进入的语言空间。
```

两个入口：

```text
轻松建立语感
适合小学到初中：伴读、表达、树洞、小日记

系统提升表达
适合高中到大学：主题阅读、写作升级、出题组镜头
```

按钮：

```text
进入今天的英语世界
```

技术要求：

点击“轻松建立语感”：

```ts
setProfile(defaultSenseSpaceProfile)
navigate("/today")
```

点击“系统提升表达”：

```ts
setProfile(defaultExamExpressionProfile)
navigate("/today")
```

---

### 9.2 `/today` 今日路径页

页面组件：

```text
/src/components/today/TodayPathPage.tsx
/src/components/today/TodayPathHeader.tsx
/src/components/today/TodayPathSteps.tsx
/src/components/today/WordSeedCard.tsx
/src/components/today/SentenceSeedCard.tsx
/src/components/today/ReadingSeedCard.tsx
/src/components/today/ExpressionTaskCard.tsx
/src/components/today/ExamLensCard.tsx
/src/components/today/FinalCanSayCard.tsx
```

页面加载逻辑：

```ts
1. 读取 profile
2. 如果没有 profile，跳转 /
3. 检查 localStorage 是否已有今日 TodayPath
4. 如果有，直接使用
5. 如果没有，调用 generateTodayPath(profile)
6. 保存 TodayPath
7. 渲染页面
```

Header 显示：

```text
greeting
theme
estimatedMinutes
pressureLevel
```

sense_space 模式不显示 pressureLevel 文本。

exam_expression 可以显示：

```text
今日预计 20 分钟
```

但不要显示：

```text
压力等级：medium
```

---

### 9.3 Today Path Step 交互

每个 step 默认折叠。

用户按顺序展开。

```text
Step 1 Word
Step 2 Sentence
Step 3 Reading
Step 4 Expression
Step 5 Optional Exam Lens
Step 6 Final Can Say
```

在 sense_space 模式下：

```text
Exam Lens 不显示
```

在 exam_expression 模式下：

```text
Exam Lens 显示为可选
文案：想看看这篇材料如果出成高考题会怎么考？
按钮：打开出题组镜头
```

---

## 10. 英文树洞 `/tree-hole`

### 10.1 数据类型

新增：

```text
/src/types/tree-hole.ts
```

```ts
export type TreeHoleEntry = {
  id: string;
  userId: string;
  rawInput: string;
  detectedMood?:
    | "happy"
    | "sad"
    | "angry"
    | "tired"
    | "worried"
    | "calm"
    | "unknown";

  aiResponse: string;
  naturalEnglishSentence: string;
  keyExpression: string;
  savedToMyVoice: boolean;

  createdAt: string;
};
```

### 10.2 页面结构

组件：

```text
/src/components/tree-hole/TreeHolePage.tsx
/src/components/tree-hole/TreeHoleInput.tsx
/src/components/tree-hole/TreeHoleResponse.tsx
/src/components/tree-hole/SaveToMyVoiceButton.tsx
```

页面文案：

标题：

```text
英文树洞
```

副标题：

```text
可以用中文、英文，或者中英混合，说一句今天的心情。这里不是考试，只是帮你把真实想法变成一点点英文。
```

输入 placeholder：

```text
今天发生了什么？你可以随便写一点……
```

按钮：

```text
帮我变成一句英文
```

### 10.3 AI 回应格式

无论 AI 是否接入，输出必须包含：

```text
1. 情绪回应
2. 更自然的英文表达
3. 一个关键词或短语
4. 是否保存到 My Voice
```

示例：

用户输入：

```text
今天我很烦，不想学习
```

输出：

```text
今天不想学习也没关系。我们只写一句很小的英文。

You can say:
I feel tired today, and I need a little rest.

小表达：
a little rest = 一点休息
```

安全要求：

```text
不得进行心理诊断。
不得提供医疗建议。
如果用户表达严重自伤风险，应提示寻求可信成年人或专业帮助。
```

---

## 11. My Little Voice `/my-voice`

### 11.1 数据类型

新增：

```text
/src/types/my-voice.ts
```

```ts
export type MyVoiceItem = {
  id: string;
  userId: string;

  source:
    | "today_path"
    | "tree_hole"
    | "reading_response"
    | "guided_writing"
    | "independent_writing";

  originalInput?: string;
  polishedSentence: string;
  translationZh?: string;

  tags: string[];
  themeCategory?: string;

  createdAt: string;
};
```

### 11.2 页面功能

显示用户保存过的英文表达。

分组：

```text
我的心情
我的朋友
我的家
我看见的世界
我的观点
我的写作句子
```

页面不能叫“错题本”。

标题：

```text
我的英文声音
```

副标题：

```text
这里保存的是你真正说过、写过、想表达过的英文。
```

---

## 12. Read With Me `/read-with-me`

### 12.1 页面逻辑

伴读页面可以使用 TodayPath 的 readingSeed，也可以用户重新生成一篇。

sense_space 模式：

```text
不显示阅读理解题。
只显示陪读问题。
```

exam_expression 模式：

```text
显示基础理解问题。
可选进入 Exam Lens。
```

### 12.2 组件

```text
/src/components/reading/ReadWithMePage.tsx
/src/components/reading/ReadingPassageCard.tsx
/src/components/reading/GuidingQuestionCard.tsx
/src/components/reading/KeywordHelper.tsx
/src/components/reading/ReadingResponseInput.tsx
```

---

## 13. Theme Journey `/theme-journey`

仅 exam_expression 模式默认使用。

页面结构：

```text
1. 本月主题
2. 今日主题
3. 主题词汇
4. 关键句型
5. 语篇阅读
6. 写作迁移
7. 可选 Exam Lens
```

不要显示完整试卷。

---

## 14. Exam Lens `/exam-lens`

### 14.1 定位

Exam Lens 不是刷题页。

页面文案：

```text
出题组镜头
```

副标题：

```text
看看今天这段材料如果出现在考试里，命题人可能会怎么考。
```

### 14.2 页面内容

显示：

```text
1. 原材料摘要
2. 考查能力
3. 一道题
4. 选项
5. 答案
6. 命题意图
7. 干扰项分析
8. 写作迁移
```

### 14.3 数据结构

使用 TodayPath.optionalExamLens。

后续可扩展为数组。

---

## 15. Growth `/growth`

### 15.1 定位

Growth 不是传统分数报告。

标题：

```text
我的英语成长
```

显示：

```text
1. 最近保存的英文句子
2. 最近常遇到的词
3. 最近表达过的主题
4. 正在变好的能力
5. 下一步建议
```

高中模式可以额外显示：

```text
高考相关能力趋势
```

但不能默认只显示分数。

---

## 16. AI Prompt 工程

新增：

```text
/src/lib/ai/prompts.ts
```

### 16.1 Sense Space Today Path Prompt

```ts
export const senseSpaceTodayPathPrompt = `
你是一个温和、有耐心的英语语言陪伴者。

请为小学到初中阶段的学习者生成一条今日英语路径。

目标：
- 轻松建立语感
- 从一个词开始
- 进入一句话
- 读一小段生活化英文
- 最后让学生写一句真实想法

禁止：
- 不要像考试
- 不要出现高考、试卷、刷题、错题、扣分
- 不要生成太长文章
- 不要使用过多语法术语

输出必须包含：
- greeting
- theme
- wordSeed
- sentenceSeed
- readingSeed
- expressionTask
- finalCanSay

要求：
- 英文自然
- 中文解释温和
- 主题贴近生活、校园、心情、自然或家庭
- 难度适合小学到初中
`;
```

### 16.2 Exam Expression Today Path Prompt

```ts
export const examExpressionTodayPathPrompt = `
你是一个高考英语表达教练和命题分析师。

请为高中到大学阶段学习者生成一条今日英语路径。

目标：
- 从主题词汇进入句子
- 从句子进入高考风格短阅读
- 从阅读迁移到表达和写作
- 可选提供一个“出题组镜头”

注意：
- 不要生成完整试卷
- 不要让用户感觉每天都在刷题
- 高考逻辑应该作为分析镜头，而不是压迫式测试

输出必须包含：
- greeting
- theme
- wordSeed
- sentenceSeed
- readingSeed
- expressionTask
- optionalExamLens
- finalCanSay

主题优先覆盖：
- 中国文化
- 西方文化理解
- 科技时事
- 哲学思辨
- 环境保护
- 青年成长
`;
```

---

## 17. AI Provider 抽象

新增：

```text
/src/lib/ai/provider.ts
```

```ts
export type LLMProvider = {
  generateText(prompt: string): Promise<string>;
  generateJSON<T>(prompt: string, schemaName: string): Promise<T>;
};

export async function getLLMProvider(): Promise<LLMProvider> {
  // Initial version can return mock provider.
  // Later can connect OpenAI / DeepSeek / Doubao / Kimi / Ollama.
}
```

必须提供 mock provider。

```text
/src/lib/ai/mockProvider.ts
```

mock provider 返回 fallback 数据，保证没有 API key 时项目仍然能运行。

---

## 18. UI 设计约束

### 18.1 sense_space

颜色：

```text
浅蓝
米白
浅绿
暖黄
低饱和
```

组件风格：

```text
圆角卡片
轻阴影
少量插画感
大留白
少分数
多鼓励
```

禁止：

```text
红色错误提示大面积出现
排名
倒计时
错题警告
```

### 18.2 exam_expression

颜色：

```text
深蓝
灰白
浅金
低饱和咖啡色
```

组件风格：

```text
清晰卡片
主题路径
能力提示
少量图表
专业但不压迫
```

---

## 19. 工程执行阶段

### Phase 1：基础结构

Codex 先执行：

```text
1. 新增 types
2. 新增 fallback 数据
3. 新增 learning store
4. 新增 localStorage 工具
5. 新增 / 路由模式选择
6. 新增 /today 页面
```

验收：

```text
无需 AI API，用户可以选择模式并进入 Today Path。
```

### Phase 2：核心页面

执行：

```text
1. /tree-hole
2. /my-voice
3. /read-with-me
4. /theme-journey
5. /exam-lens
6. /growth
```

验收：

```text
每个页面都有 fallback 数据和可点击交互。
```

### Phase 3：AI 接入准备

执行：

```text
1. provider interface
2. mock provider
3. prompts
4. schema validation
5. generateTodayPath 接口替换
```

验收：

```text
无 API key 时 fallback 可用；
有 API key 时可替换 provider。
```

### Phase 4：体验优化

执行：

```text
1. 根据 mode 调整 UI 文案
2. sense_space 隐藏考试标签
3. exam_expression 显示 Exam Lens
4. My Voice 可保存表达
5. Growth 可读取保存内容
```

验收：

```text
两个模式前端体验明显不同。
```

---

## 20. 验收清单

Codex 完成后必须满足：

```text
[ ] 首页不是传统功能目录
[ ] 首页可以选择两个学习模式
[ ] /today 是主学习入口
[ ] Today Path 包含 word、sentence、reading、expression
[ ] sense_space 不显示高考、试卷、刷题语气
[ ] exam_expression 可选显示 Exam Lens
[ ] Tree Hole 可以输入心情并生成英文表达
[ ] My Voice 可以保存用户表达
[ ] Read With Me 不默认变成阅读理解题
[ ] Growth 展示成长而不是只展示分数
[ ] 所有页面有 fallback 数据
[ ] 没有 AI API key 时网站仍可使用
[ ] 新增类型文件清晰
[ ] 不破坏现有部署
[ ] Vercel build 通过
```

---

## 21. Codex 总执行指令

将以下内容作为 Codex 开始任务时的总指令：

```text
请严格按照 /docs/ENGLISH_APP_ENGINEERING_UPGRADE_SPEC.md 执行 English Grammar Sense 项目升级。

不要重新设计产品方向。
不要把系统改成题库。
不要把系统改成传统课件。
不要删除已有功能。
不要自由新增未定义模块。

本次任务优先完成 Phase 1：
1. 新增类型文件
2. 新增 fallback TodayPath 数据
3. 新增 learning store
4. 新增 localStorage 工具
5. 改造首页为双模式入口
6. 新增 /today 今日语言路径页面

所有实现必须保证：
- 无 AI API key 时可运行
- Vercel build 通过
- TypeScript 无明显类型错误
- 页面有 loading / empty / error 状态
- sense_space 和 exam_expression 两种模式前端文案明显不同
```

---

## 22. 最终产品判断

这个网页升级后不应该像：

```text
课件
题库
刷题网站
语法大全
```

而应该像：

```text
一个每天都能进入的英语语言空间
```

其核心体验是：

```text
系统主动带路
用户每天完成一条小路径
从一个词开始
读懂一点世界
说出一句自己
慢慢走向阅读、写作和考试能力
```
