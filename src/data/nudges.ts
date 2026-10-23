import type { PersonaId } from '../store/types';

/**
 * Solar-peak nudges (deck slide 6: "11am–3pm: pre-cool, run the washer, charge the car").
 * kWh shifted per accepted nudge are ASSUMPTION (typical appliance loads), used only for the demo KPI.
 */
export interface Nudge {
  id: string;
  for: PersonaId[];
  icon: 'washer' | 'snow' | 'car';
  title: string;
  body: string;
  kwh: number;
  cta: string;
  to?: string;
}

export const NUDGES: Nudge[] = [
  { id: 'washer', for: ['condo', 'landed', 'elder'], icon: 'washer', title: 'Run the washer now', body: 'Your slice is generating most right now', kwh: 1, cta: 'I’ll do it' },
  { id: 'precool', for: ['condo', 'landed'], icon: 'snow', title: 'Pre-cool before 3 pm', body: 'Cool the room on sunshine, then coast into the evening', kwh: 1.5, cta: 'Pre-cool' },
  { id: 'charge', for: ['landed', 'condo', 'public'], icon: 'car', title: 'Charge on sunshine', body: 'Bays are on live canopy solar until 3 pm', kwh: 18, cta: 'Find a bay', to: '/map' },
];

export const nudgesFor = (p: PersonaId) => NUDGES.filter((n) => n.for.includes(p));
