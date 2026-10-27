import { Menu, FolderGit2, Sparkles, Terminal, Globe, ExternalLink } from 'lucide-react';
import { ActiveScreen, RepositoryItem } from '../../types';

interface TopHeaderProps {
  activeScreen: ActiveScreen;
  activeRepo: RepositoryItem | null;
  onOpenRepoSelector: () => void;
  onOpenMobileSidebar: () => void;
  onToggleTerminal?: () => void;
  isTerminalOpen?: boolean;
  onNavigate?: (screen: ActiveScreen) => void;
}

const screenTitles: Record<ActiveScreen, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Dashboard Overview',
    subtitle: 'Unified workspace for repository diagnostics, exploration, PR checks, and AI copilot',
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
  'ai-copilot': {
    title: 'AI Repository Copilot',
    subtitle: 'Interactive architecture chat, AI unit test scaffold generator, and PR risk assessment',
  },
};

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeScreen,
  activeRepo,
  onOpenRepoSelector,
  onOpenMobileSidebar,
  onToggleTerminal,
  isTerminalOpen,
  onNavigate,
}) => {
  const current = screenTitles[activeScreen] || screenTitles.dashboard;

  return (
    <header className="h-14 bg-charcoal-900 border-b border-charcoal-800/80 px-4 lg:px-6 flex items-center justify-between shrink-0 select-none">
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
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono text-charcoal-400">
                <span className="text-charcoal-600">/</span>
                <span className="text-charcoal-200 font-medium">{activeRepo.name}</span>
                {activeRepo.originType === 'github' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-purple-950/70 text-purple-300 border border-purple-800/50">
                    <Globe className="w-2.5 h-2.5" />
                    GitHub Remote
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-charcoal-800 text-charcoal-400 border border-charcoal-700">
                    Local
                  </span>
                )}
              </span>
            )}
          </div>
          <p className="text-xs text-charcoal-400 hidden md:block mt-0.5">{current.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* AI Mode Quick Toggle */}
        {onNavigate && (
          <button
            onClick={() => onNavigate(activeScreen === 'ai-copilot' ? 'dashboard' : 'ai-copilot')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              activeScreen === 'ai-copilot'
                ? 'bg-brand-cyan/20 text-brand-cyan border-brand-cyan/50 shadow-sm'
                : 'bg-charcoal-850 hover:bg-charcoal-800 text-charcoal-300 hover:text-brand-cyan border-charcoal-750'
            }`}
            title="Toggle AI Copilot Mode"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
            <span className="hidden sm:inline">AI Mode</span>
            {activeScreen === 'ai-copilot' && (
              <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
            )}
          </button>
        )}

        {/* Terminal Toggle Button */}
        {onToggleTerminal && (
          <button
            onClick={onToggleTerminal}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-all ${
              isTerminalOpen
                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-700/60'
                : 'bg-charcoal-850 hover:bg-charcoal-800 text-charcoal-300 hover:text-emerald-400 border-charcoal-750'
            }`}
            title="Toggle Integrated Terminal Drawer (Ctrl+`)"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Terminal</span>
            <span className="hidden md:inline text-[10px] px-1 py-0.2 rounded bg-charcoal-800 text-charcoal-400 border border-charcoal-700">
              ^`
            </span>
          </button>
        )}

        {/* Switch / Select Repo Button */}
        <button
          onClick={onOpenRepoSelector}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 border border-charcoal-700 text-xs font-medium text-charcoal-200 transition-colors"
        >
          <FolderGit2 className="w-3.5 h-3.5 text-charcoal-400" />
          <span>{activeRepo ? 'Switch Repo' : 'Select Repo'}</span>
        </button>

        {activeRepo?.remoteUrl && (
          <a
            href={activeRepo.remoteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-charcoal-400 hover:text-charcoal-200 hover:bg-charcoal-850 transition-colors"
            title="View on GitHub"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </header>
  );
};
export default TopHeader;
