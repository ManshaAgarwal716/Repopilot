import React, { useState } from 'react';
import { ActiveScreen, RepositoryItem } from './types';
import { Layout } from './components/layout/Layout';
import { DashboardView } from './views/DashboardView';
import { DoctorView } from './views/DoctorView';
import { ExplorerView } from './views/ExplorerView';
import { PRCompassView } from './views/PRCompassView';
import { AICopilotView } from './views/AICopilotView';
import { CodeViewerModal } from './components/code/CodeViewerModal';
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
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalCommand, setTerminalCommand] = useState('repopilot doctor .');
  const [selectedCodeFile, setSelectedCodeFile] = useState<{
    fileName: string;
    filePath: string;
    codeSnippet?: string;
  } | null>(null);

  // Listen for terminal launch requests from any view or button
  React.useEffect(() => {
    const handleLaunchTerminal = (e: Event) => {
      const customEvent = e as CustomEvent<{ command?: string }>;
      if (customEvent.detail?.command) {
        setTerminalCommand(customEvent.detail.command);
      }
      setIsTerminalOpen(true);
    };
    window.addEventListener('repopilot:terminal', handleLaunchTerminal);
    return () => window.removeEventListener('repopilot:terminal', handleLaunchTerminal);
  }, []);

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
      originType: 'local',
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

  const handleOpenRepoModal = () => {
    const btn = document.querySelector('[aria-label="Open repo selector"]') as HTMLElement;
    if (btn) btn.click();
    else {
      // Find switch repo button by text
      const allButtons = Array.from(document.querySelectorAll('button'));
      const switchBtn = allButtons.find((b) => b.textContent?.includes('Repo'));
      switchBtn?.click();
    }
  };

  const handleAskAIAboutFile = (_filePath: string) => {
    setSelectedCodeFile(null);
    setActiveScreen('ai-copilot');
  };

  // Render current screen content
  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return (
          <DashboardView
            onNavigate={setActiveScreen}
            activeRepo={activeRepo}
            onOpenRepoSelector={handleOpenRepoModal}
            recentRepos={recentRepos}
            onSelectRepo={handleSelectRepo}
            onClearRecentRepos={handleClearRecentRepos}
            onRestoreDemoRepos={handleRestoreDemoRepos}
          />
        );
      case 'ai-copilot':
        return (
          <AICopilotView
            activeRepo={activeRepo}
            onOpenRepoSelector={handleOpenRepoModal}
          />
        );
      case 'doctor':
        return (
          <DoctorView
            activeRepo={activeRepo}
            report={activeRepo?.isDemo ? DEMO_DOCTOR_REPORT : null}
            onOpenRepoSelector={handleOpenRepoModal}
            onLoadDemoRepo={handleRestoreDemoRepos}
          />
        );
      case 'explorer':
        return (
          <ExplorerView
            activeRepo={activeRepo}
            report={activeRepo?.isDemo ? DEMO_EXPLORER_REPORT : null}
            onOpenRepoSelector={handleOpenRepoModal}
            onLoadDemoRepo={handleRestoreDemoRepos}
          />
        );
      case 'pr-compass':
        return (
          <PRCompassView
            activeRepo={activeRepo}
            report={activeRepo?.isDemo ? DEMO_PR_COMPASS_REPORT : null}
            onOpenRepoSelector={handleOpenRepoModal}
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
      isTerminalOpen={isTerminalOpen}
      onToggleTerminal={() => setIsTerminalOpen((prev) => !prev)}
      onCloseTerminal={() => setIsTerminalOpen(false)}
      terminalCommand={terminalCommand}
    >
      {renderScreen()}

      {selectedCodeFile && (
        <CodeViewerModal
          isOpen={true}
          onClose={() => setSelectedCodeFile(null)}
          fileName={selectedCodeFile.fileName}
          filePath={selectedCodeFile.filePath}
          codeSnippet={selectedCodeFile.codeSnippet}
          onAskAI={handleAskAIAboutFile}
        />
      )}
    </Layout>
  );
};

export default App;
