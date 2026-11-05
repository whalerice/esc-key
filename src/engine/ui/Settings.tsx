'use client';

import type { AppSettings } from '@/engine/types';

export function Settings({
  open,
  settings,
  onChange,
  onClose,
}: {
  open: boolean;
  settings: AppSettings;
  onChange: (partial: Partial<AppSettings>) => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="modal settings" data-layer="modal" role="dialog">
      <h2>설정</h2>
      <label>
        <input
          type="checkbox"
          checked={settings.bigText}
          onChange={(e) => onChange({ bigText: e.target.checked })}
        />
        글자 크게
      </label>
      <label>
        <input
          type="checkbox"
          checked={settings.hearingAssist}
          onChange={(e) => onChange({ hearingAssist: e.target.checked })}
        />
        청각 보조
      </label>
      <label>
        <input
          type="checkbox"
          checked={settings.reduceEffects}
          onChange={(e) => onChange({ reduceEffects: e.target.checked })}
        />
        효과 줄이기
      </label>
      <button type="button" onClick={onClose}>
        닫기
      </button>
    </div>
  );
}
