import type { LearningScenario } from "../types/learning";

type InteractionStep = LearningScenario["interactionSteps"][number];

interface HotTopicTemplate {
  id: string;
  title: string;
  realWorldContext: string;
  languageInput: string;
  targetExpressions: string[];
  hiddenGrammarPoints: string[];
  vocabularyFocus: string[];
  expressionGoal: string;
  transferContext: string;
  question: string;
  correctOption: string;
  options: string[];
}

const hash = (value: string) =>
  [...value].reduce((total, char) => (total * 31 + char.charCodeAt(0)) % 9973, 23);

const stableShuffle = (items: string[], seed: string) =>
  [...items]
    .map((item, index) => ({ item, rank: (hash(`${seed}-${item}`) + index * 41) % 9973 }))
    .sort((a, b) => a.rank - b.rank)
    .map(({ item }) => item);

const isoWeekKey = (date = new Date()) => {
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const day = Math.floor((date.getTime() - start.getTime()) / 86400000) + 1;
  const week = Math.ceil((day + start.getUTCDay()) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
};

const templates: HotTopicTemplate[] = [
  {
    id: "ai-tools-independent-thinking",
    title: "热点话题：AI 学习工具",
    realWorldContext: "英语课讨论 AI tools 是否会帮助学生学习，还是让学生过度依赖。",
    languageInput:
      "Although AI tools can provide quick explanations, students still need to think independently before accepting an answer.",
    targetExpressions: ["Although ..., students still need to ...", "before doing ..."],
    hiddenGrammarPoints: ["although 让步状语从句", "need to do", "before doing"],
    vocabularyFocus: ["provide", "explanations", "independently", "accepting", "answer"],
    expressionGoal: "Learn to discuss a current technology topic with balance and self-control.",
    transferContext: "Short-video learning: many resources are available, but students still need to judge quality.",
    question: "Choose the exact position of this sentence.",
    correctOption: "AI can help, but students must still think for themselves",
    options: [
      "AI can help, but students must still think for themselves",
      "AI tools should replace students' own thinking",
      "Students should avoid every digital learning tool"
    ]
  },
  {
    id: "short-video-focus",
    title: "热点话题：短视频与注意力",
    realWorldContext: "班会讨论 short videos 对学习注意力的影响。",
    languageInput:
      "While short videos can make information easier to notice, they may also train students to lose patience with longer texts.",
    targetExpressions: ["While ..., they may also ...", "lose patience with ..."],
    hiddenGrammarPoints: ["while 让步对比", "may also", "to do 不定式"],
    vocabularyFocus: ["short", "notice", "train", "patience", "texts"],
    expressionGoal: "Learn to describe both the attraction and the hidden cost of a digital habit.",
    transferContext: "Online games: they are relaxing, but may affect time management.",
    question: "Choose the hidden concern in this sentence.",
    correctOption: "Short videos may weaken patience for longer reading",
    options: [
      "Short videos may weaken patience for longer reading",
      "Short videos always improve deep reading",
      "Longer texts have no connection with attention"
    ]
  },
  {
    id: "extreme-weather-campus",
    title: "热点话题：极端天气与校园生活",
    realWorldContext: "新闻中频繁出现 extreme weather，学生讨论学校如何应对天气变化。",
    languageInput:
      "As extreme weather becomes more common, schools need clearer plans so that students can stay safe during sudden changes.",
    targetExpressions: ["As ... becomes ..., ... need ... so that ..."],
    hiddenGrammarPoints: ["as 引导背景变化", "so that 目的状语从句", "比较级 more common"],
    vocabularyFocus: ["extreme", "weather", "common", "plans", "safe"],
    expressionGoal: "Learn to connect a social change with a practical response.",
    transferContext: "Public health: as risks change, schools need clearer routines.",
    question: "Choose the relation between the two parts of the sentence.",
    correctOption: "A changing situation creates a need for a practical plan",
    options: [
      "A changing situation creates a need for a practical plan",
      "A school plan causes extreme weather to happen",
      "Student safety is mentioned without any reason"
    ]
  },
  {
    id: "green-lifestyle-students",
    title: "热点话题：低碳生活与学生选择",
    realWorldContext: "英语课堂讨论学生是否能通过日常选择参与环保。",
    languageInput:
      "If more students choose reusable bottles and public transport, small daily decisions can gradually reduce waste on campus.",
    targetExpressions: ["If ..., ... can gradually ...", "daily decisions"],
    hiddenGrammarPoints: ["if 条件句", "情态动词 can", "gradually 副词"],
    vocabularyFocus: ["reusable", "transport", "decisions", "gradually", "waste"],
    expressionGoal: "Learn to express how small actions can create a larger result.",
    transferContext: "Healthy lifestyle: small habits can improve long-term energy.",
    question: "Choose what this sentence emphasizes.",
    correctOption: "Small student choices can lead to a larger environmental result",
    options: [
      "Small student choices can lead to a larger environmental result",
      "Only large national policies can reduce any waste",
      "Reusable bottles are mentioned without a result"
    ]
  },
  {
    id: "space-news-curiosity",
    title: "热点话题：航天新闻与好奇心",
    realWorldContext: "学生读到新的 space exploration 新闻，讨论科学新闻为什么能激发学习兴趣。",
    languageInput:
      "When students read about space exploration, they often become curious about science because the news connects knowledge with real discovery.",
    targetExpressions: ["When ..., they often ... because ...", "connect ... with ..."],
    hiddenGrammarPoints: ["when 时间状语从句", "because 原因状语从句", "connect A with B"],
    vocabularyFocus: ["space", "exploration", "curious", "connects", "discovery"],
    expressionGoal: "Learn to explain why a news topic can motivate learning.",
    transferContext: "Medical news: real discoveries can make biology feel meaningful.",
    question: "Choose why the news can motivate students.",
    correctOption: "It connects school knowledge with real discovery",
    options: [
      "It connects school knowledge with real discovery",
      "It makes science less connected to real life",
      "It only gives names without any learning value"
    ]
  }
];

const buildStep = (template: HotTopicTemplate, seed: string): InteractionStep => {
  const options = stableShuffle(template.options, seed);
  return {
    id: `${template.id}-dynamic-check`,
    type: "guided_response",
    prompt: template.question,
    userInputType: "choice",
    aiFeedbackMode: "after_submit",
    successCriteria: [template.correctOption],
    choices: options,
    optionTags: options,
    correctOption: template.correctOption,
    optionExplanations: Object.fromEntries(
      options.map((option) => [
        option,
        option === template.correctOption
          ? "This option matches the current topic and the sentence logic."
          : "This option is related to the topic, but it misses the sentence's exact logic."
      ])
    ),
    teacherHint: "This topic rotates. Focus on the sentence logic, not only the topic label."
  };
};

export function buildHotTopicScenarios(dayNumber: number, now = new Date()): LearningScenario[] {
  const refreshKey = isoWeekKey(now);
  const start = (dayNumber + hash(refreshKey)) % templates.length;
  const selected = [templates[start], templates[(start + 2) % templates.length]];

  return selected.map((template, index) => ({
    id: `${template.id}-${refreshKey}-day-${dayNumber}-${index}`,
    type: "social_issue",
    sourceCategory: "recent_hot_topic",
    sourceNote: `Dynamic hot-topic pool · refresh key ${refreshKey} · Day ${dayNumber}. GPT/news provider can replace this local template.`,
    title: template.title,
    realWorldContext: template.realWorldContext,
    studentRole: "Reader and discussion participant",
    taskGoal: "Understand a current issue through one clear English sentence",
    languageInput: template.languageInput,
    targetExpressions: template.targetExpressions,
    hiddenGrammarPoints: template.hiddenGrammarPoints,
    vocabularyFocus: template.vocabularyFocus,
    expressionGoal: template.expressionGoal,
    transferContext: template.transferContext,
    interactionSteps: [buildStep(template, `${refreshKey}-${dayNumber}-${index}`)]
  }));
}
