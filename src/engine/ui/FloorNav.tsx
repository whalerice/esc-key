'use client';

/**
 * Tower section list. Visited floors only. Emits the floor id after the walk.
 * Spec: docs/개발/공통엔진_v1.md §19-7.
 */
import { useEffect, useRef, useState } from 'react';
import type { FloorStop } from '@/engine/types';
import { floorCanGo, floorTravelMs } from './floorNav';

export type FloorNavProps = {
  floors: FloorStop[];
  visited: readonly string[];
  current?: string;
  reduceEffects?: boolean;
  onGo?: (id: string) => void;
};

export function FloorNav({
  floors,
  visited,
  current,
  reduceEffects = false,
  onGo,
}: FloorNavProps) {
  const [pending, setPending] = useState<string | null>(null);
  const onGoRef = useRef(onGo);
  onGoRef.current = onGo;

  useEffect(() => {
    if (!pending) return;
    const id = pending;
    const ms = floorTravelMs(reduceEffects);
    // ponytail: timeout, not GSAP — stair art is not in this gray box
    const timer = window.setTimeout(() => {
      onGoRef.current?.(id);
      setPending(null);
    }, ms);
    return () => window.clearTimeout(timer);
  }, [pending, reduceEffects]);

  return (
    <nav className="floor-nav" aria-label="층 이동">
      <div className="floor-list">
      {floors.map((floor) => {
        const open = floorCanGo(floor.id, visited);
        const here = floor.id === current;
        return (
          <button
            key={floor.id}
            type="button"
            className="floor-stop"
            disabled={!open || pending != null}
            aria-current={here ? 'page' : undefined}
            data-floor={floor.id}
            data-open={open ? 'yes' : 'no'}
            onClick={() => {
              if (!open || pending) return;
              setPending(floor.id);
            }}
          >
            <span className="floor-band" style={{ background: floor.band ?? '#888' }} />
            <span className="floor-n">{floor.id}</span>
            <span className="floor-name">{floor.name}</span>
            {!open && <span className="floor-lock">잠금</span>}
          </button>
        );
      })}
      </div>
      <p className="floor-status" data-travel={pending ? 'yes' : 'no'}>
        {pending ? (reduceEffects ? '페이드' : '계단') : '대기'}
      </p>
    </nav>
  );
}
