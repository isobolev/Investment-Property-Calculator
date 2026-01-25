export interface GermanState {
  name: string;
  code: string;
  taxRate: number; // Grunderwerbsteuer in percent
}

export const germanStates: GermanState[] = [
  { name: 'Baden-Württemberg', code: 'BW', taxRate: 5.0 },
  { name: 'Bayern', code: 'BY', taxRate: 3.5 },
  { name: 'Berlin', code: 'BE', taxRate: 6.0 },
  { name: 'Brandenburg', code: 'BB', taxRate: 6.5 },
  { name: 'Bremen', code: 'HB', taxRate: 5.0 },
  { name: 'Hamburg', code: 'HH', taxRate: 5.5 },
  { name: 'Hessen', code: 'HE', taxRate: 6.0 },
  { name: 'Mecklenburg-Vorpommern', code: 'MV', taxRate: 6.0 },
  { name: 'Niedersachsen', code: 'NI', taxRate: 5.0 },
  { name: 'Nordrhein-Westfalen', code: 'NW', taxRate: 6.5 },
  { name: 'Rheinland-Pfalz', code: 'RP', taxRate: 5.0 },
  { name: 'Saarland', code: 'SL', taxRate: 6.5 },
  { name: 'Sachsen', code: 'SN', taxRate: 5.5 },
  { name: 'Sachsen-Anhalt', code: 'ST', taxRate: 5.0 },
  { name: 'Schleswig-Holstein', code: 'SH', taxRate: 6.5 },
  { name: 'Thüringen', code: 'TH', taxRate: 5.0 },
];

export function getStateByCode(code: string): GermanState | undefined {
  return germanStates.find((state) => state.code === code);
}
