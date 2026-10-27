import React from 'react';
import { Menu, FolderGit2, Sparkles, ArrowUpRight } from 'lucide-react';
import { ActiveScreen, RepositoryItem } from '../../types';
import { Badge } from '../common/Badge';

interface TopHeaderProps {
  activeScreen: ActiveScreen;
  activeRepo: RepositoryItem | null;
  onOpenRepoSelector: () => void;
  onOpenMobileSidebar: () => void;
}

const screenTitles: Record<ActiveScreen, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Dashboard Overview',
    subtitle: 'Unified workspace for repository diagnostics, exploration, and PR checks',
  },
  doctor: {
    title: 'Repository Doctor',
    subtitle: 'Audit environment prerequisites, configuration files, and setup steps',
  },
  explorer: {
    title: 'Repository Explorer',
    subtitle: 'Browse repository architecture, file tree, and recommended starting points',
  },
  'pr-compass': {
    title: 'PR Compass',
    subtitle: 'Audit local Git branch changes, test discovery, and coverage gaps before opening a PR',
  },
};

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeScreen,
  activeRepo,
  onOpenRepoSelector,
  onOpenMobileSidebar,
}) => {
  const current = screenTitles[activeScreen];

  return (
    <header className="h-14 bg-charcoal-900 border-b border-charcoal-800/80 px-4 lg:px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-100 hover:bg-charcoal-800 lg:hidden focus:outline-none"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-charcoal-100">{current.title}</h1>
            {activeRepo && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-charcoal-400">
                <span className="text-charcoal-600">/</span>
                <span className="text-charcoal-300 font-medium">{activeRepo.name}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-charcoal-400 hidden md:block mt-0.5">{current.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {activeRepo?.isDemo && (
          <Badge variant="cyan" dot size="sm" className="hidden sm:inline-flex">
            <Sparkles className="w-3 h-3 text-brand-cyan" />
            Demo Mode Active
          </Badge>
        )}

        <button
          onClick={onOpenRepoSelector}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 border border-charcoal-700 text-xs font-medium text-charcoal-200 transition-colors"
        >
          <FolderGit2 className="w-3.5 h-3.5 text-charcoal-400" />
          <span>{activeRepo ? 'Switch Repo' : 'Select Repo'}</span>
        </button>

        <a
          href="https://github.com/ManshaAgarwal716/Repopilot"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-charcoal-400 hover:text-charcoal-200 hover:bg-charcoal-850 transition-colors"
        >
          <span>Docs</span>
          <ArrowUpRight className="w-3 h-3" />
        </a>
      </div>
    </header>
  );
};
