import Link from 'next/link';
import { listThemes } from '@/themes/registry';

/** Neulbom theme list. Spec: docs/개발/공통엔진_v1.md §3. */
export default function NeulbomListPage() {
  const themes = listThemes('neulbom');

  return (
    <main className="theme-list">
      <p>
        <Link href="/">← 허브</Link>
      </p>
      <h1>늘봄시</h1>
      <p>추천 순서 · 1/12 슬라이스 플레이 가능</p>
      <ul className="theme-links">
        {themes.map((t, i) => (
          <li key={t.id}>
            <Link href={`/neulbom/${t.id}`}>
              {i + 1}. {t.title}
              <span style={{ opacity: 0.55 }}> · {t.lengthMin}분</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
