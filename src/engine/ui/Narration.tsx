'use client';

/** Narration strip — bottom 22%, one line, tap to advance. Spec: §4 layer 5. */

export type NarrationProps = {
  line: string | null;
  onAdvance?: () => void;
};

export function Narration({ line, onAdvance }: NarrationProps) {
  if (!line) return null;
  return (
    <button
      type="button"
      className="narration"
      data-layer="narration"
      onClick={onAdvance}
    >
      <span>{line}</span>
    </button>
  );
}
