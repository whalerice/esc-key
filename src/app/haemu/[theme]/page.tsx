import { notFound } from 'next/navigation';
import { getTheme, listThemes } from '@/themes/registry';
import { StubThemePlay } from '@/themes/StubThemePlay';

type Props = { params: Promise<{ theme: string }> };

export function generateStaticParams() {
  return listThemes('haemu').map((t) => ({ theme: t.id }));
}

/** Haemu runner stub. Theme puzzles are not mounted here. */
export default async function HaemuThemePage({ params }: Props) {
  const { theme: themeId } = await params;
  const theme = getTheme(themeId);
  if (!theme || theme.world !== 'haemu') notFound();
  return <StubThemePlay theme={theme} />;
}
