import Link from 'next/link';

/** Hub — world select. Spec: docs/개발/공통엔진_v1.md §3. */
export default function HubPage() {
  return (
    <main className="hub">
      <h1>ESC KEY</h1>
      <p>
        공통 엔진 스캐폴드. 규약 → <code>docs/개발/공통엔진_v1.md</code>
      </p>
      <ul className="hub-links">
        <li>
          <Link href="/neulbom">늘봄시</Link>
        </li>
        <li>
          <Link href="/haemu">해무</Link>
        </li>
        <li>
          <Link href="/lab/foundations">엔진 시험 · 회전 / 시계 / 라디오</Link>
        </li>
        <li>
          <Link href="/lab/lighthouse">엔진 시험 · 등대 위젯</Link>
        </li>
        <li>
          <Link href="/lab/tailor">엔진 시험 · 한 땀 위젯</Link>
        </li>
        <li>
          <Link href="/lab/greenhouse">엔진 시험 · 겨울 온실 위젯</Link>
        </li>
        <li>
          <Link href="/lab/darkroom">엔진 시험 · 붉은 방 위젯</Link>
        </li>
        <li>
          <Link href="/lab/lasttrain">엔진 시험 · 막차 이후 위젯</Link>
        </li>
        <li>
          <Link href="/standalone">단독</Link>
        </li>
      </ul>
    </main>
  );
}
