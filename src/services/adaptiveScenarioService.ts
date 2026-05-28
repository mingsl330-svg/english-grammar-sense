import type { CheckInReport, LearningScenario, LearningVersion, PlacementResult, ProgressState } from "../types/learning";

const uniqueById = (scenarios: LearningScenario[]) => {
  const seen = new Set<string>();
  return scenarios.filter((scenario) => {
    if (seen.has(scenario.id)) return false;
    seen.add(scenario.id);
    return true;
  });
};

const hasCjk = (text: string) => /[\u4e00-\u9fff]/.test(text);

const firstEnglishToken = (text: string) => text.match(/[A-Za-z][A-Za-z'-]{1,24}/)?.[0];

const safeReviewWord = (words: string[], fallback: string) => {
  for (const word of words) {
    const token = firstEnglishToken(word);
    if (token) return token;
  }
  return fallback;
};

const safeReviewWords = (words: string[], limit: number) =>
  Array.from(new Set(words.map(firstEnglishToken).filter((word): word is string => Boolean(word)))).slice(0, limit);

const safePatternLabel = (grammar: string) => {
  const normalized = grammar.toLowerCase();
  if (normalized.includes("not because")) return "not because ..., but because ...";
  if (normalized.includes("because")) return "because for giving a reason";
  if (normalized.includes("although")) return "although for balancing two ideas";
  if (/\bas\b/.test(normalized)) return "as for showing a background change";
  if (normalized.includes("even when")) return "even when for keeping action during difficulty";
  if (normalized.includes("who")) return "who for adding detail about a person or group";
  if (normalized.includes("which")) return "which for adding a result or extra detail";
  if (normalized.includes("if")) return "if for conditions";
  if (normalized.includes("when")) return "when for time or situation";
  if (normalized.includes("before")) return "before doing for action order";
  if (normalized.includes("need to")) return "need to for necessary action";
  if (normalized.includes("had to")) return "had to for necessary past action";
  if (normalized.includes("can")) return "can for ability or permission";
  if (normalized.includes("will")) return "will for a next action";
  if (normalized.includes("going to")) return "going to for a plan";
  return hasCjk(grammar) ? "today's sentence pattern" : grammar;
};

const safeWeakPointLabel = (mistake?: string) => {
  const clean = (mistake ?? "").replace(/\s+/g, " ").trim();
  const normalized = clean.toLowerCase();
  if (normalized.includes("chose")) return "choosing the sentence purpose";
  if (normalized.includes("because-clause") || normalized.includes("because clause")) return "using a because-clause to explain motivation";
  if (normalized.includes("vocabulary")) return "using a key word in context";
  if (normalized.includes("sentence_structure")) return "finding the sentence structure";
  if (normalized.includes("grammar")) return "using the pattern in a real situation";
  if (normalized.includes("expression")) return "making the expression natural";
  if (normalized.includes("transfer")) return "moving the expression into a new scene";
  if (clean && !hasCjk(clean) && /^[A-Za-z0-9 ,.'":;!?()/-]+$/.test(clean) && clean.length <= 100) {
    return clean.replace(/^main issue:\s*/i, "");
  }
  return "yesterday's main learning point";
};

const placementBridgeScenario = (placement: PlacementResult, version: LearningVersion): LearningScenario => {
  const isJunior = version === "primary_junior";
  const weak = placement.weakAreas[0] ?? "迁移表达";
  const expressionWeak = weak.includes("表达");
  const transferWeak = weak.includes("迁移");
  const languageInput = expressionWeak
    ? isJunior
      ? "I really like English class because my teacher helps me understand new words."
      : "I really enjoy this club because I can meet new friends and practice speaking naturally."
    : transferWeak
      ? isJunior
        ? "Thank you for helping me. I will try the sentence again by myself."
        : "Thank you for helping me practice speaking. I will keep trying and speak more clearly next time."
      : isJunior
        ? "I forgot my notebook. Can I look at yours for a minute?"
        : "I stayed up finishing the poster, so I may need a little help before I present.";

  const correctOption = expressionWeak
    ? "It sounds natural and gives a real reason"
    : transferWeak
      ? "It thanks someone and says the next action"
      : "It shows what the speaker really needs";

  return {
    id: `placement-bridge-${placement.completedAt}-${version}`,
    type: isJunior ? "school_life" : "classroom_discussion",
    sourceCategory: "daily_life",
    sourceNote: `Placement bridge · ${placement.level} · ${weak}`,
    title: "Start From Your Placement",
    realWorldContext:
      "This first scene comes from your placement result. The goal is to start from the point that needs the most support.",
    studentRole: "Learner using the first placement result",
    taskGoal: expressionWeak
      ? "Make the expression sound natural"
      : transferWeak
        ? "Move a learned expression into your own action"
        : "Read the real intention before answering",
    languageInput,
    targetExpressions: expressionWeak
      ? ["really like / really enjoy", "because ..."]
      : transferWeak
        ? ["Thank you for ...", "I will ..."]
        : ["I forgot ...", "I may need ..."],
    hiddenGrammarPoints: expressionWeak
      ? ["because 原因", "自然表达"]
      : transferWeak
        ? ["Thank you for doing", "will 表示下一步"]
        : ["真实意图理解", "请求帮助"],
    vocabularyFocus: languageInput.match(/[A-Za-z']+/g)?.slice(0, 8) ?? [],
    expressionGoal: "Use the placement result to choose today's first useful English move.",
    transferContext: "Use the same idea in your own school or home situation.",
    interactionSteps: [
      {
        id: "placement-bridge-step",
        type: "meaning_discovery",
        prompt: "Choose the best job of this sentence before you move to new scenes.",
        userInputType: "choice",
        aiFeedbackMode: "after_submit",
        successCriteria: [correctOption, weak],
        choices: [
          correctOption,
          "It only asks you to remember a grammar name",
          "It is unrelated to your first placement result"
        ],
        correctOption,
        optionTags: [
          correctOption,
          "grammar name only",
          "unrelated"
        ],
        optionExplanations: {
          [correctOption]: "This answer connects the first daily task to the placement result.",
          "It only asks you to remember a grammar name": "The app should start from meaning and use, not a grammar title.",
          "It is unrelated to your first placement result": "The first scene is selected because of the placement result."
        },
        teacherHint: "Start with meaning. The grammar name can wait."
      }
    ]
  };
};

const reportReviewScenario = (report: CheckInReport, version: LearningVersion): LearningScenario => {
  const isJunior = version === "primary_junior";
  const word = safeReviewWord(report.newWordsLearned, "help");
  const rawGrammar = report.grammarPracticed[0] ?? (isJunior ? "because for giving a reason" : "because for giving a reason");
  const grammar = safePatternLabel(rawGrammar);
  const mistake = report.mistakesEncountered?.[0] ?? report.mainMistake;
  const weakPoint = safeWeakPointLabel(mistake);
  const languageInput = isJunior
    ? `Yesterday I met the word "${word}". Today I can use it in one new school sentence.`
    : `Yesterday I had trouble with ${weakPoint}. Today I will reuse "${word}" and the pattern ${grammar} in a new situation.`;
  const correctOption = "Review yesterday first, then enter a new scene";

  return {
    id: `day-${report.dayNumber + 1}-review-bridge-${report.id}`,
    type: isJunior ? "school_life" : "classroom_discussion",
    sourceCategory: "daily_life",
    sourceNote: `Review bridge from Day ${report.dayNumber}`,
    title: "Yesterday Comes Back First",
    realWorldContext:
      "Language grows when yesterday's words and patterns return in a fresh situation before new material starts.",
    studentRole: "Learner restarting after yesterday's summary",
    taskGoal: "Reactivate one word, one pattern, and one weak point before new scenes.",
    languageInput,
    targetExpressions: [`use ${word}`, grammar],
    hiddenGrammarPoints: Array.from(new Set([rawGrammar, "复习后迁移"])),
    vocabularyFocus: safeReviewWords(report.newWordsLearned, isJunior ? 3 : 5),
    expressionGoal: "Turn yesterday's trace into today's first usable sentence.",
    transferContext: report.nextDayReviewPlan?.newSceneFocus ?? "Use yesterday's word in a new real-life sentence.",
    interactionSteps: [
      {
        id: "review-bridge-step",
        type: "meaning_discovery",
        prompt: report.nextDayReviewPlan?.firstReviewPrompt ?? "Choose the best first move for today's learning.",
        userInputType: "choice",
        aiFeedbackMode: "after_submit",
        successCriteria: ["review first", word, grammar],
        choices: [
          correctOption,
          "Skip yesterday and only do new questions",
          "Memorize the grammar name without using it"
        ],
        correctOption,
        optionTags: [
          correctOption,
          "skip review",
          "name only"
        ],
        optionExplanations: {
          [correctOption]: "This keeps the learning loop cumulative: review, then new scenes.",
          "Skip yesterday and only do new questions": "New scenes should build on yesterday's real difficulty.",
          "Memorize the grammar name without using it": "The goal is language use, not grammar labels."
        },
        teacherHint: "Use one old word or pattern before adding anything new."
      }
    ]
  };
};

export const buildAdaptiveScenarioPool = ({
  basePool,
  learningVersion,
  placement,
  progress
}: {
  basePool: LearningScenario[];
  learningVersion: LearningVersion;
  placement?: PlacementResult;
  progress: ProgressState;
}) => {
  const dayNumber = progress.longTermProgress.currentDay;
  const previousReport = progress.checkInReports.find((report) => report.dayNumber === dayNumber - 1);
  const bridges: LearningScenario[] = [];
  if (dayNumber === 1 && placement) bridges.push(placementBridgeScenario(placement, learningVersion));
  if (dayNumber > 1 && previousReport) bridges.push(reportReviewScenario(previousReport, learningVersion));

  return uniqueById([...bridges, ...basePool]);
};
