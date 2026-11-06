'use client';

/**
 * Client-only Pixi stage shell. Import via next/dynamic with ssr:false.
 * Spec: docs/개발/공통엔진_v1.md §3, §6.
 */
import { useEffect, useRef } from 'react';
import { Application } from 'pixi.js';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '@/engine/types';
import { layoutContain, maxDpr } from './Viewport';

export type PixiStageProps = {
  background?: string;
  onReady?: (app: Application) => void;
};

export function PixiStage({ background = '#0a0a0a', onReady }: PixiStageProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let ro: ResizeObserver | undefined;
    const app = new Application();

    void (async () => {
      await app.init({
        width: LOGICAL_WIDTH,
        height: LOGICAL_HEIGHT,
        background,
        antialias: true,
        resolution: maxDpr(),
        autoDensity: true,
      });
      if (disposed) {
        app.destroy(true);
        return;
      }
      appRef.current = app;
      host.appendChild(app.canvas);

      const fit = () => {
        const rect = host.getBoundingClientRect();
        const layout = layoutContain(rect.width, rect.height);
        const canvas = app.canvas;
        canvas.style.position = 'absolute';
        canvas.style.left = `${layout.offsetX}px`;
        canvas.style.top = `${layout.offsetY}px`;
        canvas.style.width = `${layout.width}px`;
        canvas.style.height = `${layout.height}px`;
      };
      fit();
      ro = new ResizeObserver(fit);
      ro.observe(host);
      onReadyRef.current?.(app);
    })();

    return () => {
      disposed = true;
      ro?.disconnect();
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, [background]);

  return <div ref={hostRef} className="pixi-stage" aria-hidden />;
}

export default PixiStage;
