'use client';

/** Modal letter / note card. Spec: §4 layer 2. */

export function LetterCard({
  open,
  title,
  body,
  onClose,
}: {
  open: boolean;
  title?: string;
  body: string;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="modal letter-card" data-layer="modal" role="dialog">
      {title && <h2>{title}</h2>}
      <p>{body}</p>
      <button type="button" onClick={onClose}>
        닫기
      </button>
    </div>
  );
}
