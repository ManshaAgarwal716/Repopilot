import React, { useState, useEffect } from 'react';
import { ActiveScreen, RepositoryItem, DoctorReport, ExplorerReport, PRCompassReport } from './types';
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

const DEFAULT_WORKSPACE_REPO: RepositoryItem = {
  id: 'workspace-repopilot',
  name: 'repopilot',
  path: '/Users/apple12390/repopilot',
  originType: 'local',
  isDemo: false,
  projectType: 'python',
  lastOpened: 'Just now',
  branch: 'main',
  defaultBranch: 'main',
  description: 'Current local workspace repository',
};

export const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('dashboard');
  const [recentRepos, setRecentRepos] = useState<RepositoryItem[]>([
    DEFAULT_WORKSPACE_REPO,
    ...DEMO_REPOSITORIES,
  ]);
  const [activeRepo, setActiveRepo] = useState<RepositoryItem | null>(DEFAULT_WORKSPACE_REPO);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalCommand, setTerminalCommand] = useState('repopilot doctor .');
  const [selectedCodeFile, setSelectedCodeFile] = useState<{
    fileName: string;
    filePath: string;
    codeSnippet?: string;
  } | null>(null);

  // Live real analysis state
  const [liveReports, setLiveReports] = useState<
    Record<
      string,
      {
        doctor: DoctorReport;
        explorer: ExplorerReport;
        prCompass: PRCompassReport;
      }
    >
  >({});
  const [isInspecting, setIsInspecting] = useState(false);

  // Live inspection runner connecting to Python backend server
  const inspectRepository = async (target: string, repoItem?: RepositoryItem) => {
    setIsInspecting(true);
    try {
      const res = await fetch('/api/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server error: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        const repoKey = repoItem?.id || target;
        setLiveReports((prev) => ({
          ...prev,
          [repoKey]: {
            doctor: data.doctor,
            explorer: data.explorer,
            prCompass: data.prCompass,
          },
          [target]: {
            doctor: data.doctor,
            explorer: data.explorer,
            prCompass: data.prCompass,
          },
        }));

        if (repoItem) {
          const updated: RepositoryItem = {
            ...repoItem,
            isDemo: false,
            projectType: (data.doctor.category as any) || repoItem.projectType,
          };
          setActiveRepo(updated);
        }
      }
    } catch (err: any) {
      console.warn('Live inspection failed or backend is starting:', err);
    } finally {
      setIsInspecting(false);
    }
  };

  // Inspect initial repo on startup
  useEffect(() => {
    if (activeRepo) {
      inspectRepository(activeRepo.path || '.', activeRepo);
    }
  }, []);

  // Listen for terminal launch requests from any view or button
  useEffect(() => {
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
    // Trigger real live analysis
    inspectRepository(repo.path || repo.name, repo);
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
    inspectRepository(path, customRepo);
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
    if (DEMO_REPOSITORIES[0]) {
      inspectRepository(DEMO_REPOSITORIES[0].path || '.', DEMO_REPOSITORIES[0]);
    }
  };

  const handleOpenRepoModal = () => {
    const allButtons = Array.from(document.querySelectorAll('button'));
    const switchBtn = allButtons.find((b) => b.textContent?.includes('Repo'));
    switchBtn?.click();
  };

  const handleAskAIAboutFile = (_filePath: string) => {
    setSelectedCodeFile(null);
    setActiveScreen('ai-copilot');
  };

  // Get active reports (prefers live real report, falls back to demo)
  const currentLive = activeRepo
    ? liveReports[activeRepo.id] || liveReports[activeRepo.path] || liveReports[activeRepo.name]
    : null;

  const currentDoctorReport =
    currentLive?.doctor || (activeRepo?.isDemo ? DEMO_DOCTOR_REPORT : null);
  const currentExplorerReport =
    currentLive?.explorer || (activeRepo?.isDemo ? DEMO_EXPLORER_REPORT : null);
  const currentPRCompassReport =
    currentLive?.prCompass || (activeRepo?.isDemo ? DEMO_PR_COMPASS_REPORT : null);

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
            report={currentDoctorReport}
            onOpenRepoSelector={handleOpenRepoModal}
            onLoadDemoRepo={handleRestoreDemoRepos}
            isLoading={isInspecting}
            onReanalyze={() => inspectRepository(activeRepo?.path || '.', activeRepo || undefined)}
          />
        );
      case 'explorer':
        return (
          <ExplorerView
            activeRepo={activeRepo}
            report={currentExplorerReport}
            onOpenRepoSelector={handleOpenRepoModal}
            onLoadDemoRepo={handleRestoreDemoRepos}
            isLoading={isInspecting}
            onReanalyze={() => inspectRepository(activeRepo?.path || '.', activeRepo || undefined)}
          />
        );
      case 'pr-compass':
        return (
          <PRCompassView
            activeRepo={activeRepo}
            report={currentPRCompassReport}
            onOpenRepoSelector={handleOpenRepoModal}
            onLoadDemoRepo={handleRestoreDemoRepos}
            isLoading={isInspecting}
            onReanalyze={() => inspectRepository(activeRepo?.path || '.', activeRepo || undefined)}
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
