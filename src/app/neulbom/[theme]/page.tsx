import { notFound } from 'next/navigation';
import { getTheme, listThemes } from '@/themes/registry';
import { ThemePlay } from '@/engine/ui/ThemePlay';

type Props = { params: Promise<{ theme: string }> };

/** Static paths for `output: 'export'`. */
export function generateStaticParams() {
  return listThemes('neulbom').map((t) => ({ theme: t.id }));
}

/** Theme runner — Pixi loads client-only inside ThemePlay. Spec: §3. */
export default async function ThemePage({ params }: Props) {
  const { theme: themeId } = await params;
  const theme = getTheme(themeId);
  if (!theme || theme.world !== 'neulbom') notFound();

  return <ThemePlay theme={theme} />;
}
