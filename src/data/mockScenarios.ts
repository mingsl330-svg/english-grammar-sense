import type { KnowledgePoint, LearningScenario } from "../types/learning";

export const knowledgePoints: KnowledgePoint[] = [
  {
    id: "because-reason",
    category: "logical_connector",
    name: "because 引导原因状语从句",
    displayName: "学会表达：为什么你这样想 / 为什么你这样做",
    difficulty: "basic",
    scenarioExamples: ["daily_conversation", "interview"],
    prerequisites: []
  },
  {
    id: "although-concession",
    category: "clause",
    name: "although 引导让步状语从句",
    displayName: "学会表达：虽然有困难，但仍然坚持某个行动",
    difficulty: "intermediate",
    scenarioExamples: ["speech", "social_issue"],
    prerequisites: ["because-reason"]
  },
  {
    id: "who-relative",
    category: "clause",
    name: "who 引导定语从句",
    displayName: "学会补充说明一个人",
    difficulty: "intermediate",
    scenarioExamples: ["news_reading", "school_life"],
    prerequisites: ["sentence-trunk"]
  },
  {
    id: "nonfinite-accompanying",
    category: "non_finite",
    name: "现在分词作伴随状语",
    displayName: "学会描写一个动作正在伴随另一个画面发生",
    difficulty: "advanced",
    scenarioExamples: ["literary_reading", "storytelling"],
    prerequisites: ["sentence-trunk"]
  }
];

export const learningScenarios: LearningScenario[] = [
  {
    id: "club-interview-because",
    type: "interview",
    title: "英语社团面试",
    realWorldContext: "你正在参加学校英语社团的面试。面试同学问：Why do you want to join our English club?",
    studentRole: "高一学生，想用自然英文说明自己的真实原因",
    taskGoal: "用一句清楚的话表达目标和原因",
    languageInput: "I want to improve my English because I hope to study abroad one day.",
    targetExpressions: ["I want to ... because ...", "I hope to ... one day"],
    hiddenGrammarPoints: ["because 引导原因状语从句", "want to do", "hope to do", "动词不定式"],
    vocabularyFocus: ["improve", "because", "hope", "abroad"],
    expressionGoal: "学会表达：我为什么想做一件事",
    transferContext: "换到新场景：你为什么想加入志愿者活动？",
    interactionSteps: [
      {
        id: "intro",
        type: "context_intro",
        prompt: "先进入场景：如果你在面试中听到这句话，你觉得说话人是在背答案，还是在解释真实原因？",
        userInputType: "choice",
        choices: ["Explaining a real reason", "Reciting a grammar rule", "Changing the topic"],
        optionTags: ["Explaining a real reason", "Reciting a grammar rule", "Changing the topic"],
        aiFeedbackMode: "instant",
        successCriteria: ["能意识到这句话是在解释原因"],
        teacherHint: "面试里最重要的是让别人知道你的动机。"
      },
      {
        id: "meaning",
        type: "comprehension_check",
        prompt: "这句话大概在说什么？不用逐词翻译，先说出核心意思。",
        userInputType: "choice",
        choices: ["He wants to improve English for a future goal", "He dislikes the English club", "He is asking about homework"],
        optionTags: ["He wants to improve English for a future goal", "He dislikes the English club", "He is asking about homework"],
        aiFeedbackMode: "after_submit",
        successCriteria: ["提到提高英语", "提到将来出国学习"]
      },
      {
        id: "reason",
        type: "meaning_discovery",
        prompt: "because 后面说明了什么？它回答了前半句里的哪个问题？",
        userInputType: "choice",
        choices: ["The reason for improving English", "The time of the interview", "The name of the club"],
        optionTags: ["The reason for improving English", "The time of the interview", "The name of the club"],
        aiFeedbackMode: "after_submit",
        successCriteria: ["能指出 because 后面是原因", "能连接 want to improve English"]
      },
      {
        id: "structure",
        type: "structure_discovery",
        prompt: "把这句话分成两个意义块：我想做什么 / 为什么想做。你会怎么切？",
        userInputType: "choice",
        choices: ["Goal + reason", "Place + weather", "Question + answer"],
        optionTags: ["Goal + reason", "Place + weather", "Question + answer"],
        aiFeedbackMode: "after_submit",
        successCriteria: ["I want to improve my English", "because I hope to study abroad one day"],
        teacherHint: "先按意思切，不急着说语法名称。"
      },
      {
        id: "vocabulary",
        type: "vocabulary_in_context",
        prompt: "improve 在这里不是普通的“变好”，而是让某种能力提高。你还能把 improve 用在哪个学习目标上？",
        userInputType: "choice",
        choices: ["Improve my reading skills", "Improve yesterday", "Improve very"],
        optionTags: ["Improve my reading skills", "Improve yesterday", "Improve very"],
        aiFeedbackMode: "after_submit",
        successCriteria: ["能用 improve + ability/skill/English/reading"]
      },
      {
        id: "guided",
        type: "guided_response",
        prompt: "请用 I want to ... because ... 回答：你为什么想提高英语？",
        userInputType: "choice",
        choices: ["I want to improve my English because it helps me understand the world", "I because English want", "Improve because club"],
        optionTags: ["I want to improve my English because it helps me understand the world", "I because English want", "Improve because club"],
        aiFeedbackMode: "after_submit",
        successCriteria: ["包含 want to", "包含 because", "原因真实清楚"]
      },
      {
        id: "transfer",
        type: "free_response",
        prompt: "迁移到新场景：你为什么想加入志愿者活动？用同一个表达逻辑写一句。",
        userInputType: "choice",
        choices: ["I want to join the volunteer activity because I can help others", "Volunteer because want I", "I joined yesterday because"],
        optionTags: ["I want to join the volunteer activity because I can help others", "Volunteer because want I", "I joined yesterday because"],
        aiFeedbackMode: "after_submit",
        successCriteria: ["目标清楚", "原因清楚", "表达自然"]
      }
    ]
  },
  {
    id: "speech-smartphones-although",
    type: "speech",
    title: "30 秒校园演讲",
    realWorldContext: "你要做一个课前英语演讲，主题是：Should students bring smartphones to school?",
    studentRole: "高二学生，需要表达一个平衡观点",
    taskGoal: "先承认好处，再提出担心",
    languageInput:
      "Although smartphones can help students find information quickly, they may also distract students from their studies.",
    targetExpressions: ["Although ..., ... may also ...", "distract sb from sth"],
    hiddenGrammarPoints: ["although 让步状语从句", "情态动词 may", "distract sb from sth", "观点表达"],
    vocabularyFocus: ["although", "smartphones", "distract", "studies"],
    expressionGoal: "学会表达：虽然有好处，但仍有问题",
    transferContext: "换到新场景：AI 学习工具虽然有帮助，但也可能带来依赖。",
    interactionSteps: [
      {
        id: "intro",
        type: "context_intro",
        prompt: "这是演讲中的一句观点句。你觉得作者是完全支持手机进校园，还是在表达平衡观点？",
        userInputType: "choice",
        choices: ["It gives a balanced opinion", "It fully supports smartphones", "It fully rejects smartphones"],
        optionTags: ["It gives a balanced opinion", "It fully supports smartphones", "It fully rejects smartphones"],
        aiFeedbackMode: "instant",
        successCriteria: ["选择平衡观点"]
      },
      {
        id: "benefit",
        type: "comprehension_check",
        prompt: "这句话先承认了手机的什么好处？",
        userInputType: "choice",
        choices: ["They can help students find information quickly", "They make students sleep longer", "They replace all teachers"],
        optionTags: ["They can help students find information quickly", "They make students sleep longer", "They replace all teachers"],
        aiFeedbackMode: "after_submit",
        successCriteria: ["help students find information quickly"]
      },
      {
        id: "worry",
        type: "meaning_discovery",
        prompt: "后半句担心什么问题？distract students from their studies 是什么意思？",
        userInputType: "choice",
        choices: ["They may take students' attention away from study", "They may improve all exams", "They may make students healthier"],
        optionTags: ["They may take students' attention away from study", "They may improve all exams", "They may make students healthier"],
        aiFeedbackMode: "after_submit",
        successCriteria: ["分散注意力", "影响学习"]
      },
      {
        id: "structure",
        type: "structure_discovery",
        prompt: "这句话的表达逻辑是：虽然有一个好处，但也有一个问题。请把两个部分分别找出来。",
        userInputType: "choice",
        choices: ["Benefit + possible problem", "Past event + future plan", "Question + greeting"],
        optionTags: ["Benefit + possible problem", "Past event + future plan", "Question + greeting"],
        aiFeedbackMode: "after_submit",
        successCriteria: ["Although smartphones can help...", "they may also distract..."]
      },
      {
        id: "guided",
        type: "guided_response",
        prompt: "请用 Although ..., ... may also ... 写一句关于 AI 学习工具的观点。",
        userInputType: "choice",
        choices: ["Although AI tools are useful, they may also make students depend on them", "Although useful may also", "AI tools because although"],
        optionTags: ["Although AI tools are useful, they may also make students depend on them", "Although useful may also", "AI tools because although"],
        aiFeedbackMode: "after_submit",
        successCriteria: ["包含 although", "包含 may also", "好处和问题都清楚"]
      },
      {
        id: "reflection",
        type: "reflection",
        prompt: "这类句子适合放在议论文哪里：开头观点、例子、还是结尾？为什么？",
        userInputType: "choice",
        choices: ["It works well when showing a balanced opinion", "It only works as a greeting", "It is only for storytelling"],
        optionTags: ["It works well when showing a balanced opinion", "It only works as a greeting", "It is only for storytelling"],
        aiFeedbackMode: "after_submit",
        successCriteria: ["能说出适合表达平衡观点"]
      }
    ]
  },
  {
    id: "news-teen-sleep-who",
    type: "news_reading",
    title: "青少年睡眠新闻",
    realWorldContext: "你正在读一条关于青少年睡眠的英文新闻。",
    studentRole: "高中读者，需要抓住研究发现",
    taskGoal: "读懂研究发现，并识别 who 后面在补充说明谁",
    languageInput:
      "A recent study shows that teenagers who sleep less than seven hours a night are more likely to feel stressed during the day.",
    targetExpressions: ["A study shows that ...", "teenagers who ...", "are more likely to ..."],
    hiddenGrammarPoints: ["宾语从句", "who 引导定语从句", "be likely to", "比较结构"],
    vocabularyFocus: ["recent", "teenagers", "likely", "stressed"],
    expressionGoal: "学会表达：研究显示某一类人更可能出现某种情况",
    transferContext: "换到健康场景：运动不足的学生更容易感到疲惫。",
    interactionSteps: [
      {
        id: "intro",
        type: "context_intro",
        prompt: "先把它当新闻读：这句话是在讲一个观点，还是一个研究发现？",
        userInputType: "choice",
        choices: ["A research finding", "A personal feeling", "A story scene"],
        optionTags: ["A research finding", "A personal feeling", "A story scene"],
        aiFeedbackMode: "instant",
        successCriteria: ["选择研究发现"]
      },
      {
        id: "finding",
        type: "comprehension_check",
        prompt: "这项研究发现了什么？用中文说大意即可。",
        userInputType: "choice",
        choices: ["Teenagers who sleep less may feel more stressed", "Teenagers sleep more than adults", "The study is about sports"],
        optionTags: ["Teenagers who sleep less may feel more stressed", "Teenagers sleep more than adults", "The study is about sports"],
        aiFeedbackMode: "after_submit",
        successCriteria: ["睡眠少于七小时", "更可能有压力"]
      },
      {
        id: "who",
        type: "structure_discovery",
        prompt: "who sleep less than seven hours a night 是在补充说明谁？",
        userInputType: "choice",
        choices: ["teenagers", "the study", "the day"],
        optionTags: ["teenagers", "the study", "the day"],
        aiFeedbackMode: "after_submit",
        successCriteria: ["teenagers"]
      },
      {
        id: "guided",
        type: "guided_response",
        prompt: "请用 students who ... are more likely to ... 写一句关于运动和健康的句子。",
        userInputType: "choice",
        choices: ["Students who exercise regularly are more likely to stay healthy", "Students who regularly likely", "Exercise who students healthy"],
        optionTags: ["Students who exercise regularly are more likely to stay healthy", "Students who regularly likely", "Exercise who students healthy"],
        aiFeedbackMode: "after_submit",
        successCriteria: ["who 后面补充说明 students", "are more likely to 使用自然"]
      }
    ]
  },
  {
    id: "literary-rain-watching",
    type: "literary_reading",
    title: "小说片段里的画面",
    realWorldContext: "你正在读一小段英文小说，画面安静，有一点孤独感。",
    studentRole: "读者，需要看懂画面和动作关系",
    taskGoal: "读出主动作和伴随动作",
    languageInput: "She stood by the window, watching the rain fall quietly over the empty street.",
    targetExpressions: ["stood by the window", "watching ...", "fall quietly"],
    hiddenGrammarPoints: ["现在分词作伴随状语", "场景描写", "动作伴随", "文学表达"],
    vocabularyFocus: ["stood", "watching", "quietly", "empty"],
    expressionGoal: "学会描写：一个人做着一个动作，同时看见另一个画面",
    transferContext: "换到故事续写：一个男孩站在校门口，等待朋友出现。",
    interactionSteps: [
      {
        id: "intro",
        type: "context_intro",
        prompt: "先想画面：你脑中看到的是一个动作，还是一个安静的场景？",
        userInputType: "choice",
        choices: ["A quiet scene with a person watching rain", "A debate about technology", "A school interview"],
        optionTags: ["A quiet scene with a person watching rain", "A debate about technology", "A school interview"],
        aiFeedbackMode: "instant",
        successCriteria: ["能说出场景感"]
      },
      {
        id: "where",
        type: "comprehension_check",
        prompt: "她在哪里？她在看什么？",
        userInputType: "choice",
        choices: ["By the window, watching the rain", "In a classroom, taking an exam", "At a station, buying tickets"],
        optionTags: ["By the window, watching the rain", "In a classroom, taking an exam", "At a station, buying tickets"],
        aiFeedbackMode: "after_submit",
        successCriteria: ["by the window", "the rain"]
      },
      {
        id: "watching",
        type: "meaning_discovery",
        prompt: "watching 在这里不是新的主句，它补充了她站在那里时正在做什么。你能说出主动作和伴随动作吗？",
        userInputType: "choice",
        choices: ["Main action: stood; accompanying action: watching", "Main action: rain; accompanying action: window", "There is no action in the sentence"],
        optionTags: ["Main action: stood; accompanying action: watching", "Main action: rain; accompanying action: window", "There is no action in the sentence"],
        aiFeedbackMode: "after_submit",
        successCriteria: ["stood", "watching"]
      },
      {
        id: "guided",
        type: "guided_response",
        prompt: "请用 standing / looking / waiting 写一句有画面感的英文。",
        userInputType: "choice",
        choices: ["Standing by the gate, he waited for his friend quietly", "Standing waiting looking", "He is a gate friend"],
        optionTags: ["Standing by the gate, he waited for his friend quietly", "Standing waiting looking", "He is a gate friend"],
        aiFeedbackMode: "after_submit",
        successCriteria: ["有主动作", "有伴随动作", "画面清楚"]
      }
    ]
  }
];
