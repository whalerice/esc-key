import Link from 'next/link';
import { listThemes } from '@/themes/registry';

/** Haemu theme list. Recommended order, no locks. Spec: docs/개발/공통엔진_v1.md §3. */
export default function HaemuListPage() {
  const themes = listThemes('haemu');

  return (
    <main className="theme-list">
      <p>
        <Link href="/">← 허브</Link>
      </p>
      <h1>해무</h1>
      <p>추천 순서 · 잠금 없음 · 심야 라디오는 회색 상자</p>
      <ul className="theme-links">
        {themes.map((t, i) => (
          <li key={t.id}>
            <Link href={`/haemu/${t.id}`}>
              {i + 1}. {t.title}
              <span style={{ opacity: 0.55 }}> · {t.lengthMin}분</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
