'use client';

/**
 * HUD layer (layer 4). Spec: docs/공통엔진.md §4.
 * Slots: timer · back · hint · inventory · mute · max-mode.
 */
import { INVENTORY_SLOTS } from '@/engine/systems/Inventory';

export type HudProps = {
  inventoryName: string;
  itemCount?: number;
  timerLabel?: string | null;
  hintBlink?: boolean;
  muted?: boolean;
  maxModeBlink?: boolean;
  notebook?: boolean;
  onBack?: () => void;
  onHint?: () => void;
  onMute?: () => void;
  onMaxMode?: () => void;
  onNotebook?: () => void;
};

export function Hud({
  inventoryName,
  itemCount = 0,
  timerLabel = null,
  hintBlink = false,
  muted = false,
  maxModeBlink = false,
  notebook = false,
  onBack,
  onHint,
  onMute,
  onMaxMode,
  onNotebook,
}: HudProps) {
  const slots = Math.max(INVENTORY_SLOTS, itemCount);

  return (
    <div className="hud" data-layer="hud">
      <div className="hud-left">
        <button type="button" className="hud-btn" onClick={onBack} aria-label="뒤로">
          ←
        </button>
        {timerLabel != null && <span className="hud-timer">{timerLabel}</span>}
      </div>
      <div className="hud-right">
        <button
          type="button"
          className={`hud-btn${hintBlink ? ' blink' : ''}`}
          onClick={onHint}
          aria-label="힌트"
        >
          힌트
        </button>
        {notebook && (
          <button type="button" className="hud-btn" onClick={onNotebook} aria-label="수첩">
            수첩
          </button>
        )}
        <button type="button" className="hud-btn" onClick={onMute} aria-label="음소거">
          {muted ? '소리 끔' : '소리'}
        </button>
        <button
          type="button"
          className={`hud-btn${maxModeBlink ? ' blink' : ''}`}
          onClick={onMaxMode}
          aria-label="최대 모드"
        >
          최대
        </button>
      </div>
      <aside className="hud-inventory" aria-label={inventoryName}>
        <span className="hud-inventory-label">{inventoryName}</span>
        <ul className="hud-inventory-slots">
          {Array.from({ length: slots }, (_, i) => (
            <li key={i} className="hud-slot" data-empty={i >= itemCount} />
          ))}
        </ul>
      </aside>
    </div>
  );
}
