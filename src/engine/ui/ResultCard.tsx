'use client';

/** Ending result card. Spec: §8-9. */

export function ResultCard({
  open,
  title,
  timeLabel,
  hints,
  onClose,
}: {
  open: boolean;
  title: string;
  timeLabel: string;
  hints: number;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="modal result-card" data-layer="modal" role="dialog">
      <h2>{title}</h2>
      <p>시간 {timeLabel}</p>
      <p>힌트 {hints}</p>
      <button type="button" onClick={onClose}>
        확인
      </button>
    </div>
  );
}
