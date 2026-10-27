import React, { useState } from 'react';
import { FolderGit2, Check, ArrowRight, AlertCircle, Info, Sparkles } from 'lucide-react';
import { Modal } from '../common/Modal';
import { RepositoryItem } from '../../types';
import { DEMO_REPOSITORIES } from '../../data/demoData';

interface RepoSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRepo: RepositoryItem | null;
  onSelectRepo: (repo: RepositoryItem) => void;
  onConnectCustomPath: (path: string) => void;
}

export const RepoSelectorModal: React.FC<RepoSelectorModalProps> = ({
  isOpen,
  onClose,
  activeRepo,
  onSelectRepo,
  onConnectCustomPath,
}) => {
  const [customPath, setCustomPath] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPath.trim()) {
      setError('Please provide a valid repository path.');
      return;
    }
    if (!customPath.startsWith('/') && !customPath.startsWith('.') && !customPath.includes('\\')) {
      setError('Path must be an absolute or relative directory path.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    // Simulate path validation and honest registration
    setTimeout(() => {
      setIsSubmitting(false);
      onConnectCustomPath(customPath.trim());
      setCustomPath('');
      onClose();
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select or Connect Repository"
      description="Choose an existing demo repository or enter a local filesystem path."
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        {/* Quick select demo repos */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-charcoal-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
              Demo Repositories (Interactive)
            </span>
            <span className="text-[11px] text-charcoal-400">Preloaded analysis</span>
          </div>

          <div className="grid gap-2">
            {DEMO_REPOSITORIES.map((repo) => {
              const isSelected = activeRepo?.id === repo.id;
              return (
                <button
                  key={repo.id}
                  onClick={() => {
                    onSelectRepo(repo);
                    onClose();
                  }}
                  className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-colors ${
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
                    <span className="text-xs text-charcoal-500 flex items-center gap-1 group-hover:text-charcoal-300">
                      Select
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-charcoal-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-charcoal-900 px-2 text-charcoal-500 font-mono text-[10px]">
              Or Connect Local Workspace Path
            </span>
          </div>
        </div>

        {/* Custom path form */}
        <form onSubmit={handleCustomSubmit} className="space-y-3">
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
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-charcoal-800 hover:bg-charcoal-750 text-charcoal-200 border border-charcoal-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Validating...' : 'Connect'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {error && (
              <p className="mt-1.5 text-xs text-brand-rose flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {error}
              </p>
            )}
          </div>

          <div className="p-3 bg-charcoal-950/70 border border-charcoal-800 rounded-lg flex items-start gap-2 text-charcoal-400">
            <Info className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong className="text-charcoal-300">Backend note:</strong> In this milestone, RepoPilot is a frontend dashboard with preloaded demo datasets. Connecting a custom path registers the target path, while the live Python HTTP API integration is slated for the next release.
            </p>
          </div>
        </form>
      </div>
    </Modal>
  );
};
