'use client';

import { v4 as uuidv4 } from 'uuid';
import type { Coffee, CoffeeFormData } from './types';

const STORAGE_KEY = 'kaffe-log';

function getAll(): Coffee[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAll(coffees: Coffee[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(coffees));
}

export function getAllCoffees(): Coffee[] {
  return getAll().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getCoffeeById(id: string): Coffee | undefined {
  return getAll().find((c) => c.id === id);
}

export function addCoffee(data: CoffeeFormData): Coffee {
  const now = new Date().toISOString();
  const coffee: Coffee = { ...data, id: uuidv4(), createdAt: now, updatedAt: now };
  const all = getAll();
  saveAll([...all, coffee]);
  return coffee;
}

export function updateCoffee(id: string, data: CoffeeFormData): Coffee | null {
  const all = getAll();
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const updated: Coffee = { ...all[idx], ...data, id, updatedAt: new Date().toISOString() };
  all[idx] = updated;
  saveAll(all);
  return updated;
}

export function deleteCoffee(id: string): boolean {
  const all = getAll();
  const filtered = all.filter((c) => c.id !== id);
  if (filtered.length === all.length) return false;
  saveAll(filtered);
  return true;
}

export function seedDemoData(): void {
  if (getAll().length > 0) return;
  const demos: CoffeeFormData[] = [
    {
      name: 'Yirgacheffe Kochere',
      roaster: 'Fuglen Coffee',
      origin: 'Ethiopia',
      variety: 'Heirloom',
      roastLevel: 'light',
      process: 'washed',
      purchaseDate: '2026-04-15',
      roastDate: '2026-04-10',
      price: 189,
      weight: 250,
      rating: 5,
      brewMethods: ['Pour Over', 'AeroPress'],
      tastingNotes: ['Floral', 'Citrus', 'Berry', 'Bright'],
      notes:
        'Exceptional cup. Jasmine florals bloom in the cup with a lingering lemon-zest finish. Best at 93°C with a 3-minute extraction.',
    },
    {
      name: 'Colombia Huila Natural',
      roaster: 'Tim Wendelboe',
      origin: 'Colombia',
      variety: 'Caturra',
      roastLevel: 'medium-light',
      process: 'natural',
      purchaseDate: '2026-03-28',
      roastDate: '2026-03-22',
      price: 235,
      weight: 250,
      rating: 4,
      brewMethods: ['Espresso', 'Chemex'],
      tastingNotes: ['Stone Fruit', 'Chocolate', 'Sweet', 'Winey'],
      notes:
        'Rich and complex. As espresso it pulls a thick, syrupy shot with notes of ripe apricot. Slightly boozy on the finish.',
    },
    {
      name: 'Kenya Nyeri AB',
      roaster: 'The Barn Berlin',
      origin: 'Kenya',
      variety: 'SL28 & SL34',
      roastLevel: 'light',
      process: 'washed',
      purchaseDate: '2026-02-10',
      roastDate: '2026-02-05',
      price: 260,
      weight: 250,
      rating: 4,
      brewMethods: ['Pour Over', 'French Press'],
      tastingNotes: ['Berry', 'Citrus', 'Bright', 'Fruity'],
      notes:
        'Classic Kenyan profile. Blackcurrant and grapefruit in the cup. A little tannic in the French press but incredible as a V60.',
    },
  ];

  const all: Coffee[] = demos.map((d) => {
    const now = new Date().toISOString();
    return { ...d, id: uuidv4(), createdAt: now, updatedAt: now };
  });
  saveAll(all);
}
