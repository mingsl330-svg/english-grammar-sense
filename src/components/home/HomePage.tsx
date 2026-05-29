import { createDefaultExamExpressionProfile, createDefaultSenseSpaceProfile } from "../../types/profile";
import type { UserLearningProfile } from "../../types/profile";

interface HomePageProps {
  existingProfile: UserLearningProfile | null;
  onNavigate: (view: string) => void;
  onSelectProfile: (profile: UserLearningProfile) => void;
}

export function HomePage({ existingProfile, onNavigate, onSelectProfile }: HomePageProps) {
  const start = (profile: UserLearningProfile) => {
    onSelectProfile(profile);
    onNavigate("today-path");
  };

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className="text-xs font-bold uppercase tracking-wide text-ocean">English Grammar Sense</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">每天一点英语，慢慢把世界说出来</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-muted">
          从一个词、一句话、一段小阅读开始，让英语从学习任务变成每天都可以进入的语言空间。
        </p>
        {existingProfile && (
          <button
            className="mt-5 rounded-md bg-ocean px-5 py-3 text-sm font-bold text-white hover:bg-ocean/90"
            onClick={() => onNavigate("today-path")}
            type="button"
          >
            进入今天的英语世界
          </button>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <button
          className="rounded-lg border border-leaf/30 bg-white p-5 text-left shadow-soft hover:border-leaf"
          onClick={() => start(createDefaultSenseSpaceProfile())}
          type="button"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-leaf">Sense Space</p>
          <h2 className="mt-2 text-2xl font-bold text-ink">轻松建立语感</h2>
          <p className="mt-3 text-sm leading-6 text-muted">适合小学到初中：伴读、表达、树洞、小日记</p>
        </button>

        <button
          className="rounded-lg border border-ocean/30 bg-white p-5 text-left shadow-soft hover:border-ocean"
          onClick={() => start(createDefaultExamExpressionProfile())}
          type="button"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-ocean">Exam Expression</p>
          <h2 className="mt-2 text-2xl font-bold text-ink">系统提升表达</h2>
          <p className="mt-3 text-sm leading-6 text-muted">适合高中到大学：主题阅读、写作升级、出题组镜头</p>
        </button>
      </section>
    </div>
  );
}
