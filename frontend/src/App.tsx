import React, { useState } from 'react';
import { ActiveScreen, RepositoryItem } from './types';
import { Layout } from './components/layout/Layout';
import { DashboardView } from './views/DashboardView';
import { DoctorView } from './views/DoctorView';
import { ExplorerView } from './views/ExplorerView';
import { PRCompassView } from './views/PRCompassView';
import {
  DEMO_REPOSITORIES,
  DEMO_DOCTOR_REPORT,
  DEMO_EXPLORER_REPORT,
  DEMO_PR_COMPASS_REPORT,
} from './data/demoData';

export const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('dashboard');
  const [recentRepos, setRecentRepos] = useState<RepositoryItem[]>(DEMO_REPOSITORIES);
  const [activeRepo, setActiveRepo] = useState<RepositoryItem | null>(DEMO_REPOSITORIES[0]);

  // Handle repository selection
  const handleSelectRepo = (repo: RepositoryItem) => {
    setActiveRepo(repo);
    // Update recent repos list ordering
    setRecentRepos((prev) => {
      const filtered = prev.filter((r) => r.id !== repo.id);
      return [repo, ...filtered];
    });
  };

  // Handle connecting a custom local path
  const handleConnectCustomPath = (path: string) => {
    const customRepo: RepositoryItem = {
      id: `custom-${Date.now()}`,
      name: path.split('/').filter(Boolean).pop() || 'local-repo',
      path,
      isDemo: false,
      projectType: 'generic',
      lastOpened: 'Just now',
      branch: 'main',
    };
    setActiveRepo(customRepo);
    setRecentRepos((prev) => [customRepo, ...prev.filter((r) => r.path !== path)]);
  };

  // Clear history to test empty state
  const handleClearRecentRepos = () => {
    setRecentRepos([]);
    setActiveRepo(null);
  };

  // Restore demo repositories
  const handleRestoreDemoRepos = () => {
    setRecentRepos(DEMO_REPOSITORIES);
    setActiveRepo(DEMO_REPOSITORIES[0]);
  };

  // Render current screen content
  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return (
          <DashboardView
            onNavigate={setActiveScreen}
            activeRepo={activeRepo}
            onOpenRepoSelector={() => {
              // Trigger modal via custom event or layout handler
              const btn = document.querySelector('[aria-label="Open repo selector"]') as HTMLElement;
              btn?.click();
            }}
            recentRepos={recentRepos}
            onSelectRepo={handleSelectRepo}
            onClearRecentRepos={handleClearRecentRepos}
            onRestoreDemoRepos={handleRestoreDemoRepos}
          />
        );
      case 'doctor':
        return (
          <DoctorView
            activeRepo={activeRepo}
            report={activeRepo?.isDemo ? DEMO_DOCTOR_REPORT : null}
            onOpenRepoSelector={() => {
              const btn = document.querySelector('[aria-label="Open repo selector"]') as HTMLElement;
              btn?.click();
            }}
            onLoadDemoRepo={handleRestoreDemoRepos}
          />
        );
      case 'explorer':
        return (
          <ExplorerView
            activeRepo={activeRepo}
            report={activeRepo?.isDemo ? DEMO_EXPLORER_REPORT : null}
            onOpenRepoSelector={() => {
              const btn = document.querySelector('[aria-label="Open repo selector"]') as HTMLElement;
              btn?.click();
            }}
            onLoadDemoRepo={handleRestoreDemoRepos}
          />
        );
      case 'pr-compass':
        return (
          <PRCompassView
            activeRepo={activeRepo}
            report={activeRepo?.isDemo ? DEMO_PR_COMPASS_REPORT : null}
            onOpenRepoSelector={() => {
              const btn = document.querySelector('[aria-label="Open repo selector"]') as HTMLElement;
              btn?.click();
            }}
            onLoadDemoRepo={handleRestoreDemoRepos}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout
      activeScreen={activeScreen}
      onNavigate={setActiveScreen}
      activeRepo={activeRepo}
      onSelectRepo={handleSelectRepo}
      onConnectCustomPath={handleConnectCustomPath}
    >
      {renderScreen()}
    </Layout>
  );
};

export default App;
