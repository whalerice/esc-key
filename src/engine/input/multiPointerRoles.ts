/**
 * Role from where the finger landed. Spec: docs/개발/공통엔진_v1.md §7-2, §19-8.
 * Pedal = bottom-left third. Cloth = right two-thirds. One finger runs only its role.
 */

export type PointerRole = 'pedal' | 'cloth';

export function roleAt(
  x: number,
  y: number,
  width: number,
  height: number,
): PointerRole | null {
  if (!(width > 0) || !(height > 0)) return null;
  if (x < width / 3 && y >= (height * 2) / 3) return 'pedal';
  if (x >= width / 3) return 'cloth';
  return null;
}

export class MultiPointerRoles {
  private assigned = new Map<number, PointerRole>();

  /** Role sticks to the pointer's first position. */
  down(id: number, x: number, y: number, width: number, height: number): PointerRole | null {
    const role = roleAt(x, y, width, height);
    if (!role) return null;
    this.assigned.set(id, role);
    return role;
  }

  roleOf(id: number): PointerRole | null {
    return this.assigned.get(id) ?? null;
  }

  up(id: number): void {
    this.assigned.delete(id);
  }

  ids(role: PointerRole): number[] {
    const out: number[] = [];
    for (const [id, assigned] of this.assigned) {
      if (assigned === role) out.push(id);
    }
    return out;
  }

  clear(): void {
    this.assigned.clear();
  }
}
