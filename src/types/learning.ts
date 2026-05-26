export type StageId = 1 | 2 | 3 | 4 | 5;

export type Difficulty = "简单" | "中等" | "较难";

export type LearningVersion = "high_school" | "primary_junior";

export type StudyPace = "gentle" | "steady" | "stretch";

export type PlacementLevel =
  | "primary_junior_foundation"
  | "junior_bridge"
  | "high_school_foundation"
  | "high_school_growth";

export interface PlacementResult {
  completedAt: string;
  level: PlacementLevel;
  learningVersion: LearningVersion;
  studyPace: StudyPace;
  readingScore: number;
  expressionScore: number;
  transferScore: number;
  overallScore: number;
  strengths: string[];
  weakAreas: string[];
  recommendedStart: string;
  firstWeekPlan: string[];
  evidence: {
    sceneUnderstanding: string;
    naturalRewrite: string;
    transferExpression: string;
  };
}

export type ScenarioType =
  | "daily_conversation"
  | "school_life"
  | "classroom_discussion"
  | "speech"
  | "news_reading"
  | "literary_reading"
  | "science_article"
  | "social_issue"
  | "email_writing"
  | "interview"
  | "debate"
  | "storytelling"
  | "travel"
  | "application_letter";

export type ScenarioSourceCategory =
  | "recent_hot_topic"
  | "classic_movie_scene"
  | "inspirational_speech"
  | "chinese_traditional_culture"
  | "daily_life"
  | "gaokao_focus"
  | "classic_english_literature";

export type InteractionStepType =
  | "context_intro"
  | "comprehension_check"
  | "meaning_discovery"
  | "structure_discovery"
  | "vocabulary_in_context"
  | "guided_response"
  | "free_response"
  | "rewrite"
  | "role_play"
  | "reflection"
  | "next_part";

export type AnnotationType =
  | "sentence_core"
  | "subject"
  | "verb"
  | "object"
  | "complement"
  | "modifier"
  | "clause"
  | "logical_relation"
  | "vocabulary_usage"
  | "tone"
  | "rhetorical_effect"
  | "expression_function";

export type AssessmentTaskType =
  | "word_in_context_writing"
  | "sentence_pattern_writing"
  | "sentence_annotation"
  | "meaning_annotation"
  | "grammar_correction"
  | "sentence_rewriting"
  | "style_annotation"
  | "paragraph_logic_writing"
  | "scenario_response"
  | "short_essay";

export type CheckInMilestone =
  | "day_7"
  | "day_15"
  | "day_30"
  | "day_60"
  | "day_120"
  | "day_240";

export type VocabularyLevel =
  | "basic_1000"
  | "core_2000"
  | "high_school_3500"
  | "extension_4000";

export type NextPartType =
  | "continue_same_level"
  | "review_vocabulary"
  | "review_grammar"
  | "simplify_sentence"
  | "sentence_expansion"
  | "imitation_practice"
  | "contrast_practice"
  | "long_sentence_analysis"
  | "paragraph_logic"
  | "writing_application"
  | "challenge_level_up";

export interface WordExplanation {
  word: string;
  meaning: string;
  partOfSpeech: string;
  difficulty: "基础" | "高中常用" | "进阶";
  inContext: string;
  senseHint: string;
  collocation: string;
  simpleExample: string;
  writingExample: string;
}

export interface SentenceToken {
  text: string;
  normalized?: string;
  roleId?: string;
  queryable?: boolean;
}

export interface StructureSegment {
  id: string;
  label: string;
  text: string;
  role: string;
}

export interface SenseStep {
  id: string;
  title: string;
  guideQuestion: string;
  explanation: string;
  microPractice: string;
}

export interface SentenceLesson {
  id: string;
  stage: StageId;
  english: string;
  chinese: string;
  trunk: string;
  readingGoal: string;
  naturalSense: string;
  tenseFocus: string;
  usageNotes: string[];
  grammarPoints: string[];
  grammarExplanation: string;
  replacementWords: string[];
  imitationTask: string;
  words: WordExplanation[];
  tokens: SentenceToken[];
  structure: StructureSegment[];
  senseSteps: SenseStep[];
}

export interface ExpansionStep {
  text: string;
  chinese: string;
  added: string;
  role: string;
  positionReason: string;
  imitation: string;
}

export interface LongSentenceAnalysis {
  original: string;
  trunk: string;
  modifiers: string[];
  clauses: string[];
  nonFinite: string[];
  connectors: string[];
  logic: string;
  literalChinese: string;
  naturalChinese: string;
  simplifiedEnglish: string;
  template: string;
}

export interface ParagraphLesson {
  id: string;
  level: "初级" | "中级" | "高级";
  topic: string;
  sentences: string[];
  topicSentenceIndex: number;
  logicMarks: string[];
  pronounReferences: string[];
  summary: string;
  imitationExpressions: string[];
}

export interface EssayLesson {
  id: string;
  type: "说明文" | "议论文" | "记叙文" | "应用文";
  title: string;
  paragraphs: string[];
  structure: string[];
  keywords: string[];
  logic: string[];
  questions: string[];
  writingTask: string;
}

export interface FeedbackResult {
  isGrammarCorrect: boolean;
  isNatural: boolean;
  errorPosition: string;
  reason: string;
  aiProvider?: "minimax" | "local_fallback";
  aiStatus?: string;
  questionPurpose?: string;
  relevanceJudgement?: string;
  purposeAlignmentScore?: number;
  expectedAnswer?: string;
  studentGap?: string;
  correctionFocus?: string;
  revisedVersion: string;
  naturalVersion: string;
  encouragement: string;
  nextStep: string;
}

export interface LearningDiagnosis {
  taskId: string;
  comprehensionScore: number;
  vocabularyScore: number;
  grammarScore: number;
  sentenceStructureScore: number;
  expressionScore: number;
  logicScore?: number;
  mainProblem:
    | "vocabulary"
    | "grammar"
    | "sentence_structure"
    | "expression"
    | "logic"
    | "careless"
    | "none";
  errorPatterns: string[];
  masteredPoints: string[];
  weakPoints: string[];
  recommendedNextPart: NextPartType;
  reason: string;
}

export interface NextPart {
  type: NextPartType;
  title: string;
  instruction: string;
  focus: string;
  prompt: string;
  estimatedMinutes: number;
}

export interface InteractionStep {
  id: string;
  type: InteractionStepType;
  prompt: string;
  userInputType: "choice" | "short_answer" | "free_text" | "voice_optional" | "drag_sort";
  aiFeedbackMode: "instant" | "after_submit";
  successCriteria: string[];
  choices?: string[];
  optionTags?: string[];
  correctOption?: string;
  optionExplanations?: Record<string, string>;
  teacherHint?: string;
}

export interface LearningScenario {
  id: string;
  type: ScenarioType;
  sourceCategory?: ScenarioSourceCategory;
  sourceNote?: string;
  title: string;
  realWorldContext: string;
  studentRole: string;
  taskGoal: string;
  languageInput: string;
  targetExpressions: string[];
  hiddenGrammarPoints: string[];
  vocabularyFocus: string[];
  expressionGoal: string;
  transferContext: string;
  interactionSteps: InteractionStep[];
}

export interface KnowledgePoint {
  id: string;
  category:
    | "sentence_structure"
    | "tense"
    | "clause"
    | "non_finite"
    | "passive_voice"
    | "modal_verb"
    | "comparison"
    | "logical_connector"
    | "vocabulary"
    | "writing_structure";
  name: string;
  displayName: string;
  difficulty: "basic" | "intermediate" | "advanced";
  scenarioExamples: ScenarioType[];
  prerequisites: string[];
}

export interface StudentProfile {
  grade: "高一" | "高二" | "高三";
  level: "基础偏弱" | "中等" | "较好";
  interests: ScenarioType[];
}

export interface VocabularyItem {
  id: string;
  word: string;
  pronunciation?: string;
  partOfSpeech: string[];
  chineseMeanings: string[];
  coreMeaning: string;
  usageInContext: string;
  commonCollocations: string[];
  exampleSentences: string[];
  writingUseCase?: string;
  readingUseCase?: string;
  difficultyLevel: "basic" | "core" | "advanced" | "extension";
  frequencyLevel: 1 | 2 | 3 | 4 | 5;
  relatedWords: string[];
  wordFamily: string[];
  commonMistakes: string[];
  scenarioTypes: ScenarioType[];
}

export interface GrammarPoint {
  id: string;
  name: string;
  category:
    | "basic_sentence_pattern"
    | "tense"
    | "voice"
    | "modal_verb"
    | "clause"
    | "non_finite"
    | "comparison"
    | "subjunctive"
    | "inversion"
    | "emphasis"
    | "agreement"
    | "pronoun_reference"
    | "logical_connector"
    | "writing_structure";
  difficulty: "basic" | "intermediate" | "advanced";
  expressionFunction: string;
  examples: string[];
  scenarioTypes: ScenarioType[];
  prerequisites: string[];
}

export interface CheckInMilestonePlan {
  id: CheckInMilestone;
  title: string;
  days: number;
  vocabularyTarget: number;
  grammarTargets: string[];
  sentenceTargets: string[];
  readingTargets: string[];
  writingTargets: string[];
  scenarioTargets: ScenarioType[];
  assessmentType: string[];
  expectedOutcome: string;
}

export interface ReadingComprehensionTask {
  id: string;
  prompt: string;
  skill: "main_idea" | "detail" | "inference" | "word_guess" | "attitude" | "reference";
}

export interface AnnotationTask {
  id: string;
  prompt: string;
  annotationTypes: AnnotationType[];
}

export interface ParagraphLogicTask {
  id: string;
  prompt: string;
  logicType: "cause" | "contrast" | "example" | "summary" | "sequence";
}

export interface ReadingTask {
  id: string;
  title: string;
  topic: string;
  wordCount: number;
  difficulty: Difficulty;
  text: string;
  targetVocabulary: string[];
  targetGrammarPoints: string[];
  comprehensionTasks: ReadingComprehensionTask[];
  annotationTasks: AnnotationTask[];
  logicTasks: ParagraphLogicTask[];
}

export interface WritingRubric {
  grammarAccuracy: number;
  vocabularyUse: number;
  sentenceVariety: number;
  logicClarity: number;
  coherence: number;
  taskCompletion: number;
  naturalness: number;
  styleAwareness?: number;
}

export interface WritingTask {
  id: string;
  scenario: string;
  writingType:
    | "sentence"
    | "paragraph"
    | "email"
    | "speech"
    | "argumentative_essay"
    | "expository_essay"
    | "story_continuation"
    | "application_letter";
  prompt: string;
  targetVocabulary: string[];
  targetSentencePatterns: string[];
  targetLogic: string[];
  wordLimit?: number;
  evaluationRubric: WritingRubric;
}

export interface SentenceItem {
  id: string;
  text: string;
  chinese: string;
  focus: string;
}

export interface ReviewTask {
  id: string;
  source: string;
  prompt: string;
}

export interface DailyCheckInTask {
  id: string;
  dayNumber: number;
  milestone: CheckInMilestone;
  vocabularyTasks: VocabularyItem[];
  grammarFocus: GrammarPoint[];
  scenarioTask: LearningScenario;
  sentencePractice: SentenceItem[];
  readingTask?: ReadingTask;
  writingTask?: WritingTask;
  reviewTasks: ReviewTask[];
  estimatedMinutes: number;
}

export interface CheckInReport {
  id: string;
  dayNumber: number;
  completedTasks: string[];
  newWordsLearned: string[];
  grammarPracticed: string[];
  grammarReviewExamples?: Array<{
    grammar: string;
    sourceSentence: string;
    simpleExample: string;
    tryThis: string;
  }>;
  writingOutput: string[];
  readingPerformance?: string;
  mainMistake: string;
  mistakesEncountered?: string[];
  bestImprovement: string;
  nextDayFocus: string;
  streakCount: number;
  scenarioCount?: number;
  assessmentPrompt?: string;
  milestoneAssessmentFocus?: string[];
  reviewQueue?: string[];
  nextDayReviewPlan?: {
    reviewWords: string[];
    grammarFocus: string[];
    firstReviewPrompt: string;
    newSceneFocus: string;
  };
}

export interface DailyReviewCompletion {
  dayNumber: number;
  completedAt: string;
  reviewWords: string[];
  reviewMistakes: string[];
  milestone?: CheckInMilestone;
}

export interface UnknownWordRecord {
  word: string;
  normalized: string;
  meaning: string;
  partOfSpeech?: string;
  phonetic?: string;
  firstSeenAt: string;
  lastSeenAt: string;
  lookupCount: number;
  sourceSentence: string;
  mastered: boolean;
}

export interface OutOfSyllabusWordRecord {
  word: string;
  normalized: string;
  meaning: string;
  phonetic?: string;
  firstSeenAt: string;
  lastSeenAt: string;
  lookupCount: number;
  sourceSentence: string;
  reason: string;
  optional: true;
}

export interface VocabularyProgress {
  knownCount: number;
  activeUseCount: number;
  currentLevel: VocabularyLevel;
  weakWords: string[];
}

export interface GrammarProgress {
  completedIds: string[];
  weakIds: string[];
}

export interface LongTermProgress {
  currentDay: number;
  streakCount: number;
  currentMilestone: CheckInMilestone;
  vocabularyKnownCount: number;
  vocabularyActiveUseCount: number;
  grammarCompletedIds: string[];
  readingLevel: "sentence" | "short_paragraph" | "article";
  writingLevel: "sentence" | "paragraph" | "essay";
  weakAreas: string[];
  nextMilestoneGoal: string;
}

export interface DailyTaskGenerationInput {
  studentProfile: StudentProfile;
  currentDay: number;
  currentMilestone: CheckInMilestone;
  vocabularyProgress: VocabularyProgress;
  grammarProgress: GrammarProgress;
  recentMistakes: string[];
  stageAssessmentResults: AssessmentResult[];
  preferredScenarioTypes: ScenarioType[];
}

export interface StageGoal {
  id: string;
  description: string;
  knowledgePoints: string[];
  skillType:
    | "vocabulary"
    | "sentence_pattern"
    | "grammar"
    | "meaning_logic"
    | "annotation"
    | "style"
    | "writing";
}

export interface AssessmentScore {
  vocabulary: number;
  grammar: number;
  sentenceStructure: number;
  meaningLogic: number;
  expressionNaturalness: number;
  annotationAccuracy: number;
  styleAwareness?: number;
  writingCompleteness: number;
}

export interface AssessmentTask {
  id: string;
  type: AssessmentTaskType;
  scenario: string;
  prompt: string;
  inputText?: string;
  targetKnowledgePoints: string[];
  expectedSkills: string[];
  userAnswer?: string;
  aiFeedback?: string;
  score?: AssessmentScore;
}

export interface NextStagePlan {
  canMoveForward: boolean;
  nextStageId: string;
  mainGoals: string[];
  reviewGoals: string[];
  newKnowledgePoints: string[];
  recommendedScenarioTypes: ScenarioType[];
  recommendedTaskTypes: AssessmentTaskType[];
  reason: string;
  estimatedSessions: number;
}

export interface AssessmentResult {
  overallScore: number;
  masteredGoals: string[];
  partiallyMasteredGoals: string[];
  weakGoals: string[];
  repeatedErrors: string[];
  learningSummary: string;
  nextStageRecommendation: NextStagePlan;
}

export interface StageAssessment {
  id: string;
  stageId: string;
  title: string;
  description: string;
  targetGoals: StageGoal[];
  tasks: AssessmentTask[];
  result?: AssessmentResult;
  createdAt: string;
}

export interface StudyRecord {
  id: string;
  date: string;
  type: "scenario" | "sentence" | "expansion" | "long-sentence" | "paragraph" | "essay" | "assessment";
  prompt: string;
  studentAnswer?: string;
  feedback?: FeedbackResult;
  diagnosis?: LearningDiagnosis;
  nextPart?: NextPart;
}

export interface ProgressState {
  currentStage: StageId;
  completedSentences: number;
  masteredWords: string[];
  trainedGrammarPoints: string[];
  weakGrammarPoints: string[];
  imitationAccuracy: number;
  longSentenceAccuracy: number;
  paragraphSummaryQuality: number;
  dailyTargets: {
    shortSentences: number;
    expandedSentences: number;
    longSentences: number;
    paragraphs: number;
    words: number;
  };
  records: StudyRecord[];
  stageAssessments: StageAssessment[];
  checkInReports: CheckInReport[];
  dailyReviewCompletions: DailyReviewCompletion[];
  longTermProgress: LongTermProgress;
  unknownWords: UnknownWordRecord[];
  outOfSyllabusWords: OutOfSyllabusWordRecord[];
}
