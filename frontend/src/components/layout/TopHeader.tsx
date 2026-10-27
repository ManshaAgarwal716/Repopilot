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
    <header className="h-14 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between shrink-0 select-none">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-none"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-slate-900">{current.title}</h1>
            {activeRepo && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                <span className="text-slate-300">/</span>
                <span className="text-slate-800 font-medium">{activeRepo.name}</span>
                {activeRepo.originType === 'github' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-sans font-medium">
                    <Globe className="w-2.5 h-2.5" />
                    GitHub
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 font-sans font-medium">
                    Local
                  </span>
                )}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 hidden md:block mt-0.5">{current.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* AI Mode Quick Toggle */}
        {onNavigate && (
          <button
            onClick={() => onNavigate(activeScreen === 'ai-copilot' ? 'dashboard' : 'ai-copilot')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              activeScreen === 'ai-copilot'
                ? 'bg-purple-50 text-purple-700 border-purple-300 shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-purple-700 border-slate-200 shadow-xs'
            }`}
            title="Toggle AI Copilot Mode"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden sm:inline">AI Copilot</span>
            {activeScreen === 'ai-copilot' && (
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
            )}
          </button>
        )}

        {/* Terminal Toggle Button */}
        {onToggleTerminal && (
          <button
            onClick={onToggleTerminal}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-all ${
              isTerminalOpen
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-medium'
                : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-emerald-700 border-slate-200 shadow-xs'
            }`}
            title="Toggle Integrated Terminal Drawer (Ctrl+`)"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Terminal</span>
            <span className="hidden md:inline text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
              ^`
            </span>
          </button>
        )}

        {/* Switch / Select Repo Button */}
        <button
          onClick={onOpenRepoSelector}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 hover:text-slate-900 shadow-xs transition-colors"
        >
          <FolderGit2 className="w-3.5 h-3.5 text-slate-500" />
          <span>{activeRepo ? 'Switch Repo' : 'Select Repo'}</span>
        </button>

        {activeRepo?.remoteUrl && (
          <a
            href={activeRepo.remoteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
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
