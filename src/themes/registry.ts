import type { ThemeDefinition, ThemeId } from '@/engine/types';
import { theme112 } from '@/themes/neulbom-112';
import { themeGreenhouse } from '@/themes/neulbom-greenhouse';
import { themeDarkroom } from '@/themes/neulbom-darkroom';
import { themeLasttrain } from '@/themes/neulbom-lasttrain';

const themes: ThemeDefinition[] = [
  theme112,
  themeGreenhouse,
  themeDarkroom,
  themeLasttrain,
];

export function listThemes(world?: ThemeDefinition['world']): ThemeDefinition[] {
  return world ? themes.filter((t) => t.world === world) : themes;
}

export function getTheme(id: ThemeId): ThemeDefinition | undefined {
  return themes.find((t) => t.id === id);
}
