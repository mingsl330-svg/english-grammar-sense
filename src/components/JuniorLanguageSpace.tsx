import { TopicClusterDB, WordBank } from "../data/gaokaoDatabases";
import type { ProgressState } from "../types/learning";

interface JuniorLanguageSpaceProps {
  progress: ProgressState;
  onNavigate: (view: string) => void;
}

const gentleActions = [
  {
    title: "今日小词",
    text: "从今天的生活场景里捡起 3 个小词，知道它们怎么用。",
    view: "word-sense"
  },
  {
    title: "和我一起读",
    text: "慢慢读一句英文，先听懂画面，再看懂句子。",
    view: "daily"
  },
  {
    title: "我会说一句",
    text: "把今天的句子换成自己的生活。",
    view: "sentence-builder"
  },
  {
    title: "英文小日记",
    text: "写一句今天发生的小事，不追求复杂。",
    view: "guided-writing"
  },
  {
    title: "英语树洞",
    text: "可以用中文说心情，系统帮你变成简单英文。",
    view: "independent-writing"
  },
  {
    title: "现实世界里的英语",
    text: "发现生活、新闻、电影、节日里能用的英文。",
    view: "reading-examiner"
  }
];

export function JuniorLanguageSpace({ onNavigate, progress }: JuniorLanguageSpaceProps) {
  const words = WordBank.filter((word) => word.topicIds.some((id) => id === "campus_life" || id === "youth_growth")).slice(0, 4);
  const topics = TopicClusterDB.filter((topic) => ["campus_life", "youth_growth", "chinese_culture"].includes(topic.id));

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-leaf/20 bg-white p-6 shadow-soft">
        <p className="text-xs font-bold uppercase tracking-wide text-leaf">小学到初中 · 语言感知空间</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">每天发现一点英文</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-muted">
          每天读懂一点世界，每天说出一点自己，每天提升一点表达。在不知不觉中走向考试能力和真实表达能力。
        </p>
        <button
          className="mt-5 rounded-md bg-leaf px-5 py-3 text-sm font-bold text-white hover:bg-leaf/90"
          onClick={() => onNavigate("daily")}
          type="button"
        >
          开始今天的语言发现
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {gentleActions.map((action) => (
          <button
            className="rounded-lg border border-line bg-white p-4 text-left shadow-soft hover:border-leaf"
            key={action.title}
            onClick={() => onNavigate(action.view)}
            type="button"
          >
            <p className="text-lg font-bold text-ink">{action.title}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{action.text}</p>
          </button>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <p className="text-sm font-bold text-leaf">今天可以遇见的词</p>
          <div className="mt-4 grid gap-3">
            {words.map((word) => (
              <div className="rounded-md bg-paper p-3" key={word.word}>
                <p className="font-bold text-ink">{word.word}</p>
                <p className="mt-1 text-sm text-muted">{word.collocations[0]} · {word.writingTransfer}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <p className="text-sm font-bold text-leaf">轻轻往前走</p>
          <div className="mt-4 grid gap-3">
            {topics.map((topic) => (
              <div className="rounded-md border border-line p-3" key={topic.id}>
                <p className="font-bold text-ink">{topic.label}</p>
                <p className="mt-1 text-sm leading-6 text-muted">{topic.monthlyUse}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-muted">
            当前第 {progress.longTermProgress.currentDay} 天。这里不会把学习变成试卷；系统会根据每天的阅读、查词和表达记录，慢慢调整明天的语言发现。
          </p>
        </div>
      </section>
    </div>
  );
}
