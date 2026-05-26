import { sentenceLessons } from "../data/mockSentences";
import { knowledgePoints, learningScenarios } from "../data/mockScenarios";
import { minimaxService } from "./minimaxService";
import type {
  AssessmentResult,
  AssessmentTask,
  Difficulty,
  FeedbackResult,
  KnowledgePoint,
  LearningDiagnosis,
  LearningScenario,
  NextPart,
  NextPartType,
  ParagraphLesson,
  SentenceLesson,
  StageAssessment,
  StudentProfile,
  StudyRecord
} from "../types/learning";

export interface SentenceGenerationInput {
  grade: "高一" | "高二" | "高三";
  difficulty: "简单" | "中等" | "较难";
  topic: "学习" | "生活" | "科技" | "运动" | "家庭" | "社会";
  grammarPoint: string;
  vocabularyLevel: "初中" | "高中基础" | "高中进阶";
}

export const nextPartLabels: Record<NextPartType, string> = {
  continue_same_level: "同级巩固",
  review_vocabulary: "语境词汇复习",
  review_grammar: "语法回看",
  simplify_sentence: "句子变短",
  sentence_expansion: "句子扩展",
  imitation_practice: "仿写加练",
  contrast_practice: "易混结构对比",
  long_sentence_analysis: "长句拆解",
  paragraph_logic: "段落逻辑",
  writing_application: "写作应用",
  challenge_level_up: "提高挑战"
};

const nextPartCopy: Record<NextPartType, Omit<NextPart, "type">> = {
  continue_same_level: {
    title: "再练一个同难度句子",
    instruction: "保持当前长度，只换一个主题，确认学生不是偶然答对。",
    focus: "稳定理解主干",
    prompt: "Read the sentence and mark subject, verb and object.",
    estimatedMinutes: 4
  },
  review_vocabulary: {
    title: "先补一个关键词",
    instruction: "从当前句子里抽出影响理解的词，放进两个真实语境中辨析。",
    focus: "词义在句子里的作用",
    prompt: "Choose the best meaning of the key word in this sentence.",
    estimatedMinutes: 5
  },
  review_grammar: {
    title: "回到更短例句看语法",
    instruction: "用一个更短的句子解释同一语法点，再回到原句。",
    focus: "语法形式和位置",
    prompt: "Compare: The book is interesting. / The book was interesting.",
    estimatedMinutes: 6
  },
  simplify_sentence: {
    title: "把句子拆短再理解",
    instruction: "先读主干，再逐个放回修饰成分。",
    focus: "主干优先",
    prompt: "Find the shortest complete sentence inside the long sentence.",
    estimatedMinutes: 6
  },
  sentence_expansion: {
    title: "给短句加信息",
    instruction: "从一个短句开始，只加一个时间、地点或原因信息。",
    focus: "扩展位置",
    prompt: "Add one time phrase to the sentence: I like coffee.",
    estimatedMinutes: 6
  },
  imitation_practice: {
    title: "照着结构写一句",
    instruction: "保留句型骨架，只替换人物、动作或原因。",
    focus: "从理解到表达",
    prompt: "Write your own sentence with: I like ... because ...",
    estimatedMinutes: 7
  },
  contrast_practice: {
    title: "对比一个易混点",
    instruction: "用两句很短的例句对比结构差异。",
    focus: "because / although 等连接关系",
    prompt: "Choose because or although, then explain the logic in Chinese.",
    estimatedMinutes: 6
  },
  long_sentence_analysis: {
    title: "进入长句拆解",
    instruction: "学生已能处理扩展句，开始识别从句、非谓语和逻辑关系。",
    focus: "长句主干和从句",
    prompt: "Break the sentence into trunk, clause and reason.",
    estimatedMinutes: 8
  },
  paragraph_logic: {
    title: "进入段落逻辑",
    instruction: "学生句子理解稳定后，开始看句子之间如何连接。",
    focus: "主题句、支撑句、转折和因果",
    prompt: "Find the topic sentence and explain how sentence 2 supports it.",
    estimatedMinutes: 10
  },
  writing_application: {
    title: "把句型用进写作",
    instruction: "把当前句型迁移到高考写作常见话题。",
    focus: "自然表达",
    prompt: "Use Although ..., I still ... because ... to write about study.",
    estimatedMinutes: 8
  },
  challenge_level_up: {
    title: "提高一级挑战",
    instruction: "增加一个从句或更抽象的主题，测试能否迁移。",
    focus: "难度升级",
    prompt: "Read a longer sentence and explain the logic in your own words.",
    estimatedMinutes: 9
  }
};

export const createNextPart = (type: NextPartType): NextPart => ({
  type,
  ...nextPartCopy[type]
});

const adaptNextPartWithHistory = (
  diagnosis: LearningDiagnosis,
  recentRecords: StudyRecord[] = []
): NextPartType => {
  const recentWeakPoints = recentRecords
    .flatMap((record) => record.diagnosis?.weakPoints ?? [])
    .slice(0, 8);
  const repeatedWeakPoint = diagnosis.weakPoints.some((point) => recentWeakPoints.includes(point));
  const recentStrongCount = recentRecords
    .slice(0, 3)
    .filter((record) => (record.diagnosis?.comprehensionScore ?? 0) >= 85).length;

  if (diagnosis.mainProblem === "grammar" && repeatedWeakPoint) return "review_grammar";
  if (diagnosis.mainProblem === "sentence_structure" && repeatedWeakPoint) return "simplify_sentence";
  if (diagnosis.mainProblem === "vocabulary" && repeatedWeakPoint) return "review_vocabulary";
  if (diagnosis.mainProblem === "none" && recentStrongCount >= 2) return "challenge_level_up";
  return diagnosis.recommendedNextPart;
};

const includesAny = (value: string, keywords: string[]) =>
  keywords.some((keyword) => value.toLowerCase().includes(keyword.toLowerCase()));

export const gptService = {
  async evaluateStageAssessment(input: {
    studentProfile: StudentProfile;
    stageAssessment: StageAssessment;
    studentAnswers: AssessmentTask[];
    learningHistory: StudyRecord[];
  }): Promise<AssessmentResult> {
    const answers = input.studentAnswers.map((task) => task.userAnswer?.trim() ?? "");
    const joined = answers.join(" ").toLowerCase();
    const hasBecause = joined.includes("because");
    const hasAlthough = joined.includes("although");
    const hasGradually = joined.includes("gradually");
    const hasAnnotationSignals = includesAny(joined, [
      "主句",
      "although",
      "前半句",
      "后半句",
      "修饰",
      "承认",
      "担心",
      "逻辑"
    ]);
    const writingLength = answers.reduce((sum, answer) => sum + answer.split(/\s+/).filter(Boolean).length, 0);
    const blankCount = answers.filter((answer) => answer.length === 0).length;

    const vocabulary = hasGradually ? 82 : 62;
    const grammar = hasBecause && hasAlthough ? 84 : hasBecause || hasAlthough ? 72 : 58;
    const sentenceStructure = hasAnnotationSignals ? 80 : 60;
    const meaningLogic = includesAny(joined, ["原因", "虽然", "但是", "承认", "问题", "because", "although"]) ? 82 : 58;
    const expressionNaturalness = writingLength > 35 ? 78 : 64;
    const annotationAccuracy = hasAnnotationSignals ? 82 : 54;
    const writingCompleteness = blankCount === 0 ? 82 : blankCount <= 1 ? 68 : 48;

    const overallScore = Math.round(
      (vocabulary +
        grammar +
        sentenceStructure +
        meaningLogic +
        expressionNaturalness +
        annotationAccuracy +
        writingCompleteness) /
        7
    );
    const canMoveForward = overallScore >= 75 && annotationAccuracy >= 70 && writingCompleteness >= 70;

    return {
      overallScore,
      masteredGoals: [
        ...(hasBecause ? ["能用 because 说明原因"] : []),
        ...(hasGradually ? ["能在语境中使用 gradually"] : []),
        ...(meaningLogic >= 75 ? ["能识别句子的语意逻辑"] : [])
      ],
      partiallyMasteredGoals: [
        ...(hasAlthough && grammar < 82 ? ["能尝试使用 although，但复合句稳定性还要加强"] : []),
        ...(expressionNaturalness < 80 ? ["能写出意思，但表达自然度还可提升"] : [])
      ],
      weakGoals: [
        ...(annotationAccuracy < 70 ? ["句子结构和语意功能批注"] : []),
        ...(grammar < 70 ? ["原因、让步等连接结构的稳定使用"] : []),
        ...(blankCount > 0 ? ["完整完成多步场景任务"] : [])
      ],
      repeatedErrors: [
        ...(hasAlthough ? [] : ["较少主动使用 although 表达让步"]),
        ...(hasAnnotationSignals ? [] : ["批注时容易只翻译，不说明结构和功能"])
      ],
      learningSummary: canMoveForward
        ? "你已经能在场景中写出基本完整的句子，并能说明部分句子逻辑。下一阶段可以进入段落逻辑训练。"
        : "你已经能理解部分场景意思，但还需要继续练习把词、结构和逻辑写清楚，尤其是批注能力和复合句稳定性。",
      nextStageRecommendation: {
        canMoveForward,
        nextStageId: canMoveForward ? "4" : "2",
        mainGoals: canMoveForward
          ? ["主题句", "支撑句", "因果关系", "转折关系", "3-5 句话表达观点"]
          : ["although 表达让步", "because 表达原因", "用一个句子表达困难 + 行动 + 原因"],
        reviewGoals: [
          ...(annotationAccuracy < 75 ? ["回看句子主干和逻辑批注"] : []),
          ...(vocabulary < 75 ? ["高频词在真实场景中的使用"] : [])
        ],
        newKnowledgePoints: canMoveForward ? ["段落主题句", "支撑句", "连接词推进"] : ["if 条件表达", "定语补充 who/that"],
        recommendedScenarioTypes: canMoveForward
          ? ["news_reading", "school_life", "speech"]
          : ["daily_conversation", "school_life", "classroom_discussion"],
        recommendedTaskTypes: canMoveForward
          ? ["paragraph_logic_writing", "scenario_response", "short_essay"]
          : ["sentence_pattern_writing", "sentence_annotation", "scenario_response"],
        reason: canMoveForward
          ? "阶段表现说明你可以从单句表达推进到段落组织。"
          : "当前最重要的是让句子表达和批注更稳定，再进入更复杂段落。",
        estimatedSessions: canMoveForward ? 4 : 3
      }
    };
  },

  async generateScenarioLearningTask(input: {
    studentProfile: StudentProfile;
    targetKnowledgePoints?: KnowledgePoint[];
    recentWeakPoints: string[];
    preferredScenarioTypes?: LearningScenario["type"][];
    difficulty: Difficulty;
  }): Promise<LearningScenario> {
    const targetIds = new Set(input.targetKnowledgePoints?.map((point) => point.id) ?? []);
    const preferredTypes = new Set(input.preferredScenarioTypes ?? input.studentProfile.interests);
    const weakPointText = input.recentWeakPoints.join(" ");

    const matchedByWeakPoint = learningScenarios.find((scenario) =>
      scenario.hiddenGrammarPoints.some((point) => weakPointText.includes(point))
    );
    if (matchedByWeakPoint) return matchedByWeakPoint;

    const matchedByKnowledge = learningScenarios.find((scenario) =>
      scenario.hiddenGrammarPoints.some((point) =>
        [...targetIds].some((id) => knowledgePoints.find((item) => item.id === id)?.name === point)
      )
    );
    if (matchedByKnowledge) return matchedByKnowledge;

    const matchedByType = learningScenarios.find((scenario) => preferredTypes.has(scenario.type));
    return matchedByType ?? learningScenarios[0];
  },

  async evaluateScenarioResponse(input: {
    scenario: LearningScenario;
    stepId: string;
    answer: string;
    recentRecords?: StudyRecord[];
  }): Promise<{ feedback: FeedbackResult; diagnosis: LearningDiagnosis; nextPart?: NextPart }> {
    const minimaxResult = await minimaxService.evaluateScenarioResponse({
      ...input,
      createNextPart
    });
    if (minimaxResult) return minimaxResult;

    const step = input.scenario.interactionSteps.find((item) => item.id === input.stepId);
    const answer = input.answer.trim().toLowerCase();
    const criteria = step?.successCriteria ?? [];
    const matchedCriteria = criteria.filter((criterion) =>
      criterion
        .toLowerCase()
        .split(/[\s/，、]+/)
        .some((word) => word.length > 2 && answer.includes(word))
    );
    const structuralSignal = includesAny(answer, ["because", "although", "who", "likely", "watching", "want to"]);
    const score = Math.min(92, 52 + matchedCriteria.length * 18 + (structuralSignal ? 12 : 0));
    const mainProblem: LearningDiagnosis["mainProblem"] =
      score >= 78
        ? "none"
        : step?.type === "vocabulary_in_context"
          ? "vocabulary"
          : step?.type === "structure_discovery"
            ? "sentence_structure"
            : step?.type === "guided_response" || step?.type === "free_response"
              ? "expression"
              : "logic";

    const recommendedNextPart: NextPartType =
      mainProblem === "none"
        ? step?.type === "free_response"
          ? "writing_application"
          : "continue_same_level"
        : mainProblem === "vocabulary"
          ? "review_vocabulary"
          : mainProblem === "sentence_structure"
            ? "simplify_sentence"
            : "imitation_practice";

    const purpose = getStepPurpose(step?.type);
    const expectedAnswer = buildExpectedAnswer(input.scenario, step);
    const studentGap = buildStudentGap({
      answer: input.answer,
      expectedAnswer,
      mainProblem,
      score,
      stepType: step?.type
    });
    const correctionFocus = buildCorrectionFocus(mainProblem, step?.type, expectedAnswer);
    const relevance =
      score >= 78
        ? `你的回答命中了本题目的。关键不是“对错”，而是你抓住了：${expectedAnswer}`
        : score >= 62
          ? `你的回答和题目目的有部分关联，但还缺少关键点：${studentGap}`
          : `你的回答偏离了题目目的。这个问题要你回答的是：${expectedAnswer}；你现在的问题是：${studentGap}`;

    const diagnosis: LearningDiagnosis = {
      taskId: `${input.scenario.id}:${input.stepId}`,
      comprehensionScore: score,
      vocabularyScore: mainProblem === "vocabulary" ? score : Math.max(68, score - 4),
      grammarScore: mainProblem === "sentence_structure" ? score : Math.max(66, score - 6),
      sentenceStructureScore: mainProblem === "sentence_structure" ? score : Math.max(66, score - 4),
      expressionScore: mainProblem === "expression" ? score : Math.max(64, score - 5),
      logicScore: step?.type === "comprehension_check" || step?.type === "meaning_discovery" ? score : undefined,
      mainProblem,
      errorPatterns:
        mainProblem === "none"
          ? []
          : ["回答里已经有意思，但还没有把场景意图、结构关系或关键词说清楚"],
      masteredPoints: mainProblem === "none" ? [input.scenario.expressionGoal] : [],
      weakPoints:
        mainProblem === "none"
          ? []
          : [input.scenario.hiddenGrammarPoints[0] ?? input.scenario.expressionGoal],
      recommendedNextPart,
      reason:
        mainProblem === "none"
          ? "你先理解了场景里的意思，再能把表达逻辑说出来，可以继续推进。"
          : "当前回答更像抓到零散词，还需要回到场景里的表达目的。"
    };

    return {
      feedback: {
        isGrammarCorrect: score >= 72,
        isNatural: score >= 76,
        errorPosition: mainProblem === "none" ? "没有明显问题" : "场景意图或结构关系",
        aiProvider: "local_fallback",
        aiStatus: "MiniMax was unavailable or could not be parsed; local rule feedback was used.",
        reason:
          mainProblem === "none"
            ? "你已经理解了这句话在场景里的作用。"
            : "先不用背语法名，先说清这句话想完成什么表达任务。",
        questionPurpose: purpose,
        relevanceJudgement: relevance,
        purposeAlignmentScore: score,
        expectedAnswer,
        studentGap,
        correctionFocus,
        revisedVersion: input.answer || input.scenario.targetExpressions[0],
        naturalVersion: input.scenario.targetExpressions[0],
        encouragement: "这一步关注的是真实表达，不是选择题对错。",
        nextStep: nextPartLabels[recommendedNextPart]
      },
      diagnosis,
      nextPart: createNextPart(recommendedNextPart)
    };
  },

  async generateSentence(input: SentenceGenerationInput): Promise<SentenceLesson> {
    const lesson = sentenceLessons.find((item) =>
      input.difficulty === "简单" ? item.id === "s1-like-coffee" : item.id === "s1-morning-study"
    );
    return lesson ?? sentenceLessons[0];
  },

  async evaluateImitation(
    lesson: SentenceLesson,
    studentSentence: string,
    recentRecords: StudyRecord[] = []
  ): Promise<{ feedback: FeedbackResult; diagnosis: LearningDiagnosis; nextPart: NextPart }> {
    const answer = studentSentence.trim();
    const hasSubject = includesAny(answer, ["i ", "he ", "she ", "we ", "they ", "my "]);
    const hasVerb = includesAny(answer, ["like", "likes", "study", "studies", "is", "are", "read", "play"]);
    const hasReason = includesAny(answer, ["because", "so", "although"]);
    const tooShort = answer.split(/\s+/).filter(Boolean).length < 3;
    const thirdPersonProblem = /\b(she|he)\s+(study|like)\b/i.test(answer);

    const grammarScore = thirdPersonProblem ? 58 : hasVerb ? 82 : 48;
    const sentenceStructureScore = hasSubject && hasVerb ? 84 : tooShort ? 42 : 64;
    const expressionScore = hasReason || answer.length > 28 ? 82 : 68;
    const vocabularyScore = answer.length > 0 ? 76 : 35;
    const comprehensionScore =
      Math.round((grammarScore + sentenceStructureScore + expressionScore + vocabularyScore) / 4);

    const mainProblem: LearningDiagnosis["mainProblem"] =
      answer.length === 0
        ? "expression"
        : !hasSubject || !hasVerb
          ? "sentence_structure"
          : thirdPersonProblem
            ? "grammar"
            : vocabularyScore < 60
              ? "vocabulary"
              : expressionScore < 75
                ? "expression"
                : "none";

    const recommendedNextPart: NextPartType =
      mainProblem === "sentence_structure"
        ? "simplify_sentence"
        : mainProblem === "grammar"
          ? "review_grammar"
          : mainProblem === "vocabulary"
            ? "review_vocabulary"
            : mainProblem === "expression"
              ? "imitation_practice"
              : comprehensionScore >= 88
                ? "sentence_expansion"
                : "continue_same_level";

    const revisedVersion =
      thirdPersonProblem
        ? answer.replace(/\b(She|He|she|he)\s+(study|like)\b/, (match, subject, verb) =>
            `${subject} ${verb === "study" ? "studies" : "likes"}`
          )
        : answer || "I like reading in the evening.";

    const feedback: FeedbackResult = {
      isGrammarCorrect: grammarScore >= 75,
      isNatural: expressionScore >= 75,
      errorPosition:
        mainProblem === "none"
          ? "没有明显错误"
          : mainProblem === "sentence_structure"
            ? "句子主干不完整"
            : mainProblem === "grammar"
              ? "谓语动词形式"
              : "表达还不够具体",
      reason:
        mainProblem === "none"
          ? "你的句子有清楚的主语和谓语，意思也能读懂。"
          : "先确保句子有一个清楚的主干，再添加时间、地点或原因。",
      revisedVersion,
      naturalVersion:
        mainProblem === "none" && hasReason
          ? answer
          : "I like reading in the evening because it helps me relax.",
      encouragement: "你已经完成了从理解到仿写的第一步，下一步只练一个小目标。",
      nextStep: nextPartLabels[recommendedNextPart]
    };

    let diagnosis: LearningDiagnosis = {
      taskId: lesson.id,
      comprehensionScore,
      vocabularyScore,
      grammarScore,
      sentenceStructureScore,
      expressionScore,
      mainProblem,
      errorPatterns:
        mainProblem === "none"
          ? []
          : [
              mainProblem === "grammar"
                ? "第三人称单数动词未变化"
                : mainProblem === "sentence_structure"
                  ? "缺少清楚的主语或谓语"
                  : "句子意思能表达，但还不够自然具体"
            ],
      masteredPoints:
        mainProblem === "none" ? [...lesson.grammarPoints, "能完成基础仿写"] : ["能尝试输出英文句子"],
      weakPoints:
        mainProblem === "none"
          ? []
          : [mainProblem === "grammar" ? lesson.grammarPoints[0] : "句子主干和表达完整度"],
      recommendedNextPart,
      reason:
        mainProblem === "none"
          ? "当前句子理解稳定，可以开始加信息，让短句变成长一点。"
          : "当前回答暴露出一个主要问题，先补这个点，再进入下一步。"
    };

    const adaptiveNextPart = adaptNextPartWithHistory(diagnosis, recentRecords);
    diagnosis = {
      ...diagnosis,
      recommendedNextPart: adaptiveNextPart,
      reason:
        adaptiveNextPart !== recommendedNextPart
          ? "结合最近几次记录，系统发现同类表现正在重复出现，所以先调整下一步。"
          : diagnosis.reason
    };

    return {
      feedback: { ...feedback, nextStep: nextPartLabels[adaptiveNextPart] },
      diagnosis,
      nextPart: createNextPart(adaptiveNextPart)
    };
  },

  async evaluateParagraph(
    paragraph: ParagraphLesson,
    summary: string
  ): Promise<{ diagnosis: LearningDiagnosis; nextPart: NextPart }> {
    const mentionsTopic = includesAny(summary, ["habit", "习惯", "study", "学习", "wisely", "有效"]);
    const mentionsContrast = includesAny(summary, ["but", "however", "不是", "而是", "比"]);
    const logicScore = mentionsTopic && mentionsContrast ? 86 : mentionsTopic ? 72 : 48;
    const recommendedNextPart: NextPartType =
      logicScore >= 85 ? "writing_application" : logicScore >= 65 ? "paragraph_logic" : "simplify_sentence";

    return {
      diagnosis: {
        taskId: paragraph.id,
        comprehensionScore: mentionsTopic ? 78 : 52,
        vocabularyScore: 72,
        grammarScore: 70,
        sentenceStructureScore: 74,
        expressionScore: summary.length > 12 ? 76 : 55,
        logicScore,
        mainProblem: logicScore >= 80 ? "none" : "logic",
        errorPatterns: logicScore >= 80 ? [] : ["总结只抓到词，没有说清句子之间的关系"],
        masteredPoints: mentionsTopic ? ["能抓住段落主题"] : [],
        weakPoints: logicScore >= 80 ? [] : ["主题句和总结句的关系"],
        recommendedNextPart,
        reason:
          logicScore >= 80
            ? "你能抓住主题和转折，可以把段落逻辑迁移到写作。"
            : "段落理解需要先说清主题，再说明后面句子如何支撑它。"
      },
      nextPart: createNextPart(recommendedNextPart)
    };
  }
};

function getStepPurpose(type?: string) {
  if (type === "context_intro") return "先判断语言发生的真实场景和说话目的";
  if (type === "comprehension_check") return "抓住英文材料的大意，而不是逐词硬翻";
  if (type === "meaning_discovery") return "发现某个表达在句子里承担的意义功能";
  if (type === "structure_discovery") return "把句子按意义块切开，看清结构服务于什么表达";
  if (type === "vocabulary_in_context") return "理解单词在当前语境中的具体用法";
  if (type === "guided_response") return "借用当前表达结构完成自己的真实表达";
  if (type === "free_response") return "把学到的表达迁移到新场景";
  if (type === "reflection") return "说明这个表达适合用在什么语言任务里";
  return "完成当前场景中的一个具体语言动作";
}

function buildExpectedAnswer(scenario: LearningScenario, step?: { id: string; type: string; successCriteria: string[] }) {
  if (!step) return scenario.expressionGoal;
  if (step.successCriteria.length > 0) {
    return step.successCriteria
      .map((criterion) => criterion.replace(/^能/, "").replace(/^选择/, ""))
      .join("；");
  }
  if (step.type === "context_intro") return `判断这是一个${scenario.realWorldContext}中的真实表达任务`;
  if (step.type === "guided_response") return `使用 ${scenario.targetExpressions[0]} 完成自己的表达`;
  return scenario.expressionGoal;
}

function buildStudentGap(input: {
  answer: string;
  expectedAnswer: string;
  mainProblem: LearningDiagnosis["mainProblem"];
  score: number;
  stepType?: string;
}) {
  if (input.score >= 78) return "没有明显缺口，可以继续推进。";
  if (input.answer.trim().length === 0) return "还没有作答，系统无法判断你是否理解了问题目的。";
  if (input.mainProblem === "vocabulary") return "你可能知道大概意思，但没有把关键词在当前语境中的用法说出来。";
  if (input.mainProblem === "sentence_structure") return "你没有把句子按意义块切开，结构关系还不清楚。";
  if (input.mainProblem === "expression") return "你的回答还没有用上本题要迁移的表达结构。";
  if (input.mainProblem === "logic") return "你没有直接回应问题要判断的语言意图或逻辑关系。";
  if (input.stepType === "context_intro") return "回答需要先判断说话人的目的，而不是翻译句子。";
  return `需要补上：${input.expectedAnswer}`;
}

function buildCorrectionFocus(
  problem: LearningDiagnosis["mainProblem"],
  stepType: string | undefined,
  expectedAnswer: string
) {
  if (problem === "none") return "保留这个理解，进入下一步。";
  if (problem === "vocabulary") return `回到关键词，说明它在这句话里如何帮助表达：${expectedAnswer}`;
  if (problem === "sentence_structure") return `先切成两个意义块，再回答：${expectedAnswer}`;
  if (problem === "expression") return `不要自由发挥太散，先套用本题结构：${expectedAnswer}`;
  if (problem === "logic" || stepType === "context_intro") return `直接回答本题核心：${expectedAnswer}`;
  return `先补上本题参考答案中的关键点：${expectedAnswer}`;
}
