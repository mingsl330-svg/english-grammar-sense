import { buildHotTopicScenarios } from "./hotTopicScenarioProvider";
import { getJuniorChallengeScenarioPool, getJuniorDailyScenarioPool } from "./juniorScenarioPool";
import { learningScenarios } from "./mockScenarios";
import type { LearningScenario, LearningVersion } from "../types/learning";

type InteractionStep = LearningScenario["interactionSteps"][number];

const hash = (value: string) =>
  [...value].reduce((total, char) => (total * 31 + char.charCodeAt(0)) % 9973, 17);

const stableShuffle = (items: string[], seed: string) =>
  [...items]
    .map((item, index) => ({ item, rank: (hash(`${seed}-${item}`) + index * 37) % 9973 }))
    .sort((a, b) => a.rank - b.rank)
    .map(({ item }) => item);

const optionExplanations = (options: string[], correctOption: string) =>
  Object.fromEntries(
    options.map((option) => [
      option,
      option === correctOption
        ? "This option matches the scene goal and expresses the meaning naturally."
        : "This option is close enough to consider, but it misses the exact purpose of this scene."
    ])
  );

const mkStep = (id: string, prompt: string, criteria: string[], optionTags?: string[], correctOption?: string) => {
  const rawOptions = optionTags ?? criteria;
  const correct = correctOption ?? rawOptions[0];
  const options = stableShuffle(rawOptions, `${id}-${prompt}`);
  return {
    id,
    type: "guided_response" as const,
    prompt,
    userInputType: "choice" as const,
    aiFeedbackMode: "after_submit" as const,
    successCriteria: criteria,
    choices: options,
    optionTags: options,
    correctOption: correct,
    optionExplanations: optionExplanations(options, correct),
    teacherHint: "Read the scene goal first, then choose the option that best completes the real communication task."
  };
};

const dailyFirstStepOverrides: Record<
  string,
  {
    prompt: string;
    options: string[];
    correctOption: string;
  }
> = {
  "club-interview-because": {
    prompt: "Choose the clearest communication purpose in this interview answer.",
    options: [
      "Explain a personal goal and the reason behind it",
      "Mention a future plan without explaining today's motivation",
      "Talk about English in general without answering the interview question"
    ],
    correctOption: "Explain a personal goal and the reason behind it"
  },
  "speech-smartphones-although": {
    prompt: "Choose the exact thinking pattern of this opinion sentence.",
    options: [
      "Admit a benefit, then point out a possible problem",
      "Give two benefits and strongly support smartphones",
      "Give one problem without admitting any benefit"
    ],
    correctOption: "Admit a benefit, then point out a possible problem"
  },
  "news-teen-sleep-who": {
    prompt: "Choose what this news sentence is mainly doing.",
    options: [
      "Report a study finding about a specific group of teenagers",
      "Tell a personal story about one tired teenager",
      "Give advice about how to organize a school day"
    ],
    correctOption: "Report a study finding about a specific group of teenagers"
  },
  "literary-rain-watching": {
    prompt: "Choose the reading focus for this literary sentence.",
    options: [
      "Notice the main position and the accompanying action in the scene",
      "Compare two different opinions about school technology",
      "Find the cause-and-result logic in a science report"
    ],
    correctOption: "Notice the main position and the accompanying action in the scene"
  }
};

const prepareStep = (step: InteractionStep, seed: string): InteractionStep => {
  const rawOptions = step.optionTags ?? step.choices ?? step.successCriteria;
  const correct = step.correctOption ?? rawOptions[0];
  const options = stableShuffle(rawOptions, seed);
  return {
    ...step,
    choices: options,
    optionTags: options,
    correctOption: correct,
    optionExplanations: {
      ...optionExplanations(options, correct),
      ...step.optionExplanations
    }
  };
};

const prepareDailyScenario = (scenario: LearningScenario): LearningScenario => {
  const override = dailyFirstStepOverrides[scenario.id];
  if (!override) {
    return {
      ...scenario,
      interactionSteps: scenario.interactionSteps.map((step) => prepareStep(step, `${scenario.id}-${step.id}`))
    };
  }

  const firstStep = scenario.interactionSteps[0];
  const options = stableShuffle(override.options, `${scenario.id}-daily-first-step`);
  return {
    ...scenario,
    interactionSteps: [
      {
        ...firstStep,
        id: `${firstStep.id}-daily-focus`,
        type: "guided_response",
        prompt: override.prompt,
        aiFeedbackMode: "after_submit",
        successCriteria: [override.correctOption],
        choices: options,
        optionTags: options,
        correctOption: override.correctOption,
        optionExplanations: optionExplanations(options, override.correctOption),
        teacherHint: "All options are related to the scene. Choose the one that best matches this sentence's real job."
      },
      ...scenario.interactionSteps.slice(1).map((step) => prepareStep(step, `${scenario.id}-${step.id}`))
    ]
  };
};

const staticDailyScenarioPool: LearningScenario[] = [
  ...learningScenarios.map(prepareDailyScenario),
  {
    id: "email-delay-because",
    type: "email_writing",
    title: "给老师解释迟交作业",
    realWorldContext: "你要给英语老师写一封简短邮件，解释为什么作业晚交。",
    studentRole: "高中学生，需要礼貌解释原因",
    taskGoal: "表达歉意 + 说明原因 + 给出补救行动",
    languageInput: "I am sorry that I submitted my homework late because I had to take care of my younger sister.",
    targetExpressions: ["I am sorry that ... because ...", "I had to ..."],
    hiddenGrammarPoints: ["because 原因状语从句", "had to 表示不得不", "宾语从句"],
    vocabularyFocus: ["submitted", "homework", "late", "because", "younger"],
    expressionGoal: "学会礼貌解释原因",
    transferContext: "换到请假场景：解释你为什么不能参加活动。",
    interactionSteps: [
      mkStep("reply", "Choose the best response goal for this email.", ["包含 because", "原因清楚", "语气礼貌"], [
        "Apologize and explain the reason",
        "Explain the delay but forget to say sorry",
        "Say sorry without giving the reason"
      ])
    ]
  },
  {
    id: "classroom-opinion-although",
    type: "classroom_discussion",
    title: "课堂讨论：线上学习",
    realWorldContext: "英语课上正在讨论 online learning 的优点和问题。",
    studentRole: "讨论参与者，需要表达平衡观点",
    taskGoal: "承认优点，同时指出问题",
    languageInput: "Although online learning offers more flexibility, it also requires students to manage their time carefully.",
    targetExpressions: ["Although ..., it also ...", "requires sb to do"],
    hiddenGrammarPoints: ["although 让步", "require sb to do", "副词 carefully"],
    vocabularyFocus: ["online", "offers", "flexibility", "requires", "manage"],
    expressionGoal: "学会表达平衡观点",
    transferContext: "换到 AI 工具场景：虽然方便，但需要自律。",
    interactionSteps: [
      mkStep("balance", "Choose the meaning this sentence expresses.", ["好处", "要求", "平衡观点"], [
        "It admits a benefit and adds a requirement",
        "It gives the benefit but ignores the requirement",
        "It gives the requirement but misses the benefit"
      ])
    ]
  },
  {
    id: "news-environment-who",
    type: "news_reading",
    title: "环保新闻短句",
    realWorldContext: "你正在阅读一条关于学生环保行动的新闻。",
    studentRole: "新闻读者，需要抓住行动者和行动结果",
    taskGoal: "读懂 who 后面在补充说明哪些学生",
    languageInput: "Students who recycle paper regularly are more likely to develop a stronger sense of responsibility.",
    targetExpressions: ["Students who ... are more likely to ..."],
    hiddenGrammarPoints: ["who 定语从句", "be likely to", "比较结构"],
    vocabularyFocus: ["recycle", "regularly", "develop", "stronger", "responsibility"],
    expressionGoal: "学会补充说明一类人",
    transferContext: "换到运动健康场景：经常运动的学生更可能保持精力。",
    interactionSteps: [
      mkStep("who", "Choose what the who-part explains.", ["students", "more likely", "responsibility"], [
        "It describes which students are being discussed",
        "It describes the result those students may develop",
        "It describes the habit but not which noun it modifies"
      ])
    ]
  },
  {
    id: "speech-confidence-gradually",
    type: "speech",
    title: "一分钟学习经历演讲",
    realWorldContext: "你要分享自己如何慢慢变得更自信。",
    studentRole: "演讲者，需要描述一个逐渐变化的过程",
    taskGoal: "用 gradually 描述能力变化",
    languageInput: "Through daily practice, I gradually became more confident when speaking English in front of others.",
    targetExpressions: ["Through ..., I gradually became ...", "when doing ..."],
    hiddenGrammarPoints: ["介词短语作方式", "gradually 副词", "when 引导时间"],
    vocabularyFocus: ["through", "daily", "gradually", "confident", "others"],
    expressionGoal: "学会描述逐渐变化",
    transferContext: "换到阅读能力：通过每天阅读，我逐渐理解长句。",
    interactionSteps: [
      mkStep("gradual", "Choose the best idea for using gradually.", ["gradually", "变化", "学习"], [
        "A skill changes slowly over time",
        "A skill changes because of one sudden moment",
        "A person describes confidence but not the process of change"
      ])
    ]
  },
  {
    id: "application-volunteer",
    type: "application_letter",
    title: "志愿者申请",
    realWorldContext: "你正在写一封申请信，说明自己为什么适合志愿者工作。",
    studentRole: "申请者，需要说明优势和原因",
    taskGoal: "说明个人品质如何帮助完成任务",
    languageInput: "I believe my patience and communication skills will enable me to help visitors solve problems effectively.",
    targetExpressions: ["I believe ... will enable me to ...", "help sb do sth"],
    hiddenGrammarPoints: ["宾语从句", "enable sb to do", "help sb do"],
    vocabularyFocus: ["believe", "patience", "communication", "enable", "effectively"],
    expressionGoal: "学会说明能力和用途",
    transferContext: "换到社团申请：说明你的能力如何帮助团队。",
    interactionSteps: [
      mkStep("ability", "Choose what the sentence connects.", ["patience", "communication", "help visitors"], [
        "Personal qualities help solve visitors' problems",
        "Personal qualities are listed but not connected to a result",
        "Helping visitors is mentioned but the writer's qualities are missing"
      ])
    ]
  },
  {
    id: "science-reading-memory",
    type: "science_article",
    title: "科学短文：睡眠与记忆",
    realWorldContext: "你正在读一段关于睡眠如何影响记忆的科普文章。",
    studentRole: "读者，需要理解因果关系",
    taskGoal: "理解充足睡眠如何影响学习",
    languageInput: "Enough sleep allows the brain to organize new information, which makes learning more effective the next day.",
    targetExpressions: ["allows ... to ...", "which makes ..."],
    hiddenGrammarPoints: ["allow sb/sth to do", "which 补充说明结果", "比较级 more effective"],
    vocabularyFocus: ["allows", "brain", "organize", "information", "effective"],
    expressionGoal: "学会说明原因带来的结果",
    transferContext: "换到运动：规律运动让身体更健康。",
    interactionSteps: [
      mkStep("cause", "Choose the cause-and-result relation.", ["organize information", "learning", "effective"], [
        "Sleep helps the brain organize information",
        "The brain organizes information but the effect on learning is missing",
        "Learning is more effective but the cause is not explained"
      ])
    ]
  },
  {
    id: "hot-topic-ai-tools-self-control",
    type: "social_issue",
    sourceCategory: "recent_hot_topic",
    sourceNote: "Contemporary topic: AI learning tools and student independence",
    title: "热点话题：AI 学习工具",
    realWorldContext: "英语课讨论 AI tools 是否会帮助学生学习，还是让学生过度依赖。",
    studentRole: "讨论者，需要表达利弊并提出自律要求",
    taskGoal: "用 although 表达技术有帮助，但需要自我控制",
    languageInput: "Although AI tools can provide quick explanations, students still need to think independently before accepting an answer.",
    targetExpressions: ["Although ..., students still need to ...", "before doing ..."],
    hiddenGrammarPoints: ["although 让步状语从句", "need to do", "before doing"],
    vocabularyFocus: ["provide", "explanations", "independently", "accepting", "answer"],
    expressionGoal: "学会讨论热点技术时表达平衡判断",
    transferContext: "换到短视频学习：虽然资源很多，但学生仍要判断信息质量。",
    interactionSteps: [
      mkStep("ai-balance", "Choose the exact position of this sentence.", ["balanced view", "independent thinking", "technology use"], [
        "AI can help, but students must still think for themselves",
        "AI tools should replace students' own thinking",
        "Students should avoid every digital learning tool"
      ])
    ]
  },
  {
    id: "classic-movie-team-encouragement",
    type: "speech",
    sourceCategory: "classic_movie_scene",
    sourceNote: "Classic movie-style team moment, rewritten as original learning material",
    title: "经典电影桥段：团队低谷时的鼓励",
    realWorldContext: "一支队伍在比赛前失去信心，队长需要用一句话把大家拉回目标。",
    studentRole: "队长，需要鼓励同伴但不空喊口号",
    taskGoal: "用 even when 表达困难中仍然坚持",
    languageInput: "Even when the result seems uncertain, a team becomes stronger if every member keeps doing his or her part.",
    targetExpressions: ["Even when ..., ...", "if every member ..."],
    hiddenGrammarPoints: ["even when 让步时间状语", "if 条件句", "比较级 stronger"],
    vocabularyFocus: ["result", "uncertain", "team", "member", "stronger"],
    expressionGoal: "学会在鼓励场景里把困难和行动连接起来",
    transferContext: "换到学习小组：考试前不确定，但每个人继续完成自己的任务。",
    interactionSteps: [
      mkStep("movie-team", "Choose what makes this encouragement natural.", ["difficulty", "team action", "condition"], [
        "It admits uncertainty and gives a concrete team action",
        "It promises success without any action",
        "It only describes one person's feeling"
      ])
    ]
  },
  {
    id: "inspirational-speech-small-steps",
    type: "speech",
    sourceCategory: "inspirational_speech",
    sourceNote: "Graduation-speech style, original wording",
    title: "励志演讲：小步骤带来改变",
    realWorldContext: "毕业演讲中，演讲者提醒学生不要只等巨大改变。",
    studentRole: "听众，需要理解观点和行动建议",
    taskGoal: "用 not because ..., but because ... 表达真正原因",
    languageInput: "People make progress not because they never fail, but because they learn something useful each time they try again.",
    targetExpressions: ["not because ..., but because ...", "each time ..."],
    hiddenGrammarPoints: ["not because ... but because ...", "时间状语从句", "宾语 something useful"],
    vocabularyFocus: ["progress", "fail", "useful", "each", "again"],
    expressionGoal: "学会表达真正的成功原因",
    transferContext: "换到英语学习：进步不是因为不犯错，而是因为每次改正。",
    interactionSteps: [
      mkStep("speech-cause", "Choose the real reason this sentence gives for progress.", ["contrast reason", "failure learning", "trying again"], [
        "Progress comes from learning after failure",
        "Progress comes from never making mistakes",
        "Progress comes from avoiding every difficult task"
      ])
    ]
  },
  {
    id: "culture-dragon-boat-teamwork",
    type: "social_issue",
    sourceCategory: "chinese_traditional_culture",
    sourceNote: "Chinese traditional culture: Dragon Boat Festival",
    title: "中国传统文化：端午与团队协作",
    realWorldContext: "你向外国同学介绍端午节龙舟活动，不只是介绍食物，还要说明文化意义。",
    studentRole: "文化介绍者，需要说明传统活动背后的精神",
    taskGoal: "用 which 引导补充说明文化意义",
    languageInput: "During the Dragon Boat Festival, people race dragon boats together, which shows the value of teamwork and shared memory.",
    targetExpressions: ["During ..., people ...", "which shows ..."],
    hiddenGrammarPoints: ["during 介词短语", "which 非限制性补充说明", "抽象名词 value"],
    vocabularyFocus: ["festival", "race", "together", "value", "memory"],
    expressionGoal: "学会介绍中国文化时从活动说到意义",
    transferContext: "换到春节：人们团聚，这体现家庭联系。",
    interactionSteps: [
      mkStep("culture-meaning", "Choose what the which-clause adds.", ["cultural meaning", "activity", "teamwork"], [
        "It explains the cultural meaning behind the activity",
        "It only repeats the name of the festival",
        "It changes the sentence into a travel plan"
      ])
    ]
  },
  {
    id: "daily-life-return-item",
    type: "daily_conversation",
    sourceCategory: "daily_life",
    sourceNote: "Common life scenario: returning or exchanging an item",
    title: "生活场景：退换商品",
    realWorldContext: "你买到的耳机有问题，需要礼貌说明问题并提出请求。",
    studentRole: "顾客，需要清楚说明问题而不是抱怨",
    taskGoal: "用 because + would like to 礼貌提出请求",
    languageInput: "I would like to return these earphones because the left side stopped working after only two days.",
    targetExpressions: ["I would like to ... because ...", "stopped working"],
    hiddenGrammarPoints: ["would like to 礼貌请求", "because 原因状语从句", "过去式 stopped"],
    vocabularyFocus: ["return", "earphones", "left", "stopped", "working"],
    expressionGoal: "学会在真实生活中礼貌说明问题和请求",
    transferContext: "换到餐厅场景：说明点错菜并请求更换。",
    interactionSteps: [
      mkStep("return-request", "Choose the communication goal of this sentence.", ["polite request", "clear reason", "product problem"], [
        "Politely ask for a return and explain the product problem",
        "Describe the product but make no request",
        "Complain strongly without giving a clear reason"
      ])
    ]
  },
  {
    id: "gaokao-focus-volunteer-application",
    type: "application_letter",
    sourceCategory: "gaokao_focus",
    sourceNote: "Gaokao writing focus: application and personal strengths",
    title: "高考重点：志愿者申请理由",
    realWorldContext: "高考常见应用文：申请成为国际交流活动志愿者。",
    studentRole: "申请者，需要说明能力、经历和适合原因",
    taskGoal: "用 having done 表达已有经历带来的优势",
    languageInput: "Having helped at a school event before, I am confident that I can communicate with visitors politely and effectively.",
    targetExpressions: ["Having done ..., I am confident that ...", "communicate with ..."],
    hiddenGrammarPoints: ["现在分词完成式作原因状语", "宾语从句", "副词 politely/effectively"],
    vocabularyFocus: ["having", "event", "confident", "communicate", "effectively"],
    expressionGoal: "学会在申请信里用经历支撑能力",
    transferContext: "换到社团申请：曾组织活动，因此能帮助团队。",
    interactionSteps: [
      mkStep("gaokao-application", "Choose what the opening phrase does.", ["past experience", "current confidence", "application reason"], [
        "It uses past experience to support present confidence",
        "It gives a future plan without any evidence",
        "It only lists a skill without a reason"
      ])
    ]
  },
  {
    id: "classic-literature-alice-curiosity",
    type: "literary_reading",
    sourceCategory: "classic_english_literature",
    sourceNote: "Classic English literature/story style, inspired by public-domain adventure writing",
    title: "经典英语文学与故事：好奇心与选择",
    realWorldContext: "你读到一个经典冒险故事风格的片段：人物因为好奇做出选择。",
    studentRole: "读者，需要理解动作背后的心理动机",
    taskGoal: "用 too ... to ... 和 because 读懂人物行为",
    languageInput: "The girl was too curious to walk away, because the small door seemed to lead to a world she had never seen before.",
    targetExpressions: ["too ... to ...", "because ...", "had never seen before"],
    hiddenGrammarPoints: ["too...to 结构", "because 原因状语从句", "过去完成时 had never seen"],
    vocabularyFocus: ["curious", "walk", "seemed", "lead", "world"],
    expressionGoal: "学会在故事中读出人物为什么行动",
    transferContext: "换到校园故事：一个学生因为好奇走进实验室。",
    interactionSteps: [
      mkStep("story-motive", "Choose why the girl did not walk away.", ["curiosity", "reason clause", "new world"], [
        "Her curiosity and the mysterious door made her stay",
        "She understood everything and had no reason to stay",
        "The sentence only describes the size of the door"
      ])
    ]
  }
];

const highSchoolPlanBands = [
  {
    untilDay: 30,
    label: "Sentence sense foundation",
    detail: "core sentence purpose, subject-verb meaning, and useful scene expressions",
    grammar: ["sentence core", "because/although", "basic relative clauses"]
  },
  {
    untilDay: 60,
    label: "Sentence expansion",
    detail: "add time, reason, contrast, result, and attitude without losing the main idea",
    grammar: ["adverbial clauses", "relative clauses", "non-finite phrases"]
  },
  {
    untilDay: 120,
    label: "Long-sentence reading",
    detail: "handle clauses, non-finite structures, and abstract words in exam-style sentences",
    grammar: ["which/who clauses", "having done", "too...to", "with structure"]
  },
  {
    untilDay: 180,
    label: "Paragraph logic",
    detail: "connect sentence meaning with cause, contrast, example, and summary logic",
    grammar: ["logical connectors", "pronoun reference", "parallel expression"]
  },
  {
    untilDay: 240,
    label: "Gaokao writing transfer",
    detail: "use learned patterns in application writing, opinions, summaries, and short essays",
    grammar: ["advanced writing patterns", "cohesion", "tone and evidence"]
  }
];

const highSchoolSentenceExtensions = {
  expansion: [
    "This detail makes the speaker's purpose clearer in a real conversation.",
    "The sentence also shows how a small choice can lead to a practical result.",
    "This idea can be used when students explain a reason or a plan."
  ],
  longSentence: [
    "What matters most is not the difficult word itself, but how the added part supports the main idea.",
    "When reading this sentence, students should first find the core action and then connect the extra information.",
    "The structure becomes easier to follow if the reason, contrast, and result are separated."
  ],
  paragraphLogic: [
    "In a paragraph, this sentence could work as a supporting point because it connects an example with a larger idea.",
    "The same pattern can help students move from a personal experience to a general opinion.",
    "This sentence prepares readers for a cause-and-result explanation in the next sentence."
  ],
  writingTransfer: [
    "For Gaokao writing, the pattern can be adapted to show evidence, attitude, and a clear suggestion.",
    "A stronger version should connect the writer's experience with a concrete action and a responsible tone.",
    "This structure can support an application letter, an opinion paragraph, or a short summary."
  ]
};

const getHighSchoolPlanForDay = (dayNumber: number) => {
  const safeDay = Math.max(1, Math.min(240, dayNumber));
  const band = highSchoolPlanBands.find((item) => safeDay <= item.untilDay) ?? highSchoolPlanBands[0];
  return {
    day: safeDay,
    label: band.label,
    detail: band.detail,
    grammar: band.grammar,
    milestone:
      safeDay === 7
        ? "7-day check: sentence purpose and activated vocabulary"
        : safeDay === 15
          ? "15-day check: sentence expansion and common weak structures"
          : safeDay === 30
            ? "30-day check: foundation sentence sense"
            : safeDay === 60
              ? "60-day check: expanded sentences and clauses"
              : safeDay === 120
                ? "120-day check: long-sentence reading"
                : safeDay === 240
                  ? "240-day final check: Gaokao reading and writing transfer"
                  : `Day ${safeDay}: ${band.label}`
  };
};

const pickHighSchoolExtension = (dayNumber: number, index: number) => {
  const pick = (items: string[]) => items[(dayNumber + index) % items.length];
  if (dayNumber <= 30) return "";
  if (dayNumber <= 60) return pick(highSchoolSentenceExtensions.expansion);
  if (dayNumber <= 120) return pick(highSchoolSentenceExtensions.longSentence);
  if (dayNumber <= 180) return pick(highSchoolSentenceExtensions.paragraphLogic);
  return pick(highSchoolSentenceExtensions.writingTransfer);
};

const adaptHighSchoolScenario = (scenario: LearningScenario, dayNumber: number, index: number): LearningScenario => {
  const plan = getHighSchoolPlanForDay(dayNumber);
  const extension = pickHighSchoolExtension(plan.day, index);
  return {
    ...scenario,
    id: `${scenario.id}-day-${plan.day}`,
    sourceNote: `${scenario.sourceNote ?? "High-school 240-day path"} · ${plan.milestone} · ${plan.detail}`,
    languageInput: extension ? `${scenario.languageInput} ${extension}` : scenario.languageInput,
    hiddenGrammarPoints: Array.from(new Set([...scenario.hiddenGrammarPoints, ...plan.grammar])),
    expressionGoal: `${scenario.expressionGoal} Today's high-school focus: ${plan.label}.`,
    transferContext: `${scenario.transferContext} 240-day focus: ${plan.detail}.`,
    interactionSteps: scenario.interactionSteps.map((step) => ({
      ...step,
      id: `${step.id}-hs-day-${plan.day}-${index}`,
      prompt: `${step.prompt} Focus: ${plan.label}.`
    }))
  };
};

const getHighSchoolDailyScenarioPool = (dayNumber: number): LearningScenario[] => {
  const basePool = [
    ...buildHotTopicScenarios(dayNumber),
    ...staticDailyScenarioPool.filter((scenario) => scenario.sourceCategory !== "recent_hot_topic")
  ];
  const rotation = (dayNumber - 1) % basePool.length;
  const rotated = [...basePool.slice(rotation), ...basePool.slice(0, rotation)];
  return rotated.map((scenario, index) => adaptHighSchoolScenario(scenario, dayNumber, index));
};

export const getDailyScenarioPool = (dayNumber: number, version: LearningVersion = "high_school"): LearningScenario[] =>
  version === "primary_junior"
    ? getJuniorDailyScenarioPool(dayNumber)
    : getHighSchoolDailyScenarioPool(dayNumber);

export const dailyScenarioPool: LearningScenario[] = getDailyScenarioPool(1);

const challengeModes = [
  {
    prompt: "The sentence has been extended. Choose the new purpose added by the second sentence.",
    correct: "It adds a broader learning result beyond the original scene",
    options: [
      "It adds a broader learning result beyond the original scene",
      "It repeats the first sentence with easier words",
      "It changes the topic away from the original scene"
    ],
    criteria: ["broader result", "not repetition", "same scene"]
  },
  {
    prompt: "Choose the best next-part direction after understanding the original sentence.",
    correct: "Use the same structure to express a more abstract idea",
    options: [
      "Use the same structure to express a more abstract idea",
      "Translate every word before reading the sentence",
      "Ignore the original structure and only memorize vocabulary"
    ],
    criteria: ["same structure", "abstract idea", "transfer"]
  },
  {
    prompt: "Choose the higher-level reading focus in this harder version.",
    correct: "Connect the original meaning with the added attitude or ability",
    options: [
      "Connect the original meaning with the added attitude or ability",
      "Find only the easiest noun in the first half",
      "Treat the added sentence as unrelated extra information"
    ],
    criteria: ["meaning connection", "added phrase", "reading focus"]
  }
];

const buildChallengeStep = (scenario: LearningScenario, index: number): InteractionStep => {
  const mode = challengeModes[index % challengeModes.length];
  return mkStep(
    `challenge-${scenario.id}-${index}`,
    mode.prompt,
    mode.criteria,
    mode.options,
    mode.correct
  );
};

export const getChallengeScenarioPool = (dayNumber: number, version: LearningVersion = "high_school"): LearningScenario[] => {
  if (version === "primary_junior") return getJuniorChallengeScenarioPool(dayNumber);
  return getDailyScenarioPool(dayNumber, version).map((scenario, index) => {
  const extension =
    index % 2 === 0
      ? "This experience can broaden students' perspective and strengthen their ability to express ideas accurately."
      : "The situation requires careful judgment, consistent effort, and a responsible attitude.";

  return {
    ...scenario,
    id: `${scenario.id}-challenge`,
    title: `${scenario.title} · 进阶词汇版`,
    taskGoal: `${scenario.taskGoal} + 理解进阶抽象表达`,
    languageInput: `${scenario.languageInput} ${extension}`,
    vocabularyFocus: Array.from(
      new Set([
        ...scenario.vocabularyFocus,
        "broaden",
        "perspective",
        "strengthen",
        "accurately",
        "consistent",
        "responsible",
        "judgment",
        "attitude"
      ])
    ),
    expressionGoal: `${scenario.expressionGoal}，并把原句意思推进到更抽象的学习表达。`,
    interactionSteps: [buildChallengeStep(scenario, index)]
  };
});
};

export const challengeScenarioPool: LearningScenario[] = getChallengeScenarioPool(1);
