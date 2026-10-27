import React, { useState } from 'react';
import {
  FolderGit2,
  Check,
  ArrowRight,
  AlertCircle,
  Globe,
  Star,
  GitFork,
  Terminal,
  FolderOpen,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { RepositoryItem } from '../../types';
import { POPULAR_REPOSITORIES, LOCAL_DEMO_REPOSITORIES } from '../../data/demoData';

interface RepoSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRepo: RepositoryItem | null;
  onSelectRepo: (repo: RepositoryItem) => void;
  onConnectCustomPath: (path: string) => void;
}

type TabType = 'github' | 'local' | 'samples';

export const RepoSelectorModal: React.FC<RepoSelectorModalProps> = ({
  isOpen,
  onClose,
  activeRepo,
  onSelectRepo,
  onConnectCustomPath,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('github');
  const [githubInput, setGithubInput] = useState('');
  const [customPath, setCustomPath] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse GitHub repository input (supports full URL or owner/repo format)
  const parseGitHubInput = (input: string): { owner: string; repo: string; fullUrl: string } | null => {
    const trimmed = input.trim();
    if (!trimmed) return null;

    // Matches https://github.com/owner/repo or git@github.com:owner/repo
    const urlMatch = trimmed.match(/github\.com[/:]([\w.-]+)\/([\w.-]+?)(\.git)?$/i);
    if (urlMatch) {
      return {
        owner: urlMatch[1],
        repo: urlMatch[2],
        fullUrl: `https://github.com/${urlMatch[1]}/${urlMatch[2]}`,
      };
    }

    // Matches owner/repo shorthand
    const shorthandMatch = trimmed.match(/^([\w.-]+)\/([\w.-]+)$/);
    if (shorthandMatch) {
      return {
        owner: shorthandMatch[1],
        repo: shorthandMatch[2],
        fullUrl: `https://github.com/${shorthandMatch[1]}/${shorthandMatch[2]}`,
      };
    }

    return null;
  };

  const handleGitHubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubInput.trim()) {
      setError('Please enter a GitHub repository URL or owner/repo shorthand.');
      return;
    }

    const parsed = parseGitHubInput(githubInput);
    if (!parsed) {
      setError('Invalid format. Enter "owner/repo" (e.g. facebook/react) or full GitHub URL.');
      return;
    }

    // Check if it matches an existing popular repository
    const matchedPopular = POPULAR_REPOSITORIES.find(
      (r) =>
        r.name.toLowerCase() === `${parsed.owner}/${parsed.repo}`.toLowerCase() ||
        r.remoteUrl?.toLowerCase() === parsed.fullUrl.toLowerCase()
    );

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (matchedPopular) {
        onSelectRepo(matchedPopular);
      } else {
        const customRemoteRepo: RepositoryItem = {
          id: `remote-${Date.now()}`,
          name: `${parsed.owner}/${parsed.repo}`,
          path: parsed.fullUrl,
          originType: 'github',
          remoteUrl: parsed.fullUrl,
          isDemo: false,
          projectType: 'generic',
          lastOpened: 'Just now',
          branch: 'main',
          defaultBranch: 'main',
          description: `Remote GitHub repository ${parsed.owner}/${parsed.repo}`,
        };
        onSelectRepo(customRemoteRepo);
      }
      setGithubInput('');
      setError(null);
      onClose();
    }, 350);
  };

  const handleCustomLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPath.trim()) {
      setError('Please provide a valid directory path.');
      return;
    }
    if (!customPath.startsWith('/') && !customPath.startsWith('.') && !customPath.includes('\\')) {
      setError('Path must be an absolute or relative directory path.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      onConnectCustomPath(customPath.trim());
      setCustomPath('');
      onClose();
    }, 300);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select or Connect Repository"
      description="Analyze public GitHub remote repositories, local workspace projects, or interactive samples."
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-charcoal-950 rounded-lg border border-charcoal-800">
          <button
            onClick={() => {
              setActiveTab('github');
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
              activeTab === 'github'
                ? 'bg-charcoal-800 text-charcoal-100 shadow-sm font-semibold'
                : 'text-charcoal-400 hover:text-charcoal-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-purple-400" />
            <span>GitHub Remote</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-300 font-mono">
              Remote
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('local');
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
              activeTab === 'local'
                ? 'bg-charcoal-800 text-charcoal-100 shadow-sm font-semibold'
                : 'text-charcoal-400 hover:text-charcoal-200'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Local Directory</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('samples');
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
              activeTab === 'samples'
                ? 'bg-charcoal-800 text-charcoal-100 shadow-sm font-semibold'
                : 'text-charcoal-400 hover:text-charcoal-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sample Repos</span>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: GITHUB REMOTE */}
        {activeTab === 'github' && (
          <div className="space-y-4">
            {/* Input URL form */}
            <form onSubmit={handleGitHubSubmit} className="space-y-2">
              <label htmlFor="github-repo-input" className="block text-xs font-medium text-charcoal-300">
                Connect Any Public GitHub Repository
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal-500 text-xs font-mono">
                    github.com/
                  </div>
                  <input
                    id="github-repo-input"
                    type="text"
                    value={githubInput}
                    onChange={(e) => {
                      setGithubInput(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="owner/repo (e.g. tiangolo/fastapi or facebook/react)"
                    className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg pl-[94px] pr-3 py-2 text-xs font-mono text-charcoal-200 placeholder:text-charcoal-600 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                >
                  {isSubmitting ? 'Connecting...' : 'Inspect Repo'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-charcoal-400">
                Supports full URLs like <code className="text-charcoal-300 bg-charcoal-950 px-1 py-0.5 rounded">https://github.com/pallets/flask</code> or shorthand <code className="text-charcoal-300 bg-charcoal-950 px-1 py-0.5 rounded">owner/repo</code>.
              </p>
            </form>

            {/* Popular Curated GitHub Repositories */}
            <div className="space-y-2 pt-2 border-t border-charcoal-800">
              <span className="text-[11px] font-semibold text-charcoal-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-purple-400" />
                Featured Open-Source Repositories (1-Click Test)
              </span>

              <div className="grid gap-2">
                {POPULAR_REPOSITORIES.map((repo) => {
                  const isSelected = activeRepo?.id === repo.id;
                  return (
                    <button
                      key={repo.id}
                      onClick={() => {
                        onSelectRepo(repo);
                        onClose();
                      }}
                      className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all group ${
                        isSelected
                          ? 'bg-purple-950/30 border-purple-500/50 text-charcoal-100'
                          : 'bg-charcoal-850/60 border-charcoal-750 hover:bg-charcoal-800 hover:border-charcoal-700 text-charcoal-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-purple-900/40 text-purple-300 border border-purple-700/50'
                              : 'bg-charcoal-800 text-charcoal-400'
                          }`}
                        >
                          <Globe className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-charcoal-100 group-hover:text-purple-300 transition-colors">
                              {repo.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 bg-charcoal-800 text-charcoal-300 rounded font-mono border border-charcoal-700">
                              {repo.projectType}
                            </span>
                            {repo.stars && (
                              <span className="text-[10px] text-amber-400 font-mono flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-current" />
                                {(repo.stars / 1000).toFixed(1)}k
                              </span>
                            )}
                            {repo.forks && (
                              <span className="text-[10px] text-charcoal-400 font-mono flex items-center gap-0.5 hidden sm:inline-flex">
                                <GitFork className="w-2.5 h-2.5" />
                                {(repo.forks / 1000).toFixed(1)}k
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-charcoal-400 truncate mt-0.5">
                            {repo.description || repo.path}
                          </p>
                        </div>
                      </div>

                      {isSelected ? (
                        <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 ml-2">
                          <Check className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="text-xs text-charcoal-500 group-hover:text-charcoal-300 shrink-0 ml-2">
                          Select
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LOCAL DIRECTORY PATH */}
        {activeTab === 'local' && (
          <div className="space-y-4">
            <form onSubmit={handleCustomLocalSubmit} className="space-y-3">
              <div>
                <label htmlFor="custom-repo-path" className="block text-xs font-medium text-charcoal-300 mb-1.5">
                  Local Repository Directory Path
                </label>
                <div className="flex gap-2">
                  <input
                    id="custom-repo-path"
                    type="text"
                    value={customPath}
                    onChange={(e) => {
                      setCustomPath(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="/Users/username/projects/my-app"
                    className="flex-1 bg-charcoal-950 border border-charcoal-700 rounded-lg px-3 py-2 text-xs font-mono text-charcoal-200 placeholder:text-charcoal-500 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-brand-cyan hover:bg-brand-cyan/90 disabled:opacity-50 text-charcoal-950 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    {isSubmitting ? 'Connecting...' : 'Connect'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick Suggestions for Local */}
              <div className="p-3 rounded-lg bg-charcoal-950 border border-charcoal-800 text-xs space-y-2">
                <span className="text-[11px] font-mono text-charcoal-400 block font-semibold">
                  Quick Local Shortcuts:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomPath('/Users/apple12390/repopilot')}
                    className="px-2 py-1 rounded bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-700 text-charcoal-200 font-mono text-[11px]"
                  >
                    /Users/apple12390/repopilot (Current Workspace)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomPath('.')}
                    className="px-2 py-1 rounded bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-700 text-charcoal-200 font-mono text-[11px]"
                  >
                    . (Current Directory)
                  </button>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-charcoal-850/50 border border-charcoal-800 text-[11px] text-charcoal-400 space-y-1">
                <p className="flex items-center gap-1.5 text-charcoal-300">
                  <Terminal className="w-3 h-3 text-brand-cyan" />
                  Local CLI Security:
                </p>
                <p>
                  RepoPilot performs strictly read-only diagnostics. No files are altered and no git commits/branches are modified.
                </p>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: SAMPLE INTERACTIVE REPOS */}
        {activeTab === 'samples' && (
          <div className="space-y-3">
            <p className="text-xs text-charcoal-400">
              Pre-configured mock repositories with full Doctor diagnostics, directory explorer trees, and pre-PR branch comparisons.
            </p>

            <div className="grid gap-2">
              {LOCAL_DEMO_REPOSITORIES.map((repo) => {
                const isSelected = activeRepo?.id === repo.id;
                return (
                  <button
                    key={repo.id}
                    onClick={() => {
                      onSelectRepo(repo);
                      onClose();
                    }}
                    className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-brand-cyan/10 border-brand-cyan/40 text-charcoal-100'
                        : 'bg-charcoal-850/70 border-charcoal-750 hover:bg-charcoal-800 hover:border-charcoal-700 text-charcoal-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-brand-cyan/20 text-brand-cyan'
                            : 'bg-charcoal-800 text-charcoal-400'
                        }`}
                      >
                        <FolderGit2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-charcoal-100 truncate">{repo.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-charcoal-750 text-charcoal-300 rounded font-mono">
                            {repo.projectType}
                          </span>
                        </div>
                        <p className="text-[11px] text-charcoal-400 truncate font-mono mt-0.5">{repo.path}</p>
                      </div>
                    </div>
                    {isSelected ? (
                      <span className="w-5 h-5 rounded-full bg-brand-cyan/20 text-brand-cyan flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="text-xs text-charcoal-500">Select</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
export default RepoSelectorModal;
