import type { WordSeed } from "../../types/today-path";

export function WordSeedCard({ word }: { word: WordSeed }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-2xl font-bold text-ink">{word.word}</p>
        <p className="mt-1 text-sm text-muted">{word.meaningZh}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {word.collocations.map((collocation) => (
          <span className="rounded-md bg-paper px-3 py-2 text-sm font-semibold text-muted" key={collocation}>
            {collocation}
          </span>
        ))}
      </div>
      <p className="rounded-md bg-leaf/5 p-3 text-sm leading-6 text-muted">{word.exampleSentence}</p>
      {word.writingTransferSentence && <p className="text-sm leading-6 text-muted">{word.writingTransferSentence}</p>}
    </div>
  );
}
