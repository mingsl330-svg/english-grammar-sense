import type { GrammarPointEntry, TopicClusterEntry, WordBankEntry } from "../types/gaokao";

export const TopicClusterDB: TopicClusterEntry[] = [
  {
    id: "chinese_culture",
    label: "中国文化",
    sourceCategory: "chinese_traditional_culture",
    monthlyUse: "把传统活动、非遗、节气和现代校园表达连接起来。",
    readingAngles: ["cultural meaning", "shared memory", "modern value"],
    writingAngles: ["introduce a tradition", "explain cultural value", "invite a foreign friend"]
  },
  {
    id: "western_culture",
    label: "西方文化",
    sourceCategory: "classic_english_literature",
    monthlyUse: "对比节日、公共礼仪、志愿文化和故事传统。",
    readingAngles: ["custom comparison", "character choice", "public manners"],
    writingAngles: ["compare two customs", "describe a visit", "write a cultural note"]
  },
  {
    id: "technology_current",
    label: "科技时事",
    sourceCategory: "recent_hot_topic",
    monthlyUse: "围绕 AI、数字学习、航天、信息判断训练观点表达。",
    readingAngles: ["benefit and risk", "human judgement", "social change"],
    writingAngles: ["balanced opinion", "tool use rule", "technology and responsibility"]
  },
  {
    id: "philosophical_thinking",
    label: "哲学思辨",
    sourceCategory: "inspirational_speech",
    monthlyUse: "训练原因、让步、选择、成长和价值判断。",
    readingAngles: ["cause behind action", "choice and consequence", "abstract meaning"],
    writingAngles: ["state a view", "support with experience", "revise a shallow opinion"]
  },
  {
    id: "campus_life",
    label: "校园生活",
    sourceCategory: "daily_life",
    monthlyUse: "从真实任务、活动、求助、社团和学习习惯进入语言使用。",
    readingAngles: ["speaker purpose", "problem solving", "school routine"],
    writingAngles: ["notice", "email", "activity proposal", "learning reflection"]
  },
  {
    id: "social_responsibility",
    label: "社会责任",
    sourceCategory: "gaokao_focus",
    monthlyUse: "志愿服务、公共规则、团队协作和个人责任。",
    readingAngles: ["responsibility", "team role", "public benefit"],
    writingAngles: ["volunteer application", "proposal", "speech for action"]
  },
  {
    id: "eco_environment",
    label: "生态环保",
    sourceCategory: "recent_hot_topic",
    monthlyUse: "低碳生活、校园环保、极端天气与行动方案。",
    readingAngles: ["change and response", "small actions", "cause and result"],
    writingAngles: ["environmental proposal", "habit change", "campus plan"]
  },
  {
    id: "youth_growth",
    label: "青年成长",
    sourceCategory: "inspirational_speech",
    monthlyUse: "自律、挫折、长期练习、合作与表达成长。",
    readingAngles: ["growth mindset", "practice and progress", "confidence"],
    writingAngles: ["personal story", "advice letter", "growth speech"]
  }
];

export const GrammarPointDB: GrammarPointEntry[] = [
  {
    id: "because-motivation",
    name: "because 原因与动机",
    examFunction: "说明行动背后的真实原因，而不是机械翻译原因状语。",
    sentenceUse: "connect an action with personal motivation",
    readingUse: "find why the writer or character acts",
    writingUse: "explain why a proposal, choice, or habit matters",
    linkedTopicIds: ["campus_life", "youth_growth", "technology_current"],
    examples: ["I joined the project because I wanted to solve a real school problem."]
  },
  {
    id: "although-balance",
    name: "although / while 平衡观点",
    examFunction: "考查学生是否能同时看见利弊、转折和限制条件。",
    sentenceUse: "admit one side before giving the real position",
    readingUse: "identify contrast and attitude",
    writingUse: "write a balanced opinion paragraph",
    linkedTopicIds: ["technology_current", "eco_environment", "western_culture"],
    examples: ["Although AI tools are useful, students still need to make their own judgement."]
  },
  {
    id: "relative-detail",
    name: "who / which 补充说明",
    examFunction: "把名词后面的限定或补充信息读清楚。",
    sentenceUse: "add useful detail to a person, group, action, or result",
    readingUse: "separate core meaning from added detail",
    writingUse: "upgrade a simple sentence with precise information",
    linkedTopicIds: ["chinese_culture", "social_responsibility", "campus_life"],
    examples: ["Students who take small actions can create visible change on campus."]
  },
  {
    id: "as-background-change",
    name: "as 背景变化",
    examFunction: "读懂社会背景变化如何引出行动需求。",
    sentenceUse: "show a changing background before the main response",
    readingUse: "connect social change with practical response",
    writingUse: "introduce a current issue naturally",
    linkedTopicIds: ["technology_current", "eco_environment", "philosophical_thinking"],
    examples: ["As digital tools become common, learners need stronger information judgement."]
  },
  {
    id: "nonfinite-evidence",
    name: "非谓语作原因/背景",
    examFunction: "识别经历、条件或背景如何支撑主句判断。",
    sentenceUse: "place experience before a claim",
    readingUse: "understand compressed information in long sentences",
    writingUse: "make application writing more concise and mature",
    linkedTopicIds: ["social_responsibility", "youth_growth", "western_culture"],
    examples: ["Having served as a volunteer before, I can communicate with visitors politely."]
  }
];

export const WordBank: WordBankEntry[] = [
  {
    word: "heritage",
    topicIds: ["chinese_culture", "western_culture"],
    collocations: ["cultural heritage", "protect heritage", "shared heritage"],
    examContext: "reading passages about culture, museums, festivals, and identity",
    writingTransfer: "This activity helps students understand the value of cultural heritage.",
    grammarLinks: ["relative-detail"]
  },
  {
    word: "responsibility",
    topicIds: ["social_responsibility", "campus_life"],
    collocations: ["take responsibility", "sense of responsibility", "social responsibility"],
    examContext: "volunteer service, teamwork, public rules",
    writingTransfer: "The activity can strengthen our sense of responsibility.",
    grammarLinks: ["because-motivation", "relative-detail"]
  },
  {
    word: "judgement",
    topicIds: ["technology_current", "philosophical_thinking"],
    collocations: ["make a judgement", "independent judgement", "sound judgement"],
    examContext: "AI, media information, personal choice",
    writingTransfer: "Students should keep independent judgement when using digital tools.",
    grammarLinks: ["although-balance", "as-background-change"]
  },
  {
    word: "sustainable",
    topicIds: ["eco_environment", "social_responsibility"],
    collocations: ["sustainable lifestyle", "sustainable development", "sustainable choice"],
    examContext: "environmental protection and long-term habits",
    writingTransfer: "Small daily choices can support a more sustainable lifestyle.",
    grammarLinks: ["as-background-change", "relative-detail"]
  },
  {
    word: "resilience",
    topicIds: ["youth_growth", "philosophical_thinking"],
    collocations: ["build resilience", "show resilience", "emotional resilience"],
    examContext: "growth stories, speeches, setbacks",
    writingTransfer: "This experience helped me build resilience and confidence.",
    grammarLinks: ["because-motivation", "nonfinite-evidence"]
  },
  {
    word: "cooperation",
    topicIds: ["campus_life", "social_responsibility", "chinese_culture"],
    collocations: ["team cooperation", "promote cooperation", "learn cooperation"],
    examContext: "team activities, volunteering, cultural events",
    writingTransfer: "Dragon boat racing shows the importance of cooperation.",
    grammarLinks: ["relative-detail"]
  }
];
