'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X } from 'lucide-react';
import type { CoffeeFormData, RoastLevel, Process } from '@/lib/types';
import { ROAST_LEVELS, PROCESSES, BREW_METHODS, TASTING_NOTES } from '@/lib/types';
import StarRating from './StarRating';
import RoastLevelBar from './RoastLevelBar';

interface CoffeeFormProps {
  initial?: Partial<CoffeeFormData>;
  onSubmit: (data: CoffeeFormData) => void;
  submitLabel?: string;
}

const DEFAULT: CoffeeFormData = {
  name: '',
  roaster: '',
  origin: '',
  variety: '',
  roastLevel: 'medium',
  process: 'washed',
  purchaseDate: new Date().toISOString().split('T')[0],
  roastDate: '',
  price: undefined,
  weight: undefined,
  rating: 3,
  brewMethods: [],
  tastingNotes: [],
  notes: '',
};

export default function CoffeeForm({ initial, onSubmit, submitLabel = 'Save Bean' }: CoffeeFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<CoffeeFormData>({ ...DEFAULT, ...initial });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof CoffeeFormData>(key: K, value: CoffeeFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }

  function toggleArray(key: 'brewMethods' | 'tastingNotes', item: string) {
    const arr = form[key] as string[];
    set(key, arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Bean name is required';
    if (!form.roaster.trim()) e.roaster = 'Roaster is required';
    if (!form.origin.trim()) e.origin = 'Origin is required';
    if (!form.purchaseDate) e.purchaseDate = 'Purchase date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Section: Identity */}
      <Section title="Bean Identity" subtitle="The essentials about this coffee">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Bean / Blend Name" error={errors.name} required>
            <input className="input-base" value={form.name} placeholder="e.g. Yirgacheffe Kochere"
              onChange={(e) => set('name', e.target.value)} />
          </Field>
          <Field label="Roaster" error={errors.roaster} required>
            <input className="input-base" value={form.roaster} placeholder="e.g. Fuglen Coffee"
              onChange={(e) => set('roaster', e.target.value)} />
          </Field>
          <Field label="Origin / Region" error={errors.origin} required>
            <input className="input-base" value={form.origin} placeholder="e.g. Ethiopia"
              onChange={(e) => set('origin', e.target.value)} />
          </Field>
          <Field label="Variety / Cultivar">
            <input className="input-base" value={form.variety ?? ''} placeholder="e.g. Heirloom, Gesha"
              onChange={(e) => set('variety', e.target.value)} />
          </Field>
        </div>
      </Section>

      {/* Section: Processing */}
      <Section title="Processing" subtitle="How the bean was grown and processed">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Field label="Process Method">
            <select className="input-base" value={form.process}
              onChange={(e) => set('process', e.target.value as Process)}>
              {PROCESSES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </Field>
          <Field label="Roast Level">
            <select className="input-base" value={form.roastLevel}
              onChange={(e) => set('roastLevel', e.target.value as RoastLevel)}>
              {ROAST_LEVELS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </Field>
        </div>
        <div className="px-1">
          <RoastLevelBar value={form.roastLevel} />
        </div>
      </Section>

      {/* Section: Purchase */}
      <Section title="Purchase Details" subtitle="When you bought it and what you paid">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Purchase Date" error={errors.purchaseDate} required>
            <input type="date" className="input-base" value={form.purchaseDate}
              onChange={(e) => set('purchaseDate', e.target.value)} />
          </Field>
          <Field label="Roast Date">
            <input type="date" className="input-base" value={form.roastDate ?? ''}
              onChange={(e) => set('roastDate', e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (kr)">
              <input type="number" min="0" step="1" className="input-base" value={form.price ?? ''}
                placeholder="0"
                onChange={(e) => set('price', e.target.value ? Number(e.target.value) : undefined)} />
            </Field>
            <Field label="Weight (g)">
              <input type="number" min="0" step="1" className="input-base" value={form.weight ?? ''}
                placeholder="250"
                onChange={(e) => set('weight', e.target.value ? Number(e.target.value) : undefined)} />
            </Field>
          </div>
        </div>
      </Section>

      {/* Section: Rating */}
      <Section title="Your Verdict" subtitle="How did it taste?">
        <div className="flex items-center gap-4 mb-6">
          <StarRating value={form.rating} onChange={(v) => set('rating', v)} size={28} />
          <span className="text-cream-400 text-sm">
            {form.rating === 5 ? 'Outstanding' : form.rating === 4 ? 'Really Good' : form.rating === 3 ? 'Good' : form.rating === 2 ? 'Decent' : 'Not for me'}
          </span>
        </div>

        {/* Brew methods */}
        <p className="text-xs text-cream-400 uppercase tracking-widest mb-3 opacity-70">Best Brew Methods</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {BREW_METHODS.map((method) => (
            <TogglePill
              key={method}
              active={form.brewMethods.includes(method)}
              onClick={() => toggleArray('brewMethods', method)}
            >
              {method}
            </TogglePill>
          ))}
        </div>

        {/* Tasting notes */}
        <p className="text-xs text-cream-400 uppercase tracking-widest mb-3 opacity-70">Tasting Notes</p>
        <div className="flex flex-wrap gap-2">
          {TASTING_NOTES.map((note) => (
            <TogglePill
              key={note}
              active={form.tastingNotes.includes(note)}
              onClick={() => toggleArray('tastingNotes', note)}
            >
              {note}
            </TogglePill>
          ))}
        </div>
      </Section>

      {/* Section: Notes */}
      <Section title="Cupping Notes" subtitle="Anything else worth remembering">
        <textarea
          className="input-base resize-none"
          rows={4}
          value={form.notes}
          placeholder="Brew temperature, extraction notes, what food it paired with…"
          onChange={(e) => set('notes', e.target.value)}
        />
      </Section>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button type="submit"
          className="flex items-center gap-2 bg-amber-gold hover:bg-amber-light text-espresso-900 font-semibold px-6 py-3 rounded-lg transition-all active:scale-95 shadow-lg">
          <Save size={16} />
          {submitLabel}
        </button>
        <button type="button" onClick={() => router.back()}
          className="flex items-center gap-2 px-5 py-3 rounded-lg text-cream-400 hover:text-cream-100 transition-colors"
          style={{ background: '#2c1b0e', border: '1px solid #3d2510' }}>
          <X size={16} />
          Cancel
        </button>
      </div>
    </form>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-cream-100" style={{ fontFamily: 'Georgia, serif' }}>{title}</h2>
        <p className="text-xs text-cream-400 opacity-60 mt-0.5">{subtitle}</p>
      </div>
      <div className="rounded-xl p-5" style={{ background: '#1e1208', border: '1px solid #3d2510' }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, error, required, children }: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs text-cream-400 opacity-70 mb-1.5 tracking-wide">
        {label}{required && <span className="text-amber-gold ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

function TogglePill({ children, active, onClick }: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer"
      style={{
        background: active ? 'rgba(200,134,10,0.2)' : 'rgba(44,27,14,0.5)',
        borderColor: active ? 'rgba(200,134,10,0.6)' : 'rgba(61,37,16,0.8)',
        color: active ? '#e8a832' : '#d9be94',
      }}
    >
      {children}
    </button>
  );
}
