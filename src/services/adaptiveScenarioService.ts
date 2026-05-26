import type { CheckInReport, LearningScenario, LearningVersion, PlacementResult, ProgressState } from "../types/learning";

const uniqueById = (scenarios: LearningScenario[]) => {
  const seen = new Set<string>();
  return scenarios.filter((scenario) => {
    if (seen.has(scenario.id)) return false;
    seen.add(scenario.id);
    return true;
  });
};

const textIncludesAny = (text: string, terms: string[]) => {
  const normalized = text.toLowerCase();
  return terms.some((term) => normalized.includes(term.toLowerCase()));
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
  const word = report.newWordsLearned[0] ?? "help";
  const grammar = report.grammarPracticed[0] ?? (isJunior ? "because 原因" : "because / although");
  const mistake = report.mistakesEncountered?.[0] ?? report.mainMistake;
  const languageInput = isJunior
    ? `Yesterday I met the word "${word}". Today I can use it in one new school sentence.`
    : `Yesterday's weak point was ${mistake}. Today I will reuse "${word}" and the pattern ${grammar} in a new situation.`;
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
    hiddenGrammarPoints: Array.from(new Set([grammar, "复习后迁移"])),
    vocabularyFocus: report.newWordsLearned.slice(0, isJunior ? 3 : 5),
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

const scoreScenario = (scenario: LearningScenario, placement?: PlacementResult, previousReport?: CheckInReport) => {
  let score = 0;
  const haystack = [
    scenario.title,
    scenario.realWorldContext,
    scenario.taskGoal,
    scenario.languageInput,
    scenario.expressionGoal,
    scenario.transferContext,
    ...scenario.hiddenGrammarPoints,
    ...scenario.vocabularyFocus,
    ...scenario.targetExpressions
  ].join(" ");

  if (placement?.weakAreas.some((weak) => weak.includes("场景") && textIncludesAny(haystack, ["meaning", "purpose", "wants", "real intention", "choose"]))) {
    score += 8;
  }
  if (placement?.weakAreas.some((weak) => weak.includes("表达") && textIncludesAny(haystack, ["natural", "polite", "because", "really", "expression"]))) {
    score += 8;
  }
  if (placement?.weakAreas.some((weak) => weak.includes("迁移") && textIncludesAny(haystack, ["transfer", "new situation", "own", "use"]))) {
    score += 8;
  }

  if (previousReport) {
    if (previousReport.grammarPracticed.some((grammar) => textIncludesAny(haystack, [grammar.split(" ")[0], grammar]))) score += 10;
    if (previousReport.newWordsLearned.some((word) => textIncludesAny(haystack, [word]))) score += 6;
    if (previousReport.mistakesEncountered?.some((mistake) => textIncludesAny(haystack, mistake.split(/\s+/).filter((item) => item.length > 4).slice(0, 4)))) {
      score += 4;
    }
  }

  return score;
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
  const scored = basePool
    .map((scenario, index) => ({
      index,
      scenario,
      score: scoreScenario(scenario, placement, previousReport)
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((item) => item.scenario);

  const bridges: LearningScenario[] = [];
  if (dayNumber === 1 && placement) bridges.push(placementBridgeScenario(placement, learningVersion));
  if (dayNumber > 1 && previousReport) bridges.push(reportReviewScenario(previousReport, learningVersion));

  return uniqueById([...bridges, ...scored]);
};
