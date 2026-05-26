import type {
  ExpansionStep,
  LongSentenceAnalysis,
  SentenceLesson
} from "../types/learning";

export const sentenceLessons: SentenceLesson[] = [
  {
    id: "s1-like-coffee",
    stage: 1,
    english: "I like coffee.",
    chinese: "我喜欢咖啡。",
    trunk: "I like coffee",
    readingGoal: "先感受这句话是在说一个稳定喜好，不是在说此刻正在喝咖啡。",
    naturalSense: "英文先说 I，把视角放在“我”；like 表示长期、稳定的倾向；coffee 是这个喜好指向的东西。",
    tenseFocus: "一般现在时在这里不是“现在正在发生”，而是表达习惯、喜好、事实。",
    usageNotes: [
      "like + 名词：I like coffee.",
      "like + doing：I like drinking coffee.",
      "真实表达里常继续补原因：because it helps me stay awake."
    ],
    grammarPoints: ["主语 + 谓语 + 宾语", "一般现在时"],
    grammarExplanation:
      "I 是主语，like 是谓语动词，coffee 是宾语。一般现在时用来表达稳定的喜好或习惯。",
    replacementWords: ["tea", "music", "basketball", "English stories"],
    imitationTask: "用 I like ... 写一个真实的喜好句。",
    words: [
      {
        word: "like",
        meaning: "喜欢",
        partOfSpeech: "动词",
        difficulty: "基础",
        inContext: "表达稳定的个人喜好",
        senseHint: "这里不是“像”，而是“对某件事有稳定好感”。",
        collocation: "like doing / like something",
        simpleExample: "I like music.",
        writingExample: "I like reading because it helps me relax."
      },
      {
        word: "coffee",
        meaning: "咖啡",
        partOfSpeech: "名词",
        difficulty: "基础",
        inContext: "作为 like 的宾语，表示喜欢的东西",
        senseHint: "不可数时表示咖啡这种饮品；a coffee 在口语里可指一杯咖啡。",
        collocation: "drink coffee / a cup of coffee",
        simpleExample: "She drinks coffee.",
        writingExample: "A cup of coffee can make the morning feel easier."
      }
    ],
    tokens: [
      { text: "I", roleId: "subject" },
      { text: "like", normalized: "like", roleId: "predicate", queryable: true },
      { text: "coffee", normalized: "coffee", roleId: "object", queryable: true },
      { text: "." }
    ],
    structure: [
      { id: "subject", label: "主语", text: "I", role: "动作或状态的发出者" },
      { id: "predicate", label: "谓语", text: "like", role: "说明主语做什么或怎么样" },
      { id: "object", label: "宾语", text: "coffee", role: "动作涉及的对象" }
    ],
    senseSteps: [
      {
        id: "meaning-first",
        title: "先抓整句感觉",
        guideQuestion: "这句话是在说“现在正在做”，还是在说“平时喜欢”？",
        explanation: "I like coffee. 的核心不是动作画面，而是一个人的稳定偏好。读句子时先抓这种整体意思。",
        microPractice: "把 coffee 换成 tea / music / reading，感觉句子仍然是在说喜好。"
      },
      {
        id: "tense",
        title: "再看时态为什么这样用",
        guideQuestion: "为什么这里不用 am liking？",
        explanation: "like 表示心理状态和长期倾向，普通表达里常用一般现在时。I am liking coffee. 听起来不自然。",
        microPractice: "判断哪句更自然：I like English. / I am liking English."
      },
      {
        id: "usage",
        title: "最后把句子变得像真实表达",
        guideQuestion: "真实聊天里只说 I like coffee. 够不够？",
        explanation: "短句能表达意思，但真实表达常会补时间、原因或场景，让别人知道为什么这件事重要。",
        microPractice: "加一个原因：I like coffee because ..."
      }
    ]
  },
  {
    id: "s1-morning-study",
    stage: 1,
    english: "She studies English every morning.",
    chinese: "她每天早上学习英语。",
    trunk: "She studies English",
    readingGoal: "读出一个重复发生的学习习惯，而不是一次性的动作。",
    naturalSense: "She 先确定人物，studies English 说明她常做的事，every morning 把这个动作变成一种日常节奏。",
    tenseFocus: "一般现在时表达习惯；主语是 she，所以动词 study 变成 studies。",
    usageNotes: [
      "every morning 常放句尾，先说动作，再补频率。",
      "study English 更像系统学习；learn English 更强调获得能力。",
      "第三人称单数不是为了考试而变形，而是英语句子里主语和动词的呼应。"
    ],
    grammarPoints: ["第三人称单数", "时间状语"],
    grammarExplanation:
      "She 是第三人称单数，所以 study 变为 studies。every morning 放在句末，补充动作发生的时间。",
    replacementWords: ["Chinese", "math", "history", "new words"],
    imitationTask: "用 He/She ... every ... 仿写一个学习习惯。",
    words: [
      {
        word: "studies",
        meaning: "学习",
        partOfSpeech: "动词",
        difficulty: "高中常用",
        inContext: "第三人称单数形式，表示她经常学习",
        senseHint: "studies 带有计划性和持续性，比 casually learns 更像日常学习安排。",
        collocation: "study English / study hard",
        simpleExample: "He studies hard.",
        writingExample: "She studies English every day to improve her reading."
      },
      {
        word: "morning",
        meaning: "早晨",
        partOfSpeech: "名词",
        difficulty: "基础",
        inContext: "every morning 表示动作发生的频率和时间",
        senseHint: "every morning 让句子有“每天重复”的感觉。",
        collocation: "in the morning / every morning",
        simpleExample: "I run in the morning.",
        writingExample: "Reading in the morning helps me start the day well."
      },
      {
        word: "English",
        meaning: "英语",
        partOfSpeech: "名词",
        difficulty: "基础",
        inContext: "作为 studies 的内容，说明她学习的科目",
        senseHint: "当 English 表示语言或学科时，首字母大写。",
        collocation: "speak English / study English / English class",
        simpleExample: "I speak English.",
        writingExample: "Learning English well can help us understand the world better."
      }
    ],
    tokens: [
      { text: "She", roleId: "subject" },
      { text: "studies", normalized: "studies", roleId: "predicate", queryable: true },
      { text: "English", roleId: "object", queryable: true },
      { text: "every", roleId: "adverbial" },
      { text: "morning", normalized: "morning", roleId: "adverbial", queryable: true },
      { text: "." }
    ],
    structure: [
      { id: "subject", label: "主语", text: "She", role: "动作的发出者" },
      { id: "predicate", label: "谓语", text: "studies", role: "说明主语做什么" },
      { id: "object", label: "宾语", text: "English", role: "学习的内容" },
      { id: "adverbial", label: "时间状语", text: "every morning", role: "补充动作时间" }
    ],
    senseSteps: [
      {
        id: "habit",
        title: "先读出习惯感",
        guideQuestion: "every morning 让你感觉这是一次动作，还是重复动作？",
        explanation: "这个句子不是说她某一天早上学习，而是说她有一个稳定习惯。",
        microPractice: "把 every morning 换成 after school，句子仍然在说习惯。"
      },
      {
        id: "verb-form",
        title: "再看动词为什么变形",
        guideQuestion: "为什么不是 She study English？",
        explanation: "英语里 she/he/it 做主语时，一般现在时的动词会呼应主语，所以 study 变 studies。",
        microPractice: "试着说：He reads. She plays. My brother studies."
      },
      {
        id: "word-choice",
        title: "最后分清 study 和 learn",
        guideQuestion: "study English 和 learn English 哪个更像每天坐下来学习？",
        explanation: "study 更强调有意识、有安排地学；learn 更强调最后学会、获得能力。",
        microPractice: "写一句：I study ... every ... because ..."
      }
    ]
  },
  {
    id: "s1-book-interesting",
    stage: 1,
    english: "The book is interesting.",
    chinese: "这本书很有趣。",
    trunk: "The book is interesting",
    readingGoal: "感受这句话不是动作，而是在给一个东西下判断。",
    naturalSense: "The book 把话题拿出来，is 把话题和评价连接起来，interesting 是说话人给出的感受。",
    tenseFocus: "is 表示现在的状态或特点，不表示动作。",
    usageNotes: [
      "interesting 形容物让人觉得有趣；interested 形容人自己感兴趣。",
      "The book is interesting. 是评价句，适合写阅读感受。",
      "如果要说“我感兴趣”，要说 I am interested in the book."
    ],
    grammarPoints: ["主语 + 系动词 + 表语", "形容词作表语"],
    grammarExplanation:
      "is 是系动词，不表示动作，而是把主语 The book 和表语 interesting 连接起来，说明书的特点。",
    replacementWords: ["movie", "class", "story", "question"],
    imitationTask: "用 The ... is ... 写一个评价句。",
    words: [
      {
        word: "interesting",
        meaning: "有趣的",
        partOfSpeech: "形容词",
        difficulty: "高中常用",
        inContext: "说明 book 的特点",
        senseHint: "interesting 是“让人感到有趣的”，不是“我自己感兴趣”。",
        collocation: "an interesting book / find it interesting",
        simpleExample: "The story is interesting.",
        writingExample: "An interesting class can make students more active."
      },
      {
        word: "book",
        meaning: "书",
        partOfSpeech: "名词",
        difficulty: "基础",
        inContext: "句子的主语核心，表示被评价的对象",
        senseHint: "The book 不是泛泛说书，而是在说某一本双方知道的书。",
        collocation: "read a book / an English book / a useful book",
        simpleExample: "This book is useful.",
        writingExample: "A good book can change the way we see life."
      },
      {
        word: "is",
        meaning: "是；处于某种状态",
        partOfSpeech: "系动词",
        difficulty: "基础",
        inContext: "连接 The book 和 interesting",
        senseHint: "这里的 is 不表示动作，更像一个连接符。",
        collocation: "is useful / is important / is different",
        simpleExample: "The class is useful.",
        writingExample: "This experience is important because it teaches me to be patient."
      }
    ],
    tokens: [
      { text: "The", roleId: "subject" },
      { text: "book", roleId: "subject", queryable: true },
      { text: "is", roleId: "linking", queryable: true },
      { text: "interesting", normalized: "interesting", roleId: "predicative", queryable: true },
      { text: "." }
    ],
    structure: [
      { id: "subject", label: "主语", text: "The book", role: "被说明的对象" },
      { id: "linking", label: "系动词", text: "is", role: "连接主语和状态" },
      { id: "predicative", label: "表语", text: "interesting", role: "说明主语的性质" }
    ],
    senseSteps: [
      {
        id: "judgement",
        title: "先判断它是不是动作句",
        guideQuestion: "这句话里有没有真正发生的动作？",
        explanation: "没有。is 在这里像等号，把 The book 和 interesting 连接起来。",
        microPractice: "The class is useful. / The story is moving. 都是评价句。"
      },
      {
        id: "ing-ed",
        title: "再分清 interesting / interested",
        guideQuestion: "是书有趣，还是人感兴趣？",
        explanation: "interesting 修饰让人产生感受的事物；interested 修饰有这种感受的人。",
        microPractice: "选择：I am interested / interesting in science."
      },
      {
        id: "writing",
        title: "最后迁移到写作",
        guideQuestion: "评价一个活动时，能不能用同样结构？",
        explanation: "The activity is meaningful. 这种句子在高中写作里很实用，清楚、自然、不复杂。",
        microPractice: "用 The ... is ... 写一个活动评价。"
      }
    ]
  }
];

export const expansionSteps: ExpansionStep[] = [
  {
    text: "I like coffee.",
    chinese: "我喜欢咖啡。",
    added: "基础主干",
    role: "表达一个稳定喜好",
    positionReason: "主语、谓语、宾语按最基本顺序排列。",
    imitation: "I like music."
  },
  {
    text: "I like coffee in the morning.",
    chinese: "我喜欢早上喝咖啡。",
    added: "in the morning",
    role: "时间状语，说明喜欢这件事通常发生在什么时候",
    positionReason: "较短的时间地点信息常放在句末，先说主干，再补充细节。",
    imitation: "I read books in the evening."
  },
  {
    text: "I like drinking coffee in the morning because it helps me stay focused.",
    chinese: "我喜欢早上喝咖啡，因为它帮助我保持专注。",
    added: "drinking, because it helps me stay focused",
    role: "动名词让表达更具体，because 从句说明原因",
    positionReason: "先说喜好和时间，再用 because 接原因，符合英文从已知到解释的表达习惯。",
    imitation: "I like reading in the evening because it helps me relax."
  },
  {
    text: "Although I used to prefer tea, I now like drinking coffee in the morning because it helps me stay focused during my study time.",
    chinese: "虽然我过去更喜欢茶，但现在我喜欢早上喝咖啡，因为它能帮助我在学习时保持专注。",
    added: "Although I used to prefer tea, now, during my study time",
    role: "让步从句制造前后变化，时间短语让原因更具体",
    positionReason: "Although 从句放句首，先交代旧情况，再突出现在的主句。",
    imitation:
      "Although I used to dislike exercise, I now run after school because it gives me more energy."
  }
];

export const longSentenceAnalysis: LongSentenceAnalysis = {
  original:
    "Although many students spend a lot of time memorizing grammar rules, they still find it difficult to use English naturally because they rarely learn how sentences are built step by step.",
  trunk: "they still find it difficult",
  modifiers: ["a lot of time", "naturally", "step by step"],
  clauses: [
    "Although many students spend a lot of time memorizing grammar rules",
    "because they rarely learn how sentences are built step by step",
    "how sentences are built step by step"
  ],
  nonFinite: ["memorizing grammar rules", "to use English naturally"],
  connectors: ["Although", "because", "how"],
  logic: "先让步：很多学生确实花时间背规则；再转折到结果：仍然觉得使用英语困难；最后说明原因：没有学习句子如何一步步搭建。",
  literalChinese:
    "虽然许多学生花大量时间记忆语法规则，他们仍然发现自然地使用英语很困难，因为他们很少学习句子是如何一步步被建立的。",
  naturalChinese:
    "很多学生虽然花了大量时间背语法规则，但仍然不会自然地使用英语，因为他们很少真正理解句子是怎样一步步构成的。",
  simplifiedEnglish:
    "Many students memorize grammar rules, but they cannot use English naturally because they do not learn sentence building.",
  template:
    "Although ..., 主语 still find it difficult to ... because ..."
};
