import type { SceneDef, SceneId } from '@/engine/types';

/**
 * Scene placeholder — themes register scene builders later.
 * Spec: docs/개발/공통엔진_v1.md §3 stage/, §8 scenes.
 */
export type SceneHandle = {
  id: SceneId;
  mount: (parent: unknown) => void;
  unmount: () => void;
};

export class SceneManager {
  private scenes = new Map<SceneId, SceneDef>();
  private current: SceneId | null = null;

  register(defs: SceneDef[]): void {
    for (const d of defs) this.scenes.set(d.id, d);
  }

  getCurrent(): SceneId | null {
    return this.current;
  }

  /** Stub: swap current scene id only. Pixi graph wiring comes with themes. */
  enter(id: SceneId): void {
    if (!this.scenes.has(id)) {
      console.warn(`[SceneManager] unknown scene: ${id}`);
      return;
    }
    this.current = id;
  }
}
