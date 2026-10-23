import { useStore } from '../store/useStore';
import type { Lang } from '../store/types';

export const LANGS: { id: Lang; label: string; speech: string }[] = [
  { id: 'en', label: 'EN', speech: 'en-MY' },
  { id: 'ms', label: 'BM', speech: 'ms-MY' },
  { id: 'zh', label: '中文', speech: 'zh-CN' },
];

export { translate } from './translate';
import { translate } from './translate';

type Vars = Record<string, string | number>;

export const useLang = (): Lang => useStore((s) => s.profiles[s.persona].lang);

export function useT() {
  const lang = useLang();
  return (en: string, vars?: Vars) => translate(lang, en, vars);
}

/** Reads text aloud in the current language (heat alerts for elderly residents). Returns false if the device can't. */
export function speak(text: string, lang: Lang): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = LANGS.find((l) => l.id === lang)?.speech ?? 'en-MY';
  u.rate = 0.92;
  const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith(u.lang.slice(0, 2).toLowerCase()));
  if (voice) u.voice = voice;
  synth.speak(u);
  return true;
}
