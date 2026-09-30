import React from 'react';
import {
  LayoutDashboard,
  Bot,
  Wrench,
  CheckSquare,
  PlayCircle,
  FileClock,
  ShieldAlert,
  Settings,
  HelpCircle,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  X
} from 'lucide-react';
import { useAgentGate } from '../../context/AgentGateContext';
import { SYSTEM_TOOLS } from '../../lib/toolsRegistry';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  isOpenMobile,
  onCloseMobile
}) => {
  const { stats, isDemoMode, resetToDemoData } = useAgentGate();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'agents', label: 'AI Agents', icon: Bot, badge: stats.totalAgents },
    { id: 'tools', label: 'Tool Registry', icon: Wrench, badge: SYSTEM_TOOLS.length },
    {
      id: 'approvals',
      label: 'Approval Center',
      icon: CheckSquare,
      highlightBadge: stats.pendingApprovals > 0 ? stats.pendingApprovals : undefined,
      pulse: stats.pendingApprovals > 0
    },
    { id: 'simulator', label: 'Action Simulator', icon: PlayCircle },
    { id: 'activity', label: 'Activity & Audit', icon: FileClock, badge: stats.actionsToday },
    { id: 'security', label: 'Security Center', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const secondaryNav = [
    { id: 'landing', label: 'Product Landing', icon: Sparkles },
    { id: 'about', label: 'How It Works', icon: HelpCircle },
    { id: 'privacy', label: 'Security & Privacy', icon: ShieldAlert }
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    onCloseMobile();
  };

  const content = (
    <aside className="w-64 h-full bg-zinc-950 border-r border-zinc-800/80 flex flex-col justify-between select-none">
      {/* Top Header in mobile drawer */}
      <div className="p-4 flex items-center justify-between border-b border-zinc-800 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Bot className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-zinc-100">AGENTGATE</span>
        </div>
        <button
          onClick={onCloseMobile}
          className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Nav */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider uppercase text-zinc-500 font-mono">
            Control Center
          </div>
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-zinc-800/90 text-white border border-zinc-700/60 shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-300'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.highlightBadge !== undefined ? (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold font-mono ${
                        item.pulse
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {item.highlightBadge}
                    </span>
                  ) : item.badge !== undefined ? (
                    <span className="text-[11px] font-mono text-zinc-600 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800/60">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider uppercase text-zinc-500 font-mono">
            Knowledge
          </div>
          <nav className="space-y-1">
            {secondaryNav.map(item => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-zinc-800/90 text-white border border-zinc-700/60'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Demo Notice / Quick Action Box */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-900/40 m-2 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span className="text-xs font-semibold text-zinc-200">Demo Sandbox</span>
          </div>
          <button
            onClick={resetToDemoData}
            title="Reset to default demo data"
            className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[11px] text-zinc-400 leading-relaxed">
          Safe testing mode active. AI agent actions evaluate policies safely without calling real external tools.
        </p>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <div className="hidden lg:block shrink-0">{content}</div>

      {/* Mobile drawer with backdrop */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 shadow-2xl animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
