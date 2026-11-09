'use client';

/** Author-notebook hint channel stub. Spec: §8-5 (1/12 skin). */

export type HintMemoProps = {
  open: boolean;
  channelLabel: string;
  intro?: string;
  stepLabel?: string;
  body: string | null;
  onClose: () => void;
  /** After one hint is open — open the next without hunting the HUD again. */
  onNextHint?: () => void;
};

export function HintMemo({
  open,
  channelLabel,
  intro,
  stepLabel,
  body,
  onClose,
  onNextHint,
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
      {onNextHint && (
        <div className="hint-memo-actions">
          <button type="button" className="hud-btn hint-memo-next" onClick={onNextHint}>
            다음 힌트
          </button>
        </div>
      )}
    </div>
  );
}
