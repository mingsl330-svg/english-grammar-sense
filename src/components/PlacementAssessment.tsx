import { useMemo, useState } from "react";
import type { LearningVersion, PlacementLevel, PlacementResult, StudyPace } from "../types/learning";

interface PlacementAssessmentProps {
  learnerName: string;
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

const scorePlacement = (draft: PlacementDraft): PlacementResult => {
  const scene = draft.sceneUnderstanding.trim().toLowerCase();
  const rewrite = draft.naturalRewrite.trim().toLowerCase();
  const transfer = draft.transferExpression.trim().toLowerCase();
  const rewriteTokens = englishTokens(rewrite);
  const transferTokens = englishTokens(transfer);

  let readingScore = 35;
  if (scene.length >= 18) readingScore += 12;
  if (includesAny(scene, ["累", "困", "tired", "stayed up", "熬夜"])) readingScore += 12;
  if (includesAny(scene, ["不想", "不能", "can not", "can't", "unable", "first", "present", "上台"])) readingScore += 16;
  if (includesAny(scene, ["help", "帮", "换", "later", "support", "先", "推迟"])) readingScore += 14;
  if (includesAny(scene, ["nervous", "紧张", "压力", "担心"])) readingScore += 8;

  let expressionScore = 35;
  if (rewriteTokens.length >= 7) expressionScore += 10;
  if (includesAny(rewrite, ["really like", "enjoy", "love", "like being", "like this club"])) expressionScore += 16;
  if (includesAny(rewrite, ["make friends", "meet friends", "meet new friends", "make new friends"])) expressionScore += 18;
  if (includesAny(rewrite, ["because", "as", "since"])) expressionScore += 8;
  if (rewrite.includes("very like")) expressionScore -= 18;
  if (rewrite.includes("have many friends")) expressionScore -= 8;

  let transferScore = 35;
  if (transferTokens.length >= 8) transferScore += 12;
  if (transferTokens.length >= 16) transferScore += 10;
  if (includesAny(transfer, ["thank", "thanks", "thank you", "grateful"])) transferScore += 14;
  if (includesAny(transfer, ["help", "helped", "practice", "speaking"])) transferScore += 14;
  if (includesAny(transfer, ["will", "next", "keep", "try", "going to", "tomorrow"])) transferScore += 12;
  if (/[。！？]/.test(draft.transferExpression) && transferTokens.length < 5) transferScore -= 12;

  readingScore = clampScore(readingScore);
  expressionScore = clampScore(expressionScore);
  transferScore = clampScore(transferScore);
  const overallScore = Math.round(readingScore * 0.34 + expressionScore * 0.33 + transferScore * 0.33);

  let level: PlacementLevel = "primary_junior_foundation";
  let learningVersion: LearningVersion = "primary_junior";
  let studyPace: StudyPace = "gentle";

  if (overallScore >= 78 && transferScore >= 70) {
    level = "high_school_growth";
    learningVersion = "high_school";
    studyPace = "stretch";
  } else if (overallScore >= 62) {
    level = "high_school_foundation";
    learningVersion = "high_school";
    studyPace = "steady";
  } else if (overallScore >= 46) {
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

  const firstWeekPlan =
    studyPace === "gentle"
      ? ["每天 3 个短场景，先说清意思。", "每次只激活 3-4 个有用词。", "遇到难句先拆意思，不急着讲语法名词。"]
      : studyPace === "stretch"
        ? ["每天完成真实场景理解和表达迁移。", "加入短段落逻辑和表达升级。", "用错句诊所整理反复出现的问题。"]
        : ["每天 4-6 个场景，理解、改写、迁移都做一点。", "生词以场景复现为主。", "一周后根据错误类型调整任务重量。"];

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

export function PlacementAssessment({ learnerName, onComplete }: PlacementAssessmentProps) {
  const [draft, setDraft] = useState<PlacementDraft>({
    sceneUnderstanding: "",
    naturalRewrite: "",
    transferExpression: ""
  });
  const [previewResult, setPreviewResult] = useState<PlacementResult>();

  const canSubmit = useMemo(
    () =>
      draft.sceneUnderstanding.trim().length >= 6 &&
      englishTokens(draft.naturalRewrite).length >= 4 &&
      englishTokens(draft.transferExpression).length >= 4,
    [draft]
  );

  const complete = () => {
    const result = scorePlacement(draft);
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
            label="1. 读懂话外意思"
            prompt="A teammate says: “I stayed up finishing the poster, but I don't think I can present first today.” 你觉得他真正想表达什么？可以用中文或英文回答。"
            value={draft.sceneUnderstanding}
            onChange={(value) => setDraft((current) => ({ ...current, sceneUnderstanding: value }))}
            placeholder="例如：他昨晚熬夜做海报，现在很累或没准备好，希望别人先上台或给他一点帮助。"
          />
          <PlacementTask
            label="2. 把表达改自然"
            prompt="把这句话改得更像真实英语：I very like this club because it lets me have many friends."
            value={draft.naturalRewrite}
            onChange={(value) => setDraft((current) => ({ ...current, naturalRewrite: value }))}
            placeholder="例如：I really enjoy this club because I can meet new friends here."
          />
          <PlacementTask
            label="3. 迁移到自己的表达"
            prompt="你的同学帮你练习口语。写 1-2 句英文感谢他，并说说你下一步会怎么做。"
            value={draft.transferExpression}
            onChange={(value) => setDraft((current) => ({ ...current, transferExpression: value }))}
            placeholder="例如：Thank you for helping me practice speaking. I will keep trying and speak more clearly next time."
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
          {!canSubmit && <span className="text-sm text-muted">每段写一点真实反应即可，不需要长答案。</span>}
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
