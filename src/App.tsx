import React, { useState } from 'react';
import { AgentGateProvider, useAgentGate } from './context/AgentGateContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { Modal } from './components/common/Modal';
import { CreateAgentWizard } from './components/agents/CreateAgentWizard';

import { ToastProvider } from './components/common/Toast';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { AgentsPage } from './pages/AgentsPage';
import { AgentDetailPage } from './pages/AgentDetailPage';
import { ToolsPage } from './pages/ToolsPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { ActivityPage } from './pages/ActivityPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { SecurityPage } from './pages/SecurityPage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { AuthPage } from './pages/AuthPage';

function MainApp() {
  const { user, createAgent } = useAgentGate();

  // Navigation state
  const [currentRoute, setCurrentRoute] = useState<string>('dashboard');
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateAgentOpen, setIsCreateAgentOpen] = useState(false);

  const navigateTo = (route: string, param?: string) => {
    setCurrentRoute(route);
    if (param) setSelectedAgentId(param);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If user navigated to landing page explicitly
  if (currentRoute === 'landing') {
    return (
      <LandingPage
        onStart={() => setCurrentRoute('dashboard')}
        onViewDemo={() => setCurrentRoute('dashboard')}
        onNavigate={navigateTo}
      />
    );
  }

  // If user logged out or explicitly navigated to auth
  if (currentRoute === 'auth' || (!user && currentRoute !== 'about' && currentRoute !== 'privacy')) {
    return (
      <AuthPage
        onSuccess={() => setCurrentRoute('dashboard')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onNavigate={navigateTo}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentRoute={currentRoute}
          onNavigate={navigateTo}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-7xl w-full mx-auto">
          {currentRoute === 'dashboard' && (
            <DashboardPage
              onNavigate={navigateTo}
              onOpenCreateAgent={() => setIsCreateAgentOpen(true)}
            />
          )}

          {currentRoute === 'agents' && (
            <AgentsPage
              onOpenCreateAgent={() => setIsCreateAgentOpen(true)}
              onOpenAgentDetails={id => navigateTo('agent_detail', id)}
              onTestAction={id => navigateTo('simulator', id)}
            />
          )}

          {currentRoute === 'agent_detail' && selectedAgentId && (
            <AgentDetailPage
              agentId={selectedAgentId}
              onBack={() => navigateTo('agents')}
              onTestAction={id => navigateTo('simulator', id)}
            />
          )}

          {currentRoute === 'tools' && <ToolsPage />}

          {currentRoute === 'approvals' && <ApprovalsPage />}

          {currentRoute === 'simulator' && (
            <SimulatorPage
              initialAgentId={selectedAgentId || undefined}
              onNavigateToApprovals={() => navigateTo('approvals')}
              onNavigateToActivity={() => navigateTo('activity')}
            />
          )}

          {currentRoute === 'activity' && <ActivityPage />}

          {currentRoute === 'security' && <SecurityPage onNavigate={navigateTo} />}

          {currentRoute === 'settings' && <SettingsPage />}

          {currentRoute === 'about' && <AboutPage />}

          {currentRoute === 'privacy' && <PrivacyPage />}
        </main>
      </div>

      {/* Footer */}
      <Footer onNavigate={navigateTo} />

      {/* Global Create Agent Wizard Modal */}
      {isCreateAgentOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsCreateAgentOpen(false)}
          title="Create Autonomous Agent"
          subtitle="Configure identity, purpose, assigned capabilities, and security boundaries"
          maxWidth="2xl"
        >
          <CreateAgentWizard
            onClose={() => setIsCreateAgentOpen(false)}
            onCreate={agentData => {
              createAgent(agentData);
              navigateTo('agents');
            }}
          />
        </Modal>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AgentGateProvider>
        <MainApp />
      </AgentGateProvider>
    </ToastProvider>
  );
}
