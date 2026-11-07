/**
 * HUD clock skins. onair-clock and watch-clock share one clock.
 * Spec: docs/개발/공통엔진_v1.md §8-6.
 */
import type { TimerFaceModel } from '@/engine/systems/Timer';

export function TimerFace({ model }: { model: TimerFaceModel }) {
  if (model.skin === 'none') return null;
  if (model.skin === 'thermometer') return <Thermo model={model} />;
  if (model.skin === 'thread-spool') return <Spool model={model} />;
  if (model.skin === 'onair-clock' || model.skin === 'watch-clock') {
    return <Clock model={model} />;
  }
  return (
    <span className="timer-digits" data-timer-skin={model.skin} data-timer-label={model.label}>
      {model.label}
    </span>
  );
}

function Clock({ model }: { model: TimerFaceModel }) {
  const warn = model.warn ? ' warn' : '';
  const blink = model.blink ? ' blink' : '';
  const lamp =
    model.skin === 'watch-clock'
      ? `lamp lamp--${model.lamp} lamp--${model.watchLamp}`
      : `lamp lamp--${model.lamp}`;
  return (
    <div
      className={`timer-face timer-face--${model.skin}${warn}${blink}`}
      data-timer-skin={model.skin}
      data-timer-label={model.label}
      aria-label={model.skin === 'watch-clock' ? `벽시계 ${model.label}` : `방송 시각 ${model.label}`}
    >
      <span className={lamp} aria-hidden />
      {model.skin === 'onair-clock' ? (
        <span className="timer-mark">ON AIR</span>
      ) : (
        <span className="timer-mark">{model.watchLamp === 'main' ? '주' : '예비'}</span>
      )}
      <span className="timer-digits">{model.label}</span>
    </div>
  );
}

function Thermo({ model }: { model: TimerFaceModel }) {
  return (
    <div
      className={`timer-face timer-face--thermometer${model.warn ? ' warn' : ''}${model.blink ? ' blink' : ''}`}
      data-timer-skin="thermometer"
      data-timer-label={model.label}
      aria-label={`온도 ${model.label}`}
    >
      {model.hold ? <span className="timer-mark">불꽃</span> : null}
      <span className="timer-digits">{model.label}</span>
    </div>
  );
}

function Spool({ model }: { model: TimerFaceModel }) {
  return (
    <div
      className={`timer-face timer-face--thread-spool${model.redCore ? ' red-core' : ''}${model.flutter ? ' flutter' : ''}`}
      data-timer-skin="thread-spool"
      data-timer-label={model.label}
      data-step={model.step}
      aria-label={`남은 실 ${model.label}`}
    >
      <span className="spool" aria-hidden>
        <span className="spool-thread" style={{ height: `${Math.round(model.ratio * 100)}%` }} />
      </span>
      <span className="timer-digits">{model.label}</span>
    </div>
  );
}
