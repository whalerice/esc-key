/**
 * Saved progress. Spec: docs/시리즈/늘봄/07_막차이후_설계_v1.md §9-6.
 * Phone open, viewfinder position, keypad drafts, and sticker zoom are not here.
 * `phoneOpen` is listed in §9-1 and omitted: §9-6 does not save it, and it is UI.
 */

export type LasttrainExtra = {
  /** Inbox rows the player opened. In-world 읽음/안 읽음 is content, not this list. */
  readMessages: string[];
  secretFolderOpen: boolean;
  /** Submitted replies, `digit:` or `hangul:` plus the string. The draft is not saved. */
  sentAnswers: string[];
};

export const initialExtra: LasttrainExtra = {
  readMessages: [],
  secretFolderOpen: false,
  sentAnswers: [],
};
