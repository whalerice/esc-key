'use client';

/** DOM keypad. Numeric / alphabet / hangul jamo / cheonjiin / custom. Spec: §8-2. */

import { useRef } from 'react';
import {
  applyCheonjiin,
  cheonjiinText,
  emptyCheonjiin,
} from '@/engine/widgets/cheonjiin';
import { applyHangulKey, HANGUL_KEYS } from '@/engine/widgets/hangul';

export type KeypadMode = 'numeric' | 'alpha' | 'cheonjiin' | 'hangul' | 'custom';
export type CheonjiinScript = 'digit' | 'hangul';

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const CHEON: { id: string; hangul: string }[] = [
  { id: '1', hangul: 'ㅣ' },
  { id: '2', hangul: 'ㆍ' },
  { id: '3', hangul: 'ㅡ' },
  { id: '4', hangul: 'ㄱㅋ' },
  { id: '5', hangul: 'ㄴㄹ' },
  { id: '6', hangul: 'ㄷㅌ' },
  { id: '7', hangul: 'ㅂㅍ' },
  { id: '8', hangul: 'ㅅㅎ' },
  { id: '9', hangul: 'ㅈㅊ' },
  { id: '*', hangul: '*' },
  { id: '0', hangul: 'ㅇㅁ' },
  { id: '#', hangul: '#' },
];

export function Keypad({
  mode = 'numeric',
  script = 'digit',
  value,
  keys: customKeys,
  onChange,
  onSubmit,
  submitLabel = '확인',
}: {
  mode?: KeypadMode;
  /** Cheonjiin only. Digit keys print numbers. Hangul keys compose. */
  script?: CheonjiinScript;
  value: string;
  /** `custom` key labels. Ignored for the built-in modes. */
  keys?: string[];
  onChange: (v: string) => void;
  onSubmit?: () => void;
  submitLabel?: string;
}) {
  const cheonRef = useRef(emptyCheonjiin());
  if (mode !== 'cheonjiin' || script !== 'hangul' || value === '') {
    if (cheonjiinText(cheonRef.current) !== '') cheonRef.current = emptyCheonjiin();
  }

  const keys =
    mode === 'numeric'
      ? ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
      : mode === 'alpha'
        ? ALPHA
        : mode === 'hangul'
          ? [...HANGUL_KEYS]
          : mode === 'cheonjiin'
            ? CHEON.map((key) => key.id)
            : (customKeys ?? ['A', 'B', 'C', 'D', 'E', 'F']);

  const press = (key: string) => {
    if (mode === 'cheonjiin') {
      if (key === '*' || key === '#') return;
      if (script === 'hangul') {
        cheonRef.current = applyCheonjiin(cheonRef.current, key);
        onChange(cheonjiinText(cheonRef.current));
        return;
      }
      onChange(key === '⌫' ? value.slice(0, -1) : value + key);
      return;
    }
    onChange(mode === 'hangul' ? applyHangulKey(value, key) : value + key);
  };
  const back = () => {
    if (mode === 'cheonjiin') {
      press('⌫');
      return;
    }
    onChange(mode === 'hangul' ? applyHangulKey(value, '⌫') : value.slice(0, -1));
  };

  const label = (key: string) => {
    if (mode !== 'cheonjiin' || script === 'digit') return key;
    return CHEON.find((item) => item.id === key)?.hangul ?? key;
  };

  return (
    <div className="keypad" data-mode={mode} data-script={mode === 'cheonjiin' ? script : undefined}>
      <div className="keypad-value">{value}</div>
      <div className="keypad-keys">
        {keys.map((key) => (
          <button key={key} type="button" data-key={key} onClick={() => press(key)}>
            {label(key)}
          </button>
        ))}
        {mode === 'cheonjiin' && script === 'hangul' && (
          <button type="button" data-key=" " onClick={() => press(' ')}>
            띄어쓰기
          </button>
        )}
        <button type="button" data-key="⌫" onClick={back}>
          ⌫
        </button>
        {onSubmit && (
          <button type="button" onClick={onSubmit}>
            {submitLabel}
          </button>
        )}
      </div>
    </div>
  );
}
