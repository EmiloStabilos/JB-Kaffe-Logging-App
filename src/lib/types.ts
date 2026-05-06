export type RoastLevel = 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark';
export type Process = 'washed' | 'natural' | 'honey' | 'anaerobic' | 'wet-hulled' | 'other';

export const ROAST_LEVELS: { value: RoastLevel; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'medium-light', label: 'Medium Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'medium-dark', label: 'Medium Dark' },
  { value: 'dark', label: 'Dark' },
];

export const PROCESSES: { value: Process; label: string }[] = [
  { value: 'washed', label: 'Washed' },
  { value: 'natural', label: 'Natural' },
  { value: 'honey', label: 'Honey' },
  { value: 'anaerobic', label: 'Anaerobic' },
  { value: 'wet-hulled', label: 'Wet Hulled' },
  { value: 'other', label: 'Other' },
];

export const BREW_METHODS = [
  'Espresso',
  'Pour Over',
  'French Press',
  'AeroPress',
  'Cold Brew',
  'Moka Pot',
  'Chemex',
  'Siphon',
  'Drip',
];

export const TASTING_NOTES = [
  'Chocolate',
  'Caramel',
  'Nutty',
  'Floral',
  'Fruity',
  'Berry',
  'Citrus',
  'Stone Fruit',
  'Earthy',
  'Spicy',
  'Smoky',
  'Sweet',
  'Bright',
  'Syrupy',
  'Winey',
];

export interface Coffee {
  id: string;
  name: string;
  roaster: string;
  origin: string;
  variety?: string;
  roastLevel: RoastLevel;
  process: Process;
  purchaseDate: string;
  roastDate?: string;
  price?: number;
  weight?: number;
  rating: number;
  brewMethods: string[];
  tastingNotes: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type CoffeeFormData = Omit<Coffee, 'id' | 'createdAt' | 'updatedAt'>;
