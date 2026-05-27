interface AudioButtonProps {
  label: string;
  text: string;
  className?: string;
  rate?: number;
}

export function AudioButton({ className = "", label, rate = 0.82, text }: AudioButtonProps) {
  const speak = () => {
    if (typeof window === "undefined" || !window.speechSynthesis || !text.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = rate;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      aria-label={label}
      className={`rounded-md border border-ocean/30 px-2 py-1 text-xs font-bold text-ocean hover:bg-ocean/10 ${className}`}
      onClick={speak}
      type="button"
    >
      {label}
    </button>
  );
}
