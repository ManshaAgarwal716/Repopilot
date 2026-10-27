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
  Sparkles,
  Globe,
} from 'lucide-react';
import { ActiveScreen, RepositoryItem } from '../../types';

interface SidebarProps {
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  activeRepo: RepositoryItem | null;
  onOpenRepoSelector: () => void;
  isOpenOnMobile: boolean;
  onCloseMobile: () => void;
  onToggleTerminal?: () => void;
  isTerminalOpen?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeScreen,
  onNavigate,
  activeRepo,
  onOpenRepoSelector,
  isOpenOnMobile,
  onCloseMobile,
  onToggleTerminal,
  isTerminalOpen,
}) => {
  const navItems = [
    {
      id: 'dashboard' as ActiveScreen,
      label: 'Dashboard',
      icon: Home,
      description: 'Overview & quick launch',
    },
    {
      id: 'ai-copilot' as ActiveScreen,
      label: 'AI Copilot Mode',
      icon: Sparkles,
      description: 'AI test scaffold & PR review',
      badge: 'AI',
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
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpenOnMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand / Logo */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
              <Compass className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-slate-900 tracking-tight">RepoPilot</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 font-mono rounded border border-slate-200">
                  v0.1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Developer Dashboard</p>
            </div>
          </div>
        </div>

        {/* Active Repository pill / selector button */}
        <div className="p-3 border-b border-slate-200/80">
          <button
            onClick={onOpenRepoSelector}
            className="w-full text-left p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all group flex items-center justify-between shadow-2xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0 shadow-2xs">
                {activeRepo?.originType === 'github' ? (
                  <Globe className="w-3.5 h-3.5 text-indigo-600" />
                ) : (
                  <FolderGit2 className="w-3.5 h-3.5 text-slate-600" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-900 block truncate leading-tight">
                    {activeRepo ? activeRepo.name : 'No repo selected'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono truncate block mt-0.5">
                  {activeRepo
                    ? activeRepo.originType === 'github'
                      ? 'GitHub Remote'
                      : activeRepo.path
                    : 'Click to select'}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0 ml-1 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-2 pb-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
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
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                      isActive
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer / Interactive Terminal Launcher */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/60 space-y-2">
          {onToggleTerminal && (
            <button
              onClick={onToggleTerminal}
              className={`w-full p-2.5 rounded-lg border text-left text-[11px] transition-all group flex items-center justify-between ${
                isTerminalOpen
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-medium'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-mono font-medium text-xs">Terminal Drawer</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                ^`
              </span>
            </button>
          )}

          <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] space-y-1 shadow-2xs">
            <div className="flex items-center justify-between font-mono">
              <span className="text-[10px] text-slate-500">Python CLI v0.1.0</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-medium">
                Active
              </span>
            </div>
            <a
              href="https://github.com/ManshaAgarwal716/Repopilot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 pt-0.5"
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
