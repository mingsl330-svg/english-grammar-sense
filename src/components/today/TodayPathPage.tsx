import { useEffect } from "react";
import { generateTodayPath } from "../../lib/today-path/generateTodayPath";
import { loadTodayPath } from "../../lib/storage/learningStorage";
import { useLearningStore } from "../../store/useLearningStore";
import { FinalCanSayCard } from "./FinalCanSayCard";
import { TodayPathHeader } from "./TodayPathHeader";
import { TodayPathSteps } from "./TodayPathSteps";

interface TodayPathPageProps {
  onNavigate: (view: string) => void;
}

export function TodayPathPage({ onNavigate }: TodayPathPageProps) {
  const { error, isLoadingTodayPath, profile, setError, setLoadingTodayPath, setTodayPath, todayPath } = useLearningStore();

  useEffect(() => {
    if (!profile) {
      onNavigate("home");
      return;
    }

    let cancelled = false;
    const date = new Date().toISOString().slice(0, 10);
    const cached = loadTodayPath(date, profile.userId);
    if (cached) {
      setTodayPath(cached);
      return;
    }

    setLoadingTodayPath(true);
    setError(null);
    generateTodayPath(profile)
      .then((path) => {
        if (!cancelled) setTodayPath(path);
      })
      .catch(() => {
        if (!cancelled) setError("今天的语言路径生成失败，请稍后再试。");
      })
      .finally(() => {
        if (!cancelled) setLoadingTodayPath(false);
      });

    return () => {
      cancelled = true;
    };
  }, [onNavigate, profile, setError, setLoadingTodayPath, setTodayPath]);

  if (isLoadingTodayPath) {
    return (
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className="font-bold text-ink">正在准备今天的英语世界</p>
        <p className="mt-2 text-sm text-muted">系统会先准备一个词、一句话、一段小阅读和一个表达任务。</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-lg border border-rose/30 bg-white p-6 shadow-soft">
        <p className="font-bold text-ink">今天的路径暂时没有生成成功</p>
        <p className="mt-2 text-sm text-muted">{error}</p>
        <button className="mt-4 rounded-md bg-ocean px-4 py-2 text-sm font-bold text-white" onClick={() => onNavigate("home")} type="button">
          返回首页
        </button>
      </section>
    );
  }

  if (!todayPath) {
    return (
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className="font-bold text-ink">还没有今日路径</p>
        <p className="mt-2 text-sm text-muted">请选择一个学习模式后进入今天的英语世界。</p>
        <button className="mt-4 rounded-md bg-ocean px-4 py-2 text-sm font-bold text-white" onClick={() => onNavigate("home")} type="button">
          选择学习模式
        </button>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <TodayPathHeader path={todayPath} />
      <TodayPathSteps path={todayPath} />
      <FinalCanSayCard lines={todayPath.finalCanSay} />
    </div>
  );
}
