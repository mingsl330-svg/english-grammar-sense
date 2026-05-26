import { useMemo, useState } from "react";
import { sentenceTargetForWeek, wordTargetFor } from "../services/learningPlanService";
import type { LearningVersion, PlacementLevel, PlacementResult, StudyPace } from "../types/learning";

interface PlacementAssessmentProps {
  learnerName: string;
  learningVersion: LearningVersion;
  onComplete: (result: PlacementResult) => void;
}

interface PlacementDraft {
  sceneUnderstanding: string;
  naturalRewrite: string;
  transferExpression: string;
}

const includesAny = (text: string, words: string[]) => words.some((word) => text.includes(word));

const englishTokens = (text: string) => text.toLowerCase().match(/[a-z']+/g) ?? [];

const clampScore = (score: number) => Math.max(20, Math.min(95, score));

const placementTasks: Record<LearningVersion, {
  sceneKeywords: string[];
  rewriteNaturalSignals: string[];
  rewriteProblemSignals: string[];
  transferSignals: string[];
  tasks: {
    label: string;
    prompt: string;
    placeholder: string;
  }[];
}> = {
  primary_junior: {
    sceneKeywords: ["忘", "notebook", "本子", "借", "look", "看", "share", "help", "帮", "homework", "作业"],
    rewriteNaturalSignals: ["really like", "like english", "enjoy", "my english class", "teacher is kind", "teacher is nice"],
    rewriteProblemSignals: ["very like"],
    transferSignals: ["thank", "thanks", "help", "homework", "will", "next", "try", "again"],
    tasks: [
      {
        label: "1. 读懂同学的意思",
        prompt: "A classmate says: “I forgot my notebook. Can I look at yours?” 你觉得他想做什么？可以用中文或英文回答。",
        placeholder: "例如：他忘带本子了，想借我看一下，或者让我帮他跟上课堂。"
      },
      {
        label: "2. 把句子说自然",
        prompt: "把这句话改得更像真实英语：I very like English class because my teacher is nice.",
        placeholder: "例如：I really like English class because my teacher is nice."
      },
      {
        label: "3. 写一句真实感谢",
        prompt: "你的同学帮你完成一道英语题。写 1 句英文感谢他，再写 1 句你接下来会做什么。",
        placeholder: "例如：Thank you for helping me. I will try it again by myself."
      }
    ]
  },
  high_school: {
    sceneKeywords: ["累", "困", "tired", "stayed up", "熬夜", "不想", "不能", "can't", "first", "present", "上台", "help", "帮", "先", "推迟"],
    rewriteNaturalSignals: ["really enjoy", "really like", "enjoy", "love", "make friends", "meet friends", "meet new friends", "make new friends"],
    rewriteProblemSignals: ["very like", "have many friends"],
    transferSignals: ["thank", "thanks", "thank you", "grateful", "help", "helped", "practice", "speaking", "will", "next", "keep", "try"],
    tasks: [
      {
        label: "1. 读懂话外意思",
        prompt: "A teammate says: “I stayed up finishing the poster, but I don't think I can present first today.” 你觉得他真正想表达什么？可以用中文或英文回答。",
        placeholder: "例如：他昨晚熬夜做海报，现在很累或没准备好，希望别人先上台或给他一点帮助。"
      },
      {
        label: "2. 把表达改自然",
        prompt: "把这句话改得更像真实英语：I very like this club because it lets me have many friends.",
        placeholder: "例如：I really enjoy this club because I can meet new friends here."
      },
      {
        label: "3. 迁移到自己的表达",
        prompt: "你的同学帮你练习口语。写 1-2 句英文感谢他，并说说你下一步会怎么做。",
        placeholder: "例如：Thank you for helping me practice speaking. I will keep trying and speak more clearly next time."
      }
    ]
  }
};

const hasAnswer = (text: string) => text.trim().length >= 2;

const scorePlacement = (draft: PlacementDraft, requestedVersion: LearningVersion): PlacementResult => {
  const taskSet = placementTasks[requestedVersion];
  const scene = draft.sceneUnderstanding.trim().toLowerCase();
  const rewrite = draft.naturalRewrite.trim().toLowerCase();
  const transfer = draft.transferExpression.trim().toLowerCase();
  const rewriteTokens = englishTokens(rewrite);
  const transferTokens = englishTokens(transfer);

  let readingScore = requestedVersion === "primary_junior" ? 40 : 35;
  if (scene.length >= (requestedVersion === "primary_junior" ? 8 : 18)) readingScore += 12;
  if (includesAny(scene, taskSet.sceneKeywords)) readingScore += requestedVersion === "primary_junior" ? 30 : 42;
  if (includesAny(scene, ["because", "所以", "because he", "因为", "want", "想"])) readingScore += 8;

  let expressionScore = requestedVersion === "primary_junior" ? 40 : 35;
  if (rewriteTokens.length >= (requestedVersion === "primary_junior" ? 5 : 7)) expressionScore += 10;
  if (includesAny(rewrite, taskSet.rewriteNaturalSignals)) expressionScore += 28;
  if (includesAny(rewrite, ["because", "as", "since"])) expressionScore += 8;
  if (includesAny(rewrite, taskSet.rewriteProblemSignals)) expressionScore -= 18;

  let transferScore = requestedVersion === "primary_junior" ? 40 : 35;
  if (transferTokens.length >= (requestedVersion === "primary_junior" ? 5 : 8)) transferScore += 12;
  if (transferTokens.length >= (requestedVersion === "primary_junior" ? 10 : 16)) transferScore += 10;
  if (includesAny(transfer, taskSet.transferSignals)) transferScore += requestedVersion === "primary_junior" ? 26 : 40;
  if (/[。！？]/.test(draft.transferExpression) && transferTokens.length < 5) transferScore -= 12;

  readingScore = clampScore(readingScore);
  expressionScore = clampScore(expressionScore);
  transferScore = clampScore(transferScore);
  const overallScore = Math.round(readingScore * 0.34 + expressionScore * 0.33 + transferScore * 0.33);

  let level: PlacementLevel = "primary_junior_foundation";
  let learningVersion: LearningVersion = "primary_junior";
  let studyPace: StudyPace = "gentle";

  if (requestedVersion === "high_school" && overallScore >= 78 && transferScore >= 70) {
    level = "high_school_growth";
    learningVersion = "high_school";
    studyPace = "stretch";
  } else if (requestedVersion === "high_school" && overallScore >= 56) {
    level = "high_school_foundation";
    learningVersion = "high_school";
    studyPace = overallScore >= 72 ? "stretch" : "steady";
  } else if (overallScore >= (requestedVersion === "primary_junior" ? 54 : 46)) {
    level = "junior_bridge";
    learningVersion = "primary_junior";
    studyPace = "steady";
  }

  const weakAreas: string[] = [];
  const strengths: string[] = [];
  if (readingScore >= 70) strengths.push("能从场景里读出说话人的真实意图");
  else weakAreas.push("场景含义理解");
  if (expressionScore >= 70) strengths.push("能把中文式表达改得更自然");
  else weakAreas.push("表达自然度");
  if (transferScore >= 70) strengths.push("能把语言迁移到自己的真实表达");
  else weakAreas.push("迁移表达");

  const recommendedStart =
    level === "high_school_growth"
      ? "从高中场景表达和短段落逻辑开始，加入一点挑战任务。"
      : level === "high_school_foundation"
        ? "从高中基础场景句和表达改写开始，稳住理解与自然表达。"
        : level === "junior_bridge"
          ? "从小初衔接场景开始，先把常用表达说自然。"
          : "从短场景和高频表达开始，任务保持轻量。";

  const startingSentences = sentenceTargetForWeek(learningVersion, 1);
  const startingWords = wordTargetFor(learningVersion, startingSentences);
  const firstWeekPlan = [
    `前两周每天 ${startingSentences} 个真实场景，不提前生成整套长期计划。`,
    `每天激活约 ${startingWords} 个有用词，仍然使用当前学段的词库范围。`,
    weakAreas.length > 0
      ? `本周优先观察：${weakAreas.join("、")}；下周根据完成情况和错误类型调整难度。`
      : "本周保持理解、自然表达、迁移使用三类任务平衡；下周根据真实表现调整难度。"
  ];

  return {
    completedAt: new Date().toISOString(),
    level,
    learningVersion,
    studyPace,
    readingScore,
    expressionScore,
    transferScore,
    overallScore,
    strengths,
    weakAreas,
    recommendedStart,
    firstWeekPlan,
    evidence: draft
  };
};

export function PlacementAssessment({ learnerName, learningVersion, onComplete }: PlacementAssessmentProps) {
  const [draft, setDraft] = useState<PlacementDraft>({
    sceneUnderstanding: "",
    naturalRewrite: "",
    transferExpression: ""
  });
  const [previewResult, setPreviewResult] = useState<PlacementResult>();
  const taskSet = placementTasks[learningVersion];

  const canSubmit = useMemo(
    () =>
      hasAnswer(draft.sceneUnderstanding) &&
      hasAnswer(draft.naturalRewrite) &&
      hasAnswer(draft.transferExpression),
    [draft]
  );

  const complete = () => {
    const result = scorePlacement(draft, learningVersion);
    setPreviewResult(result);
    onComplete(result);
  };

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className="text-sm font-bold text-ocean">首次能力定位</p>
        <h2 className="mt-2 text-2xl font-bold text-ink">{learnerName} 的第一段真实语言样本</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          这不是考试。系统只用三段小回答判断从哪里开始更合适：理解场景、修正表达、把一句话用到自己的场景里。
        </p>

        <div className="mt-6 space-y-5">
          <PlacementTask
            {...taskSet.tasks[0]}
            value={draft.sceneUnderstanding}
            onChange={(value) => setDraft((current) => ({ ...current, sceneUnderstanding: value }))}
          />
          <PlacementTask
            {...taskSet.tasks[1]}
            value={draft.naturalRewrite}
            onChange={(value) => setDraft((current) => ({ ...current, naturalRewrite: value }))}
          />
          <PlacementTask
            {...taskSet.tasks[2]}
            value={draft.transferExpression}
            onChange={(value) => setDraft((current) => ({ ...current, transferExpression: value }))}
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            className="rounded-md bg-ocean px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-line"
            disabled={!canSubmit}
            onClick={complete}
            type="button"
          >
            生成学习起点
          </button>
          {!canSubmit && <span className="text-sm text-muted">三题各写一点即可，可以很短。</span>}
        </div>
      </div>

      <aside className="rounded-lg border border-ocean/25 bg-ocean/5 p-5">
        <p className="text-sm font-bold text-ocean">定位会影响什么</p>
        <div className="mt-4 space-y-3 text-sm leading-6 text-muted">
          <p>学段版本：小初衔接或高中版。</p>
          <p>每日重量：轻量、标准或挑战。</p>
          <p>第一周任务：更偏理解、自然表达或迁移使用。</p>
          <p>公开小组前，个人完整答案默认只属于自己。</p>
        </div>
        {previewResult && (
          <div className="mt-5 rounded-lg bg-white p-4">
            <p className="text-sm font-bold text-ink">{previewResult.recommendedStart}</p>
            <p className="mt-2 text-xs text-muted">综合定位：{previewResult.overallScore}</p>
          </div>
        )}
      </aside>
    </section>
  );
}

function PlacementTask({
  label,
  onChange,
  placeholder,
  prompt,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  prompt: string;
  value: string;
}) {
  return (
    <label className="block rounded-lg border border-line bg-paper p-4">
      <span className="text-sm font-bold text-ink">{label}</span>
      <span className="mt-2 block text-sm leading-6 text-muted">{prompt}</span>
      <textarea
        className="mt-3 min-h-24 w-full resize-y rounded-md border border-line bg-white px-3 py-2 text-sm leading-6 text-ink outline-none focus:border-ocean"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}
