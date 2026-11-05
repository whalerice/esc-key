'use client';

/** Author-notebook hint channel stub. Spec: §8-5 (1/12 skin). */

export type HintMemoProps = {
  open: boolean;
  channelLabel: string;
  intro?: string;
  stepLabel?: string;
  body: string | null;
  onClose: () => void;
};

export function HintMemo({
  open,
  channelLabel,
  intro,
  stepLabel,
  body,
  onClose,
}: HintMemoProps) {
  if (!open || body == null) return null;
  return (
    <div className="modal hint-memo" role="dialog" aria-label={channelLabel}>
      <header className="hint-memo-head">
        <strong>{channelLabel}</strong>
        {stepLabel && <span className="hint-memo-step">{stepLabel}</span>}
        <button type="button" className="hud-btn" onClick={onClose} aria-label="닫기">
          닫기
        </button>
      </header>
      {intro && <p className="hint-memo-intro">{intro}</p>}
      <p className="hint-memo-body">{body}</p>
    </div>
  );
}
