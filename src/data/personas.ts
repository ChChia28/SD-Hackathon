import type { Lang, PersonaId } from '../store/types';
import { TARIFF } from './constants';

export interface Persona {
  id: PersonaId;
  label: string;
  short: string;
  name: string;
  /** How the deck introduces them (slide 3). */
  tagline: string;
  initials: string;
  address: string;
  /** How this person earns: CREAM roof income, a 1 kW solar slice, or nothing (public). */
  reward: 'cream' | 'slice' | 'none';
  /** Solar capacity credited to this user, kWp (0 = none). For slices: 1 kW of the shared pool. */
  kWp: number;
  panels: number;
  /** Share of the sold energy's value paid to a roof host as solar income. */
  rewardShare: number;
  /** Can split the reward between credits and an electricity bill rebate. */
  canRebate?: boolean;
  /** Effective TNB rate per kWh — slice credits are issued at this rate (A4). */
  tariff?: number;
  /** Monthly household use, kWh — for the "bill today vs with slice" card (ASSUMPTION, A4 worked example for Aisyah). */
  monthlyUseKwh?: number;
  /** Slice paid for by the community solar dividend (B40 / elderly). */
  sponsored?: boolean;
  drivesEv: boolean;
  systemLabel: string;
  /** Default display language and text size for this person. */
  lang: Lang;
  largeText?: boolean;
  /** Where the user is on the township map. */
  home: { x: number; y: number };
  homeBayId?: string;
  blurb: string;
}

export const PERSONAS: Record<PersonaId, Persona> = {
  landed: {
    id: 'landed',
    label: 'Roof host · landed',
    short: 'Mr Lim',
    name: 'Mr Lim Wei Keat',
    tagline: 'Landed CREAM roof host, 48',
    initials: 'LW',
    address: 'Elmina Green, Elmina',
    reward: 'cream',
    kWp: 4.4,
    panels: 8,
    rewardShare: 1,
    canRebate: true,
    drivesEv: true,
    systemLabel: 'CREAM rooftop · Elmina Green',
    lang: 'en',
    home: { x: 96, y: 242 },
    blurb: 'Leases his roof under CREAM. SunD adds credits on top of the lease and he charges his e.MAS 5 with them.',
  },
  condo: {
    id: 'condo',
    label: 'Condo renter',
    short: 'Aisyah',
    name: 'Aisyah Rahman',
    tagline: 'Condo renter, 29',
    initials: 'AR',
    address: 'Residensi Elmina, B-12-3, Elmina East',
    reward: 'slice',
    kWp: 1,
    panels: 2,
    rewardShare: 1,
    canRebate: true,
    tariff: TARIFF.aisyah,
    monthlyUseKwh: 490,
    drivesEv: true,
    systemLabel: '1 kW solar slice',
    lang: 'en',
    home: { x: 262, y: 292 },
    homeBayId: 'residensi',
    blurb: 'No roof of her own. Subscribes to a 1 kW solar slice: ≈110 kWh a month off her bill.',
  },
  public: {
    id: 'public',
    label: 'Public EV driver',
    short: 'Daniel',
    name: 'Daniel Raj',
    tagline: 'EV driver, mall visitor, 35',
    initials: 'DR',
    address: 'Visitor from Shah Alam',
    reward: 'none',
    kWp: 0,
    panels: 0,
    rewardShare: 0,
    drivesEv: true,
    systemLabel: '',
    lang: 'en',
    home: { x: 196, y: 196 },
    blurb: 'Pays per kWh, catches Solar Surplus Discounts and pre-buys Saver Credits.',
  },
  elder: {
    id: 'elder',
    label: 'B40 · lives alone',
    short: 'Uncle Tan',
    name: 'Uncle Tan Ah Seng',
    tagline: 'B40 household, lives alone, 72',
    initials: 'TA',
    address: 'Flat Elmina Jaya, Blok C, Elmina Central',
    reward: 'slice',
    kWp: 1,
    panels: 2,
    rewardShare: 1,
    canRebate: true,
    tariff: TARIFF.low,
    monthlyUseKwh: 200,
    sponsored: true,
    drivesEv: false,
    systemLabel: 'Sponsored 1 kW slice',
    lang: 'zh',
    largeText: false,
    home: { x: 178, y: 334 },
    blurb: 'A sponsored slice from the solar dividend, plus heat alerts and the nearest SunD Cool room in one tap.',
  },
};

export const PERSONA_IDS: PersonaId[] = ['condo', 'landed', 'public', 'elder'];
