'use client';

/** DOM keypad stub (numeric / alpha / cheonjiin). Spec: §8-2. */

export type KeypadMode = 'numeric' | 'alpha' | 'cheonjiin' | 'custom';

export function Keypad({
  mode = 'numeric',
  value,
  onChange,
  onSubmit,
}: {
  mode?: KeypadMode;
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
}) {
  const keys =
    mode === 'numeric'
      ? ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
      : ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="keypad" data-mode={mode}>
      <div className="keypad-value">{value}</div>
      <div className="keypad-keys">
        {keys.map((k) => (
          <button key={k} type="button" onClick={() => onChange(value + k)}>
            {k}
          </button>
        ))}
        <button type="button" onClick={() => onChange(value.slice(0, -1))}>
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
