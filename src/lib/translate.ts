import type { Lang } from '../store/types';
import { DICT } from './dict';

type Vars = Record<string, string | number>;

/** Translate an English UI string. Unknown strings fall back to English, so nothing ever renders blank. */
export function translate(lang: Lang, en: string, vars?: Vars): string {
  const row = lang === 'en' ? undefined : DICT[en];
  let out = (row && lang !== 'en' && row[lang]) || en;
  if (vars) for (const [k, v] of Object.entries(vars)) out = out.split(`{${k}}`).join(String(v));
  return out;
}
