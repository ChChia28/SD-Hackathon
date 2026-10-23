import { Cloud, CloudRain, Moon, PlugZap, Sun, Users, Zap, type LucideIcon } from 'lucide-react';
import type { BayStatus, Weather } from '../store/types';
import { Pill } from './ui';

// Status is always shown as colour + icon + words, never colour alone.
export const STATUS_META: Record<BayStatus, { label: string; tone: 'leaf' | 'sky' | 'coral' | 'slate'; color: string; Icon: LucideIcon }> = {
  surplus: { label: 'Solar surplus', tone: 'leaf', color: '#2F9E6B', Icon: Sun },
  normal: { label: 'Available', tone: 'sky', color: '#1A1F3A', Icon: Zap },
  busy: { label: 'All ports busy', tone: 'coral', color: '#E0832F', Icon: Users },
  grid: { label: 'Grid backup', tone: 'slate', color: '#8A8E9C', Icon: PlugZap },
};

export function StatusPill({ status }: { status: BayStatus }) {
  const m = STATUS_META[status];
  return (
    <Pill tone={m.tone} icon={<m.Icon size={15} strokeWidth={2.5} />}>
      {m.label}
    </Pill>
  );
}

export const WEATHER_LABEL: Record<Weather, string> = { sunny: 'Sunny', cloudy: 'Cloudy', rainy: 'Rainy' };

export function WeatherIcon({ weather, night, size = 18 }: { weather: Weather; night: boolean; size?: number }) {
  if (night) return <Moon size={size} />;
  if (weather === 'sunny') return <Sun size={size} />;
  if (weather === 'cloudy') return <Cloud size={size} />;
  return <CloudRain size={size} />;
}
