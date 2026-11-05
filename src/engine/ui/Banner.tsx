'use client';

/** Top call/radio banner — does not cover puzzle. Spec: §4 layer 3. */

export function Banner({
  text,
  onAccept,
}: {
  text: string | null;
  onAccept?: () => void;
}) {
  if (!text) return null;
  return (
    <div className="banner" data-layer="banner" role="status">
      <span>{text}</span>
      {onAccept && (
        <button type="button" onClick={onAccept}>
          받기
        </button>
      )}
    </div>
  );
}
