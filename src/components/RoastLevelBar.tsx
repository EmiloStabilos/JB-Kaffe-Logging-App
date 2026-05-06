import type { RoastLevel } from '@/lib/types';

const LEVELS: RoastLevel[] = ['light', 'medium-light', 'medium', 'medium-dark', 'dark'];
const LABELS: Record<RoastLevel, string> = {
  light: 'Light',
  'medium-light': 'Med Light',
  medium: 'Medium',
  'medium-dark': 'Med Dark',
  dark: 'Dark',
};

interface RoastLevelBarProps {
  value: RoastLevel;
  compact?: boolean;
}

export default function RoastLevelBar({ value, compact = false }: RoastLevelBarProps) {
  const idx = LEVELS.indexOf(value);
  const pct = ((idx / (LEVELS.length - 1)) * 100).toFixed(0);

  if (compact) {
    return (
      <span
        className="text-xs font-medium px-2 py-0.5 rounded"
        style={{ background: getRoastBg(value), color: getRoastColor(value) }}
      >
        {LABELS[value]}
      </span>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="relative h-2 rounded-full overflow-hidden" style={{ background: '#2c1b0e' }}>
        <div className="absolute inset-0 roast-gradient opacity-30 rounded-full" />
        <div
          className="absolute top-0 left-0 h-full rounded-full roast-gradient"
          style={{ width: `${Math.max(8, parseInt(pct))}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-espresso-900"
          style={{
            left: `calc(${pct}% - 6px)`,
            background: getRoastBg(value),
          }}
        />
      </div>
      <div className="flex justify-between text-xs" style={{ color: 'var(--cream-400)' }}>
        <span>Light</span>
        <span className="font-medium" style={{ color: getRoastBg(value) }}>{LABELS[value]}</span>
        <span>Dark</span>
      </div>
    </div>
  );
}

function getRoastBg(level: RoastLevel): string {
  const map: Record<RoastLevel, string> = {
    light: '#f5cc72',
    'medium-light': '#e8a832',
    medium: '#c8860a',
    'medium-dark': '#7a4a20',
    dark: '#3d2510',
  };
  return map[level];
}

function getRoastColor(level: RoastLevel): string {
  return level === 'dark' || level === 'medium-dark' ? '#f7edd8' : '#130c04';
}
