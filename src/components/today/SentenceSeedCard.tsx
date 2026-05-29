import type { SentenceSeed } from "../../types/today-path";

export function SentenceSeedCard({ sentence }: { sentence: SentenceSeed }) {
  return (
    <div className="space-y-3">
      <p className="text-xl font-bold leading-8 text-ink">{sentence.sentence}</p>
      <p className="text-sm text-muted">{sentence.translationZh}</p>
      {sentence.keyStructure && <p className="rounded-md bg-paper p-3 text-sm font-semibold text-muted">{sentence.keyStructure}</p>}
      <p className="text-sm leading-6 text-muted">{sentence.gentleExplanation}</p>
      {sentence.upgradedVersion && <p className="rounded-md bg-ocean/5 p-3 text-sm leading-6 text-muted">{sentence.upgradedVersion}</p>}
    </div>
  );
}
