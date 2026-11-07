'use client';

import { useEffect, useRef, useState, type MutableRefObject, type PointerEvent as ReactPointerEvent } from 'react';
import { useAppStore } from '@/engine/save/appStore';
import { LetterCard } from '@/engine/ui/LetterCard';
import { nearestSnap } from '@/engine/widgets/DragSnap';
import { markFound, type FindTarget } from '@/engine/widgets/FindTap';
import { NumberDial } from '@/engine/widgets/NumberDial';
import { SeamRip } from '@/engine/widgets/SeamRip';
import { SequenceTap } from '@/engine/widgets/SequenceTap';
import { SewingMachine, type SewSnapshot } from '@/engine/widgets/SewingMachine';
import {
  BUTTON_CARD,
  CLOCK,
  endingBeats,
  LEDGER_1999,
  LEDGER_2023,
  line,
  MOM_NOTE,
  type ScriptKey,
} from './data/script';
import {
  CASE,
  clothPark,
  COVERS,
  curvePath,
  eyeTarget,
  GAUGE_TARGETS,
  HOLE_ORDER,
  ITEM_KEY,
  ITEM_NOTE,
  ITEM_RIPPER,
  ITEM_TICKET,
  judgeButton,
  judgeCover,
  judgeEye,
  judgeGauge,
  judgeHoles,
  judgeKnot,
  judgeP1,
  judgeSew,
  judgeShelf,
  judgeWrap,
  RIP_COUNT,
  STRAIGHT_PATH,
  straightPercent,
  THREAD_TIP,
  WRAP_TURNS,
} from './puzzles/answers';
import { useTailorStore } from './store';

const ORDER = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'] as const;

const ROOM: Record<string, string> = {
  shop: '가게',
  door: '창고 문',
  ledger: '재봉틀 자리',
  warehouse: '창고',
  shelf: '철망 선반',
  bench: '작업대',
  'sewing-straight': '재봉틀',
  'sewing-curve': '재봉틀',
};

type Card = { title: string; body: string } | null;

export function TailorFlow({
  say,
  askHint,
  clockRef,
  selectedItem,
  onUseRef,
  onHold,
}: {
  say: (text: string) => void;
  askHint: () => void;
  clockRef: MutableRefObject<(ms: number) => void>;
  selectedItem: string | null;
  onUseRef: MutableRefObject<(itemId: string | null, targetId: string) => void>;
  onHold: (hold: boolean) => void;
}) {
  const scene = useTailorStore((s) => s.scene);
  const solved = useTailorStore((s) => s.solved);
  const quiet = useAppStore((s) => s.settings.reduceEffects);
  const [beat, setBeat] = useState<number | null>(null);
  const [card, setCard] = useState<Card>(null);
  const [notes, setNotes] = useState(false);
  const [flicker, setFlicker] = useState(false);
  const sayRef = useRef(say);
  sayRef.current = say;
  const notebook = useTailorStore((s) => s.notebook);

  useEffect(() => {
    onUseRef.current = (itemId, targetId) => {
      if (targetId.startsWith('cover:')) compare(itemId, targetId.slice(6), sayRef.current);
      if (targetId === 'lining') startRip(itemId, sayRef.current);
    };
  }, [onUseRef]);

  useEffect(() => {
    const s = useTailorStore.getState();
    if (scene === 'warehouse' && !s.flags.p2room) {
      s.setFlag('p2room');
      sayRef.current(line('p2.room'));
    }
    if (scene === 'shelf' && !s.flags.p4look) {
      s.setFlag('p4look');
      sayRef.current(line('p4.look'));
    }
    if (scene === 'bench' && s.solved.P4 && !s.flags.p5flash) {
      s.setFlag('p5flash');
      sayRef.current(line('p5.flash'));
    }
    if (scene === 'sewing-straight' && !s.flags.sewGuide) {
      s.setFlag('sewGuide');
      sayRef.current(line('p3.guide1'));
      sayRef.current(line('p3.guide2'));
      sayRef.current(line('p3.one'));
    }
    if (scene === 'sewing-curve' && !s.flags.curveGuide) {
      s.setFlag('curveGuide');
      sayRef.current(line('p8.pocket'));
      sayRef.current(line('p8.ask'));
    }
  }, [scene]);

  useEffect(() => {
    clockRef.current = (ms) => {
      const on = ms >= 29 * 60_000;
      setFlicker((prev) => (prev === on ? prev : on));
      const tell = sayRef.current;
      for (const cue of CLOCK) {
        once(cue.id, ms >= cue.at, () => {
          tell(line(cue.key));
          if (cue.id === 'flicker' && useTailorStore.getState().scene === 'sewing-curve') {
            tell(line('p8.flicker'));
          }
        });
      }
    };
    return () => {
      clockRef.current = () => undefined;
    };
  }, [clockRef]);

  const go = (to: string) => useTailorStore.getState().setScene(to);
  const next = ORDER.find((id) => !solved[id]) ?? '끝';
  const collapsed = scene === 'sewing-straight' || scene === 'sewing-curve';

  return (
    <div
      className="tailor-flow"
      data-scene={scene}
      data-next={next}
      data-flicker={flicker ? (quiet ? 'soft' : 'hard') : 'no'}
    >
      <p className="radio-room">
        {ROOM[scene] ?? scene} · {next}
      </p>
      <div className="radio-row">
        {scene !== 'shop' && scene !== 'sewing-straight' && scene !== 'sewing-curve' && (
          <button type="button" onClick={() => go('shop')}>
            가게
          </button>
        )}
        {(scene === 'sewing-straight' || scene === 'sewing-curve') && (
          <button type="button" onClick={() => go('ledger')}>
            그만두기
          </button>
        )}
        <button type="button" onClick={() => go('ledger')}>
          재봉틀 자리
        </button>
        <button
          type="button"
          onClick={() => {
            if (!solved.P1 && scene !== 'door') {
              say(line('p1.curtain'));
              go('door');
              return;
            }
            if (!solved.P1) return say('문이 잠겼다.');
            go('warehouse');
          }}
        >
          창고
        </button>
        <button type="button" onClick={() => setNotes((open) => !open)}>
          수첩
        </button>
        {collapsed && (
          <button type="button" className="scene-thimble" onClick={askHint}>
            골무
          </button>
        )}
      </div>
      {notes && (
        <ul className="radio-notes">
          {notebook.length === 0 && <li>비어 있다.</li>}
          {notebook.map((note) => (
            <li key={note.id}>{note.text}</li>
          ))}
        </ul>
      )}

      {scene === 'shop' && <Shop say={say} />}
      {scene === 'door' && <Door say={say} />}
      {scene === 'ledger' && <Ledger say={say} setCard={setCard} />}
      {scene === 'warehouse' && <Warehouse say={say} />}
      {scene === 'shelf' && <Shelf say={say} selectedItem={selectedItem} />}
      {scene === 'bench' && <Bench say={say} setCard={setCard} />}
      {scene === 'sewing-straight' && (
        <SewBox
          curve={false}
          say={say}
          onPass={(ratio) => finishStraight(ratio, say)}
        />
      )}
      {scene === 'sewing-curve' && solved.P7 && !solved.P8 && (
        <SewBox
          curve
          say={say}
          onPass={(ratio) => {
            const s = useTailorStore.getState();
            s.patchExtra({
              sewScore: { ...s.extra.sewScore, P8: straightPercent(ratio) },
            });
            onHold(true);
            setBeat(0);
          }}
        />
      )}

      {beat != null && !solved.P8 && (
        <div className="tailor-ending" role="dialog">
          <p>{line(endingBeats[beat] ?? 'end.10')}</p>
          <button
            type="button"
            onClick={() => {
              if (beat >= endingBeats.length - 1) {
                const s = useTailorStore.getState();
                if (!s.solved.P8) {
                  s.markSolved('P8');
                  s.setScene('shop');
                }
                return;
              }
              setBeat(beat + 1);
            }}
          >
            {beat >= endingBeats.length - 1 ? '끝' : '다음'}
          </button>
        </div>
      )}

      <LetterCard
        open={!!card}
        title={card?.title}
        body={card?.body ?? ''}
        onClose={() => setCard(null)}
      />
    </div>
  );
}

function once(flag: string, ready: boolean, run: () => void) {
  if (!ready) return;
  const s = useTailorStore.getState();
  if (s.flags[flag]) return;
  s.setFlag(flag);
  run();
}

function addNote(id: string, text: string) {
  const s = useTailorStore.getState();
  if (s.notebook.some((note) => note.id === id)) return;
  useTailorStore.setState({ notebook: [...s.notebook, { id, text }] });
}

function Shop({ say }: { say: (text: string) => void }) {
  return (
    <section>
      <div className="radio-row">
        <button type="button" onClick={() => say(line('p1.boss'))}>
          사장
        </button>
        <button
          type="button"
          onClick={() => {
            say(line('p1.ticket'));
            addNote('ticket', line('p1.ticket'));
          }}
        >
          번호표
        </button>
      </div>
    </section>
  );
}

function Door({ say }: { say: (text: string) => void }) {
  const solved = useTailorStore((s) => !!s.solved.P1);
  const dial = useRef(new NumberDial(4));
  const [vals, setVals] = useState<number[]>([0, 0, 0, 0]);
  const [clues, setClues] = useState<FindTarget[]>([{ id: 'tape', found: false }]);

  return (
    <section>
      <div className="radio-row">
        <button type="button" onClick={() => say(line('p1.curtain'))}>
          자물쇠
        </button>
        <button
          type="button"
          onClick={() => {
            setClues((prev) => markFound(prev, 'tape'));
            say(line('p1.tape'));
            addNote('tape', '줄자 단추: 0 · 7 · 3 · 1');
          }}
        >
          줄자 {clues[0]?.found ? '확인' : ''}
        </button>
        <button type="button" onClick={() => say(line('p1.boss'))}>
          사장
        </button>
      </div>
      {!solved && (
        <div className="radio-row" aria-label="숫자 다이얼">
          {vals.map((value, i) => (
            <button
              key={i}
              type="button"
              data-digit={i}
              onClick={() => {
                dial.current.setDigit(i, value + 1);
                setVals([...dial.current.values]);
              }}
            >
              {value}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              const code = vals.join('');
              const verdict = judgeP1(code);
              if (verdict === 'ok') {
                const s = useTailorStore.getState();
                if (s.solved.P1) return;
                s.markSolved('P1');
                s.setScene('warehouse');
                say(line('p1.solved'));
                say(line('p1.chance'));
                say(line('p1.smell'));
                return;
              }
              if (verdict === 'reverse') {
                useTailorStore.getState().patchExtra({ trapReverseTape: true });
                say(line('p1.reverse'));
                return;
              }
              say(line('p1.no'));
            }}
          >
            열기
          </button>
        </div>
      )}
      {solved && <p>창고 문이 열려 있다.</p>}
    </section>
  );
}

function Ledger({
  say,
  setCard,
}: {
  say: (text: string) => void;
  setCard: (card: Card) => void;
}) {
  const solved = useTailorStore((s) => s.solved);
  const [books, setBooks] = useState<FindTarget[]>([
    { id: '1999', found: false },
    { id: '2023', found: false },
  ]);

  return (
    <section>
      <div className="radio-row">
        <button
          type="button"
          onClick={() => {
            setBooks((prev) => markFound(prev, '1999'));
            setCard({ title: '1999년 장부', body: LEDGER_1999 });
            say(line('p2.book1999'));
            say(line('p2.boss'));
            addNote('0731', line('p2.book1999'));
          }}
        >
          1999 {books.find((book) => book.id === '1999')?.found ? '봄' : ''}
        </button>
        <button
          type="button"
          onClick={() => {
            setBooks((prev) => markFound(prev, '2023'));
            setCard({ title: '2023년 장부', body: LEDGER_2023 });
            say(line('p2.book2023'));
          }}
        >
          2023 {books.find((book) => book.id === '2023')?.found ? '봄' : ''}
        </button>
      </div>
      {solved.P2 && !solved.P3 && (
        <button type="button" onClick={() => openStraight(say)}>
          바지 단 박기
        </button>
      )}
      {solved.P7 && !solved.P8 && (
        <button
          type="button"
          onClick={() => {
            say(line('p8.ask'));
            useTailorStore.getState().setScene('sewing-curve');
          }}
        >
          안감 박기
        </button>
      )}
    </section>
  );
}

function openStraight(say: (text: string) => void) {
  say(line('p3.ask'));
  say(line('p3.me'));
  useTailorStore.getState().setScene('sewing-straight');
}

function Warehouse({ say }: { say: (text: string) => void }) {
  const solved = useTailorStore((s) => s.solved);
  const items = useTailorStore((s) => s.items);
  const pick = (color: string, fromTop: number) => {
    const verdict = judgeShelf(color, fromTop);
    if (verdict === 'clue') {
      say(line('p2.uniform'));
      addNote('ribbon', line('p2.note'));
      return;
    }
    if (verdict === 'trap') {
      useTailorStore.getState().patchExtra({ trapShelfFromBottom: true });
      say(line('p2.trap'));
      return;
    }
    if (verdict === 'ok') {
      const s = useTailorStore.getState();
      if (s.solved.P2) return say(line('p2.solved'));
      s.patchExtra({ shelfFound: true });
      s.markSolved('P2');
      say(line('p2.solved'));
      say(line('p2.jin'));
      say(line('p2.call'));
      return;
    }
    say(line('p2.no'));
  };

  return (
    <section>
      <p>빨강 나비매듭 · 파랑 한 번 · 초록 두 번 · 노랑 고리 · 남색은 철망</p>
      <div className="radio-row">
        <button type="button" onClick={() => pick('blue', 2)}>
          파랑 · 위에서 둘째
        </button>
        <button type="button" onClick={() => pick('navy', 3)}>
          남색 · 위에서 셋째
        </button>
        <button type="button" onClick={() => pick('navy', 4)}>
          남색 · 아래에서 셋째
        </button>
        <button type="button" onClick={() => pick('red', 1)}>
          빨강 · 위에서 첫째
        </button>
      </div>
      {solved.P2 && (
        <button
          type="button"
          onClick={() => {
            if (!items.includes(ITEM_KEY)) return say(line('p4.need'));
            useTailorStore.getState().setScene('shelf');
          }}
        >
          철망 열기
        </button>
      )}
      {solved.P4 && (
        <button type="button" onClick={() => useTailorStore.getState().setScene('bench')}>
          작업대
        </button>
      )}
    </section>
  );
}

function compare(itemId: string | null, coverId: string, say: (text: string) => void) {
  if (itemId !== ITEM_TICKET) {
    say('번호표 반쪽을 맞대 봐.');
    return;
  }
  const s = useTailorStore.getState();
  if (s.solved.P4) return;
  if (!s.extra.stubTried.includes(coverId)) {
    s.patchExtra({ stubTried: [...s.extra.stubTried, coverId] });
  }
  const verdict = judgeCover(coverId);
  if (verdict === 'ok') {
    useTailorStore.getState().markSolved('P4');
    useTailorStore.getState().setScene('bench');
    say(line('p4.solved'));
    say(line('p4.years'));
    addNote('years', line('p4.years'));
    return;
  }
  const key: ScriptKey =
    verdict === 'edge' ? 'p4.edge' : verdict === 'wave' ? 'p4.wave' : 'p4.seal';
  say(line(key));
}

function Shelf({
  say,
  selectedItem,
}: {
  say: (text: string) => void;
  selectedItem: string | null;
}) {
  const solved = useTailorStore((s) => !!s.solved.P4);
  return (
    <section>
      <button
        type="button"
        onClick={() => {
          say(line('p4.mine'));
          addNote('stub', line('p4.mine'));
        }}
      >
        내 번호표
      </button>
      {!solved && (
        <div className="radio-row">
          {COVERS.map((cover, index) => (
            <button
              key={cover.id}
              type="button"
              data-use-target={`cover:${cover.id}`}
              onClick={() => compare(selectedItem ?? ITEM_TICKET, cover.id, say)}
            >
              {cover.label}
              <span className="tailor-stub" aria-hidden>
                {index}
              </span>
            </button>
          ))}
        </div>
      )}
      {solved && <p>0731 커버를 꺼냈다.</p>}
    </section>
  );
}

function finishStraight(ratio: number, say: (text: string) => void) {
  const s = useTailorStore.getState();
  if (s.solved.P3) return;
  s.patchExtra({ sewScore: { ...s.extra.sewScore, P3: straightPercent(ratio) } });
  s.markSolved('P3');
  s.addItem(ITEM_KEY);
  s.addItem(ITEM_RIPPER);
  s.setScene('warehouse');
  say(line('p3.solved'));
  say(line('p3.key'));
  say(line('p3.ripper'));
}

function Bench({
  say,
  setCard,
}: {
  say: (text: string) => void;
  setCard: (card: Card) => void;
}) {
  const solved = useTailorStore((s) => s.solved);
  const items = useTailorStore((s) => s.items);
  const step = useTailorStore((s) => s.extra.buttonStep);
  const [ripping, setRipping] = useState(false);
  const [piece, setPiece] = useState<string | null>(null);

  return (
    <section>
      {!solved.P5 && (
        <>
          <div className="radio-row">
            <button type="button" onClick={() => say(line('p5.memo'))}>
              커버 메모
            </button>
            <button type="button" onClick={() => say(line('p5.left'))}>
              겉 왼쪽
            </button>
            <button type="button" onClick={() => say(line('p5.right'))}>
              겉 오른쪽
            </button>
            <button
              type="button"
              data-use-target="lining"
              onClick={() => {
                say(line('p5.lining'));
                startRip(items.includes(ITEM_RIPPER) ? ITEM_RIPPER : null, say);
                if (items.includes(ITEM_RIPPER)) setRipping(true);
              }}
            >
              안감 주머니
            </button>
          </div>
          {ripping && items.includes(ITEM_RIPPER) && (
            <RipPad
              say={say}
              onDone={() => {
                setRipping(false);
                finishRip(say, setCard);
              }}
            />
          )}
        </>
      )}

      {solved.P5 && !solved.P6 && (
        <CasePuzzle say={say} piece={piece} setPiece={setPiece} />
      )}

      {solved.P6 && !solved.P7 && (
        <ButtonPuzzle say={say} step={step} setCard={setCard} />
      )}

      {solved.P7 && !solved.P8 && (
        <button
          type="button"
          onClick={() => useTailorStore.getState().setScene('sewing-curve')}
        >
          재봉틀로
        </button>
      )}

      {items.includes(ITEM_NOTE) && (
        <div className="radio-row">
          <button type="button" onClick={() => setCard({ title: '엄마의 쪽지', body: MOM_NOTE })}>
            쪽지
          </button>
          <button type="button" onClick={() => setCard({ title: '꼬마 단추 다는 법', body: BUTTON_CARD })}>
            카드
          </button>
        </div>
      )}
    </section>
  );
}

function startRip(itemId: string | null, say: (text: string) => void) {
  if (itemId !== ITEM_RIPPER) say(line('p5.need'));
}

function finishRip(say: (text: string) => void, setCard: (card: Card) => void) {
  const s = useTailorStore.getState();
  if (s.solved.P5) return;
  s.markSolved('P5');
  s.addItem(ITEM_NOTE);
  s.patchExtra({ ripped: RIP_COUNT });
  addNote('mom', '엄마의 쪽지');
  addNote('how', '꼬마 단추 다는 법');
  setCard({ title: '엄마의 쪽지', body: MOM_NOTE });
  say(line('p5.solved'));
  say(line('p5.boss'));
  say(line('p5.card'));
}

function RipPad({ say, onDone }: { say: (text: string) => void; onDone: () => void }) {
  const padRef = useRef<HTMLDivElement>(null);
  const api = useRef<SeamRip | null>(null);
  const [left, setLeft] = useState(RIP_COUNT);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const sayRef = useRef(say);
  sayRef.current = say;

  useEffect(() => {
    const el = padRef.current;
    if (!el) return;
    const rip = new SeamRip({
      count: RIP_COUNT,
      onChange: (n) => {
        setLeft(n);
        useTailorStore.getState().patchExtra({ ripped: RIP_COUNT - n });
      },
      onStray: () => sayRef.current(line('p5.stray')),
      onComplete: () => onDoneRef.current(),
    });
    const saved = Math.min(RIP_COUNT, useTailorStore.getState().extra.ripped);
    for (let i = 0; i < saved; i++) rip.rip(i);
    api.current = rip;
    setLeft(rip.left);
    const off = rip.attach(el);
    return () => {
      off();
      api.current = null;
    };
  }, []);

  return (
    <div>
      <div ref={padRef} className="rip-pad" aria-label="시접">
        <p>남은 땀 {left}. 빨간 실을 따라 드래그하거나 한 땀씩.</p>
      </div>
      <button
        type="button"
        onClick={() => {
          const next = api.current?.stitches.find((stitch) => !stitch.ripped);
          if (next) api.current?.rip(next.index);
        }}
      >
        다음 땀
      </button>
    </div>
  );
}

function CasePuzzle({
  say,
  piece,
  setPiece,
}: {
  say: (text: string) => void;
  piece: string | null;
  setPiece: (id: string) => void;
}) {
  const gauge = useTailorStore((s) => s.extra.gauge);
  return (
    <section>
      <div className="radio-row">
        <button type="button" onClick={() => say(line('p6.spot'))}>
          빈 단추 자리
        </button>
        <button
          type="button"
          onClick={() => {
            say(line('p6.case'));
            addNote('lid', '엄마 생일 12/22 단추!!');
          }}
        >
          필통
        </button>
        <button type="button" onClick={() => say(line('p6.gauge'))}>
          게이지
        </button>
      </div>
      <div className="radio-row">
        {CASE.map((item) => (
          <button key={item.id} type="button" aria-pressed={piece === item.id} onClick={() => setPiece(item.id)}>
            {item.name}
            {gauge[item.id] ? ` ${gauge[item.id]}mm` : ''}
          </button>
        ))}
      </div>
      <div className="radio-row" aria-label="단추 게이지">
        {GAUGE_TARGETS.map((hole) => (
          <button
            key={hole.id}
            type="button"
            onClick={() => {
              if (!piece) return say('물건을 고르고 대 봐.');
              const hit = nearestSnap(hole.x, hole.y, GAUGE_TARGETS);
              const mm = Number(hit?.id ?? hole.id);
              const verdict = judgeGauge(piece, mm);
              if (verdict === 'fit') {
                const s = useTailorStore.getState();
                s.patchExtra({ gauge: { ...s.extra.gauge, [piece]: mm } });
                say(`${line('p6.fit')} ${mm}mm.`);
                return;
              }
              say(line('p6.loose'));
            }}
          >
            {hole.id}mm
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            if (!piece) return;
            const verdict = judgeButton(piece);
            if (verdict === 'ok') {
              const s = useTailorStore.getState();
              if (!s.solved.P6) s.markSolved('P6');
              say(line('p6.solved'));
              say(line('p6.boss'));
              return;
            }
            if (verdict === 'small') {
              useTailorStore.getState().patchExtra({ trapBrownGlass: true });
              say(line('p6.brown'));
              return;
            }
            const key: ScriptKey =
              verdict === 'big' ? 'p6.big' : verdict === 'one' ? 'p6.one' : verdict === 'roll' ? 'p6.roll' : 'p6.plain';
            say(line(key));
          }}
        >
          단추 자리에
        </button>
      </div>
    </section>
  );
}

function ButtonPuzzle({
  say,
  step,
  setCard,
}: {
  say: (text: string) => void;
  step: number;
  setCard: (card: Card) => void;
}) {
  return (
    <section>
      <button type="button" onClick={() => setCard({ title: '꼬마 단추 다는 법', body: BUTTON_CARD })}>
        카드
      </button>
      <p>단추 단계 {step + 1} / 4</p>
      {step <= 0 && (
        <button
          type="button"
          onClick={() => {
            say(line('p7.spool'));
            useTailorStore.getState().patchExtra({ buttonStep: 1 });
          }}
        >
          실 끝 자르기
        </button>
      )}
      {step === 1 && <Eye say={say} />}
      {step === 2 && <Holes say={say} />}
      {step === 3 && <Wrap say={say} />}
      {step >= 4 && <Knot say={say} />}
    </section>
  );
}

function Eye({ say }: { say: (text: string) => void }) {
  const [holding, setHolding] = useState(false);
  const [inside, setInside] = useState(false);
  const start = useRef<number | null>(null);
  const said = useRef(false);
  const sayRef = useRef(say);
  sayRef.current = say;

  useEffect(() => {
    const id = window.setInterval(() => {
      const hit = nearestSnap(THREAD_TIP.x, THREAD_TIP.y, [eyeTarget(performance.now())]);
      setInside(!!hit);
      if (!holding) {
        start.current = null;
        return;
      }
      if (!hit) {
        start.current = null;
        return;
      }
      const now = performance.now();
      if (start.current == null) start.current = now;
      if (judgeEye(true, true, now - start.current) === 'ok') {
        useTailorStore.getState().patchExtra({ buttonStep: 2 });
      }
    }, 50);
    return () => window.clearInterval(id);
  }, [holding]);

  return (
    <div>
      <p data-eye={inside ? 'in' : 'out'}>바늘귀 {inside ? '안' : '밖'}. 실 끝을 대고 잠깐 기다린다.</p>
      <button
        type="button"
        onPointerDown={() => setHolding(true)}
        onPointerUp={() => {
          setHolding(false);
          if (useTailorStore.getState().extra.buttonStep >= 2) return;
          const held = start.current == null ? 0 : performance.now() - start.current;
          const verdict = judgeEye(true, inside, held);
          if (verdict === 'ok') return;
          if (verdict === 'miss' || verdict === 'short') {
            sayRef.current(line('p7.miss'));
            if (!said.current) {
              said.current = true;
              sayRef.current(line('p7.hand'));
            }
          }
        }}
        onPointerLeave={() => setHolding(false)}
      >
        실 끝 대기
      </button>
      <button type="button" onClick={() => say(line('p7.fuzz'))}>
        안 자르고 꿰기
      </button>
    </div>
  );
}

function Holes({ say }: { say: (text: string) => void }) {
  const [seq, setSeq] = useState<string[]>([]);
  const tap = (id: string) => {
    const next = [...seq, id];
    if (judgeHoles(next) === 'ok' && new SequenceTap([...HOLE_ORDER]).check(next)) {
      useTailorStore.getState().patchExtra({ buttonStep: 3 });
      return;
    }
    const prefix = HOLE_ORDER.slice(0, next.length);
    if (next.every((item, i) => item === prefix[i])) {
      setSeq(next);
      return;
    }
    setSeq([]);
    say(line('p7.tangle'));
  };
  return (
    <div className="radio-row">
      <button type="button" onClick={() => tap('1u')}>
        구멍1 위
      </button>
      <button type="button" onClick={() => tap('2d')}>
        구멍2 아래
      </button>
      <p>
        {seq.length}/{HOLE_ORDER.length}
      </p>
    </div>
  );
}

function Wrap({ say }: { say: (text: string) => void }) {
  const acc = useRef(0);
  const prev = useRef<number | null>(null);
  const [turns, setTurns] = useState(0);
  const done = useRef(false);
  const finish = (n: number) => {
    setTurns(n);
    if (done.current || judgeWrap(n) !== 'ok') return;
    done.current = true;
    useTailorStore.getState().patchExtra({ buttonStep: 4 });
    say(line('p7.wrap'));
  };
  const angle = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return Math.atan2(event.clientY - (rect.top + rect.height / 2), event.clientX - (rect.left + rect.width / 2));
  };
  return (
    <div
      className="rip-pad"
      aria-label="실기둥"
      onPointerDown={(event) => {
        prev.current = angle(event);
      }}
      onPointerMove={(event) => {
        if (prev.current == null || event.buttons === 0) return;
        const next = angle(event);
        let delta = next - prev.current;
        if (delta > Math.PI) delta -= Math.PI * 2;
        if (delta < -Math.PI) delta += Math.PI * 2;
        prev.current = next;
        acc.current += delta;
        finish(Math.abs(acc.current) / (Math.PI * 2));
      }}
      onPointerUp={() => {
        prev.current = null;
      }}
    >
      <p>
        감은 바퀴 {turns.toFixed(1)} / {WRAP_TURNS}
      </p>
      <button type="button" onClick={() => finish(turns + 1)}>
        한 바퀴
      </button>
    </div>
  );
}

function Knot({ say }: { say: (text: string) => void }) {
  const down = useRef(0);
  return (
    <button
      type="button"
      onPointerDown={() => {
        down.current = performance.now();
      }}
      onPointerUp={() => {
        const held = performance.now() - down.current;
        if (judgeKnot(held) !== 'ok') {
          say(line('p7.short'));
          return;
        }
        const s = useTailorStore.getState();
        if (s.solved.P7) return;
        s.markSolved('P7');
        say(line('p7.solved'));
        say(line('p7.knot'));
        say(line('p7.next'));
      }}
    >
      매듭 누르기
    </button>
  );
}

function SewBox({
  curve,
  say,
  onPass,
}: {
  curve: boolean;
  say: (text: string) => void;
  onPass: (ratio: number) => void;
}) {
  const padRef = useRef<HTMLDivElement>(null);
  const machineRef = useRef<SewingMachine | null>(null);
  const parkRef = useRef(false);
  const passed = useRef(false);
  const sayRef = useRef(say);
  const onPassRef = useRef(onPass);
  sayRef.current = say;
  onPassRef.current = onPass;
  const [snap, setSnap] = useState<SewSnapshot | null>(null);
  const path = useRef(curve ? curvePath() : STRAIGHT_PATH);

  useEffect(() => {
    const el = padRef.current;
    if (!el) return;
    const machine = new SewingMachine({
      path: path.current,
      curve,
      oneHand: true,
      feed: curve ? [0, 40, 40, 40] : [0, 140, 200, 260],
      stepMs: curve ? 3000 : 500,
      onBunch: () => sayRef.current(line('p3.bunch')),
      onBigMiss: () => sayRef.current(line('p3.miss')),
      onReachEnd: (ratio) => {
        if (judgeSew(ratio) === 'ok') {
          if (passed.current) return;
          passed.current = true;
          onPassRef.current(ratio);
          return;
        }
        sayRef.current(line('p3.bad'));
        machine.reset();
        passed.current = false;
      },
    });
    machineRef.current = machine;
    const off = machine.attach(el);
    let frame = 0;
    const loop = () => {
      const now = performance.now();
      if (curve && parkRef.current) {
        machine.clothAngle = 0;
        machine.clothX = clothPark(path.current, machine.progressPx);
        machine.nudgeCloth(0, 0, now);
      }
      machine.tick(now);
      setSnap(machine.snapshot());
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      off();
      machineRef.current = null;
    };
  }, [curve]);

  return (
    <section data-sew={curve ? 'curve' : 'straight'} data-progress={(snap?.progress ?? 0).toFixed(2)}>
      <div ref={padRef} className="sew-pad" aria-label="재봉틀">
        <div className="role-pedal">페달</div>
        <div className="role-cloth">천</div>
      </div>
      <div className="radio-row">
        <button
          type="button"
          onPointerDown={() => machineRef.current?.setPedal(true, performance.now())}
          onPointerUp={() => machineRef.current?.setPedal(false, performance.now())}
          onPointerLeave={() => machineRef.current?.setPedal(false, performance.now())}
        >
          페달
        </button>
        <button type="button" onClick={() => machineRef.current?.nudgeCloth(0, 0, performance.now())}>
          살짝 밀기
        </button>
        {curve && (
          <button
            type="button"
            onPointerDown={() => {
              parkRef.current = true;
            }}
            onPointerUp={() => {
              parkRef.current = false;
            }}
            onPointerLeave={() => {
              parkRef.current = false;
            }}
          >
            초크선에 붙이기
          </button>
        )}
      </div>
      <p>
        진행 {((snap?.progress ?? 0) * 100).toFixed(0)}% · 어긋남 {(snap?.offset ?? 0).toFixed(0)} · 비뚤{' '}
        {Math.round((snap?.crookedRatio ?? 0) * 100)}%
      </p>
    </section>
  );
}
