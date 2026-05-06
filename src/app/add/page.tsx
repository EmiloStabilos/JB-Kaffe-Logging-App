'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { addCoffee } from '@/lib/storage';
import type { CoffeeFormData } from '@/lib/types';
import CoffeeForm from '@/components/CoffeeForm';

export default function AddPage() {
  const router = useRouter();

  function handleSubmit(data: CoffeeFormData) {
    addCoffee(data);
    router.push('/');
  }

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
          New Entry
        </p>
        <h1 className="text-3xl font-bold text-cream-100" style={{ fontFamily: 'Georgia, serif' }}>
          Log a Bean
        </h1>
        <p className="text-cream-400 text-sm mt-1">
          Record the details of your latest coffee discovery
        </p>
      </div>
      <CoffeeForm onSubmit={handleSubmit} submitLabel="Log Bean" />
    </div>
  );
}
