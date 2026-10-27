import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { ActiveScreen, RepositoryItem } from '../../types';
import { RepoSelectorModal } from '../repo/RepoSelectorModal';
import { TerminalDrawer } from '../terminal/TerminalDrawer';

interface LayoutProps {
  children: React.ReactNode;
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  activeRepo: RepositoryItem | null;
  onSelectRepo: (repo: RepositoryItem) => void;
  onConnectCustomPath: (path: string) => void;
  isTerminalOpen?: boolean;
  onToggleTerminal?: () => void;
  terminalCommand?: string;
  onCloseTerminal?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeScreen,
  onNavigate,
  activeRepo,
  onSelectRepo,
  onConnectCustomPath,
  isTerminalOpen: externalIsTerminalOpen,
  onToggleTerminal: externalOnToggleTerminal,
  terminalCommand = 'repopilot doctor .',
  onCloseTerminal: externalOnCloseTerminal,
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isRepoModalOpen, setIsRepoModalOpen] = useState(false);
  const [localIsTerminalOpen, setLocalIsTerminalOpen] = useState(false);

  const isTerminalOpen = externalIsTerminalOpen ?? localIsTerminalOpen;
  const toggleTerminal = externalOnToggleTerminal ?? (() => setLocalIsTerminalOpen((prev) => !prev));
  const closeTerminal = externalOnCloseTerminal ?? (() => setLocalIsTerminalOpen(false));

  // Global hotkey: Ctrl + ` or Cmd + ` toggles terminal drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        toggleTerminal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTerminal]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800">
      {/* Sidebar */}
      <Sidebar
        activeScreen={activeScreen}
        onNavigate={onNavigate}
        activeRepo={activeRepo}
        onOpenRepoSelector={() => setIsRepoModalOpen(true)}
        isOpenOnMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onToggleTerminal={toggleTerminal}
        isTerminalOpen={isTerminalOpen}
      />

      {/* Main app column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <TopHeader
          activeScreen={activeScreen}
          activeRepo={activeRepo}
          onOpenRepoSelector={() => setIsRepoModalOpen(true)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onToggleTerminal={toggleTerminal}
          isTerminalOpen={isTerminalOpen}
          onNavigate={onNavigate}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-50">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>

        {/* Integrated Terminal Drawer */}
        <TerminalDrawer
          isOpen={isTerminalOpen}
          onClose={closeTerminal}
          activeCommand={terminalCommand}
        />
      </div>

      {/* Repo Selector Modal */}
      <RepoSelectorModal
        isOpen={isRepoModalOpen}
        onClose={() => setIsRepoModalOpen(false)}
        activeRepo={activeRepo}
        onSelectRepo={onSelectRepo}
        onConnectCustomPath={onConnectCustomPath}
      />
    </div>
  );
};
export default Layout;
