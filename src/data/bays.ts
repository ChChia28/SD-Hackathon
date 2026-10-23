import type { BayType } from '../store/types';

export interface Connector {
  id: string;
  kind: 'AC' | 'DC';
  label: string;
  kw: number;
  count: number;
}

export interface Bay {
  id: string;
  name: string;
  area: string;
  type: BayType;
  x: number;
  y: number;
  canopyKwp: number;
  batteryKwh: number;
  baseDemandKw: number;
  initialSoc: number;
  connectors: Connector[];
  /** Partner site beyond the township. Every bay runs on its own canopy + battery, independent of CREAM. */
  outsideZone?: boolean;
  /** Roadmap phase (deck slide 9): the 10-lot pilot, the Phase 3 mall bay, or the later network. */
  phase: 'pilot' | 'phase3' | 'network';
  lots: number;
}

export const PHASE_LABEL: Record<Bay['phase'], string> = {
  pilot: 'Pilot bay · Phase 1–2',
  phase3: 'Medium mall bay · Phase 3',
  network: 'Network · Phase 4 view',
};

const ac = (count: number): Connector => ({ id: 'ac', kind: 'AC', label: 'Type 2 · 22 kW', kw: 22, count });
const dc = (count: number): Connector => ({ id: 'dc', kind: 'DC', label: 'CCS2 · 60 kW', kw: 60, count });

export const BAY_TYPE_LABEL: Record<BayType, string> = {
  mall: 'Shopping mall',
  office: 'Offices',
  park: 'Park',
  clubhouse: 'Clubhouse',
  commercial: 'Commercial',
  condo: 'Condo car park',
  petrol: 'Partner petrol station',
};

export const BAYS: Bay[] = [
  {
    id: 'central-mall',
    name: 'Elmina Central Mall',
    area: 'Elmina Central',
    type: 'mall',
    x: 196,
    y: 176,
    // A2 medium bay: 30 lots · 75 kWp · 180 kWh · 24 AC + 6 DC
    canopyKwp: 75,
    batteryKwh: 180,
    baseDemandKw: 26,
    initialSoc: 66,
    connectors: [dc(6), ac(24)],
    phase: 'phase3',
    lots: 30,
  },
  {
    id: 'central-park',
    name: 'Central Park Elmina',
    area: 'Central Park',
    type: 'park',
    x: 128,
    y: 140,
    canopyKwp: 20,
    batteryKwh: 80,
    baseDemandKw: 6.3,
    initialSoc: 82,
    connectors: [ac(4)],
    phase: 'network',
    lots: 4,
  },
  {
    id: 'clubhouse',
    name: 'Elmina Clubhouse · Pilot',
    area: 'Elmina West',
    type: 'clubhouse',
    x: 74,
    y: 214,
    // A2 small pilot bay: 10 lots · 25 kWp · 60 kWh · 8 AC + 2 DC
    canopyKwp: 25,
    batteryKwh: 60,
    baseDemandKw: 7.5,
    initialSoc: 58,
    connectors: [dc(2), ac(8)],
    phase: 'pilot',
    lots: 10,
  },
  {
    id: 'innovation-park',
    name: 'Innovation Park Offices',
    area: 'Innovation Park',
    type: 'office',
    x: 290,
    y: 104,
    canopyKwp: 50,
    batteryKwh: 200,
    baseDemandKw: 14.5,
    initialSoc: 70,
    connectors: [dc(2), ac(6)],
    phase: 'network',
    lots: 8,
  },
  {
    id: 'lakeside',
    name: 'Elmina Lakeside Walk',
    area: 'Elmina Lakeside',
    type: 'commercial',
    x: 246,
    y: 236,
    canopyKwp: 24,
    batteryKwh: 100,
    baseDemandKw: 6.8,
    initialSoc: 50,
    connectors: [dc(1), ac(3)],
    phase: 'network',
    lots: 4,
  },
  {
    id: 'residensi',
    name: 'Residensi Elmina Car Park',
    area: 'Elmina East',
    type: 'condo',
    x: 278,
    y: 312,
    canopyKwp: 30,
    batteryKwh: 120,
    baseDemandKw: 6.1,
    initialSoc: 62,
    connectors: [ac(8)],
    phase: 'network',
    lots: 8,
  },
  {
    id: 'west-shops',
    name: 'Elmina West Shoplots',
    area: 'Elmina West',
    type: 'commercial',
    x: 104,
    y: 320,
    canopyKwp: 16,
    batteryKwh: 64,
    baseDemandKw: 4.6,
    initialSoc: 36,
    connectors: [ac(4)],
    phase: 'network',
    lots: 4,
  },
  {
    id: 'gateway-station',
    name: 'Partner Station · Elmina Gateway',
    area: 'Outside CREAM zone',
    type: 'petrol',
    x: 330,
    y: 400,
    canopyKwp: 18,
    batteryKwh: 72,
    baseDemandKw: 4.6,
    initialSoc: 24,
    connectors: [dc(2), ac(2)],
    phase: 'network',
    lots: 4,
    outsideZone: true,
  },
];

export const getBay = (id: string): Bay => BAYS.find((b) => b.id === id) ?? BAYS[0];
