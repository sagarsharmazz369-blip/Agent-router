import React from 'react';
import { ActionPlayground } from '../components/simulator/ActionPlayground';

interface SimulatorPageProps {
  onNavigateToApprovals: () => void;
  onNavigateToActivity: () => void;
  initialAgentId?: string;
}

export const SimulatorPage: React.FC<SimulatorPageProps> = ({
  onNavigateToApprovals,
  onNavigateToActivity,
  initialAgentId
}) => {
  return (
    <div className="space-y-6">
      <ActionPlayground
        initialAgentId={initialAgentId}
        onNavigateToApprovals={onNavigateToApprovals}
        onNavigateToActivity={onNavigateToActivity}
      />
    </div>
  );
};
