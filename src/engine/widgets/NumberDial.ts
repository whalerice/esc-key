/** Emits value changes only — puzzle judges answers. Spec: §8-2. */
import { Container, FederatedPointerEvent, Graphics, Text } from 'pixi.js';

export type DialListener = (value: number[]) => void;

export class NumberDial {
  values: number[];
  constructor(
    public digits: number,
    private onChange?: DialListener,
  ) {
    this.values = Array(digits).fill(0);
  }
  setDigit(i: number, v: number): void {
    this.values[i] = ((v % 10) + 10) % 10;
    this.onChange?.([...this.values]);
  }
  /** Pixi puzzle panel — background zoom stays locked while open. */
  mount(parent: Container, opts?: { x?: number; y?: number }): Container {
    const root = new Container();
    root.position.set(opts?.x ?? 560, opts?.y ?? 280);
    const bg = new Graphics()
      .roundRect(0, 0, 800, 420, 8)
      .fill({ color: 0x1a1510, alpha: 0.96 })
      .stroke({ color: 0xc4a574, width: 2 });
    root.addChild(bg);
    const title = new Text({
      text: '숫자 다이얼',
      style: { fill: 0xf2efe8, fontSize: 28 },
    });
    title.position.set(40, 24);
    root.addChild(title);

    const slotW = 120;
    const gap = 24;
    const startX = (800 - (this.digits * slotW + (this.digits - 1) * gap)) / 2;
    for (let i = 0; i < this.digits; i++) {
      const cell = new Container();
      cell.position.set(startX + i * (slotW + gap), 100);
      cell.eventMode = 'static';
      cell.cursor = 'pointer';
      const g = new Graphics()
        .roundRect(0, 0, slotW, 220, 6)
        .fill(0x2a2218)
        .stroke({ color: 0x8a7a60, width: 1 });
      const label = new Text({
        text: String(this.values[i]),
        style: { fill: 0xf2efe8, fontSize: 72 },
      });
      label.anchor.set(0.5);
      label.position.set(slotW / 2, 110);
      cell.addChild(g, label);
      let lastY = 0;
      cell.on('pointerdown', (e: FederatedPointerEvent) => {
        lastY = e.globalY;
      });
      cell.on('pointerup', (e: FederatedPointerEvent) => {
        const dy = e.globalY - lastY;
        if (Math.abs(dy) < 12) return;
        this.setDigit(i, this.values[i]! + (dy < 0 ? 1 : -1));
        label.text = String(this.values[i]);
      });
      // tap zones: top = +1, bottom = -1
      cell.on('pointertap', (e: FederatedPointerEvent) => {
        const local = cell.toLocal(e.global);
        if (Math.abs(e.globalY - lastY) >= 12) return;
        this.setDigit(i, this.values[i]! + (local.y < 110 ? 1 : -1));
        label.text = String(this.values[i]);
      });
      root.addChild(cell);
    }
    parent.addChild(root);
    return root;
  }
}
