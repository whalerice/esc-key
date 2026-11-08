/** Shared bottom-strip caption kinds. Spec gap: docs only name the strip, not kind chrome. */

export type CaptionKind = 'narration' | 'dialogue';

export type CaptionLine = {
  text: string;
  kind: CaptionKind;
  /** Dialogue only. Shown as the speaker chip when set. */
  speaker?: string;
};

export type CaptionInput = string | CaptionLine;

/** Theme Flow / overlay caption queue. */
export type SayFn = (line: CaptionInput) => void;

export function narration(text: string): CaptionLine {
  return { text, kind: 'narration' };
}

export function dialogue(text: string, speaker?: string): CaptionLine {
  return { text, kind: 'dialogue', ...(speaker ? { speaker } : {}) };
}

export function asCaption(input: CaptionInput): CaptionLine {
  if (typeof input === 'string') return { text: input, kind: 'narration' };
  return input;
}
