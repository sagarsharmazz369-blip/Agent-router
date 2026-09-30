import React, { useEffect, useState, useRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: number | string;
  subtext?: string;
  icon: LucideIcon;
  color?: 'emerald' | 'amber' | 'rose' | 'cyan' | 'zinc';
  onClick?: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  color = 'zinc',
  onClick
}) => {
  const [isChanged, setIsChanged] = useState(false);
  const [diff, setDiff] = useState<number | null>(null);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (prevValueRef.current !== value) {
      if (typeof value === 'number' && typeof prevValueRef.current === 'number') {
        setDiff(value - prevValueRef.current);
      } else {
        setDiff(null);
      }
      prevValueRef.current = value;
      setIsChanged(true);
      const timer = setTimeout(() => {
        setIsChanged(false);
        setDiff(null);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [value]);

  const colorMap = {
    emerald: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
      glow: 'hover:border-emerald-500/50',
      flash: 'ring-2 ring-emerald-500/70 bg-emerald-950/40 border-emerald-500/60'
    },
    amber: {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
      glow: 'hover:border-amber-500/50',
      flash: 'ring-2 ring-amber-500/70 bg-amber-950/40 border-amber-500/60'
    },
    rose: {
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
      glow: 'hover:border-rose-500/50',
      flash: 'ring-2 ring-rose-500/70 bg-rose-950/40 border-rose-500/60'
    },
    cyan: {
      bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25',
      glow: 'hover:border-cyan-500/50',
      flash: 'ring-2 ring-cyan-500/70 bg-cyan-950/40 border-cyan-500/60'
    },
    zinc: {
      bg: 'bg-zinc-800 text-zinc-300 border-zinc-700/60',
      glow: 'hover:border-zinc-600',
      flash: 'ring-2 ring-zinc-400/60 bg-zinc-800/90 border-zinc-500'
    }
  }[color];

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-xl border transition-all duration-300 ${
        isChanged ? `${colorMap.flash} scale-[1.02]` : 'bg-zinc-900/70 border-zinc-800/80'
      } ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''} ${colorMap.glow}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider font-mono">
          {label}
        </span>
        <div className={`p-2 rounded-lg border transition-transform duration-300 ${colorMap.bg} ${isChanged ? 'scale-110' : ''}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <div className="relative overflow-hidden inline-flex items-baseline">
          <span
            key={String(value)}
            className={`text-2xl font-bold tracking-tight font-mono inline-block animate-stat-slide transition-colors duration-300 ${
              isChanged ? 'text-white' : 'text-zinc-100'
            }`}
          >
            {value}
          </span>
        </div>

        {diff !== null && diff !== 0 && (
          <span
            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded transition-all duration-300 ${
              diff > 0
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            {diff > 0 ? `+${diff}` : `${diff}`}
          </span>
        )}

        {subtext && <span className="text-xs text-zinc-500">{subtext}</span>}
      </div>
    </div>
  );
};
