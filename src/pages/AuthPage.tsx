import React, { useState } from 'react';
import { Shield, Bot, Check, ArrowRight, PlayCircle, Lock, Mail, User } from 'lucide-react';
import { useAgentGate } from '../context/AgentGateContext';

interface AuthPageProps {
  onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const { loginAsDemo, user } = useAgentGate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In free MVP, register/login locally creates a user profile session
    loginAsDemo();
    onSuccess();
  };

  const handleDemoSignIn = () => {
    loginAsDemo();
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 selection:bg-emerald-500 selection:text-black">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/15">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            AGENT<span className="text-emerald-400">GATE</span>
          </h1>
          <p className="text-xs text-zinc-400">
            Sign in to access your AI Agent Security &amp; Permission Console
          </p>
        </div>

        {/* Card */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-5 shadow-2xl">
          {/* Quick Demo One-Click Access */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider font-mono">
                Instant Demo Sandbox
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Explore AgentGate immediately with pre-configured demo agents, policies, and pending approvals. Zero setup required.
            </p>
            <button
              type="button"
              onClick={handleDemoSignIn}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs shadow-emerald-500/20"
            >
              <PlayCircle className="w-4 h-4 fill-current" />
              <span>Enter Sandbox Demo</span>
            </button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-zinc-800"></div>
            <span className="shrink-0 mx-3 text-[10px] text-zinc-500 uppercase font-mono">Or Operator Sign-in</span>
            <div className="flex-grow border-t border-zinc-800"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Alex Chen"
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="operator@company.security"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 outline-hidden focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 outline-hidden focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700 font-medium text-xs transition-colors"
            >
              {isRegister ? 'Create Operator Account' : 'Sign In as Operator'}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsRegister(prev => !prev)}
              className="text-xs text-zinc-400 hover:text-emerald-400 transition-colors"
            >
              {isRegister
                ? 'Already have an account? Sign in'
                : "Don't have an operator profile? Create one"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
