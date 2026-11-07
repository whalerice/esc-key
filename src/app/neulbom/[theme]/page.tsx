import { notFound } from 'next/navigation';
import { getTheme, listThemes } from '@/themes/registry';
import { Neulbom112Play } from '@/themes/neulbom-112/Play';
import { GreenhousePlay } from '@/themes/neulbom-greenhouse/Play';
import { StubThemePlay } from '@/themes/StubThemePlay';

type Props = { params: Promise<{ theme: string }> };

/** Static paths for `output: 'export'`. Hub links `/neulbom/<theme.id>`. */
export function generateStaticParams() {
  return listThemes('neulbom').map((t) => ({ theme: t.id }));
}

/** Theme runner — Pixi loads client-only inside ThemePlay. Spec: §3. */
export default async function ThemePage({ params }: Props) {
  const { theme: themeId } = await params;
  const theme = getTheme(themeId);
  if (!theme || theme.world !== 'neulbom') notFound();

  if (theme.id === 'neulbom-112') {
    return <Neulbom112Play />;
  }

  if (theme.id === 'neulbom-greenhouse') {
    return <GreenhousePlay />;
  }

  return <StubThemePlay theme={theme} />;
}
