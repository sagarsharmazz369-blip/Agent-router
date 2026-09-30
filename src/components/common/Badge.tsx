import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldX, HelpCircle, Shield, Sparkles } from 'lucide-react';
import { PermissionLevel, RiskLevel } from '../../types';

interface BadgeProps {
  type: 'decision' | 'risk' | 'status';
  value: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ type, value, size = 'md', showIcon = true }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-medium'
  }[size];

  if (type === 'decision') {
    const val = value.toUpperCase() as PermissionLevel;
    if (val === 'ALLOW') {
      return (
        <span className={`inline-flex items-center rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 ${sizeClasses}`}>
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
          <span>ALLOW</span>
        </span>
      );
    }
    if (val === 'ASK') {
      return (
        <span className={`inline-flex items-center rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 ${sizeClasses}`}>
          {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-amber-300 shrink-0" />}
          <span>ASK APPROVAL</span>
        </span>
      );
    }
    if (val === 'BLOCK') {
      return (
        <span className={`inline-flex items-center rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30 ${sizeClasses}`}>
          {showIcon && <ShieldX className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
          <span>BLOCK</span>
        </span>
      );
    }
  }

  if (type === 'risk') {
    const risk = value.toLowerCase() as RiskLevel;
    switch (risk) {
      case 'low':
        return (
          <span className={`inline-flex items-center rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${sizeClasses}`}>
            {showIcon && <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
            <span>Low Risk</span>
          </span>
        );
      case 'medium':
        return (
          <span className={`inline-flex items-center rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 ${sizeClasses}`}>
            {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
            <span>Medium Risk</span>
          </span>
        );
      case 'high':
        return (
          <span className={`inline-flex items-center rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20 ${sizeClasses}`}>
            {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-orange-400 shrink-0" />}
            <span>High Risk</span>
          </span>
        );
      case 'critical':
        return (
          <span className={`inline-flex items-center rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30 font-semibold ${sizeClasses}`}>
            {showIcon && <ShieldX className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
            <span>Critical Risk</span>
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700 ${sizeClasses}`}>
            {value}
          </span>
        );
    }
  }

  // status type
  const status = value.toLowerCase();
  switch (status) {
    case 'pending':
      return (
        <span className={`inline-flex items-center rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse ${sizeClasses}`}>
          <AlertTriangle className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span>Pending Review</span>
        </span>
      );
    case 'approved':
    case 'executed':
      return (
        <span className={`inline-flex items-center rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{status === 'approved' ? 'Approved & Executed' : 'Executed'}</span>
        </span>
      );
    case 'rejected':
      return (
        <span className={`inline-flex items-center rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30 ${sizeClasses}`}>
          <ShieldX className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>Rejected</span>
        </span>
      );
    case 'blocked':
      return (
        <span className={`inline-flex items-center rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30 ${sizeClasses}`}>
          <ShieldX className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>Blocked</span>
        </span>
      );
    case 'active':
      return (
        <span className={`inline-flex items-center rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
          <span>Active</span>
        </span>
      );
    case 'paused':
      return (
        <span className={`inline-flex items-center rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 shrink-0"></span>
          <span>Paused</span>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700 ${sizeClasses}`}>
          <HelpCircle className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span>{value}</span>
        </span>
      );
  }
};
