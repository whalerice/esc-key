import { notFound } from 'next/navigation';
import { getTheme, listThemes } from '@/themes/registry';
import { HaemuRadioPlay } from '@/themes/haemu-radio/Play';
import { StubThemePlay } from '@/themes/StubThemePlay';

type Props = { params: Promise<{ theme: string }> };

export function generateStaticParams() {
  return listThemes('haemu').map((t) => ({ theme: t.id }));
}

/** Haemu runner. 심야 라디오 is the gray-box play; the other themes stay stubs. */
export default async function HaemuThemePage({ params }: Props) {
  const { theme: themeId } = await params;
  const theme = getTheme(themeId);
  if (!theme || theme.world !== 'haemu') notFound();
  if (theme.id === 'haemu-radio') return <HaemuRadioPlay />;
  return <StubThemePlay theme={theme} />;
}
