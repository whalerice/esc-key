'use client';

import type { CaptionLine } from '@/engine/ui/caption';

/** Bottom 22% caption strip — narration vs dialogue chrome. Spec: §4 layer 5. */

export type NarrationProps = {
  line: CaptionLine | null;
  onAdvance?: () => void;
};

export function Narration({ line, onAdvance }: NarrationProps) {
  if (!line) return null;
  const kind = line.kind;
  const label = kind === 'dialogue' ? (line.speaker ?? '대사') : '내레이션';
  return (
    <button
      type="button"
      className="narration"
      data-layer="narration"
      data-kind={kind}
      onClick={onAdvance}
      aria-label={`${label}: ${line.text}`}
    >
      <span className="narration-panel">
        <span className="narration-kind">{label}</span>
        <span className="narration-text">{line.text}</span>
      </span>
    </button>
  );
}
