'use client';

/** DOM keypad. Numeric / alphabet / hangul jamo / custom. Spec: §8-2. */

import { applyHangulKey, HANGUL_KEYS } from '@/engine/widgets/hangul';

export type KeypadMode = 'numeric' | 'alpha' | 'cheonjiin' | 'hangul' | 'custom';

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function Keypad({
  mode = 'numeric',
  value,
  keys: customKeys,
  onChange,
  onSubmit,
}: {
  mode?: KeypadMode;
  value: string;
  /** `custom` key labels. Ignored for the built-in modes. */
  keys?: string[];
  onChange: (v: string) => void;
  onSubmit?: () => void;
}) {
  const keys =
    mode === 'numeric'
      ? ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
      : mode === 'alpha'
        ? ALPHA
        : mode === 'hangul'
          ? [...HANGUL_KEYS]
          : (customKeys ?? ['A', 'B', 'C', 'D', 'E', 'F']);

  const press = (key: string) => {
    onChange(mode === 'hangul' ? applyHangulKey(value, key) : value + key);
  };
  const back = () => {
    onChange(mode === 'hangul' ? applyHangulKey(value, '⌫') : value.slice(0, -1));
  };

  return (
    <div className="keypad" data-mode={mode}>
      <div className="keypad-value">{value}</div>
      <div className="keypad-keys">
        {keys.map((key) => (
          <button key={key} type="button" onClick={() => press(key)}>
            {key}
          </button>
        ))}
        <button type="button" onClick={back}>
          ⌫
        </button>
        {onSubmit && (
          <button type="button" onClick={onSubmit}>
            확인
          </button>
        )}
      </div>
    </div>
  );
}
