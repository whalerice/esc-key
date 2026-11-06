'use client';

/**
 * HUD layer (layer 4). Spec: docs/개발/공통엔진_v1.md §4.
 * Slots: timer · back · hint · inventory · mute · max-mode.
 */
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { INVENTORY_SLOTS } from '@/engine/systems/Inventory';
import { GESTURE } from '@/engine/input/gestures';

export type HudProps = {
  inventoryName: string;
  itemCount?: number;
  /** Optional short labels drawn in filled slots (item ids ok for slice). */
  itemLabels?: string[];
  timerLabel?: ReactNode;
  hintBlink?: boolean;
  muted?: boolean;
  maxModeBlink?: boolean;
  notebook?: boolean;
  onBack?: () => void;
  onHint?: () => void;
  onMute?: () => void;
  onMaxMode?: () => void;
  onNotebook?: () => void;
  /**
   * Sewing scenes. Hides hint and inventory; timer stays.
   * Spec §19-11. Other chrome stays so back / mute / max still work.
   */
  collapsed?: boolean;
  /** Tap a slot to select. Drag onto `[data-use-target]`. */
  selectedItem?: string | null;
  onSelectItem?: (itemId: string) => void;
  onUseItem?: (itemId: string, targetId: string) => void;
};

export function Hud({
  inventoryName,
  itemCount = 0,
  itemLabels = [],
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
  collapsed = false,
  selectedItem = null,
  onSelectItem,
  onUseItem,
}: HudProps) {
  const slots = Math.max(INVENTORY_SLOTS, itemCount);
  const drag = onSelectItem || onUseItem;

  return (
    <div className="hud" data-layer="hud" data-collapsed={collapsed ? 'yes' : 'no'}>
      <div className="hud-left">
        <button type="button" className="hud-btn" onClick={onBack} aria-label="뒤로">
          ←
        </button>
        {timerLabel != null && timerLabel !== '' && (
          <div className="hud-timer">{timerLabel}</div>
        )}
      </div>
      <div className="hud-right">
        {!collapsed && (
          <button
            type="button"
            className={`hud-btn${hintBlink ? ' blink' : ''}`}
            onClick={onHint}
            aria-label="힌트"
          >
            힌트
          </button>
        )}
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
      {!collapsed && (
        <aside className="hud-inventory" aria-label={inventoryName}>
          <span className="hud-inventory-label">{inventoryName}</span>
          <ul className="hud-inventory-slots">
            {Array.from({ length: slots }, (_, i) => {
              const label = i < itemCount ? (itemLabels[i] ?? '') : '';
              return (
                <li
                  key={i}
                  className="hud-slot"
                  data-empty={i >= itemCount}
                  data-selected={!!label && selectedItem === label}
                  data-draggable={drag && !!label}
                  role={drag && label ? 'button' : undefined}
                  aria-pressed={drag && label ? selectedItem === label : undefined}
                  aria-label={drag && label ? label : undefined}
                  onPointerDown={
                    drag && label
                      ? (event) => beginItemGesture(event, label, onSelectItem, onUseItem)
                      : undefined
                  }
                >
                  {label ? <span className="hud-slot-label">{label}</span> : null}
                </li>
              );
            })}
          </ul>
        </aside>
      )}
    </div>
  );
}

function beginItemGesture(
  event: ReactPointerEvent<HTMLElement>,
  itemId: string,
  onSelect?: (itemId: string) => void,
  onUse?: (itemId: string, targetId: string) => void,
) {
  if (event.button !== 0) return;
  const startX = event.clientX;
  const startY = event.clientY;
  const pointerId = event.pointerId;
  let ghost: HTMLDivElement | null = null;
  let moved = false;

  const move = (ev: PointerEvent) => {
    if (ev.pointerId !== pointerId) return;
    if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < GESTURE.dragMovePx) return;
    moved = true;
    if (!ghost) {
      ghost = document.createElement('div');
      ghost.className = 'hud-drag-ghost';
      ghost.textContent = itemId;
      document.body.appendChild(ghost);
    }
    ghost.style.left = `${ev.clientX + 12}px`;
    ghost.style.top = `${ev.clientY + 12}px`;
  };

  const up = (ev: PointerEvent) => {
    if (ev.pointerId !== pointerId) return;
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', up);
    ghost?.remove();
    if (!moved) {
      onSelect?.(itemId);
      return;
    }
    const under = document.elementFromPoint(ev.clientX, ev.clientY);
    const target = under?.closest('[data-use-target]')?.getAttribute('data-use-target');
    if (target) onUse?.(itemId, target);
  };

  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
}
