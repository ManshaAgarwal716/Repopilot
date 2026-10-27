import React from 'react';
import {
  Compass,
  Stethoscope,
  FolderTree,
  GitPullRequest,
  Home,
  FolderGit2,
  ChevronRight,
  Terminal,
  ExternalLink,
} from 'lucide-react';
import { ActiveScreen, RepositoryItem } from '../../types';

interface SidebarProps {
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  activeRepo: RepositoryItem | null;
  onOpenRepoSelector: () => void;
  isOpenOnMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeScreen,
  onNavigate,
  activeRepo,
  onOpenRepoSelector,
  isOpenOnMobile,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'dashboard' as ActiveScreen,
      label: 'Dashboard',
      icon: Home,
      description: 'Overview & quick launch',
    },
    {
      id: 'doctor' as ActiveScreen,
      label: 'Repository Doctor',
      icon: Stethoscope,
      description: 'Environment diagnostics',
    },
    {
      id: 'explorer' as ActiveScreen,
      label: 'Repository Explorer',
      icon: FolderTree,
      description: 'Structure & entry points',
    },
    {
      id: 'pr-compass' as ActiveScreen,
      label: 'PR Compass',
      icon: GitPullRequest,
      description: 'Pre-PR change audit',
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenOnMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-charcoal-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-charcoal-900 border-r border-charcoal-800/80 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpenOnMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand / Logo */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-charcoal-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-cyan/15 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan shadow-sm">
              <Compass className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-charcoal-100 tracking-tight">RepoPilot</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-charcoal-800 text-charcoal-400 font-mono rounded border border-charcoal-700">
                  v0.1.0
                </span>
              </div>
              <p className="text-[10px] text-charcoal-500 font-mono">Developer Dashboard</p>
            </div>
          </div>
        </div>

        {/* Active Repository pill / selector button */}
        <div className="p-3 border-b border-charcoal-800/60">
          <button
            onClick={onOpenRepoSelector}
            className="w-full text-left p-2.5 rounded-lg bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-750/70 hover:border-charcoal-700 transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-md bg-charcoal-800 group-hover:bg-charcoal-750 border border-charcoal-700 flex items-center justify-center text-charcoal-300 shrink-0">
                <FolderGit2 className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-medium text-charcoal-200 block truncate leading-tight">
                  {activeRepo ? activeRepo.name : 'No repo selected'}
                </span>
                <span className="text-[10px] text-charcoal-400 font-mono truncate block mt-0.5">
                  {activeRepo ? (activeRepo.isDemo ? 'Demo Mode' : activeRepo.path) : 'Click to select'}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-charcoal-500 group-hover:text-charcoal-300 shrink-0 ml-1 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-2 pb-1.5 text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider font-mono">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/25'
                    : 'text-charcoal-400 hover:text-charcoal-200 hover:bg-charcoal-850/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-brand-cyan' : 'text-charcoal-400 group-hover:text-charcoal-200'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer / CLI Status info */}
        <div className="p-3 border-t border-charcoal-800 bg-charcoal-950/40">
          <div className="p-2.5 rounded-lg bg-charcoal-850/60 border border-charcoal-800 text-[11px] space-y-1.5">
            <div className="flex items-center justify-between text-charcoal-300 font-mono">
              <span className="flex items-center gap-1.5 text-xs text-charcoal-200">
                <Terminal className="w-3.5 h-3.5 text-brand-cyan" />
                Python CLI
              </span>
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 rounded">
                Active
              </span>
            </div>
            <p className="text-[10px] text-charcoal-400 leading-normal">
              CLI Milestone 4 is fully tested. Run <code className="text-charcoal-200 bg-charcoal-800 px-1 py-0.5 rounded">repopilot --help</code> in terminal.
            </p>
            <a
              href="https://github.com/ManshaAgarwal716/Repopilot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-brand-cyan hover:underline flex items-center gap-1 pt-0.5"
            >
              GitHub Repository
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </aside>
    </>
  );
};
