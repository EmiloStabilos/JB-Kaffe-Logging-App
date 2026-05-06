import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Coffee, CoffeeFormData } from './types';

const COL = 'coffees';

function fromFirestore(id: string, data: Record<string, unknown>): Coffee {
  return {
    ...(data as Omit<Coffee, 'id' | 'createdAt' | 'updatedAt'>),
    id,
    createdAt: data.createdAt instanceof Timestamp
      ? data.createdAt.toDate().toISOString()
      : String(data.createdAt ?? ''),
    updatedAt: data.updatedAt instanceof Timestamp
      ? data.updatedAt.toDate().toISOString()
      : String(data.updatedAt ?? ''),
  };
}

export async function getAllCoffees(): Promise<Coffee[]> {
  const q = query(collection(db, COL), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => fromFirestore(d.id, d.data()));
}

export async function getCoffeeById(id: string): Promise<Coffee | undefined> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return undefined;
  return fromFirestore(snap.id, snap.data());
}

export async function addCoffee(data: CoffeeFormData): Promise<Coffee> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  const snap = await getDoc(ref);
  return fromFirestore(snap.id, snap.data()!);
}

export async function updateCoffee(id: string, data: CoffeeFormData): Promise<Coffee | null> {
  const ref = doc(db, COL, id);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return fromFirestore(snap.id, snap.data());
}

export async function deleteCoffee(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

export async function seedDemoData(): Promise<void> {
  const existing = await getDocs(collection(db, COL));
  if (!existing.empty) return;

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
      notes: 'Exceptional cup. Jasmine florals bloom with a lingering lemon-zest finish.',
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
      notes: 'Rich and complex. Pulls a thick syrupy espresso shot with notes of ripe apricot.',
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
      notes: 'Classic Kenyan profile. Blackcurrant and grapefruit. Incredible as a V60.',
    },
  ];

  await Promise.all(
    demos.map((d) =>
      addDoc(collection(db, COL), {
        ...d,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    )
  );
}
