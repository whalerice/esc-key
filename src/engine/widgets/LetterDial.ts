/** Letter / syllable dial — emits via value(). Puzzle judges. Spec: §8-2. */
import { Container, FederatedPointerEvent, Graphics, Text } from 'pixi.js';

export type LetterDialListener = (value: string) => void;

export class LetterDial {
  constructor(
    public slots: string[][],
    public indices: number[] = slots.map(() => 0),
    private onChange?: LetterDialListener,
  ) {}

  value(): string {
    return this.indices.map((i, s) => this.slots[s]![i]!).join('');
  }

  setIndex(slot: number, index: number): void {
    const opts = this.slots[slot]!;
    this.indices[slot] = ((index % opts.length) + opts.length) % opts.length;
    this.onChange?.(this.value());
  }

  mount(parent: Container, opts?: { x?: number; y?: number; title?: string }): Container {
    const root = new Container();
    root.position.set(opts?.x ?? 480, opts?.y ?? 260);
    const n = this.slots.length;
    const slotW = 140;
    const gap = 28;
    const width = Math.max(720, n * slotW + (n - 1) * gap + 80);
    const bg = new Graphics()
      .roundRect(0, 0, width, 440, 8)
      .fill({ color: 0x1a1510, alpha: 0.96 })
      .stroke({ color: 0xc4a574, width: 2 });
    root.addChild(bg);
    const title = new Text({
      text: opts?.title ?? '글자 다이얼',
      style: { fill: 0xf2efe8, fontSize: 28 },
    });
    title.position.set(40, 24);
    root.addChild(title);

    const startX = (width - (n * slotW + (n - 1) * gap)) / 2;
    for (let s = 0; s < n; s++) {
      const cell = new Container();
      cell.position.set(startX + s * (slotW + gap), 100);
      cell.eventMode = 'static';
      cell.cursor = 'pointer';
      const g = new Graphics()
        .roundRect(0, 0, slotW, 240, 6)
        .fill(0x2a2218)
        .stroke({ color: 0x8a7a60, width: 1 });
      const label = new Text({
        text: this.slots[s]![this.indices[s]!]!,
        style: { fill: 0xf2efe8, fontSize: 56 },
      });
      label.anchor.set(0.5);
      label.position.set(slotW / 2, 120);
      cell.addChild(g, label);
      let lastY = 0;
      cell.on('pointerdown', (e: FederatedPointerEvent) => {
        lastY = e.globalY;
      });
      cell.on('pointerup', (e: FederatedPointerEvent) => {
        const dy = e.globalY - lastY;
        if (Math.abs(dy) < 12) return;
        this.setIndex(s, this.indices[s]! + (dy < 0 ? 1 : -1));
        label.text = this.slots[s]![this.indices[s]!]!;
      });
      cell.on('pointertap', (e: FederatedPointerEvent) => {
        const local = cell.toLocal(e.global);
        if (Math.abs(e.globalY - lastY) >= 12) return;
        this.setIndex(s, this.indices[s]! + (local.y < 120 ? 1 : -1));
        label.text = this.slots[s]![this.indices[s]!]!;
      });
      root.addChild(cell);
    }
    parent.addChild(root);
    return root;
  }
}
