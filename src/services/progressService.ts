import type {
  CheckInMilestone,
  CheckInReport,
  DailyReviewCompletion,
  LearningVersion,
  OutOfSyllabusWordRecord,
  PlacementResult,
  ProgressState,
  StudyRecord,
  UnknownWordRecord
} from "../types/learning";
import { supplementalDictionary } from "../data/supplementalDictionary";
import { DEFAULT_LOCAL_LEARNER_ID } from "./learnerProfileService";

const STORAGE_KEY = "english-grammar-sense-progress";
const legacyStorageKeyFor = (version: LearningVersion = "high_school") =>
  version === "high_school" ? STORAGE_KEY : `${STORAGE_KEY}-${version}`;
const storageKeyFor = (version: LearningVersion = "high_school", learnerId = DEFAULT_LOCAL_LEARNER_ID) =>
  `${STORAGE_KEY}-${learnerId}-${version}`;
const milestoneDays: Array<{ day: number; milestone: CheckInMilestone }> = [
  { day: 7, milestone: "day_7" },
  { day: 15, milestone: "day_15" },
  { day: 30, milestone: "day_30" },
  { day: 60, milestone: "day_60" },
  { day: 120, milestone: "day_120" },
  { day: 240, milestone: "day_240" }
];

type UnknownWordDraft = Omit<UnknownWordRecord, "firstSeenAt" | "lastSeenAt" | "lookupCount" | "mastered">;
type OutOfSyllabusWordDraft = Omit<OutOfSyllabusWordRecord, "firstSeenAt" | "lastSeenAt" | "lookupCount" | "optional">;

const wordForms = (word: string) => {
  const base = word.toLowerCase();
  const forms = new Set([base, `${base}s`, `${base}ed`, `${base}ing`]);
  if (base.endsWith("e")) {
    forms.add(`${base}d`);
    forms.add(`${base.slice(0, -1)}ing`);
  }
  if (base.endsWith("y")) {
    forms.add(`${base.slice(0, -1)}ies`);
    forms.add(`${base.slice(0, -1)}ied`);
  }
  if (base === "submit") forms.add("submitted");
  if (base === "stand") forms.add("stood");
  if (base === "study") {
    forms.add("studies");
    forms.add("studied");
  }
  return forms;
};

const sentenceContainsWord = (sentence: string, word: string) => {
  const forms = wordForms(word);
  const tokens = sentence.toLowerCase().match(/[a-z']+/g) ?? [];
  return tokens.some((token) => forms.has(token));
};

const resolveSourceSentence = (
  currentSource: string,
  incomingSource: string,
  word: Pick<UnknownWordRecord, "word" | "normalized" | "meaning" | "partOfSpeech" | "phonetic">
) => {
  const candidates = [word.normalized, word.word].filter(Boolean);
  if (currentSource && candidates.some((candidate) => sentenceContainsWord(currentSource, candidate))) {
    return currentSource;
  }
  if (incomingSource && candidates.some((candidate) => sentenceContainsWord(incomingSource, candidate))) {
    return incomingSource;
  }
  return currentSource || incomingSource || "";
};

const repairUnknownWordSources = (unknownWords: UnknownWordRecord[] = []) =>
  unknownWords.map((word) => ({
    ...word,
    sourceSentence: resolveSourceSentence(word.sourceSentence, "", word)
  }));

const outOfSyllabusLevels = new Set(["拓展", "大学及以上", "词库缺项"]);

const isKnownOutOfSyllabusWord = (word: Pick<UnknownWordRecord, "normalized" | "meaning">) => {
  const normalized = word.normalized.toLowerCase();
  const supplemental = supplementalDictionary[normalized];
  return Boolean(
    word.meaning.startsWith("超纲词") ||
      (supplemental && outOfSyllabusLevels.has(supplemental.level))
  );
};

const withSupplementalMeaning = <T extends { normalized: string; word: string; meaning: string; phonetic?: string }>(
  word: T
): T => {
  const supplemental = supplementalDictionary[word.normalized.toLowerCase()];
  if (!supplemental) return word;
  return {
    ...word,
    word: supplemental.word || word.word,
    meaning: supplemental.meaning || word.meaning,
    phonetic: supplemental.phonetic ?? word.phonetic
  };
};

const migrateOutOfSyllabusUnknownWords = (
  unknownWords: UnknownWordRecord[],
  outOfSyllabusWords: OutOfSyllabusWordRecord[] = []
) => {
  const optionalWords = new Map(
    outOfSyllabusWords.map((word) => [word.normalized, withSupplementalMeaning(word)])
  );
  const requiredWords: UnknownWordRecord[] = [];

  for (const word of unknownWords) {
    const normalized = word.normalized.toLowerCase();
    if (!isKnownOutOfSyllabusWord({ ...word, normalized })) {
      requiredWords.push(word);
      continue;
    }

    const existing = optionalWords.get(normalized);
    optionalWords.set(normalized, withSupplementalMeaning({
      word: existing?.word ?? word.word,
      normalized,
      meaning: existing?.meaning ?? word.meaning,
      phonetic: existing?.phonetic ?? word.phonetic,
      sourceSentence: existing?.sourceSentence ?? word.sourceSentence,
      reason: "Moved from required vocabulary because it is beyond the high-school core list.",
      firstSeenAt: existing?.firstSeenAt ?? word.firstSeenAt,
      lastSeenAt: word.lastSeenAt,
      lookupCount: Math.max(existing?.lookupCount ?? 0, word.lookupCount),
      optional: true
    }));
  }

  return {
    unknownWords: requiredWords,
    outOfSyllabusWords: [...optionalWords.values()]
  };
};

const milestoneForDay = (dayNumber: number): CheckInMilestone => {
  const match = [...milestoneDays].reverse().find((item) => dayNumber >= item.day);
  return match?.milestone ?? "day_7";
};

const freshDefaultProgress = (): ProgressState => ({
  ...defaultProgress,
  records: defaultProgress.records.map((record) => ({ ...record, date: new Date().toISOString() })),
  stageAssessments: [],
  checkInReports: [],
  dailyReviewCompletions: [],
  unknownWords: [],
  outOfSyllabusWords: [],
  longTermProgress: {
    ...defaultProgress.longTermProgress,
    weakAreas: [...defaultProgress.longTermProgress.weakAreas],
    grammarCompletedIds: [...defaultProgress.longTermProgress.grammarCompletedIds]
  },
  masteredWords: [...defaultProgress.masteredWords],
  trainedGrammarPoints: [...defaultProgress.trainedGrammarPoints],
  weakGrammarPoints: [...defaultProgress.weakGrammarPoints]
});

const parseProgress = (raw: string): ProgressState => {
  const progress = { ...freshDefaultProgress(), ...JSON.parse(raw) } as ProgressState;
  const repairedWords = repairUnknownWordSources(progress.unknownWords);
  const migratedWords = migrateOutOfSyllabusUnknownWords(repairedWords, progress.outOfSyllabusWords ?? []);
  return {
    ...progress,
    dailyReviewCompletions: progress.dailyReviewCompletions ?? [],
    unknownWords: migratedWords.unknownWords,
    outOfSyllabusWords: migratedWords.outOfSyllabusWords
  };
};

export const defaultProgress: ProgressState = {
  currentStage: 1,
  completedSentences: 0,
  masteredWords: ["like", "coffee", "interesting"],
  trainedGrammarPoints: ["主语 + 谓语 + 宾语"],
  weakGrammarPoints: ["第三人称单数"],
  imitationAccuracy: 72,
  longSentenceAccuracy: 58,
  paragraphSummaryQuality: 64,
  dailyTargets: {
    shortSentences: 5,
    expandedSentences: 3,
    longSentences: 1,
    paragraphs: 1,
    words: 5
  },
  records: [
    {
      id: "seed-1",
      date: new Date().toISOString(),
      type: "sentence",
      prompt: "I like coffee.",
      studentAnswer: "I like music."
    }
  ],
  stageAssessments: [],
  checkInReports: [],
  dailyReviewCompletions: [],
  longTermProgress: {
    currentDay: 1,
    streakCount: 0,
    currentMilestone: "day_7",
    vocabularyKnownCount: 3,
    vocabularyActiveUseCount: 1,
    grammarCompletedIds: ["grammar-because"],
    readingLevel: "sentence",
    writingLevel: "sentence",
    weakAreas: ["词汇语境使用", "句子主干识别"],
    nextMilestoneGoal: "7 天内建立句子感：读懂简单场景句，并写出自己的简单句。"
  },
  unknownWords: [],
  outOfSyllabusWords: []
};

export const progressService = {
  load(version: LearningVersion = "high_school", learnerId = DEFAULT_LOCAL_LEARNER_ID): ProgressState {
    try {
      const key = storageKeyFor(version, learnerId);
      const raw = localStorage.getItem(key);
      if (raw) return parseProgress(raw);

      const legacyRaw = learnerId === DEFAULT_LOCAL_LEARNER_ID ? localStorage.getItem(legacyStorageKeyFor(version)) : null;
      if (legacyRaw) {
        localStorage.setItem(key, legacyRaw);
        return parseProgress(legacyRaw);
      }

      return freshDefaultProgress();
    } catch {
      return freshDefaultProgress();
    }
  },

  save(progress: ProgressState, version: LearningVersion = "high_school", learnerId = DEFAULT_LOCAL_LEARNER_ID) {
    localStorage.setItem(storageKeyFor(version, learnerId), JSON.stringify(progress));
  },

  addRecord(progress: ProgressState, record: StudyRecord): ProgressState {
    const completedSentences =
      record.type === "sentence" || record.type === "scenario"
        ? progress.completedSentences + 1
        : progress.completedSentences;
    const weakGrammarPoints = record.diagnosis?.weakPoints.length
      ? Array.from(new Set([...progress.weakGrammarPoints, ...record.diagnosis.weakPoints]))
      : progress.weakGrammarPoints;
    const trainedGrammarPoints = record.diagnosis?.masteredPoints.length
      ? Array.from(new Set([...progress.trainedGrammarPoints, ...record.diagnosis.masteredPoints]))
      : progress.trainedGrammarPoints;

    return {
      ...progress,
      completedSentences,
      weakGrammarPoints,
      trainedGrammarPoints,
      imitationAccuracy: record.diagnosis?.expressionScore ?? progress.imitationAccuracy,
      records: [record, ...progress.records].slice(0, 30)
    };
  },

  addStageAssessment(progress: ProgressState, assessment: ProgressState["stageAssessments"][number]): ProgressState {
    const assessmentRecord: StudyRecord = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      type: "assessment",
      prompt: assessment.title,
      studentAnswer: assessment.result?.learningSummary
    };

    return {
      ...progress,
      stageAssessments: [assessment, ...progress.stageAssessments].slice(0, 10),
      records: [assessmentRecord, ...progress.records].slice(0, 30)
    };
  },

  addUnknownWord(
    progress: ProgressState,
    word: UnknownWordDraft
  ): ProgressState {
    const now = new Date().toISOString();
    const normalized = word.normalized.toLowerCase();
    const existing = progress.unknownWords.find((item) => item.normalized === normalized);
    const unknownWords = existing
      ? progress.unknownWords.map((item) =>
          item.normalized === normalized
            ? {
                ...item,
                lastSeenAt: now,
                lookupCount: item.lookupCount + 1,
                meaning: item.meaning || word.meaning,
                partOfSpeech: item.partOfSpeech ?? word.partOfSpeech,
                phonetic: item.phonetic ?? word.phonetic,
                sourceSentence: resolveSourceSentence(item.sourceSentence, word.sourceSentence, {
                  ...word,
                  normalized
                })
              }
            : item
        )
      : [
          ...progress.unknownWords,
          {
            ...word,
            normalized,
            sourceSentence: resolveSourceSentence("", word.sourceSentence, {
              ...word,
              normalized
            }),
            firstSeenAt: now,
            lastSeenAt: now,
            lookupCount: 1,
            mastered: false
          }
        ];

    return {
      ...progress,
      unknownWords,
      longTermProgress: {
        ...progress.longTermProgress,
        weakAreas: Array.from(new Set([...progress.longTermProgress.weakAreas, "生词累计与复习"]))
      }
    };
  },

  masterUnknownWords(progress: ProgressState, normalizedWords: string[]): ProgressState {
    const targets = new Set(normalizedWords.map((word) => word.toLowerCase()));
    const mastered = progress.unknownWords.filter((word) => targets.has(word.normalized));
    return {
      ...progress,
      masteredWords: Array.from(new Set([...progress.masteredWords, ...mastered.map((word) => word.word)])),
      unknownWords: progress.unknownWords.map((word) =>
        targets.has(word.normalized) ? { ...word, mastered: true } : word
      ),
      longTermProgress: {
        ...progress.longTermProgress,
        vocabularyKnownCount: progress.longTermProgress.vocabularyKnownCount + mastered.length,
        vocabularyActiveUseCount: progress.longTermProgress.vocabularyActiveUseCount + mastered.length
      }
    };
  },

  addOutOfSyllabusWord(progress: ProgressState, word: OutOfSyllabusWordDraft): ProgressState {
    const now = new Date().toISOString();
    const normalized = word.normalized.toLowerCase();
    const existing = progress.outOfSyllabusWords.find((item) => item.normalized === normalized);
    const outOfSyllabusWords = existing
      ? progress.outOfSyllabusWords.map((item) =>
          item.normalized === normalized
            ? {
                ...item,
                lastSeenAt: now,
                lookupCount: item.lookupCount + 1,
                sourceSentence: item.sourceSentence || word.sourceSentence,
                reason: word.reason || item.reason
              }
            : item
        )
      : [
          ...progress.outOfSyllabusWords,
          {
            ...word,
            normalized,
            firstSeenAt: now,
            lastSeenAt: now,
            lookupCount: 1,
            optional: true as const
          }
        ];

    return {
      ...progress,
      outOfSyllabusWords,
      longTermProgress: {
        ...progress.longTermProgress,
        weakAreas: Array.from(new Set([...progress.longTermProgress.weakAreas, "超纲词可选学习"]))
      }
    };
  },

  addCheckInReport(progress: ProgressState, report: CheckInReport): ProgressState {
    const reportRecord: StudyRecord = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      type: "assessment",
      prompt: `Day ${report.dayNumber} 学习总结`,
      studentAnswer: report.nextDayFocus
    };

    return {
      ...progress,
      checkInReports: [report, ...progress.checkInReports].slice(0, 240),
      longTermProgress: {
        ...progress.longTermProgress,
        currentDay: Math.max(progress.longTermProgress.currentDay, report.dayNumber + 1),
        streakCount: report.streakCount,
        currentMilestone: milestoneForDay(report.dayNumber + 1),
        nextMilestoneGoal: report.nextDayFocus,
        weakAreas: Array.from(new Set([...progress.longTermProgress.weakAreas, report.mainMistake]))
      },
      records: [reportRecord, ...progress.records].slice(0, 30)
    };
  },

  completeDailyReview(progress: ProgressState, completion: DailyReviewCompletion): ProgressState {
    const existing = new Set(progress.dailyReviewCompletions.map((item) => item.dayNumber));
    const dailyReviewCompletions = existing.has(completion.dayNumber)
      ? progress.dailyReviewCompletions.map((item) => (item.dayNumber === completion.dayNumber ? completion : item))
      : [completion, ...progress.dailyReviewCompletions].slice(0, 240);

    return {
      ...progress,
      dailyReviewCompletions,
      records: [
        {
          id: crypto.randomUUID(),
          date: completion.completedAt,
          type: "assessment" as const,
          prompt: `Day ${completion.dayNumber} warm-up review`,
          studentAnswer: [...completion.reviewWords, ...completion.reviewMistakes].join("; ")
        },
        ...progress.records
      ].slice(0, 30)
    };
  },

  applyPlacementResult(progress: ProgressState, result: PlacementResult): ProgressState {
    const dailyTargets =
      result.studyPace === "gentle"
        ? { shortSentences: 3, expandedSentences: 1, longSentences: 0, paragraphs: 0, words: 4 }
        : result.studyPace === "stretch"
          ? { shortSentences: 6, expandedSentences: 3, longSentences: 1, paragraphs: 1, words: 8 }
          : { shortSentences: 4, expandedSentences: 2, longSentences: 1, paragraphs: 0, words: 6 };

    const currentStage = result.level === "high_school_growth" ? 2 : 1;
    const writingLevel = result.transferScore >= 76 ? "paragraph" : "sentence";
    const readingLevel = result.readingScore >= 76 ? "short_paragraph" : "sentence";
    const placementRecord: StudyRecord = {
      id: crypto.randomUUID(),
      date: result.completedAt,
      type: "assessment",
      prompt: "首次能力定位",
      studentAnswer: result.recommendedStart
    };

    return {
      ...progress,
      currentStage,
      dailyTargets,
      imitationAccuracy: Math.max(45, result.expressionScore),
      longSentenceAccuracy: Math.max(40, result.readingScore - 8),
      paragraphSummaryQuality: Math.max(40, result.transferScore - 8),
      weakGrammarPoints: Array.from(new Set([...progress.weakGrammarPoints, ...result.weakAreas])),
      records: [placementRecord, ...progress.records].slice(0, 30),
      longTermProgress: {
        ...progress.longTermProgress,
        currentDay: 1,
        readingLevel,
        writingLevel,
        weakAreas: Array.from(new Set([...progress.longTermProgress.weakAreas, ...result.weakAreas])),
        nextMilestoneGoal: result.firstWeekPlan[0] ?? result.recommendedStart
      }
    };
  },

  reset(version: LearningVersion = "high_school", learnerId = DEFAULT_LOCAL_LEARNER_ID): ProgressState {
    localStorage.removeItem(storageKeyFor(version, learnerId));
    return freshDefaultProgress();
  }
};
