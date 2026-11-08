'use client';

import { useEffect, useRef, useState } from 'react';
import type { SayFn } from '@/engine/ui/caption';
import { LetterDial } from '@/engine/widgets/LetterDial';
import { NumberDial } from '@/engine/widgets/NumberDial';
import { DragSort } from '@/engine/widgets/DragSort';
import { coatArt, magnetArt, MEMO_SRC, PHOTO_SRC, roomArt } from './art';
import { playClue, playSeat, stopBeds, syncBed } from './audio';
import styles from './art.module.css';
import { line, spoken } from './data/script';
import {
  COATS,
  HEIGHTS,
  MAGNETS,
  P3_LABEL,
  P3_ORDER,
  P3_START,
  P8_SLOTS,
  PHOTOS,
  PIECES,
  TAPE_PAD,
  ZOOM,
  collectPiece,
  frameLines,
  isP1Correct,
  isP2Correct,
  isP5Correct,
  isP8Correct,
  judgeCoat,
  judgeP3,
  judgeP4,
  judgeTape,
  judgeZoom,
  nextPuzzle,
  pieceOpen,
  piecesComplete,
  stepZoom,
} from './puzzles/answers';
import { use112Store } from './store';
import { use112Ui } from './ui';

export function Neulbom112Flow({ say }: { say: SayFn }) {
  const solved = use112Store((s) => s.solved);
  const items = use112Store((s) => s.items);
  const pieces = use112Store((s) => s.extra.pieces);
  const doll = use112Store((s) => !!s.flags.doll);
  const ending = use112Store((s) => !!s.flags.endingA);
  const zoom = use112Ui((s) => s.zoom);
  const sayRef = useRef(say);
  sayRef.current = say;
  const [letterOpen, setLetterOpen] = useState(false);
  const current = nextPuzzle(solved);

  useEffect(() => {
    if (zoom < ZOOM.p8 || use112Store.getState().flags.x12) return;
    use112Store.getState().setFlag('x12');
    sayRef.current(spoken('narration.x12'));
  }, [zoom]);

  useEffect(() => {
    syncBed({ hush: doll || ending });
    return () => stopBeds();
  }, [doll, ending]);

  const has = (id: string) => items.includes(id);

  return (
    <div className={`flow112 ${styles.flow}`} data-zoom={zoom} data-puzzle={current ?? 'clear'}>
      <img
        className={styles.scene}
        src={roomArt({ open: !!solved.P1, up: !!solved.P5, attic: !!solved.P7, lights: doll || ending })}
        alt=""
      />
      <div className="radio-row">
        <button type="button" aria-label="배율 낮추기" onClick={() => use112Ui.getState().setZoom(stepZoom(zoom, -1))}>
          −
        </button>
        <p>×{zoom}</p>
        <button type="button" aria-label="배율 높이기" onClick={() => use112Ui.getState().setZoom(stepZoom(zoom, 1))}>
          +
        </button>
      </div>

      {!has('줄자') && (
        <button type="button" onClick={() => gain('줄자', say, ['inspect.desk', 'acquire.tape'])}>
          <Mark name="desk" />
          작업대
        </button>
      )}
      {!has('편지①') && (
        <button type="button" onClick={() => gain('편지①', say, ['inspect.wall', 'letter.1', 'narration.letter.1'])}>
          <Mark name="wall" />
          공방 벽
        </button>
      )}

      {current === 'P1' && <Mailbox zoom={zoom} say={say} />}
      {current === 'P2' && <Door zoom={zoom} say={say} hasTape={has('줄자')} />}
      {current === 'P3' && <Calendar zoom={zoom} say={say} />}
      {current === 'P4' && <Magnets zoom={zoom} say={say} />}
      {current === 'P5' && <Clock zoom={zoom} say={say} />}
      {current === 'P6' && <Bed zoom={zoom} say={say} />}
      {current === 'P7' && <Wardrobe zoom={zoom} say={say} letters={has('편지①') && has('편지②') && has('편지③')} />}
      {current === 'P8' && <Attic zoom={zoom} say={say} read={has('그림')} />}

      {solved.P1 && !solved.P5 && (
        <button type="button" onClick={() => say(zoom >= ZOOM.p5 ? line('inspect.clock.shop') : line('inspect.clock.far'))}>
          <Mark name="clock" />
          벽시계 문자판
        </button>
      )}
      {solved.P1 && (
        <button type="button" onClick={() => say(spoken('inspect.pot'))}>
          <Mark name="pot" />
          창가 화분
        </button>
      )}
      {solved.P4 && !has('사진·입학') && (
        <button type="button" onClick={() => gain('사진·입학', say, ['acquire.photo2'])}>
          <Mark name="photo-school" />
          거실 액자
        </button>
      )}
      {solved.P5 && !has('사진·졸업') && (
        <button type="button" onClick={() => gain('사진·졸업', say, ['acquire.photo3'])}>
          <Mark name="photo-grad" />
          책상
        </button>
      )}
      {(has('편지①') || has('편지②') || has('편지③')) && (
        <button
          type="button"
          onClick={() => {
            playClue('mom');
            if (has('편지①')) say(spoken('letter.1'));
            if (has('편지②')) say(spoken('letter.2'));
            if (has('편지③')) say(spoken('letter.3'));
          }}
        >
          편지 다시 읽기
        </button>
      )}

      <div className="radio-row">
        {PIECES.filter((piece) => pieceOpen(piece.after, solved) && !pieces.includes(piece.id)).map((piece) => (
          <button key={piece.id} type="button" onClick={() => onPiece(piece.id, piece.zoom, piece.text, zoom, say)}>
            <Mark name={`piece-${piece.id}`} />
            {piece.label}
          </button>
        ))}
      </div>

      {solved.P8 && !ending && !letterOpen && (
        <button type="button" data-stand="doll" onClick={() => placeDoll(say, setLetterOpen)}>
          <Mark name="stand" />
          빈 받침대
        </button>
      )}
      {letterOpen && (
        <section className={styles.sheet} data-letter="hidden">
          <p>{line('letter.hidden')}</p>
          <button
            type="button"
            onClick={() => {
              setLetterOpen(false);
              use112Store.getState().setFlag('endingA');
            }}
          >
            접기
          </button>
        </section>
      )}
      {doll && !ending && <p>창문마다 불이 켜졌다. 기억 조각 {pieces.length}/8</p>}
    </div>
  );
}

function Mark({ name }: { name: string }) {
  return <img className={styles.mark} src={`/themes/neulbom-112/props/${name}.svg`} alt="" />;
}

function gain(id: string, say: SayFn, keys: Parameters<typeof line>[0][]) {
  const store = use112Store.getState();
  if (!store.items.includes(id)) store.addItem(id);
  if (id.startsWith('편지')) {
    playSeat('paper');
    playClue('mom');
  } else if (id.startsWith('사진') || id === '쪽지' || id === '그림' || id === '봉투') playSeat('paper');
  else if (id === '줄자') playSeat('drawer');
  for (const key of keys) say(spoken(key));
}

function Mailbox({ zoom, say }: { zoom: number; say: SayFn }) {
  const [open, setOpen] = useState(false);
  return (
    <section data-puzzle="P1">
      <button
        type="button"
        onClick={() => {
          if (judgeZoom(zoom, ZOOM.p1) === 'far') {
            say(spoken('inspect.mailbox.far'));
            return;
          }
          say(spoken('inspect.mailbox.near'));
          setOpen(true);
        }}
      >
        <Mark name="mailbox" />
        우편함
      </button>
      {open && <img className={styles.clue} src="/themes/neulbom-112/props/envelope-near.svg" alt="" />}
      {open && (
        <NumberPad
          digits={4}
          aria="지붕 자물쇠"
          ok={isP1Correct}
          onYes={() => {
            const s = use112Store.getState();
            s.addItem('봉투');
            s.setScene('dollhouse');
            s.markSolved('P1');
            playSeat('lock');
            playSeat('paper');
            say(spoken('acquire.envelope'));
            say(spoken('narration.p1.solved'));
          }}
          onNo={() => say(spoken('system.wrong'))}
        />
      )}
    </section>
  );
}

function Door({ zoom, say, hasTape }: { zoom: number; say: SayFn; hasTape: boolean }) {
  const [tape, setTape] = useState(false);
  return (
    <section data-puzzle="P2">
      <p>{line('inspect.frame')}</p>
      <p>{line('inspect.lock')}</p>
      <button
        type="button"
        className="flow112-pad"
        data-target="frame"
        onPointerUp={(event) => {
          if (!hasTape) {
            say(spoken('inspect.desk'));
            return;
          }
          const rect = event.currentTarget.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width) * TAPE_PAD.w;
          const y = ((event.clientY - rect.top) / rect.height) * TAPE_PAD.h;
          const verdict = judgeTape(x, y, zoom);
          if (verdict === 'miss') say(spoken('tape.miss'));
          else if (verdict === 'far') say(spoken('tape.far'));
          else {
            setTape(true);
            say(spoken('tape.ok'));
          }
        }}
      >
        문틀
      </button>
      {tape && (
        <>
          <img className={styles.clue} src="/themes/neulbom-112/props/heights.svg" alt="" />
          <p>{HEIGHTS.map((row) => `${row.age}살 ${row.cm}`).join(' · ')}</p>
          <NumberPad
            digits={4}
            aria="신발장"
            ok={isP2Correct}
            onYes={() => {
              const s = use112Store.getState();
              s.addItem('편지②');
              s.markSolved('P2');
              playSeat('lock');
              playSeat('paper');
              playClue('mom');
              say(spoken('letter.2'));
            }}
            onNo={() => say(spoken('system.wrong'))}
          />
        </>
      )}
    </section>
  );
}

function Calendar({ zoom, say }: { zoom: number; say: SayFn }) {
  if (judgeZoom(zoom, ZOOM.p3) === 'far') {
    return (
      <button type="button" data-puzzle="P3" onClick={() => say(spoken('calendar.far'))}>
        <Mark name="calendar" />
        달력
      </button>
    );
  }
  return (
    <section data-puzzle="P3">
      <SortPad
        onYes={() => {
          const s = use112Store.getState();
          s.addItem('편지③');
          s.addItem('사진·돌');
          s.markSolved('P3');
          playSeat('drawer');
          playSeat('paper');
          playClue('mom');
          say(spoken('narration.p3'));
          say(spoken('letter.3'));
        }}
        onNo={() => say(spoken('system.wrong'))}
      />
    </section>
  );
}

function Magnets({ zoom, say }: { zoom: number; say: SayFn }) {
  const [taps, setTaps] = useState<string[]>([]);
  const far = judgeZoom(zoom, ZOOM.p4) === 'far';
  return (
    <section data-puzzle="P4">
      <p>{far ? line('magnet.far') : line('inspect.fridge')}</p>
      <img className={styles.clue} data-clear={far ? 'no' : 'yes'} src="/themes/neulbom-112/props/fridge.svg" alt="" />
      <div className="radio-row">
        {MAGNETS.map((magnet) => (
          <button
            key={magnet.id}
            type="button"
            onClick={() => {
              if (far) {
                say(spoken('magnet.far'));
                return;
              }
              if ('route' in magnet && magnet.route && !use112Store.getState().flags.route) {
                use112Store.getState().setFlag('route');
                say(spoken('inspect.route'));
              }
              const next = [...taps, magnet.id];
              const verdict = judgeP4(next);
              if (verdict === 'reset') {
                setTaps([]);
                playSeat('magnets');
                say(spoken('p4.wrong'));
                return;
              }
              setTaps(next);
              if (verdict === 'ok') {
                use112Store.getState().markSolved('P4');
                playSeat('tick');
                say(spoken('narration.p4'));
              }
            }}
          >
            <img className={styles.mark} data-clear={far ? 'no' : 'yes'} src={magnetArt(magnet.id)} alt="" />
            {magnet.label}
            {!far && magnet.dot > 0 ? ` 점${magnet.dot}` : ''}
          </button>
        ))}
      </div>
    </section>
  );
}

function Clock({ zoom, say }: { zoom: number; say: SayFn }) {
  const far = judgeZoom(zoom, ZOOM.p5) === 'far';
  return (
    <section data-puzzle="P5">
      <p>{line('inspect.clock')}</p>
      <img className={styles.clue} data-clear={far ? 'no' : 'yes'} src="/themes/neulbom-112/props/clock.svg" alt="" />
      {far ? (
        <p>시계 바늘이 흐리다.</p>
      ) : (
        <>
          {PHOTOS.map((photo) => (
            <img key={photo.id} className={styles.clue} src={PHOTO_SRC[photo.id]} alt="" />
          ))}
          {frameLines().map((text) => (
            <p key={text}>{text}</p>
          ))}
          <NumberPad
            digits={3}
            aria="벽시계"
            ok={isP5Correct}
            onYes={() => {
              const s = use112Store.getState();
              if (!s.items.includes(PHOTOS[1]!.id)) s.addItem(PHOTOS[1]!.id);
              s.markSolved('P5');
              playSeat('lock');
              playSeat('tick');
              say(spoken('narration.p5'));
            }}
            onNo={() => say(spoken('system.wrong'))}
          />
        </>
      )}
    </section>
  );
}

function Bed({ zoom, say }: { zoom: number; say: SayFn }) {
  return (
    <section data-puzzle="P6">
      <p>{line('inspect.bed')}</p>
      <img className={styles.clue} data-clear={judgeZoom(zoom, ZOOM.p6) === 'far' ? 'no' : 'yes'} src="/themes/neulbom-112/props/bed.svg" alt="" />
      <button
        type="button"
        onClick={() => {
          if (judgeZoom(zoom, ZOOM.p6) === 'far') {
            say(spoken('bed.far'));
            return;
          }
          const s = use112Store.getState();
          s.addItem('쪽지');
          s.markSolved('P6');
          playSeat('paper');
          say(spoken('acquire.note'));
          say(spoken('note.back'));
        }}
      >
        <Mark name="bed" />
        침대 밑
      </button>
    </section>
  );
}

function Wardrobe({
  zoom,
  say,
  letters,
}: {
  zoom: number;
  say: SayFn;
  letters: boolean;
}) {
  const far = judgeZoom(zoom, ZOOM.p7) === 'far';
  return (
    <section data-puzzle="P7">
      <button type="button" onClick={() => say(spoken('inspect.vanity'))}>
        <Mark name="vanity" />
        화장대
      </button>
      <p>{far ? line('coat.far') : line('inspect.wardrobe')}</p>
      {!letters && <p>편지를 다 모으지 않았다.</p>}
      <div className="radio-row">
        {COATS.map((coat) => (
          <button
            key={coat.id}
            type="button"
            onClick={() => {
              if (far || !letters) {
                say(far ? line('coat.far') : line('letter.3'));
                return;
              }
              if (judgeCoat(coat.id) === 'no') {
                say(spoken('coat.wrong'));
                return;
              }
              const s = use112Store.getState();
              s.addItem('다락 열쇠');
              s.markSolved('P7');
              playSeat('drawer');
              say(spoken('coat.ok'));
              say(spoken('narration.attic'));
            }}
          >
            <img className={styles.mark} src={coatArt(coat.id, far)} alt="" />
            {far ? '코트' : coat.label}
          </button>
        ))}
      </div>
    </section>
  );
}

function Attic({ zoom, say, read }: { zoom: number; say: SayFn; read: boolean }) {
  const far = judgeZoom(zoom, ZOOM.p8) === 'far';
  return (
    <section data-puzzle="P8">
      <p>{line('inspect.box')}</p>
      <img className={styles.clue} src="/themes/neulbom-112/props/box.svg" alt="" />
      <button
        type="button"
        onClick={() => {
          if (far) {
            say(spoken('drawing.far'));
            return;
          }
          const s = use112Store.getState();
          if (!s.items.includes('그림')) {
            s.addItem('그림');
            playSeat('paper');
          }
          say(spoken('drawing.near'));
          say(spoken('drawing.back'));
        }}
      >
        <img className={styles.mark} data-clear={far ? 'no' : 'yes'} src={far ? '/themes/neulbom-112/props/drawing.svg' : '/themes/neulbom-112/props/drawing-near.svg'} alt="" />
        벽 그림
      </button>
      {read && (
        <>
          <img className={styles.clue} src="/themes/neulbom-112/props/drawing-near.svg" alt="" />
          <p>{line('inspect.attic.box')}</p>
          <LetterPad
            onYes={() => {
              use112Store.getState().markSolved('P8');
              playSeat('lock');
              playSeat('drawer');
              say(spoken('narration.p8.solved'));
              say(spoken('narration.dolls'));
              say(spoken('memo.author'));
              say(spoken('guide.stand'));
            }}
            onNo={() => say(spoken('system.wrong'))}
          />
        </>
      )}
    </section>
  );
}

function placeDoll(say: SayFn, openLetter: (open: boolean) => void) {
  const s = use112Store.getState();
  if (!s.flags.doll) {
    s.setFlag('doll');
    playSeat('wood');
    say(spoken('narration.doll'));
    say(spoken('narration.home'));
  }
  if (piecesComplete(s.extra.pieces)) {
    openLetter(true);
    playClue('ending');
  } else s.setFlag('endingA');
}

function onPiece(id: string, need: number, text: string, zoom: number, say: SayFn) {
  if (judgeZoom(zoom, need) === 'far') {
    say(spoken('system.wrong'));
    return;
  }
  const s = use112Store.getState();
  s.patchExtra({ pieces: collectPiece(s.extra.pieces, id) });
  playSeat('spark');
  say(text);
}

function NumberPad({
  digits,
  aria,
  ok,
  onYes,
  onNo,
}: {
  digits: number;
  aria: string;
  ok: (values: readonly number[]) => boolean;
  onYes: () => void;
  onNo: () => void;
}) {
  const dial = useRef(new NumberDial(digits));
  const [, bump] = useState(0);
  return (
    <div className="radio-row" data-dial={aria}>
      {dial.current.values.map((value, index) => (
        <button
          key={index}
          type="button"
          aria-label={`${aria} ${index + 1}`}
          onClick={() => {
            dial.current.setDigit(index, value + 1);
            playSeat('dial');
            bump((n) => n + 1);
          }}
        >
          {value}
        </button>
      ))}
      <button type="button" onClick={() => (ok(dial.current.values) ? onYes() : onNo())}>
        확인
      </button>
    </div>
  );
}

function LetterPad({ onYes, onNo }: { onYes: () => void; onNo: () => void }) {
  const dial = useRef(new LetterDial(P8_SLOTS));
  const [, bump] = useState(0);
  return (
    <div className="radio-row" data-dial="다락">
      {dial.current.indices.map((index, slot) => (
        <button
          key={slot}
          type="button"
          aria-label={`글자 ${slot + 1}`}
          onClick={() => {
            dial.current.setIndex(slot, index + 1);
            playSeat('dial');
            bump((n) => n + 1);
          }}
        >
          {P8_SLOTS[slot]![index]}
        </button>
      ))}
      <button type="button" onClick={() => (isP8Correct(dial.current.value()) ? onYes() : onNo())}>
        확인
      </button>
    </div>
  );
}

function SortPad({ onYes, onNo }: { onYes: () => void; onNo: () => void }) {
  const sort = useRef(new DragSort([...P3_START]));
  const [, bump] = useState(0);
  return (
    <div data-sort="calendar">
      {sort.current.order.map((id, index) => (
        <div key={id} className="radio-row">
          <img className={styles.mark} src={MEMO_SRC[id] ?? MEMO_SRC.talk} alt="" />
          <p>{P3_LABEL[id as (typeof P3_ORDER)[number]]}</p>
          {index > 0 && (
            <button
              type="button"
              aria-label={`${P3_LABEL[id as (typeof P3_ORDER)[number]]} 앞으로`}
              onClick={() => {
                sort.current.move(index, index - 1);
                bump((n) => n + 1);
              }}
            >
              앞으로
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={() => (judgeP3(sort.current.order) ? onYes() : onNo())}>
        서랍 열기
      </button>
    </div>
  );
}
