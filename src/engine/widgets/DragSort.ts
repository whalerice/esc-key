export class DragSort {
  order: string[];
  constructor(initial: string[]) {
    this.order = [...initial];
  }
  move(from: number, to: number): void {
    const [item] = this.order.splice(from, 1);
    if (item != null) this.order.splice(to, 0, item);
  }
}
