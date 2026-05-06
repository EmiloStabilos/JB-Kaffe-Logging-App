'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-espresso-700 backdrop-blur-sm"
      style={{ background: 'rgba(19,12,4,0.92)' }}>
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <CoffeeCupIcon />
          <div>
            <span className="text-lg font-semibold text-cream-100"
              style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.04em' }}>
              Kaffe
            </span>
            <span className="text-lg font-light tracking-widest text-amber-gold ml-1"
              style={{ fontFamily: 'Georgia, serif' }}>
              Journal
            </span>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-4">
          {/* Hide "My Beans" on mobile — logo already goes home */}
          <Link
            href="/"
            className={`hidden sm:block text-sm tracking-wide transition-colors ${
              pathname === '/' ? 'text-amber-light' : 'text-cream-400 hover:text-cream-100'
            }`}
          >
            My Beans
          </Link>
          <Link
            href="/add"
            className="flex items-center gap-1.5 bg-amber-gold hover:bg-amber-light text-espresso-900 text-sm font-semibold px-3 py-2 sm:px-4 rounded-lg transition-all active:scale-95"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Log Bean</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

function CoffeeCupIcon() {
  return (
    <div className="relative w-7 h-7 shrink-0">
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M10 7 Q11 4 10 2" stroke="#c8860a" strokeWidth="1.2" strokeLinecap="round" className="steam" />
        <path d="M14 7 Q15 3.5 14 1" stroke="#c8860a" strokeWidth="1.2" strokeLinecap="round" className="steam-2" />
        <path d="M18 7 Q19 4 18 2" stroke="#c8860a" strokeWidth="1.2" strokeLinecap="round" className="steam-3" />
        <path d="M6 10 L8 26 H24 L26 10 Z" fill="#3d2510" stroke="#c8860a" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M24 14 Q30 14 30 19 Q30 24 24 24" stroke="#c8860a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M4 27 H28" stroke="#c8860a" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8.5 13 L9.8 23 H22.2 L23.5 13 Z" fill="#7a4a20" opacity="0.7" />
      </svg>
    </div>
  );
}
