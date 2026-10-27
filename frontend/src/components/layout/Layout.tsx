import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { ActiveScreen, RepositoryItem } from '../../types';
import { RepoSelectorModal } from '../repo/RepoSelectorModal';

interface LayoutProps {
  children: React.ReactNode;
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  activeRepo: RepositoryItem | null;
  onSelectRepo: (repo: RepositoryItem) => void;
  onConnectCustomPath: (path: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeScreen,
  onNavigate,
  activeRepo,
  onSelectRepo,
  onConnectCustomPath,
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isRepoModalOpen, setIsRepoModalOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-charcoal-950 text-charcoal-200">
      {/* Sidebar */}
      <Sidebar
        activeScreen={activeScreen}
        onNavigate={onNavigate}
        activeRepo={activeRepo}
        onOpenRepoSelector={() => setIsRepoModalOpen(true)}
        isOpenOnMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main app column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopHeader
          activeScreen={activeScreen}
          activeRepo={activeRepo}
          onOpenRepoSelector={() => setIsRepoModalOpen(true)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-charcoal-950">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
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
