import Link from 'next/link';

/** Hub — world select. Spec: docs/공통엔진.md §3. */
export default function HubPage() {
  return (
    <main className="hub">
      <h1>ESC KEY</h1>
      <p>
        공통 엔진 스캐폴드. 규약 → <code>docs/공통엔진.md</code>
      </p>
      <ul className="hub-links">
        <li>
          <Link href="/neulbom">늘봄시</Link>
        </li>
        <li>
          <span aria-disabled>해무 (예정)</span>
        </li>
        <li>
          <span aria-disabled>단독 / 잿빛 새벽 (예정)</span>
        </li>
      </ul>
    </main>
  );
}
