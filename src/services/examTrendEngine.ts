import { GrammarPointDB, TopicClusterDB, WordBank } from "../data/gaokaoDatabases";
import type { GaokaoTopicId, MonthlyExamTrend } from "../types/gaokao";
import type { ProgressState } from "../types/learning";

const monthlyTopicCycle: GaokaoTopicId[][] = [
  ["chinese_culture", "campus_life", "youth_growth"],
  ["technology_current", "philosophical_thinking", "social_responsibility"],
  ["eco_environment", "technology_current", "campus_life"],
  ["western_culture", "chinese_culture", "philosophical_thinking"]
];

const monthKeyFor = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

export const ExamTrendEngine = {
  getMonthlyTrend(date = new Date(), progress?: ProgressState): MonthlyExamTrend {
    const monthIndex = date.getMonth();
    const baseTopics = monthlyTopicCycle[monthIndex % monthlyTopicCycle.length];
    const weakAreas = progress?.longTermProgress.weakAreas.join(" ") ?? "";
    const topicIds = weakAreas.includes("文化")
      ? Array.from(new Set<GaokaoTopicId>(["chinese_culture", ...baseTopics]))
      : baseTopics;
    const topicFocus = topicIds
      .map((id) => TopicClusterDB.find((topic) => topic.id === id))
      .filter((topic): topic is NonNullable<typeof topic> => Boolean(topic))
      .slice(0, 4);
    const grammarFocus = GrammarPointDB.filter((grammar) =>
      grammar.linkedTopicIds.some((id) => topicIds.includes(id))
    ).slice(0, 4);
    const wordFocus = WordBank.filter((word) => word.topicIds.some((id) => topicIds.includes(id))).slice(0, 8);
    const monthKey = monthKeyFor(date);

    return {
      monthKey,
      title: `${monthKey} 高考英语考向模拟`,
      topicFocus,
      grammarFocus,
      wordFocus,
      questionTypes: [
        "阅读理解：主旨、细节、推理、态度、词义猜测",
        "七选五：语篇衔接、代词指代、段落功能",
        "语法填空：非谓语、从句、时态语态、词形转换",
        "应用文/读后续写：审题、要点覆盖、句式升级、自然表达"
      ],
      writingDirections: topicFocus.flatMap((topic) => topic.writingAngles).slice(0, 6),
      examinerNotes: [
        "先从主题词和搭配进入语境，再进入句式功能。",
        "阅读题不只问答案，要追问命题人为什么设置这个干扰项。",
        "写作训练必须把阅读里的主题词、句式和观点迁移出来。",
        "本地模板只作为 fallback；接入后端实时信息后由同一接口替换内容源。"
      ]
    };
  }
};
