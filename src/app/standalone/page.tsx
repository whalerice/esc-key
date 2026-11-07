import Link from 'next/link';
import { listThemes } from '@/themes/registry';

/** Standalone themes. No locks. */
export default function StandaloneListPage() {
  const themes = listThemes('standalone');

  return (
    <main className="theme-list">
      <p>
        <Link href="/">← 허브</Link>
      </p>
      <h1>단독</h1>
      <p>잿빛 새벽. 회색 상자, 엔딩까지.</p>
      <ul className="theme-links">
        {themes.map((t, i) => (
          <li key={t.id}>
            <Link href={`/standalone/${t.id}`}>
              {i + 1}. {t.title}
              <span style={{ opacity: 0.55 }}> · {t.lengthMin}분</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
