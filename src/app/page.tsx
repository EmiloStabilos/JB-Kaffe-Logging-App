'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Coffee, TrendingUp, Star, Plus } from 'lucide-react';
import { getAllCoffees, seedDemoData } from '@/lib/storage';
import type { Coffee as CoffeeType, RoastLevel } from '@/lib/types';
import { ROAST_LEVELS } from '@/lib/types';
import CoffeeCard from '@/components/CoffeeCard';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'name', label: 'Name A–Z' },
  { value: 'oldest', label: 'Oldest First' },
];

export default function HomePage() {
  const [coffees, setCoffees] = useState<CoffeeType[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterRoast, setFilterRoast] = useState<RoastLevel | ''>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seedDemoData()
      .then(() => getAllCoffees())
      .then(setCoffees)
      .finally(() => setLoading(false));
  }, []);

  const filtered = coffees
    .filter((c) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.roaster.toLowerCase().includes(q) ||
        c.origin.toLowerCase().includes(q) ||
        c.tastingNotes.some((n) => n.toLowerCase().includes(q));
      const matchRoast = !filterRoast || c.roastLevel === filterRoast;
      return matchSearch && matchRoast;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const avgRating = coffees.length
    ? (coffees.reduce((s, c) => s + c.rating, 0) / coffees.length).toFixed(1)
    : '–';
  const topRoaster = (() => {
    const counts: Record<string, number> = {};
    coffees.forEach((c) => { counts[c.roaster] = (counts[c.roaster] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '–';
  })();

  return (
    <div className="space-y-8 fade-up">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl px-8 py-10"
        style={{ background: 'linear-gradient(135deg, #2c1b0e 0%, #1e1208 60%, #130c04 100%)', border: '1px solid #3d2510' }}>
        <div className="relative z-10">
          <p className="text-amber-gold text-xs font-semibold tracking-[0.2em] uppercase mb-2">
            Your Coffee Journal
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-cream-100 mb-1" style={{ fontFamily: 'Georgia, serif' }}>
            Bean Collection
          </h1>
          <p className="text-cream-400 text-sm mt-1">
            {loading ? 'Loading…' : `${coffees.length} ${coffees.length === 1 ? 'bean' : 'beans'} logged · Savour every cup`}
          </p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #c8860a, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute right-20 bottom-0 w-32 h-32 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #e8a832, transparent)', transform: 'translateY(40%)' }} />
      </div>

      {/* Stats */}
      {!loading && coffees.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard icon={<Coffee size={18} />} label="Beans Logged" value={coffees.length} />
          <StatCard icon={<Star size={18} />} label="Avg Rating" value={avgRating} />
          <div className="hidden sm:block">
            <StatCard icon={<TrendingUp size={18} />} label="Top Roaster" value={topRoaster} small />
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-2">
        <div className="relative">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cream-400 opacity-50 pointer-events-none" />
          <input
            type="text"
            placeholder="Search beans, roasters, origins…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base"
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
          <select value={filterRoast} onChange={(e) => setFilterRoast(e.target.value as RoastLevel | '')} className="input-base sm:w-40">
            <option value="">All Roasts</option>
            {ROAST_LEVELS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-base sm:w-44">
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <LoadingSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState hasAny={coffees.length > 0} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((coffee, i) => (
            <div key={coffee.id} className="fade-up" style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
              <CoffeeCard coffee={coffee} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, small = false }: {
  icon: React.ReactNode; label: string; value: string | number; small?: boolean;
}) {
  return (
    <div className="rounded-xl p-3 sm:p-4" style={{ background: '#1e1208', border: '1px solid #3d2510' }}>
      <div className="flex items-center gap-1.5 text-amber-gold mb-1.5">{icon}</div>
      <p className="font-bold text-cream-100 truncate"
        style={{ fontFamily: 'Georgia, serif', fontSize: small ? '0.8rem' : '1.4rem' }}>
        {value}
      </p>
      <p className="text-xs text-cream-400 opacity-60 mt-0.5 truncate">{label}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl h-52 animate-pulse" style={{ background: '#1e1208', border: '1px solid #3d2510' }} />
      ))}
    </div>
  );
}

function EmptyState({ hasAny }: { hasAny: boolean }) {
  return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">☕</div>
      <h3 className="text-xl font-semibold text-cream-200 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
        {hasAny ? 'No beans match your search' : 'Your journal is empty'}
      </h3>
      <p className="text-cream-400 text-sm mb-6">
        {hasAny ? 'Try adjusting your filters.' : 'Start by logging your first coffee bean.'}
      </p>
      {!hasAny && (
        <Link href="/add" className="inline-flex items-center gap-2 bg-amber-gold hover:bg-amber-light text-espresso-900 font-semibold px-6 py-3 rounded-lg transition-colors">
          <Plus size={16} />
          Log Your First Bean
        </Link>
      )}
    </div>
  );
}
