import React from 'react';
import { Shield, Sparkles } from 'lucide-react';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="mt-auto border-t border-zinc-800/80 bg-zinc-950 py-6 px-4 sm:px-8 text-xs text-zinc-500">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-zinc-300">AgentGate</span>
          <span>— Give AI agents power. Keep humans in control.</span>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate('about')}
            className="hover:text-zinc-300 transition-colors"
          >
            How It Works
          </button>
          <button
            onClick={() => onNavigate('privacy')}
            className="hover:text-zinc-300 transition-colors"
          >
            Security &amp; Privacy
          </button>
          <button
            onClick={() => onNavigate('security')}
            className="hover:text-zinc-300 transition-colors"
          >
            Security Center
          </button>
          <button
            onClick={() => onNavigate('simulator')}
            className="hover:text-zinc-300 transition-colors"
          >
            Simulator
          </button>
        </div>
      </div>
    </footer>
  );
};
