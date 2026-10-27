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

  return (
    <div className="space-y-6">
      {/* Hero Welcome Panel */}
      <div className="relative overflow-hidden rounded-2xl bg-charcoal-900 border border-charcoal-750/70 p-6 lg:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/25 text-brand-cyan text-xs font-medium">
              <Compass className="w-3.5 h-3.5" />
              <span>Developer-First Repository Onboarding & Pre-PR Audit</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-charcoal-100 tracking-tight">
              Understand unfamiliar codebases with confidence.
            </h2>
            <p className="text-xs lg:text-sm text-charcoal-400 leading-relaxed">
              RepoPilot inspects local repositories in strictly read-only mode. Audit development tools, explore architecture and key entry points, and verify test coverage before opening Pull Requests.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <button
              onClick={onOpenRepoSelector}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-cyan text-charcoal-950 font-semibold text-xs hover:bg-cyan-400 transition-colors shadow-sm"
            >
              <FolderGit2 className="w-4 h-4" />
              <span>{activeRepo ? 'Change Target Repository' : 'Select Local Repository'}</span>
            </button>
            <div className="flex items-center gap-2 text-[11px] text-charcoal-400 justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Read-Only Safety Guarantee</span>
            </div>
          </div>
        </div>

        {/* Current Active Repo Bar */}
        {activeRepo && (
          <div className="mt-6 pt-5 border-t border-charcoal-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-charcoal-500 font-mono text-[11px]">ACTIVE REPO:</span>
              <span className="font-semibold text-charcoal-200 font-mono">{activeRepo.name}</span>
              <span className="text-charcoal-500 font-mono hidden sm:inline">({activeRepo.path})</span>
              {isDemo ? (
                <Badge variant="cyan" dot size="sm">
                  Demo Dataset
                </Badge>
              ) : (
                <Badge variant="zinc" size="sm">
                  Custom Path
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-charcoal-400 font-mono text-[11px]">
              {activeRepo.branch && <span>Branch: {activeRepo.branch}</span>}
              <span>Type: {activeRepo.projectType}</span>
            </div>
          </div>
        )}
      </div>

      {/* Feature Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-charcoal-300 uppercase tracking-wider font-mono">
            Core Features
          </h3>
          <span className="text-[11px] text-charcoal-500">Select any tool to begin</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Doctor */}
          <Card
            hoverable
            onClick={() => onNavigate('doctor')}
            className="group flex flex-col justify-between"
          >
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <Badge variant="emerald" size="sm">
                  Diagnostic
                </Badge>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-charcoal-100 group-hover:text-brand-cyan transition-colors flex items-center justify-between">
                  <span>Repository Doctor</span>
                  <ArrowRight className="w-4 h-4 text-charcoal-500 group-hover:text-brand-cyan group-hover:translate-x-1 transition-all" />
                </h4>
                <p className="text-xs text-charcoal-400 mt-1 leading-relaxed">
                  Audit runtime prerequisites, verify installed tool versions (Git, Python, Node), and generate setup next steps.
                </p>
              </div>

              <div className="pt-3 border-t border-charcoal-800/70 text-xs text-charcoal-400 space-y-1.5 font-mono">
                <div className="flex items-center justify-between text-[11px]">
                  <span>System Tools Checked:</span>
                  <span className="text-emerald-400 font-medium">4 of 4 Available</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Config Manifest:</span>
                  <span className="text-charcoal-200">PEP 518/621</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Explorer */}
          <Card
            hoverable
            onClick={() => onNavigate('explorer')}
            className="group flex flex-col justify-between"
          >
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
                  <FolderTree className="w-5 h-5" />
                </div>
                <Badge variant="cyan" size="sm">
                  Exploration
                </Badge>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-charcoal-100 group-hover:text-brand-cyan transition-colors flex items-center justify-between">
                  <span>Repository Explorer</span>
                  <ArrowRight className="w-4 h-4 text-charcoal-500 group-hover:text-brand-cyan group-hover:translate-x-1 transition-all" />
                </h4>
                <p className="text-xs text-charcoal-400 mt-1 leading-relaxed">
                  Traverse directory hierarchy, decode configuration file roles, and discover high-confidence starting points.
                </p>
              </div>

              <div className="pt-3 border-t border-charcoal-800/70 text-xs text-charcoal-400 space-y-1.5 font-mono">
                <div className="flex items-center justify-between text-[11px]">
                  <span>Key Entry Points:</span>
                  <span className="text-cyan-400 font-medium">2 Identified</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Recognized Frameworks:</span>
                  <span className="text-charcoal-200">Typer, pytest</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: PR Compass */}
          <Card
            hoverable
            onClick={() => onNavigate('pr-compass')}
            className="group flex flex-col justify-between"
          >
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-950/40 border border-indigo-800/40 flex items-center justify-center text-indigo-400">
                  <GitPullRequest className="w-5 h-5" />
                </div>
                <Badge variant="indigo" size="sm">
                  Pre-PR Audit
                </Badge>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-charcoal-100 group-hover:text-brand-cyan transition-colors flex items-center justify-between">
                  <span>PR Compass</span>
                  <ArrowRight className="w-4 h-4 text-charcoal-500 group-hover:text-brand-cyan group-hover:translate-x-1 transition-all" />
                </h4>
                <p className="text-xs text-charcoal-400 mt-1 leading-relaxed">
                  Compare branch commits against main, detect affected functional areas, and highlight potential test coverage gaps.
                </p>
              </div>

              <div className="pt-3 border-t border-charcoal-800/70 text-xs text-charcoal-400 space-y-1.5 font-mono">
                <div className="flex items-center justify-between text-[11px]">
                  <span>Branch Comparison:</span>
                  <span className="text-charcoal-200">vs origin/main</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Test Discovery:</span>
                  <span className="text-amber-400 font-medium">2 Potential Gaps</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Repositories Section with Verified Empty State */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-charcoal-300 uppercase tracking-wider font-mono">
              Recent Repositories
            </h3>
            <span className="text-[11px] text-charcoal-500 font-mono">({recentRepos.length})</span>
          </div>

          <div className="flex items-center gap-2">
            {recentRepos.length > 0 ? (
              <button
                onClick={onClearRecentRepos}
                className="text-[11px] text-charcoal-500 hover:text-charcoal-300 transition-colors"
              >
                Clear History
              </button>
            ) : (
              <button
                onClick={onRestoreDemoRepos}
                className="text-[11px] text-brand-cyan hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                Load Demo Repositories
              </button>
            )}
          </div>
        </div>

        {recentRepos.length === 0 ? (
          <EmptyState
            icon={FolderGit2}
            title="No Recent Repositories"
            description="You haven't opened or connected any local repositories yet. Choose a demo repository or connect a path to begin exploring."
            actionText="Connect Local Repository"
            onAction={onOpenRepoSelector}
            secondaryActionText="Load Demo Repos"
            onSecondaryAction={onRestoreDemoRepos}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recentRepos.map((repo) => {
              const isCurrent = activeRepo?.id === repo.id;
              return (
                <div
                  key={repo.id}
                  onClick={() => onSelectRepo(repo)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isCurrent
                      ? 'bg-brand-cyan/10 border-brand-cyan/40 shadow-sm'
                      : 'bg-charcoal-900 border-charcoal-800 hover:bg-charcoal-850 hover:border-charcoal-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isCurrent
                          ? 'bg-brand-cyan/20 text-brand-cyan'
                          : 'bg-charcoal-800 text-charcoal-400'
                      }`}
                    >
                      <FolderGit2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-charcoal-100 truncate">{repo.name}</span>
                        {repo.isDemo && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-charcoal-800 text-charcoal-400 rounded font-mono">
                            Demo
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-charcoal-500 font-mono truncate mt-0.5">{repo.path}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="text-[10px] text-charcoal-500 flex items-center gap-1">
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

      {/* CLI Quick Reference Panel */}
      <div className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-charcoal-800 text-charcoal-300 flex items-center justify-center shrink-0">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-charcoal-200">Terminal Companion CLI Ready</h4>
            <p className="text-[11px] text-charcoal-400">
              Run <code className="text-charcoal-200 font-mono bg-charcoal-800 px-1 py-0.5 rounded">repopilot doctor</code>, <code className="text-charcoal-200 font-mono bg-charcoal-800 px-1 py-0.5 rounded">explore</code>, or <code className="text-charcoal-200 font-mono bg-charcoal-800 px-1 py-0.5 rounded">pr-check</code> directly in your terminal.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('doctor')}
            className="px-3 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-charcoal-300 text-xs font-medium border border-charcoal-700 transition-colors"
          >
            Run Doctor
          </button>
          <button
            onClick={() => onNavigate('pr-compass')}
            className="px-3 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-charcoal-300 text-xs font-medium border border-charcoal-700 transition-colors"
          >
            Run PR Compass
          </button>
        </div>
      </div>
    </div>
  );
};
