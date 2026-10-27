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
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
          <button
            onClick={() => {
              setActiveTab('github');
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
              activeTab === 'github'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>GitHub Remote</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono">
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
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5 text-slate-700" />
            <span>Local Directory</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('samples');
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
              activeTab === 'samples'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sample Repos</span>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: GITHUB REMOTE */}
        {activeTab === 'github' && (
          <div className="space-y-4">
            {/* Input URL form */}
            <form onSubmit={handleGitHubSubmit} className="space-y-2">
              <label htmlFor="github-repo-input" className="block text-xs font-medium text-slate-700">
                Connect Any Public GitHub Repository
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs font-mono">
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
                    className="w-full bg-white border border-slate-300 rounded-lg pl-[94px] pr-3 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-xs"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
                >
                  {isSubmitting ? 'Connecting...' : 'Inspect Repo'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Supports full URLs like <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded border border-slate-200">https://github.com/pallets/flask</code> or shorthand <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded border border-slate-200">owner/repo</code>.
              </p>
            </form>

            {/* Popular Curated GitHub Repositories */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-blue-600" />
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
                      className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all group shadow-2xs ${
                        isSelected
                          ? 'bg-blue-50/80 border-blue-300 text-slate-900'
                          : 'bg-white border-slate-200 hover:bg-slate-50/80 hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-blue-100 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          <Globe className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                              {repo.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-mono border border-slate-200">
                              {repo.projectType}
                            </span>
                            {repo.stars && (
                              <span className="text-[10px] text-amber-600 font-mono flex items-center gap-0.5 font-medium">
                                <Star className="w-2.5 h-2.5 fill-current" />
                                {(repo.stars / 1000).toFixed(1)}k
                              </span>
                            )}
                            {repo.forks && (
                              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-0.5 hidden sm:inline-flex">
                                <GitFork className="w-2.5 h-2.5" />
                                {(repo.forks / 1000).toFixed(1)}k
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {repo.description || repo.path}
                          </p>
                        </div>
                      </div>

                      {isSelected ? (
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 ml-2">
                          <Check className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 group-hover:text-slate-700 shrink-0 ml-2 font-medium">
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
                <label htmlFor="custom-repo-path" className="block text-xs font-medium text-slate-700 mb-1.5">
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
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-xs"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
                  >
                    {isSubmitting ? 'Connecting...' : 'Connect'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick Suggestions for Local */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
                <span className="text-[11px] font-mono text-slate-600 block font-semibold">
                  Quick Local Shortcuts:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomPath('/Users/apple12390/repopilot')}
                    className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-mono text-[11px] shadow-2xs"
                  >
                    /Users/apple12390/repopilot (Current Workspace)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomPath('.')}
                    className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-mono text-[11px] shadow-2xs"
                  >
                    . (Current Directory)
                  </button>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <p className="flex items-center gap-1.5 font-medium text-slate-800">
                  <Terminal className="w-3 h-3 text-blue-600" />
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
            <p className="text-xs text-slate-500">
              Pre-configured repositories with full Doctor diagnostics, directory explorer trees, and pre-PR branch comparisons.
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
                    className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all shadow-2xs ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-300 text-slate-900'
                        : 'bg-white border-slate-200 hover:bg-slate-50/80 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        <FolderGit2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-900 truncate">{repo.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-mono border border-slate-200">
                            {repo.projectType}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate font-mono mt-0.5">{repo.path}</p>
                      </div>
                    </div>
                    {isSelected ? (
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">Select</span>
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
