'use client';

import type { NoteEntry } from '@/engine/types';

/** Right-half notebook sheet. Spec: §8-4. Disabled when theme.hud.notebook === false. */

export function Notebook({
  open,
  notes,
  onClose,
}: {
  open: boolean;
  notes: NoteEntry[];
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="modal notebook" data-layer="modal" role="dialog">
      <h2>수첩</h2>
      <ul>
        {notes.map((n) => (
          <li key={n.id}>{n.text}</li>
        ))}
      </ul>
      <button type="button" onClick={onClose}>
        닫기
      </button>
    </div>
  );
}
