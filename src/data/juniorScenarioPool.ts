import type { LearningScenario } from "../types/learning";

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
        ? "This choice matches the real communication goal."
        : "This choice is related, but it misses the main job of the sentence."
    ])
  );

const mkStep = (id: string, prompt: string, options: string[], correctOption: string): InteractionStep => {
  const choices = stableShuffle(options, `${id}-${prompt}`);
  return {
    id,
    type: "guided_response",
    prompt,
    userInputType: "choice",
    aiFeedbackMode: "after_submit",
    successCriteria: [correctOption],
    choices,
    optionTags: choices,
    correctOption,
    optionExplanations: optionExplanations(choices, correctOption),
    teacherHint: "Think about what the speaker wants to do in this real situation."
  };
};

export const juniorDailyScenarioPool: LearningScenario[] = [
  {
    id: "junior-borrow-pencil",
    type: "daily_conversation",
    sourceCategory: "daily_life",
    sourceNote: "Primary-junior focus: classroom request",
    title: "Classroom Request",
    realWorldContext: "A student forgot a pencil and wants to ask a classmate politely.",
    studentRole: "Student asking for help",
    taskGoal: "Make a polite request",
    languageInput: "Can I borrow your pencil for a minute?",
    targetExpressions: ["Can I borrow ...?", "for a minute"],
    hiddenGrammarPoints: ["Can I ...? 请求句", "物主代词 your", "时间短语 for a minute"],
    vocabularyFocus: ["borrow", "pencil", "minute"],
    expressionGoal: "Ask for something politely",
    transferContext: "Ask to borrow an eraser or ruler.",
    interactionSteps: [
      mkStep("borrow", "Choose the purpose of this sentence.", [
        "Ask to use something for a short time",
        "Tell someone that the pencil is old",
        "Say that the class is starting"
      ], "Ask to use something for a short time")
    ]
  },
  {
    id: "junior-class-time",
    type: "school_life",
    sourceCategory: "daily_life",
    sourceNote: "Primary-junior focus: asking time",
    title: "Asking About Class Time",
    realWorldContext: "A student wants to know when the next class starts.",
    studentRole: "Student checking the schedule",
    taskGoal: "Ask for time information",
    languageInput: "What time does the English class start?",
    targetExpressions: ["What time does ... start?"],
    hiddenGrammarPoints: ["What time 疑问句", "does 助动词", "第三人称单数 start"],
    vocabularyFocus: ["time", "English", "class", "start"],
    expressionGoal: "Ask when something starts",
    transferContext: "Ask when the bus or movie starts.",
    interactionSteps: [
      mkStep("time", "Choose what the speaker wants to know.", [
        "The starting time of the English class",
        "The teacher's favorite class",
        "The student's English score"
      ], "The starting time of the English class")
    ]
  },
  {
    id: "junior-lunch-choice",
    type: "daily_conversation",
    sourceCategory: "daily_life",
    sourceNote: "Primary-junior focus: food choice and reason",
    title: "Lunch Choice",
    realWorldContext: "A student is choosing food at lunch.",
    studentRole: "Student ordering food",
    taskGoal: "Say what you want and why",
    languageInput: "I would like some noodles because I am hungry.",
    targetExpressions: ["I would like ... because ..."],
    hiddenGrammarPoints: ["would like 表示想要", "because 原因", "some + 名词"],
    vocabularyFocus: ["would", "noodles", "because", "hungry"],
    expressionGoal: "Say a choice with a reason",
    transferContext: "Say what drink you want and why.",
    interactionSteps: [
      mkStep("lunch", "Choose what this sentence does.", [
        "It gives a food choice and a reason",
        "It asks where the noodles are",
        "It says the student cooked lunch"
      ], "It gives a food choice and a reason")
    ]
  },
  {
    id: "junior-lost-book",
    type: "school_life",
    sourceCategory: "daily_life",
    sourceNote: "Primary-junior focus: problem statement",
    title: "Lost English Book",
    realWorldContext: "A student cannot find a book before class.",
    studentRole: "Student explaining a problem",
    taskGoal: "State a simple problem clearly",
    languageInput: "I can't find my English book.",
    targetExpressions: ["I can't find ..."],
    hiddenGrammarPoints: ["can't + 动词原形", "物主代词 my", "名词短语 English book"],
    vocabularyFocus: ["can't", "find", "English", "book"],
    expressionGoal: "Explain what you cannot find",
    transferContext: "Say you cannot find your bag or ticket.",
    interactionSteps: [
      mkStep("lost-book", "Choose the problem in this sentence.", [
        "The student cannot find the English book",
        "The student wants to buy a new book",
        "The student is reading an English story"
      ], "The student cannot find the English book")
    ]
  },
  {
    id: "junior-weekend-plan",
    type: "daily_conversation",
    sourceCategory: "daily_life",
    sourceNote: "Primary-junior focus: future plan",
    title: "Weekend Plan",
    realWorldContext: "A student is talking about a weekend family plan.",
    studentRole: "Student sharing a plan",
    taskGoal: "Talk about a near future plan",
    languageInput: "I am going to visit my grandparents this weekend.",
    targetExpressions: ["I am going to ... this weekend"],
    hiddenGrammarPoints: ["be going to 表将来", "visit + 人", "时间状语 this weekend"],
    vocabularyFocus: ["going", "visit", "grandparents", "weekend"],
    expressionGoal: "Talk about a plan",
    transferContext: "Talk about a plan to play basketball or see a movie.",
    interactionSteps: [
      mkStep("plan", "Choose the time meaning of this sentence.", [
        "A plan for the coming weekend",
        "Something that happened yesterday",
        "A habit that happens every day"
      ], "A plan for the coming weekend")
    ]
  },
  {
    id: "junior-drawing-club",
    type: "school_life",
    sourceCategory: "daily_life",
    sourceNote: "Primary-junior focus: hobby and reason",
    title: "After-school Club",
    realWorldContext: "A student explains why drawing club feels useful.",
    studentRole: "Student talking about a hobby",
    taskGoal: "Connect a hobby with a feeling",
    languageInput: "I like drawing because it helps me relax.",
    targetExpressions: ["I like ... because it helps me ..."],
    hiddenGrammarPoints: ["like doing", "because 原因", "help sb do"],
    vocabularyFocus: ["drawing", "because", "helps", "relax"],
    expressionGoal: "Say why you like an activity",
    transferContext: "Say why you like reading or running.",
    interactionSteps: [
      mkStep("club", "Choose why the student likes drawing.", [
        "Drawing helps the student relax",
        "Drawing makes the student late",
        "Drawing is only a school rule"
      ], "Drawing helps the student relax")
    ]
  },
  {
    id: "junior-football-yesterday",
    type: "storytelling",
    sourceCategory: "daily_life",
    sourceNote: "Primary-junior focus: simple past",
    title: "Yesterday After School",
    realWorldContext: "A student tells a friend what happened yesterday.",
    studentRole: "Student telling a simple past event",
    taskGoal: "Use past tense to tell an event",
    languageInput: "I played football with my friends yesterday.",
    targetExpressions: ["I played ... yesterday"],
    hiddenGrammarPoints: ["一般过去时 played", "with + 人", "时间状语 yesterday"],
    vocabularyFocus: ["played", "football", "friends", "yesterday"],
    expressionGoal: "Talk about something that happened before",
    transferContext: "Talk about watching a movie yesterday.",
    interactionSteps: [
      mkStep("past", "Choose when this event happened.", [
        "It happened yesterday",
        "It is happening now",
        "It will happen next week"
      ], "It happened yesterday")
    ]
  },
  {
    id: "junior-class-rule",
    type: "classroom_discussion",
    sourceCategory: "daily_life",
    sourceNote: "Primary-junior focus: should",
    title: "Classroom Rule",
    realWorldContext: "A teacher reminds students how to learn well in class.",
    studentRole: "Student understanding a rule",
    taskGoal: "Understand advice with should",
    languageInput: "We should listen carefully in class.",
    targetExpressions: ["We should ... in class"],
    hiddenGrammarPoints: ["should + 动词原形", "副词 carefully", "地点短语 in class"],
    vocabularyFocus: ["should", "listen", "carefully", "class"],
    expressionGoal: "Understand and give simple advice",
    transferContext: "Say what students should do at home.",
    interactionSteps: [
      mkStep("rule", "Choose the advice in this sentence.", [
        "Students need to listen carefully",
        "Students want to leave the classroom",
        "Students are talking about lunch"
      ], "Students need to listen carefully")
    ]
  },
  {
    id: "junior-ai-homework-helper",
    type: "school_life",
    sourceCategory: "recent_hot_topic",
    sourceNote: "Primary-junior focus: using new technology wisely",
    title: "Smart Homework Help",
    realWorldContext: "A student talks about using an AI tool without copying answers.",
    studentRole: "Student explaining a study habit",
    taskGoal: "Say what a tool can help with and what you should still do",
    languageInput: "AI can help me check spelling, but I should think by myself.",
    targetExpressions: ["can help me ...", "but I should ..."],
    hiddenGrammarPoints: ["can + 动词原形", "but 转折", "by myself"],
    vocabularyFocus: ["AI", "check", "spelling", "should", "myself"],
    expressionGoal: "Use a hot topic to express a balanced study habit",
    transferContext: "Talk about using a dictionary, a tablet, or a learning app.",
    interactionSteps: [
      mkStep("ai-helper", "Choose the balanced idea in this sentence.", [
        "AI helps with spelling, but the student still needs to think",
        "AI should finish all homework for the student",
        "The student does not need to check spelling"
      ], "AI helps with spelling, but the student still needs to think")
    ]
  },
  {
    id: "junior-movie-friendship",
    type: "storytelling",
    sourceCategory: "classic_movie_scene",
    sourceNote: "Primary-junior focus: friendship in a familiar movie-like scene",
    title: "Movie Friendship Moment",
    realWorldContext: "In a movie scene, one friend stays when another friend feels afraid.",
    studentRole: "Student understanding a simple movie line",
    taskGoal: "Understand support between friends",
    languageInput: "A good friend stays with you when you are afraid.",
    targetExpressions: ["stays with you", "when you are ..."],
    hiddenGrammarPoints: ["一般现在时", "when 时间/情境从句", "形容词 afraid"],
    vocabularyFocus: ["friend", "stays", "afraid", "with"],
    expressionGoal: "Describe what a good friend does",
    transferContext: "Describe what a classmate does when you need help.",
    interactionSteps: [
      mkStep("movie-friend", "Choose what the sentence shows.", [
        "A friend gives support in a hard moment",
        "A student is watching a funny movie alone",
        "Two friends are choosing a weekend movie"
      ], "A friend gives support in a hard moment")
    ]
  },
  {
    id: "junior-keep-trying",
    type: "classroom_discussion",
    sourceCategory: "inspirational_speech",
    sourceNote: "Primary-junior focus: short encouraging speech",
    title: "Keep Trying",
    realWorldContext: "A teacher gives a short line before a class challenge.",
    studentRole: "Student understanding encouragement",
    taskGoal: "Connect practice with progress",
    languageInput: "I can learn better if I practice every day.",
    targetExpressions: ["learn better", "if I ... every day"],
    hiddenGrammarPoints: ["can + 动词原形", "if 条件", "频率表达 every day"],
    vocabularyFocus: ["learn", "better", "practice", "every"],
    expressionGoal: "Say how regular practice helps",
    transferContext: "Talk about reading, speaking, or writing practice.",
    interactionSteps: [
      mkStep("keep-trying", "Choose the condition for learning better.", [
        "Practicing every day",
        "Stopping after one mistake",
        "Waiting for the test day"
      ], "Practicing every day")
    ]
  },
  {
    id: "junior-spring-festival",
    type: "daily_conversation",
    sourceCategory: "chinese_traditional_culture",
    sourceNote: "Primary-junior focus: Chinese festival expression",
    title: "Spring Festival Visit",
    realWorldContext: "A student tells an international friend about a family tradition.",
    studentRole: "Student introducing a Chinese festival habit",
    taskGoal: "Describe a family activity during a festival",
    languageInput: "We visit our grandparents during the Spring Festival.",
    targetExpressions: ["visit our grandparents", "during the Spring Festival"],
    hiddenGrammarPoints: ["一般现在时", "during + 时间", "our + 名词"],
    vocabularyFocus: ["visit", "grandparents", "during", "festival"],
    expressionGoal: "Introduce one Chinese traditional culture detail in simple English",
    transferContext: "Talk about eating dumplings or watching a family show.",
    interactionSteps: [
      mkStep("spring-festival", "Choose what the family does.", [
        "They visit grandparents during the festival",
        "They study at school during the festival",
        "They forget the festival"
      ], "They visit grandparents during the festival")
    ]
  },
  {
    id: "junior-reading-exam-habit",
    type: "school_life",
    sourceCategory: "gaokao_focus",
    sourceNote: "Primary-junior focus: entrance-exam reading habit",
    title: "Reading Test Habit",
    realWorldContext: "A student learns a useful habit for school reading tests.",
    studentRole: "Student preparing for a reading task",
    taskGoal: "Understand a practical test-reading habit",
    languageInput: "Before I answer, I read the question carefully.",
    targetExpressions: ["Before I ...", "read ... carefully"],
    hiddenGrammarPoints: ["before 时间从句", "副词 carefully", "answer 作动词"],
    vocabularyFocus: ["before", "answer", "question", "carefully"],
    expressionGoal: "Say a useful exam habit without sounding like a test drill",
    transferContext: "Talk about checking a sentence before writing it.",
    interactionSteps: [
      mkStep("exam-habit", "Choose the order of actions.", [
        "Read the question first, then answer",
        "Answer first, then read the question",
        "Skip the question and write anything"
      ], "Read the question first, then answer")
    ]
  },
  {
    id: "junior-secret-garden",
    type: "storytelling",
    sourceCategory: "classic_english_literature",
    sourceNote: "Primary-junior focus: simple classic story feeling",
    title: "Story Garden",
    realWorldContext: "A simple line from a classic-story style scene.",
    studentRole: "Student reading a short story sentence",
    taskGoal: "Follow a simple story action and surprise",
    languageInput: "The little girl opened the door and saw a quiet garden.",
    targetExpressions: ["opened the door", "saw a quiet garden"],
    hiddenGrammarPoints: ["一般过去时 opened/saw", "and 连接动作", "形容词 quiet"],
    vocabularyFocus: ["little", "opened", "door", "saw", "quiet"],
    expressionGoal: "Read a short story sentence with clear action order",
    transferContext: "Write one sentence about finding a room, a box, or a garden.",
    interactionSteps: [
      mkStep("story-garden", "Choose the action order.", [
        "She opened the door and then saw the garden",
        "She saw the garden and then closed the door",
        "She ran to school before opening the door"
      ], "She opened the door and then saw the garden")
    ]
  }
];

const juniorPlanModules = [
  {
    title: "Classroom English",
    focus: "requests, classroom objects, and simple instructions",
    grammar: "Can I ...? / should do"
  },
  {
    title: "Daily Routines",
    focus: "time, habits, family, and school schedules",
    grammar: "simple present / what time"
  },
  {
    title: "Food And Choices",
    focus: "likes, needs, choices, and reasons",
    grammar: "would like / because"
  },
  {
    title: "Problems And Help",
    focus: "lost items, small problems, and asking for help",
    grammar: "can't / need to"
  },
  {
    title: "Plans And Weekends",
    focus: "near future plans and activities",
    grammar: "be going to"
  },
  {
    title: "Hobbies And Feelings",
    focus: "hobbies, feelings, and simple reasons",
    grammar: "like doing / help sb do"
  },
  {
    title: "Past Events",
    focus: "yesterday, last weekend, and simple stories",
    grammar: "simple past"
  },
  {
    title: "Rules And Advice",
    focus: "school rules, advice, and good habits",
    grammar: "should / must"
  }
];

const juniorDifficultyBands = [
  { untilDay: 30, label: "Foundation", detail: "short sentences and one clear purpose" },
  { untilDay: 60, label: "Build-up", detail: "short sentences with time, place, or reason" },
  { untilDay: 120, label: "Connection", detail: "two-clause meaning with because, when, or but" },
  { untilDay: 180, label: "Story", detail: "simple past, plans, and short story logic" },
  { untilDay: 240, label: "Junior readiness", detail: "mixed junior-level sentence patterns and short paragraph preparation" }
];

export const getJuniorPlanForDay = (dayNumber: number) => {
  const safeDay = Math.max(1, Math.min(240, dayNumber));
  const module = juniorPlanModules[(safeDay - 1) % juniorPlanModules.length];
  const difficulty = juniorDifficultyBands.find((band) => safeDay <= band.untilDay) ?? juniorDifficultyBands[0];
  const week = Math.ceil(safeDay / 7);
  const milestone =
    safeDay === 7
      ? "First-week check: classroom requests, time, and simple reasons"
      : safeDay === 15
        ? "15-day check: routines, choices, problems, and plans"
        : safeDay === 30
          ? "30-day check: foundation sentence patterns"
          : safeDay === 60
            ? "60-day check: connected sentences with reasons and time"
            : safeDay === 120
              ? "120-day check: junior reading readiness"
              : safeDay === 240
                ? "240-day final check: mixed junior-level communication"
                : `Week ${week} daily practice`;

  return {
    day: safeDay,
    moduleTitle: module.title,
    moduleFocus: module.focus,
    grammarFocus: module.grammar,
    difficultyLabel: difficulty.label,
    difficultyDetail: difficulty.detail,
    milestone
  };
};

const juniorSentenceExtensions = {
  buildUp: [
    "I can use it at school.",
    "This is useful in class.",
    "I can say it after lunch.",
    "This helps me talk with friends."
  ],
  connection: [
    "because it helps me solve a small problem.",
    "when I need to speak clearly.",
    "but I need to use it politely.",
    "because it is part of daily school life."
  ],
  story: [
    "Yesterday, I used a similar sentence with my classmate.",
    "Last week, this sentence helped me explain a small problem.",
    "After class, I tried to say the same idea in my own words.",
    "In a short story, this sentence can show what the speaker needs."
  ],
  readiness: [
    "If I meet a similar sentence in a reading test, I should find the speaker's purpose first.",
    "This sentence can become part of a short paragraph about school life.",
    "I can change the subject, time, or reason to make a new sentence.",
    "The key is to understand the meaning before copying the pattern."
  ]
};

const adaptJuniorLanguageInput = (baseSentence: string, dayNumber: number, index: number) => {
  if (dayNumber <= 30) return baseSentence;
  const pick = (items: string[]) => items[(dayNumber + index) % items.length];
  if (dayNumber <= 60) return `${baseSentence} ${pick(juniorSentenceExtensions.buildUp)}`;
  if (dayNumber <= 120) return `${baseSentence} ${pick(juniorSentenceExtensions.connection)}`;
  if (dayNumber <= 180) return `${baseSentence} ${pick(juniorSentenceExtensions.story)}`;
  return `${baseSentence} ${pick(juniorSentenceExtensions.readiness)}`;
};

const extraGrammarForDay = (dayNumber: number) => {
  if (dayNumber <= 30) return [];
  if (dayNumber <= 60) return ["extra detail: time/place/use"];
  if (dayNumber <= 120) return ["connector: because/when/but"];
  if (dayNumber <= 180) return ["simple story extension"];
  return ["junior readiness: purpose before pattern"];
};

export const getJuniorDailyScenarioPool = (dayNumber: number): LearningScenario[] => {
  const plan = getJuniorPlanForDay(dayNumber);
  const rotation = (dayNumber - 1) % juniorDailyScenarioPool.length;
  const rotated = [
    ...juniorDailyScenarioPool.slice(rotation),
    ...juniorDailyScenarioPool.slice(0, rotation)
  ];

  return rotated.map((scenario, index) => ({
    ...scenario,
    id: `${scenario.id}-day-${plan.day}`,
    title: `Day ${plan.day} · ${scenario.title}`,
    languageInput: adaptJuniorLanguageInput(scenario.languageInput, plan.day, index),
    sourceNote: `${scenario.sourceNote} · ${plan.difficultyLabel}: ${plan.difficultyDetail}`,
    taskGoal: `${scenario.taskGoal} · ${plan.moduleTitle}`,
    hiddenGrammarPoints: [...scenario.hiddenGrammarPoints, ...extraGrammarForDay(plan.day)],
    expressionGoal: `${scenario.expressionGoal}. Today's focus: ${plan.grammarFocus}.`,
    transferContext: `${scenario.transferContext} Daily module: ${plan.moduleFocus}.`,
    interactionSteps: scenario.interactionSteps.map((step) => ({
      ...step,
      id: `${step.id}-day-${plan.day}-${index}`,
      prompt: `${step.prompt} Today's focus: ${plan.grammarFocus}.`
    }))
  }));
};

export const getJuniorChallengeScenarioPool = (dayNumber = 1): LearningScenario[] =>
  getJuniorDailyScenarioPool(dayNumber).map((scenario, index) => ({
    ...scenario,
    id: `${scenario.id}-challenge`,
    title: `${scenario.title} · richer version`,
    languageInput:
      index % 2 === 0
        ? `${scenario.languageInput} This can help me speak more clearly.`
        : `${scenario.languageInput} It is useful in daily school life.`,
    vocabularyFocus: Array.from(new Set([...scenario.vocabularyFocus, "useful", "clearly", "daily"])),
    expressionGoal: `${scenario.expressionGoal} with one extra detail.`,
    interactionSteps: [
      mkStep(`challenge-${scenario.id}`, "Choose the extra idea added in the second sentence.", [
        "It adds one useful result or detail",
        "It changes the topic completely",
        "It only repeats the same words"
      ], "It adds one useful result or detail")
    ]
  }));
