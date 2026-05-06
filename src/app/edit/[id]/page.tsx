'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getCoffeeById, updateCoffee } from '@/lib/storage';
import type { Coffee, CoffeeFormData } from '@/lib/types';
import CoffeeForm from '@/components/CoffeeForm';

export default function EditPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [coffee, setCoffee] = useState<Coffee | null>(null);

  useEffect(() => {
    const found = getCoffeeById(id);
    if (!found) { router.replace('/'); return; }
    setCoffee(found);
  }, [id, router]);

  function handleSubmit(data: CoffeeFormData) {
    updateCoffee(id, data);
    router.push(`/coffee/${id}`);
  }

  if (!coffee) return null;

  const initial: Partial<CoffeeFormData> = {
    name: coffee.name,
    roaster: coffee.roaster,
    origin: coffee.origin,
    variety: coffee.variety,
    roastLevel: coffee.roastLevel,
    process: coffee.process,
    purchaseDate: coffee.purchaseDate,
    roastDate: coffee.roastDate,
    price: coffee.price,
    weight: coffee.weight,
    rating: coffee.rating,
    brewMethods: coffee.brewMethods,
    tastingNotes: coffee.tastingNotes,
    notes: coffee.notes,
  };

  return (
    <div className="max-w-2xl mx-auto fade-up space-y-6">
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-cream-400 hover:text-amber-light transition-colors mb-4"
        >
          <ArrowLeft size={15} />
          Back
        </button>
        <p className="text-amber-gold text-xs font-semibold tracking-[0.2em] uppercase mb-1">
          Edit Entry
        </p>
        <h1 className="text-3xl font-bold text-cream-100" style={{ fontFamily: 'Georgia, serif' }}>
          {coffee.name}
        </h1>
        <p className="text-cream-400 text-sm mt-1">{coffee.roaster}</p>
      </div>
      <CoffeeForm initial={initial} onSubmit={handleSubmit} submitLabel="Save Changes" />
    </div>
  );
}
