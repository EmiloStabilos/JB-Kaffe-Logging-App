'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit2, Trash2, MapPin, Calendar, Beaker, Weight, BadgeDollarSign, Leaf } from 'lucide-react';
import { getCoffeeById, deleteCoffee } from '@/lib/storage';
import type { Coffee } from '@/lib/types';
import StarRating from '@/components/StarRating';
import RoastLevelBar from '@/components/RoastLevelBar';

export default function CoffeeDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [coffee, setCoffee] = useState<Coffee | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const found = getCoffeeById(id);
    if (!found) { router.replace('/'); return; }
    setCoffee(found);
  }, [id, router]);

  function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    deleteCoffee(id);
    router.push('/');
  }

  if (!coffee) return null;

  const purchaseDate = new Date(coffee.purchaseDate).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const roastDate = coffee.roastDate
    ? new Date(coffee.roastDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const daysSinceRoast = coffee.roastDate
    ? Math.floor((new Date().getTime() - new Date(coffee.roastDate).getTime()) / 86400000)
    : null;

  return (
    <div className="max-w-2xl mx-auto fade-up space-y-6">
      {/* Back */}
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-cream-400 hover:text-amber-light transition-colors">
        <ArrowLeft size={15} />
        Back to journal
      </button>

      {/* Hero card */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #3d2510' }}>
        {/* Top gradient */}
        <div className="h-1 roast-gradient" />

        <div className="p-7" style={{ background: 'linear-gradient(145deg, #2c1b0e, #1e1208)' }}>
          <div className="flex items-start justify-between gap-4 mb-1">
            <div>
              <p className="text-amber-gold text-xs font-semibold tracking-[0.15em] uppercase mb-1">
                {coffee.roaster}
              </p>
              <h1 className="text-3xl font-bold text-cream-100 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                {coffee.name}
              </h1>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link href={`/edit/${coffee.id}`}
                className="p-2 rounded-lg text-cream-400 hover:text-amber-light transition-colors"
                style={{ background: '#3d2510' }}>
                <Edit2 size={16} />
              </Link>
              <button onClick={handleDelete}
                className={`p-2 rounded-lg transition-all ${confirmDelete
                  ? 'bg-red-900 text-red-300 ring-1 ring-red-700'
                  : 'text-cream-400 hover:text-red-400'}`}
                style={!confirmDelete ? { background: '#3d2510' } : undefined}
                title={confirmDelete ? 'Click again to confirm' : 'Delete entry'}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {confirmDelete && (
            <p className="text-red-400 text-xs mt-2 mb-3">
              Click the delete button again to permanently remove this entry.
            </p>
          )}

          {/* Rating */}
          <div className="flex items-center gap-3 mt-4 mb-6">
            <StarRating value={coffee.rating} readonly size={20} />
            <span className="text-cream-400 text-sm">{ratingLabel(coffee.rating)}</span>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <MetaItem icon={<MapPin size={14} />} label="Origin">{coffee.origin}</MetaItem>
            {coffee.variety && <MetaItem icon={<Leaf size={14} />} label="Variety">{coffee.variety}</MetaItem>}
            <MetaItem icon={<Beaker size={14} />} label="Process">
              {coffee.process.charAt(0).toUpperCase() + coffee.process.slice(1)}
            </MetaItem>
            <MetaItem icon={<Calendar size={14} />} label="Purchased">{purchaseDate}</MetaItem>
            {roastDate && (
              <MetaItem icon={<Calendar size={14} />} label="Roasted">
                {roastDate}
                {daysSinceRoast !== null && (
                  <span className="block text-xs opacity-50 mt-0.5">
                    {daysSinceRoast} days ago
                  </span>
                )}
              </MetaItem>
            )}
            {coffee.price !== undefined && (
              <MetaItem icon={<BadgeDollarSign size={14} />} label="Price">{coffee.price} kr</MetaItem>
            )}
            {coffee.weight !== undefined && (
              <MetaItem icon={<Weight size={14} />} label="Weight">{coffee.weight}g</MetaItem>
            )}
          </div>

          {/* Roast level */}
          <div className="mb-2">
            <p className="text-xs text-cream-400 opacity-60 uppercase tracking-widest mb-3">Roast Level</p>
            <RoastLevelBar value={coffee.roastLevel} />
          </div>
        </div>
      </div>

      {/* Tasting notes */}
      {coffee.tastingNotes.length > 0 && (
        <Section title="Tasting Notes">
          <div className="flex flex-wrap gap-2">
            {coffee.tastingNotes.map((note) => (
              <span key={note} className="tag text-sm px-3 py-1">{note}</span>
            ))}
          </div>
        </Section>
      )}

      {/* Brew methods */}
      {coffee.brewMethods.length > 0 && (
        <Section title="Brew Methods">
          <div className="flex flex-wrap gap-2">
            {coffee.brewMethods.map((method) => (
              <span key={method} className="text-sm px-3 py-1 rounded-full"
                style={{ background: '#2c1b0e', border: '1px solid #5a3618', color: '#d9be94' }}>
                {method}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Cupping notes */}
      {coffee.notes.trim() && (
        <Section title="Cupping Notes">
          <p className="text-cream-300 text-sm leading-relaxed whitespace-pre-wrap">{coffee.notes}</p>
        </Section>
      )}

      {/* Footer meta */}
      <p className="text-center text-xs text-cream-400 opacity-30 pb-4">
        Logged {new Date(coffee.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        {coffee.updatedAt !== coffee.createdAt && ` · Updated ${new Date(coffee.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`}
      </p>
    </div>
  );
}

function MetaItem({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-amber-gold mb-1">{icon}
        <span className="text-xs text-cream-400 opacity-60 uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-sm text-cream-200 font-medium">{children}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5" style={{ background: '#1e1208', border: '1px solid #3d2510' }}>
      <p className="text-xs text-cream-400 opacity-60 uppercase tracking-widest mb-4">{title}</p>
      {children}
    </div>
  );
}

function ratingLabel(r: number): string {
  return ['', 'Not for me', 'Decent', 'Good', 'Really Good', 'Outstanding'][r] ?? '';
}
