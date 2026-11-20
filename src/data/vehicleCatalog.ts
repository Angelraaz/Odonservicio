import type { VehicleBrandId, VehicleType } from '../types/vehicle';

export interface VehicleModelPreset {
  id: string;
  modelName: string;
  year: number;
  engineLabel: string;
  tankCapacityLiters: number;
  kmPerLiter: number;
}

export interface BrandDefinition {
  id: VehicleBrandId;
  label: string;
  type: VehicleType;
  models: VehicleModelPreset[];
}

export const VEHICLE_BRANDS: BrandDefinition[] = [
  // Carros clásicos (año 2000 hacia atrás)
  {
    id: 'ford',
    label: 'Ford',
    type: 'car',
    models: [
      { id: 'ford-festiva-93', modelName: 'Ford Festiva', year: 1993, engineLabel: '1.3L Carburado', tankCapacityLiters: 38, kmPerLiter: 13.5 },
      { id: 'ford-laser-97', modelName: 'Ford Laser', year: 1997, engineLabel: '1.6L', tankCapacityLiters: 50, kmPerLiter: 11.5 },
      { id: 'ford-sierra-91', modelName: 'Ford Sierra', year: 1991, engineLabel: '2.0L', tankCapacityLiters: 60, kmPerLiter: 9.0 },
    ],
  },
  {
    id: 'fiat',
    label: 'Fiat',
    type: 'car',
    models: [
      { id: 'fiat-uno-94', modelName: 'Fiat Uno', year: 1994, engineLabel: '1.3L', tankCapacityLiters: 47, kmPerLiter: 13.0 },
      { id: 'fiat-premio-92', modelName: 'Fiat Premio', year: 1992, engineLabel: '1.5L', tankCapacityLiters: 50, kmPerLiter: 11.5 },
      { id: 'fiat-palio-98', modelName: 'Fiat Palio', year: 1998, engineLabel: '1.6L', tankCapacityLiters: 48, kmPerLiter: 11.0 },
    ],
  },
  {
    id: 'lada',
    label: 'Lada',
    type: 'car',
    models: [
      { id: 'lada-samara-93', modelName: 'Lada Samara', year: 1993, engineLabel: '1.5L', tankCapacityLiters: 43, kmPerLiter: 11.5 },
      { id: 'lada-2105-90', modelName: 'Lada 2105 / Riva', year: 1990, engineLabel: '1.3L', tankCapacityLiters: 39, kmPerLiter: 10.5 },
      { id: 'lada-niva-94', modelName: 'Lada Niva 4x4', year: 1994, engineLabel: '1.6L 4x4', tankCapacityLiters: 42, kmPerLiter: 8.5 },
    ],
  },
  {
    id: 'chrysler',
    label: 'Chrysler',
    type: 'car',
    models: [
      { id: 'chrysler-neon-97', modelName: 'Chrysler Neon', year: 1997, engineLabel: '2.0L', tankCapacityLiters: 47, kmPerLiter: 10.5 },
      { id: 'chrysler-spirit-93', modelName: 'Chrysler Spirit', year: 1993, engineLabel: '2.5L', tankCapacityLiters: 60, kmPerLiter: 8.5 },
      { id: 'chrysler-lebaron-92', modelName: 'Chrysler LeBaron', year: 1992, engineLabel: '3.0L V6', tankCapacityLiters: 60, kmPerLiter: 7.5 },
    ],
  },
  {
    id: 'volkswagen',
    label: 'Volkswagen',
    type: 'car',
    models: [
      { id: 'vw-escarabajo-85', modelName: 'VW Escarabajo', year: 1985, engineLabel: '1.6L Aire', tankCapacityLiters: 40, kmPerLiter: 11.5 },
      { id: 'vw-gol-96', modelName: 'VW Gol', year: 1996, engineLabel: '1.8L', tankCapacityLiters: 55, kmPerLiter: 11.0 },
      { id: 'vw-jetta-94', modelName: 'VW Jetta / Golf', year: 1994, engineLabel: '1.8L', tankCapacityLiters: 55, kmPerLiter: 10.5 },
    ],
  },
  {
    id: 'chevrolet',
    label: 'Chevrolet',
    type: 'car',
    models: [
      { id: 'chevy-chevette-91', modelName: 'Chevrolet Chevette', year: 1991, engineLabel: '1.6L', tankCapacityLiters: 45, kmPerLiter: 11.5 },
      { id: 'chevy-corsa-98', modelName: 'Chevrolet Corsa', year: 1998, engineLabel: '1.4L', tankCapacityLiters: 46, kmPerLiter: 13.0 },
      { id: 'chevy-monza-92', modelName: 'Chevrolet Monza', year: 1992, engineLabel: '2.0L', tankCapacityLiters: 61, kmPerLiter: 9.0 },
    ],
  },

  // Motos
  {
    id: 'honda',
    label: 'Honda',
    type: 'moto',
    models: [
      { id: 'honda-cg125', modelName: 'Honda CG 125 / 150', year: 1998, engineLabel: '125–150 cc', tankCapacityLiters: 12, kmPerLiter: 38.0 },
      { id: 'honda-wave110', modelName: 'Honda Wave 110', year: 2005, engineLabel: '110 cc', tankCapacityLiters: 4, kmPerLiter: 45.0 },
      { id: 'honda-xr250', modelName: 'Honda XR 150 / 250', year: 2000, engineLabel: '150–250 cc', tankCapacityLiters: 13.5, kmPerLiter: 28.0 },
    ],
  },
  {
    id: 'yamaha',
    label: 'Yamaha',
    type: 'moto',
    models: [
      { id: 'yamaha-rx115', modelName: 'Yamaha RX 115', year: 1996, engineLabel: '115 cc 2T', tankCapacityLiters: 10.5, kmPerLiter: 26.0 },
      { id: 'yamaha-ybr125', modelName: 'Yamaha YBR 125', year: 2004, engineLabel: '125 cc 4T', tankCapacityLiters: 13, kmPerLiter: 38.0 },
      { id: 'yamaha-dt125', modelName: 'Yamaha DT 125 / 175', year: 1995, engineLabel: '125–175 cc 2T', tankCapacityLiters: 10, kmPerLiter: 24.0 },
    ],
  },
  {
    id: 'suzuki',
    label: 'Suzuki',
    type: 'moto',
    models: [
      { id: 'suzuki-ax100', modelName: 'Suzuki AX 100', year: 1997, engineLabel: '100 cc 2T', tankCapacityLiters: 12, kmPerLiter: 30.0 },
      { id: 'suzuki-gn125', modelName: 'Suzuki GN 125', year: 2002, engineLabel: '125 cc 4T', tankCapacityLiters: 10.3, kmPerLiter: 37.0 },
      { id: 'suzuki-dr200', modelName: 'Suzuki DR 200 / 650', year: 1999, engineLabel: '200+ cc', tankCapacityLiters: 13, kmPerLiter: 24.0 },
    ],
  },
  {
    id: 'kawasaki',
    label: 'Kawasaki',
    type: 'moto',
    models: [
      { id: 'kawa-klx150', modelName: 'Kawasaki KLX 150', year: 2012, engineLabel: '150 cc', tankCapacityLiters: 7, kmPerLiter: 32.0 },
      { id: 'kawa-ninja250', modelName: 'Kawasaki Ninja 250', year: 1999, engineLabel: '250 cc', tankCapacityLiters: 17, kmPerLiter: 25.0 },
      { id: 'kawa-klr650', modelName: 'Kawasaki KLR 650', year: 1998, engineLabel: '650 cc', tankCapacityLiters: 23, kmPerLiter: 19.0 },
    ],
  },
  {
    id: 'bera',
    label: 'Bera',
    type: 'moto',
    models: [
      { id: 'bera-sbr150', modelName: 'Bera SBR 150', year: 2022, engineLabel: '150 cc', tankCapacityLiters: 11, kmPerLiter: 34.0 },
      { id: 'bera-socialista', modelName: 'Bera Socialista 150', year: 2015, engineLabel: '150 cc', tankCapacityLiters: 10, kmPerLiter: 35.0 },
      { id: 'bera-br200', modelName: 'Bera BR 200', year: 2018, engineLabel: '200 cc', tankCapacityLiters: 12, kmPerLiter: 30.0 },
    ],
  },
  {
    id: 'bajaj',
    label: 'Bajaj',
    type: 'moto',
    models: [
      { id: 'bajaj-boxer150', modelName: 'Bajaj Boxer 150', year: 2018, engineLabel: '150 cc', tankCapacityLiters: 11, kmPerLiter: 42.0 },
      { id: 'bajaj-discover125', modelName: 'Bajaj Discover 125', year: 2016, engineLabel: '125 cc', tankCapacityLiters: 8, kmPerLiter: 45.0 },
      { id: 'bajaj-pulsar200', modelName: 'Bajaj Pulsar 200', year: 2019, engineLabel: '200 cc', tankCapacityLiters: 12, kmPerLiter: 32.0 },
    ],
  },
];

export const CAR_ENGINE_ESTIMATES = [
  { id: 'car-small', label: '1.0 – 1.4 L (≤2000)', tankCapacityLiters: 40, kmPerLiter: 13.0 },
  { id: 'car-mid', label: '1.5 – 1.8 L (≤2000)', tankCapacityLiters: 48, kmPerLiter: 11.0 },
  { id: 'car-big', label: '2.0 L+ / V6 (≤2000)', tankCapacityLiters: 60, kmPerLiter: 8.5 },
];

export const MOTO_ENGINE_ESTIMATES = [
  { id: 'moto-125', label: '100 – 125 cc', tankCapacityLiters: 11, kmPerLiter: 38.0 },
  { id: 'moto-150', label: '150 – 200 cc', tankCapacityLiters: 12, kmPerLiter: 32.0 },
  { id: 'moto-250', label: '250 cc+ / 2T', tankCapacityLiters: 14, kmPerLiter: 24.0 },
];

export function isValidBrandId(id: string): id is VehicleBrandId {
  return VEHICLE_BRANDS.some((b) => b.id === id);
}

export function getBrandDefinition(id: string): BrandDefinition {
  return VEHICLE_BRANDS.find((b) => b.id === id) || VEHICLE_BRANDS[0];
}
