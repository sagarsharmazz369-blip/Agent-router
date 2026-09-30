import React from 'react';
import { Shield, Sparkles, Moon, Sun, PlayCircle, Menu, LogOut, Info } from 'lucide-react';
import { useAgentGate } from '../../context/AgentGateContext';

interface NavbarProps {
  onOpenMobileMenu: () => void;
  onNavigate: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu, onNavigate }) => {
  const {
    isDemoMode,
    theme,
    toggleTheme,
    aiExplanationEnabled,
    toggleAiExplanation,
    user,
    logout,
    loginAsDemo,
    stats
  } = useAgentGate();

  return (
    <header className="sticky top-0 z-30 h-16 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle + Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 focus:outline-hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 group-hover:border-emerald-500 transition-all shadow-xs shadow-emerald-500/20">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-zinc-100">
                AGENT<span className="text-emerald-400">GATE</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                v1.0
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 font-medium hidden sm:block">AI Action Control Center</p>
          </div>
        </div>

        {/* Status pill */}
        <div className="hidden md:flex items-center ml-4 px-2.5 py-1 rounded-full text-xs font-medium border bg-emerald-950/20 border-emerald-500/30 text-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 animate-ping" />
          <span>Policy Engine Active</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Simulator Button */}
        <button
          onClick={() => onNavigate('simulator')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-xs shadow-emerald-600/30"
        >
          <PlayCircle className="w-4 h-4" />
          <span>Test Action</span>
        </button>

        {/* AI Explanations Toggle */}
        <button
          onClick={toggleAiExplanation}
          title={aiExplanationEnabled ? 'AI explanations enabled (Gemini)' : 'Enable AI explanations'}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all ${
            aiExplanationEnabled
              ? 'bg-purple-950/40 border-purple-500/40 text-purple-300 shadow-xs shadow-purple-900/50'
              : 'bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sparkles className={`w-3.5 h-3.5 ${aiExplanationEnabled ? 'text-purple-400' : 'text-zinc-500'}`} />
          <span className="hidden md:inline">AI Intel</span>
          <span className={`text-[10px] uppercase font-mono px-1 py-0.2 rounded ${aiExplanationEnabled ? 'bg-purple-500/20 text-purple-300' : 'bg-zinc-800 text-zinc-500'}`}>
            {aiExplanationEnabled ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* Dark/Light mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User / Demo Status */}
        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-medium text-zinc-200">{user.displayName}</div>
              <div className="text-[10px] text-zinc-500 font-mono">
                {user.isDemo ? 'Demo Mode' : user.email}
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-300">
              {user.displayName.charAt(0)}
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 rounded-md"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={loginAsDemo}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
          >
            Try Demo
          </button>
        )}
      </div>
    </header>
  );
};
