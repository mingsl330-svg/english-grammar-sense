import type { TodayPath } from "../../types/today-path";

export function TodayPathHeader({ path }: { path: TodayPath }) {
  const isSenseSpace = path.mode === "sense_space";

  return (
    <section className={`rounded-lg border bg-white p-6 shadow-soft ${isSenseSpace ? "border-leaf/25" : "border-ocean/25"}`}>
      <p className={`text-xs font-bold uppercase tracking-wide ${isSenseSpace ? "text-leaf" : "text-ocean"}`}>
        {isSenseSpace ? "Today Path · 语言感知" : "Today Path · 表达成长"}
      </p>
      <h1 className="mt-2 text-2xl font-bold text-ink">{path.theme}</h1>
      <p className="mt-3 max-w-3xl text-base leading-7 text-muted">{path.greeting}</p>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <span className="rounded-md bg-paper px-3 py-2 font-semibold text-muted">今日预计 {path.estimatedMinutes} 分钟</span>
        {!isSenseSpace && <span className="rounded-md bg-ocean/5 px-3 py-2 font-semibold text-ocean">Exam Lens 可选</span>}
      </div>
    </section>
  );
}
