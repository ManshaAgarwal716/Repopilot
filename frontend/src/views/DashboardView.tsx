import React from 'react';
import {
  Compass,
  Stethoscope,
  FolderTree,
  GitPullRequest,
  ArrowRight,
  FolderGit2,
  Terminal,
  Clock,
  Sparkles,
  ShieldCheck,
  Globe,
  Star,
} from 'lucide-react';
import { ActiveScreen, RepositoryItem } from '../types';
import { Card, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';

interface DashboardViewProps {
  onNavigate: (screen: ActiveScreen) => void;
  activeRepo: RepositoryItem | null;
  onOpenRepoSelector: () => void;
  recentRepos: RepositoryItem[];
  onSelectRepo: (repo: RepositoryItem) => void;
  onClearRecentRepos: () => void;
  onRestoreDemoRepos: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  activeRepo,
  onOpenRepoSelector,
  recentRepos,
  onSelectRepo,
  onClearRecentRepos,
  onRestoreDemoRepos,
}) => {
  const isDemo = activeRepo?.isDemo ?? false;

  const handleOpenTerminalCommand = (command: string) => {
    window.dispatchEvent(new CustomEvent('repopilot:terminal', { detail: { command } }));
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome Panel */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 lg:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">
              <Compass className="w-3.5 h-3.5" />
              <span>Developer-First Repository Onboarding, Audit & AI Copilot</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
              Understand unfamiliar codebases with confidence.
            </h2>
            <p className="text-xs lg:text-sm text-slate-600 leading-relaxed">
              RepoPilot inspects GitHub remote and local repositories in strictly read-only mode. Audit development tools, explore architecture, generate AI unit test scaffolds for coverage gaps, and verify PR safety before merging.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <button
              onClick={onOpenRepoSelector}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              <FolderGit2 className="w-4 h-4" />
              <span>{activeRepo ? 'Switch / Connect Repo' : 'Select Target Repository'}</span>
            </button>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Read-Only Safety Guarantee</span>
            </div>
          </div>
        </div>

        {/* Current Active Repo Bar */}
        {activeRepo && (
          <div className="mt-6 pt-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-slate-400 font-mono text-[11px]">ACTIVE REPO:</span>
              <span className="font-semibold text-slate-900 font-mono flex items-center gap-1.5">
                {activeRepo.originType === 'github' ? (
                  <Globe className="w-3.5 h-3.5 text-indigo-600" />
                ) : (
                  <FolderGit2 className="w-3.5 h-3.5 text-blue-600" />
                )}
                {activeRepo.name}
              </span>
              <span className="text-slate-500 font-mono hidden sm:inline">({activeRepo.path})</span>
              {activeRepo.originType === 'github' ? (
                <Badge variant="indigo" size="sm">
                  GitHub Remote
                </Badge>
              ) : isDemo ? (
                <Badge variant="cyan" dot size="sm">
                  Sample Project
                </Badge>
              ) : (
                <Badge variant="zinc" size="sm">
                  Local Path
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
              {activeRepo.branch && <span>Branch: {activeRepo.branch}</span>}
              <span>Type: {activeRepo.projectType}</span>
            </div>
          </div>
        )}
      </div>

      {/* Feature Cards Grid (4 Columns) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
            Core Tool Suite
          </h3>
          <span className="text-[11px] text-slate-400">Select any tool to begin</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: AI Copilot */}
          <Card
            hoverable
            onClick={() => onNavigate('ai-copilot')}
            className="group flex flex-col justify-between border-slate-200 hover:border-purple-300 hover:shadow-md bg-white transition-all"
          >
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <Badge variant="indigo" size="sm">
                  AI Mode
                </Badge>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 group-hover:text-purple-700 transition-colors flex items-center justify-between">
                  <span>AI Copilot & Scaffolding</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Interactive architecture chat, AI unit test scaffold generator for detected test gaps, and pre-PR risk review.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1.5 font-mono">
                <div className="flex items-center justify-between text-[11px]">
                  <span>Test Scaffolds:</span>
                  <span className="text-purple-600 font-medium">Ready for Gaps</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>PR Risk Engine:</span>
                  <span className="text-emerald-600 font-medium">Low Risk</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Doctor */}
          <Card
            hoverable
            onClick={() => onNavigate('doctor')}
            className="group flex flex-col justify-between border-slate-200 hover:border-emerald-300 hover:shadow-md bg-white transition-all"
          >
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <Badge variant="emerald" size="sm">
                  Diagnostic
                </Badge>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center justify-between">
                  <span>Repository Doctor</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Audit runtime prerequisites, verify installed tool versions (Git, Python, Node), and generate setup next steps.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1.5 font-mono">
                <div className="flex items-center justify-between text-[11px]">
                  <span>System Tools:</span>
                  <span className="text-emerald-600 font-medium">4 of 4 Available</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Config Manifest:</span>
                  <span className="text-slate-800">PEP 518/621</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Explorer */}
          <Card
            hoverable
            onClick={() => onNavigate('explorer')}
            className="group flex flex-col justify-between border-slate-200 hover:border-blue-300 hover:shadow-md bg-white transition-all"
          >
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <FolderTree className="w-5 h-5" />
                </div>
                <Badge variant="cyan" size="sm">
                  Exploration
                </Badge>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors flex items-center justify-between">
                  <span>Repository Explorer</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Traverse directory hierarchy, decode configuration file roles, and discover high-confidence starting points.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1.5 font-mono">
                <div className="flex items-center justify-between text-[11px]">
                  <span>Key Entry Points:</span>
                  <span className="text-blue-600 font-medium">2 Identified</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Frameworks:</span>
                  <span className="text-slate-800">Typer, pytest</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: PR Compass */}
          <Card
            hoverable
            onClick={() => onNavigate('pr-compass')}
            className="group flex flex-col justify-between border-slate-200 hover:border-indigo-300 hover:shadow-md bg-white transition-all"
          >
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <GitPullRequest className="w-5 h-5" />
                </div>
                <Badge variant="indigo" size="sm">
                  Pre-PR Audit
                </Badge>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors flex items-center justify-between">
                  <span>PR Compass</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Compare branch commits against main, detect affected functional areas, and highlight test coverage gaps.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1.5 font-mono">
                <div className="flex items-center justify-between text-[11px]">
                  <span>Comparison:</span>
                  <span className="text-slate-800">vs origin/main</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Test Discovery:</span>
                  <span className="text-amber-600 font-medium">2 Potential Gaps</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent & Remote Repositories Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
              Repositories ({recentRepos.length})
            </h3>
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              GitHub remote & local workspaces
            </span>
          </div>

          <div className="flex items-center gap-2">
            {recentRepos.length > 0 ? (
              <button
                onClick={onClearRecentRepos}
                className="text-[11px] text-slate-500 hover:text-slate-800 transition-colors"
              >
                Clear History
              </button>
            ) : (
              <button
                onClick={onRestoreDemoRepos}
                className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                Restore Default Repositories
              </button>
            )}
          </div>
        </div>

        {recentRepos.length === 0 ? (
          <EmptyState
            icon={FolderGit2}
            title="No Repositories in History"
            description="You haven't opened or connected any repositories yet. Choose a remote GitHub repository or local directory path to begin."
            actionText="Select Repository"
            onAction={onOpenRepoSelector}
            secondaryActionText="Load Defaults"
            onSecondaryAction={onRestoreDemoRepos}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentRepos.map((repo) => {
              const isCurrent = activeRepo?.id === repo.id;
              const isGitHub = repo.originType === 'github';
              return (
                <div
                  key={repo.id}
                  onClick={() => onSelectRepo(repo)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between shadow-2xs ${
                    isCurrent
                      ? 'bg-blue-50/70 border-blue-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                        isCurrent
                          ? isGitHub
                            ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                            : 'bg-blue-100 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {isGitHub ? <Globe className="w-4 h-4" /> : <FolderGit2 className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900 truncate">{repo.name}</span>
                        {isGitHub ? (
                          <span className="text-[10px] px-1.5 py-0.2 bg-indigo-50 text-indigo-700 rounded font-mono border border-indigo-200">
                            Remote
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-mono border border-slate-200">
                            {repo.projectType}
                          </span>
                        )}
                        {repo.stars && (
                          <span className="text-[10px] text-amber-600 font-mono flex items-center gap-0.5 font-medium">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            {(repo.stars / 1000).toFixed(0)}k
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5">{repo.path}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-2.5 h-2.5" />
                      {repo.lastOpened}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Integrated Terminal & CLI Quick Companion Panel */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-semibold text-slate-900">Integrated Terminal Drawer & CLI Companion</h4>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono border border-slate-200">
                Ctrl + `
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Launch commands interactively in the bottom terminal panel, or test CLI outputs for doctor, explorer, and PR compass.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleOpenTerminalCommand('repopilot doctor .')}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-mono border border-slate-200 transition-colors shadow-2xs"
          >
            doctor .
          </button>
          <button
            onClick={() => handleOpenTerminalCommand('repopilot explore . --depth 2')}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-mono border border-slate-200 transition-colors shadow-2xs"
          >
            explore .
          </button>
          <button
            onClick={() => handleOpenTerminalCommand('repopilot pr-check --base main')}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-mono border border-slate-200 transition-colors shadow-2xs"
          >
            pr-check
          </button>
          <button
            onClick={() => handleOpenTerminalCommand('pytest -v')}
            className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-mono border border-emerald-300 transition-colors flex items-center gap-1.5 font-medium shadow-2xs"
          >
            <Terminal className="w-3 h-3" />
            <span>Open Terminal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default DashboardView;
