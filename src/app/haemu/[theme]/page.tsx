import { notFound } from 'next/navigation';
import { getTheme, listThemes } from '@/themes/registry';
import { HaemuLighthousePlay } from '@/themes/haemu-lighthouse/Play';
import { HaemuRadioPlay } from '@/themes/haemu-radio/Play';
import { HaemuTailorPlay } from '@/themes/haemu-tailor/Play';
import { StubThemePlay } from '@/themes/StubThemePlay';

type Props = { params: Promise<{ theme: string }> };

export function generateStaticParams() {
  return listThemes('haemu').map((t) => ({ theme: t.id }));
}

/** Haemu runner. 심야 라디오 and 등대지기 are illustrated. 한 땀 stays gray-box. */
export default async function HaemuThemePage({ params }: Props) {
  const { theme: themeId } = await params;
  const theme = getTheme(themeId);
  if (!theme || theme.world !== 'haemu') notFound();
  if (theme.id === 'haemu-radio') return <HaemuRadioPlay />;
  if (theme.id === 'haemu-lighthouse') return <HaemuLighthousePlay />;
  if (theme.id === 'haemu-tailor') return <HaemuTailorPlay />;
  return <StubThemePlay theme={theme} />;
}
