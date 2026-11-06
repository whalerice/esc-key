'use client';

/** Ending result card. Spec: §8-9. */

export function ResultCard({
  open,
  title,
  endingId,
  lines,
  onReplay,
}: {
  open: boolean;
  title: string;
  endingId?: string;
  lines: string[];
  onReplay?: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="modal result-card"
      data-layer="modal"
      role="dialog"
      data-ending={endingId ?? title}
    >
      <h2>{title}</h2>
      {lines.map((text, i) => (
        <p key={i}>{text}</p>
      ))}
      {onReplay && (
        <button type="button" className="gate-btn" onClick={onReplay}>
          처음부터
        </button>
      )}
    </div>
  );
}
