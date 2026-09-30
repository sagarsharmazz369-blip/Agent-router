import React from 'react';
import { FlaskConical } from 'lucide-react';

interface SimulationBadgeProps {
  className?: string;
  subtle?: boolean;
}

export const SimulationBadge: React.FC<SimulationBadgeProps> = ({ className = '', subtle = false }) => {
  if (subtle) {
    return (
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono tracking-wider font-semibold uppercase bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 ${className}`}>
        <FlaskConical className="w-2.5 h-2.5" />
        SIMULATION
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono tracking-wider font-semibold uppercase bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 shadow-xs shadow-cyan-950 ${className}`}>
      <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
      <span>SIMULATION SANDBOX</span>
    </span>
  );
};
