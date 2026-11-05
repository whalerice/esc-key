/**
 * Shared GSAP tweens. Kill scene context on leave. Spec: §14.
 * PixiPlugin registration deferred until a Pixi target is mounted.
 */
import gsap from 'gsap';

export function shake(target: gsap.TweenTarget, reduce = false): gsap.core.Tween {
  const amp = reduce ? 2 : 8;
  return gsap.fromTo(
    target,
    { x: -amp },
    { x: amp, duration: 0.3, yoyo: true, repeat: 3, clearProps: 'x' },
  );
}

export function createSceneContext(): gsap.Context {
  return gsap.context(() => undefined);
}
