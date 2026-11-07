import { notFound } from 'next/navigation';
import { getTheme, listThemes } from '@/themes/registry';
import { AshDawnPlay } from '@/themes/ashen-dawn/Play';
import { StubThemePlay } from '@/themes/StubThemePlay';

type Props = { params: Promise<{ theme: string }> };

export function generateStaticParams() {
  return listThemes('standalone').map((t) => ({ theme: t.id }));
}

/** Standalone runner. 잿빛 새벽 is a gray box through an ending. */
export default async function StandaloneThemePage({ params }: Props) {
  const { theme: themeId } = await params;
  const theme = getTheme(themeId);
  if (!theme || theme.world !== 'standalone') notFound();
  if (theme.id === 'ashen-dawn') return <AshDawnPlay />;
  return <StubThemePlay theme={theme} />;
}
