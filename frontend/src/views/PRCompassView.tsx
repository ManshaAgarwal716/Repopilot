import React, { useState } from 'react';
import {
  GitPullRequest,
  GitBranch,
  FileDiff,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Info,
  Copy,
  Check,
  Terminal,
  ShieldCheck,
  FileCode,
} from 'lucide-react';
import { PRCompassReport, RepositoryItem, ChangeType } from '../types';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';

interface PRCompassViewProps {
  activeRepo: RepositoryItem | null;
  report: PRCompassReport | null;
  onOpenRepoSelector: () => void;
  onLoadDemoRepo: () => void;
}

export const PRCompassView: React.FC<PRCompassViewProps> = ({
  activeRepo,
  report,
  onOpenRepoSelector,
  onLoadDemoRepo,
}) => {
  const [copiedCmd, setCopiedCmd] = useState(false);

  // Empty state: no repo selected
  if (!activeRepo) {
    return (
      <EmptyState
        icon={GitPullRequest}
        title="No Repository Selected for PR Compass"
        description="Select a local repository or load the interactive demo repository to audit local branch differences, discover tests, and highlight potential coverage gaps before opening a PR."
        actionText="Select Repository"
        onAction={onOpenRepoSelector}
        secondaryActionText="Load Demo Repo"
        onSecondaryAction={onLoadDemoRepo}
      />
    );
  }

  // Custom path without backend running
  if (!report) {
    return (
      <div className="space-y-5">
        <div className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 flex items-start gap-3">
          <Info className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-charcoal-100">
              PR Compass Pending for: <code className="font-mono text-brand-cyan">{activeRepo.path}</code>
            </h4>
            <p className="text-xs text-charcoal-400 leading-relaxed">
              In this frontend milestone, live Git branch comparisons require running the local CLI. The backend HTTP API server is planned for the next release.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader
            title="Run PR Compass in Terminal"
            subtitle="Audit branch differences and test coverage gaps using the local CLI"
          />
          <CardContent className="space-y-4">
            <div className="bg-charcoal-950 border border-charcoal-800 rounded-xl p-4 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-charcoal-400 border-b border-charcoal-800 pb-2">
                <span>TERMINAL COMMAND</span>
                <span className="text-[11px] text-indigo-400">Read-Only</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal-200">repopilot pr-check {activeRepo.path} --base main</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onLoadDemoRepo}
                className="px-3.5 py-2 rounded-lg bg-brand-cyan/15 hover:bg-brand-cyan/25 text-brand-cyan border border-brand-cyan/30 text-xs font-medium transition-colors"
              >
                Switch to Demo Dataset to View Pre-PR Report
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCopyCmd = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 1500);
  };

  const getChangeBadge = (type: ChangeType) => {
    switch (type) {
      case 'added':
        return <Badge variant="emerald" size="sm">Added</Badge>;
      case 'modified':
        return <Badge variant="amber" size="sm">Modified</Badge>;
      case 'deleted':
        return <Badge variant="rose" size="sm">Deleted</Badge>;
      case 'renamed':
        return <Badge variant="cyan" size="sm">Renamed</Badge>;
      default:
        return <Badge variant="zinc" size="sm">Copied</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Demo Banner */}
      {activeRepo.isDemo && (
        <div className="p-3 bg-charcoal-900 border border-brand-cyan/30 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-cyan shrink-0" />
            <span className="text-charcoal-200">
              Viewing simulated pre-PR check for <strong className="text-charcoal-100 font-mono">{activeRepo.name}</strong>.
            </span>
          </div>
          <Badge variant="cyan" size="sm">
            Demo Mode
          </Badge>
        </div>
      )}

      {/* Branch Comparison Overview Banner */}
      <Card className="p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-charcoal-400">COMPARISON:</span>
              <span className="px-2 py-0.5 rounded bg-charcoal-800 text-charcoal-200 font-semibold flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-brand-cyan" />
                {report.currentBranch}
              </span>
              <span className="text-charcoal-500 font-sans">compared to</span>
              <span className="px-2 py-0.5 rounded bg-charcoal-800 text-charcoal-300 font-semibold">
                {report.baseBranch} ({report.baseRef || 'unresolved'})
              </span>
            </div>

            <div className="text-xs text-charcoal-400 font-mono flex items-center gap-3">
              <span>Range: <span className="text-charcoal-200">{report.comparisonRange || 'HEAD...base'}</span></span>
              <span>•</span>
              <span>{report.summary.total} committed files changed</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('repopilot:terminal', { detail: { command: 'repopilot pr-check --base main' } }))}
              className="px-2.5 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-indigo-300 font-mono text-xs border border-charcoal-700 flex items-center gap-1.5 transition-colors"
            >
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Run in Terminal</span>
            </button>
            {report.uncommitted.hasUncommitted ? (
              <Badge variant="amber" dot size="md">
                Uncommitted Changes in Working Tree
              </Badge>
            ) : (
              <Badge variant="emerald" dot size="md">
                Clean Working Tree
              </Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Change Counts Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5">
          <span className="text-[11px] text-charcoal-500 font-mono block">TOTAL CHANGED</span>
          <span className="text-xl font-bold text-charcoal-100 font-mono mt-1 block">
            {report.summary.total}
          </span>
          <span className="text-[10px] text-charcoal-400 block mt-0.5">Committed in branch</span>
        </Card>

        <Card className="p-3.5">
          <span className="text-[11px] text-emerald-500 font-mono block">ADDED FILES</span>
          <span className="text-xl font-bold text-emerald-400 font-mono mt-1 block">
            +{report.summary.added}
          </span>
          <span className="text-[10px] text-charcoal-400 block mt-0.5">New code & assets</span>
        </Card>

        <Card className="p-3.5">
          <span className="text-[11px] text-amber-500 font-mono block">MODIFIED FILES</span>
          <span className="text-xl font-bold text-amber-400 font-mono mt-1 block">
            ~{report.summary.modified}
          </span>
          <span className="text-[10px] text-charcoal-400 block mt-0.5">Existing files updated</span>
        </Card>

        <Card className="p-3.5">
          <span className="text-[11px] text-rose-500 font-mono block">POTENTIAL GAPS</span>
          <span className="text-xl font-bold text-amber-400 font-mono mt-1 block">
            {report.testAnalysis.potentialGapsCount}
          </span>
          <span className="text-[10px] text-charcoal-400 block mt-0.5">Missing matching test</span>
        </Card>
      </div>

      {/* Uncommitted Working Tree Changes Notice (Crucial distinction!) */}
      {report.uncommitted.hasUncommitted && (
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              Uncommitted Working Tree Changes Detected
            </h4>
            <span className="text-[11px] font-mono text-amber-400/80">
              Not included in committed PR comparison
            </span>
          </div>
          <p className="text-xs text-charcoal-300 leading-relaxed">
            You have active modifications in your workspace. RepoPilot separates uncommitted files from the committed PR branch diff so you can review what has actually been committed versus what remains in your worktree.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs font-mono">
            <div className="p-2 rounded bg-charcoal-900 border border-charcoal-800">
              <span className="text-charcoal-500 block text-[10px]">STAGED:</span>
              <span className="text-emerald-400 font-semibold">{report.uncommitted.stagedCount} files</span>
            </div>
            <div className="p-2 rounded bg-charcoal-900 border border-charcoal-800">
              <span className="text-charcoal-500 block text-[10px]">UNSTAGED:</span>
              <span className="text-amber-400 font-semibold">
                {report.uncommitted.unstagedCount} files ({report.uncommitted.unstagedFiles.join(', ') || 'none'})
              </span>
            </div>
            <div className="p-2 rounded bg-charcoal-900 border border-charcoal-800">
              <span className="text-charcoal-500 block text-[10px]">UNTRACKED:</span>
              <span className="text-charcoal-400 font-semibold">
                {report.uncommitted.untrackedCount} files ({report.uncommitted.untrackedFiles.join(', ') || 'none'})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Committed Branch Changes Table */}
      <Card>
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              <FileDiff className="w-4 h-4 text-brand-cyan" />
              Committed Branch Changes (vs &apos;{report.baseBranch}&apos;)
            </span>
          }
          subtitle="All committed modifications between the current branch and the selected base branch"
        />
        <div className="divide-y divide-charcoal-800/80">
          <div className="grid grid-cols-12 px-4 py-2 text-[11px] font-mono text-charcoal-500 uppercase">
            <div className="col-span-2 sm:col-span-2">Type</div>
            <div className="col-span-6 sm:col-span-5">File Path</div>
            <div className="col-span-4 sm:col-span-5">Affected Functional Area</div>
          </div>
          {report.branchChanges.map((change) => (
            <div
              key={change.path}
              className="grid grid-cols-12 px-4 py-3 items-center text-xs hover:bg-charcoal-850/40 transition-colors"
            >
              <div className="col-span-2 sm:col-span-2">{getChangeBadge(change.changeType)}</div>
              <div className="col-span-6 sm:col-span-5 font-mono text-charcoal-200 font-medium truncate flex items-center gap-2">
                <span>{change.path}</span>
                {change.oldPath && (
                  <span className="text-[10px] text-charcoal-500 font-sans">
                    (from {change.oldPath})
                  </span>
                )}
              </div>
              <div className="col-span-4 sm:col-span-5 text-charcoal-400 text-xs truncate">
                <span className="px-2 py-0.5 rounded bg-charcoal-800 text-charcoal-300 font-mono text-[11px]">
                  {change.affectedArea}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Test Discovery & Potential Gap Analysis */}
      <Card>
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              Test Coverage & Potential Gap Analysis
            </span>
          }
          subtitle="Heuristic mapping of modified files against candidate test suites"
        />
        <div className="divide-y divide-charcoal-800/80">
          <div className="grid grid-cols-12 px-4 py-2 text-[11px] font-mono text-charcoal-500 uppercase">
            <div className="col-span-5 sm:col-span-4">Changed File</div>
            <div className="col-span-3 sm:col-span-2">Test Status</div>
            <div className="col-span-4 sm:col-span-6">Candidate Test Mapping & Notes</div>
          </div>
          {report.testAnalysis.mappings.map((mapping) => (
            <div
              key={mapping.changedFile}
              className="grid grid-cols-12 px-4 py-3 items-center text-xs hover:bg-charcoal-850/40 transition-colors"
            >
              <div className="col-span-5 sm:col-span-4 font-mono text-charcoal-200 font-medium truncate">
                {mapping.changedFile}
              </div>
              <div className="col-span-3 sm:col-span-2">
                {mapping.hasPotentialGap ? (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant="amber" size="sm">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      Potential Gap
                    </Badge>
                  </div>
                ) : mapping.relatedTests.length > 0 ? (
                  <Badge variant="emerald" size="sm">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Test Found
                  </Badge>
                ) : (
                  <Badge variant="zinc" size="sm">
                    Non-code
                  </Badge>
                )}
              </div>
              <div className="col-span-4 sm:col-span-6 text-charcoal-400 text-xs leading-relaxed truncate sm:whitespace-normal">
                {mapping.relatedTests.length > 0 && (
                  <span className="font-mono text-brand-cyan mr-2 font-medium">
                    {mapping.relatedTests.join(', ')}
                  </span>
                )}
                <span>{mapping.note}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Suggested Verification Commands */}
      <Card className="bg-charcoal-900 border-charcoal-800">
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-brand-cyan" />
              Suggested Test Verification Recommendations
            </span>
          }
          subtitle="Run the targeted test commands in your terminal before opening your PR"
        />
        <CardContent className="space-y-4">
          <div className="p-3.5 rounded-xl bg-charcoal-950 border border-charcoal-800 font-mono text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-charcoal-500 uppercase text-[10px]">SUGGESTED CMD:</span>
              <code className="text-emerald-400 font-semibold truncate">
                {report.testAnalysis.suggestedCommand || 'pytest'}
              </code>
            </div>
            {report.testAnalysis.suggestedCommand && (
              <button
                onClick={() => handleCopyCmd(report.testAnalysis.suggestedCommand!)}
                className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-200 hover:bg-charcoal-850 transition-colors shrink-0"
                title="Copy command"
              >
                {copiedCmd ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-charcoal-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Safety guarantee:</strong> RepoPilot operates exclusively in read-only mode. It never executes test suites autonomously and never modifies Git branches.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
