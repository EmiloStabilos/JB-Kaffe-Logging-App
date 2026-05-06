import Link from 'next/link';
import { MapPin, Calendar, Beaker } from 'lucide-react';
import type { Coffee } from '@/lib/types';
import StarRating from './StarRating';
import RoastLevelBar from './RoastLevelBar';

interface CoffeeCardProps {
  coffee: Coffee;
}

export default function CoffeeCard({ coffee }: CoffeeCardProps) {
  const date = new Date(coffee.purchaseDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Link href={`/coffee/${coffee.id}`}>
      <article
        className="card-hover rounded-xl overflow-hidden cursor-pointer"
        style={{
          background: 'linear-gradient(145deg, #2c1b0e, #1e1208)',
          border: '1px solid rgba(61,37,16,0.8)',
        }}
      >
        {/* Top accent bar */}
        <div className="h-0.5 roast-gradient opacity-60" />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <h2
                className="text-lg font-semibold text-cream-100 leading-tight truncate"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {coffee.name}
              </h2>
              <p className="text-sm text-amber-light mt-0.5 truncate">{coffee.roaster}</p>
            </div>
            <StarRating value={coffee.rating} readonly size={15} />
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-cream-400 mb-4">
            <span className="flex items-center gap-1">
              <MapPin size={11} className="text-amber-gold" />
              {coffee.origin}
            </span>
            <span className="flex items-center gap-1">
              <Beaker size={11} className="text-amber-gold" />
              {coffee.process.charAt(0).toUpperCase() + coffee.process.slice(1)}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={11} className="text-amber-gold" />
              {date}
            </span>
          </div>

          {/* Roast bar */}
          <div className="mb-4">
            <RoastLevelBar value={coffee.roastLevel} />
          </div>

          {/* Tasting notes */}
          {coffee.tastingNotes.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {coffee.tastingNotes.slice(0, 4).map((note) => (
                <span key={note} className="tag">{note}</span>
              ))}
              {coffee.tastingNotes.length > 4 && (
                <span className="tag" style={{ opacity: 0.6 }}>+{coffee.tastingNotes.length - 4}</span>
              )}
            </div>
          )}

          {/* Brew methods */}
          {coffee.brewMethods.length > 0 && (
            <p className="mt-3 text-xs text-cream-400 opacity-70">
              {coffee.brewMethods.join(' · ')}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}
