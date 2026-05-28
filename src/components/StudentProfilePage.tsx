import { buildStudentAbilityProfile } from "../services/studentAbilityProfileService";
import type { LearningVersion, ProgressState } from "../types/learning";

interface StudentProfilePageProps {
  learningVersion: LearningVersion;
  progress: ProgressState;
}

const labels = {
  vocabularyContext: "词汇语境能力",
  grammarRecognition: "语法识别能力",
  grammarOutput: "语法输出能力",
  longSentenceUnderstanding: "长难句理解能力",
  readingInference: "阅读推理能力",
  discourseStructure: "语篇结构能力",
  culturalExpression: "文化表达能力",
  technologyThemeUnderstanding: "科技主题理解能力",
  opinionExpression: "观点表达能力",
  writingOrganization: "写作组织能力",
  languageNaturalness: "语言自然度",
  examTaskAdaptability: "高考题型适应度"
};

export function StudentProfilePage({ learningVersion, progress }: StudentProfilePageProps) {
  const profile = buildStudentAbilityProfile(progress);
  const isJunior = learningVersion === "primary_junior";

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className={`text-xs font-bold uppercase tracking-wide ${isJunior ? "text-leaf" : "text-ocean"}`}>
          Student Profile
        </p>
        <h1 className="mt-2 text-2xl font-bold text-ink">{isJunior ? "语言成长画像" : "高考英语能力画像"}</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          {isJunior
            ? "这里不强调分数，只观察孩子是否更愿意读、说、写一点英文。"
            : "画像来自学习记录、日任务、阶段考核和写作训练，用于调整下一阶段难度。"}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {(Object.entries(profile) as Array<[keyof typeof labels, number]>).map(([key, value]) => (
          <div className="rounded-lg border border-line bg-white p-4 shadow-soft" key={key}>
            <div className="flex justify-between gap-3">
              <p className="font-bold text-ink">{labels[key]}</p>
              {!isJunior && <p className="text-sm font-bold text-ocean">{value}</p>}
            </div>
            <div className="mt-3 h-2 rounded-full bg-paper">
              <div className={`h-2 rounded-full ${isJunior ? "bg-leaf" : "bg-ocean"}`} style={{ width: `${value}%` }} />
            </div>
            <p className="mt-2 text-sm text-muted">
              {value >= 75 ? "已经形成可迁移能力。" : value >= 60 ? "正在稳定发展，需要更多真实语境。" : "下一步先降低压力，增加可理解输入。"}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
