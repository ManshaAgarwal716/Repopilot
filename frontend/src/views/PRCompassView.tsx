import React, { useState } from 'react';
import {
  GitPullRequest,
  GitBranch,
  FileDiff,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
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
  isLoading?: boolean;
  onReanalyze?: () => void;
}

export const PRCompassView: React.FC<PRCompassViewProps> = ({
  activeRepo,
  report,
  onOpenRepoSelector,
  onLoadDemoRepo,
  isLoading,
  onReanalyze,
}) => {
  const [copiedCmd, setCopiedCmd] = useState(false);

  // Empty state: no repo selected
  if (!activeRepo) {
    return (
      <EmptyState
        icon={GitPullRequest}
        title="No Repository Selected for PR Compass"
        description="Select a local repository or connect a public GitHub repository to audit local branch differences, discover tests, and highlight potential coverage gaps before opening a PR."
        actionText="Select Repository"
        onAction={onOpenRepoSelector}
        secondaryActionText="Load Sample Repo"
        onSecondaryAction={onLoadDemoRepo}
      />
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center flex flex-col items-center justify-center space-y-4 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-xs">
          <Sparkles className="w-7 h-7 animate-spin" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-sm font-semibold text-slate-900 font-mono">
            Auditing Git Changes & Test Coverage: {activeRepo.name}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            RepoPilot engine is computing branch differences, mapping tests to changed files, and identifying potential coverage gaps...
          </p>
        </div>
      </div>
    );
  }

  // Not yet analyzed
  if (!report) {
    return (
      <div className="space-y-5">
        <Card>
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                <GitPullRequest className="w-4 h-4 text-indigo-600" />
                <span>Run PR Compass Audit: {activeRepo.name}</span>
              </span>
            }
            subtitle="Compare branch commits vs main, analyze affected functional areas, and highlight test coverage gaps"
          />
          <CardContent className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Target repository: <code className="font-mono text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{activeRepo.path}</code>. Click below to run live PR audit.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              {onReanalyze && (
                <button
                  onClick={onReanalyze}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
                >
                  <GitPullRequest className="w-4 h-4" />
                  <span>Run PR Compass Audit Now</span>
                </button>
              )}
              <button
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent('repopilot:terminal', {
                      detail: { command: `repopilot pr-check ${activeRepo.path} --base main` },
                    })
                  )
                }
                className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-mono transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Terminal className="w-3.5 h-3.5 text-indigo-600" />
                <span>Run in Terminal</span>
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
      {/* Branch Comparison Overview Banner */}
      <Card className="p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-500">COMPARISON:</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-900 font-semibold flex items-center gap-1.5 border border-slate-200">
                <GitBranch className="w-3.5 h-3.5 text-blue-600" />
                {report.currentBranch}
              </span>
              <span className="text-slate-400 font-sans">compared to</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                {report.baseBranch} ({report.baseRef || 'unresolved'})
              </span>
            </div>

            <div className="text-xs text-slate-500 font-mono flex items-center gap-3">
              <span>Range: <span className="text-slate-800 font-semibold">{report.comparisonRange || 'HEAD...base'}</span></span>
              <span>•</span>
              <span>{report.summary.total} committed files changed</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('repopilot:terminal', { detail: { command: 'repopilot pr-check --base main' } }))}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-indigo-700 font-mono text-xs border border-slate-200 flex items-center gap-1.5 transition-colors shadow-2xs font-medium"
            >
              <Terminal className="w-3.5 h-3.5 text-indigo-600" />
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
          <span className="text-[11px] text-slate-500 font-mono block">TOTAL CHANGED</span>
          <span className="text-xl font-bold text-slate-900 font-mono mt-1 block">
            {report.summary.total}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Committed in branch</span>
        </Card>

        <Card className="p-3.5">
          <span className="text-[11px] text-emerald-700 font-mono block font-medium">ADDED FILES</span>
          <span className="text-xl font-bold text-emerald-600 font-mono mt-1 block">
            +{report.summary.added}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">New code & assets</span>
        </Card>

        <Card className="p-3.5">
          <span className="text-[11px] text-amber-700 font-mono block font-medium">MODIFIED FILES</span>
          <span className="text-xl font-bold text-amber-600 font-mono mt-1 block">
            ~{report.summary.modified}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Existing files updated</span>
        </Card>

        <Card className="p-3.5">
          <span className="text-[11px] text-rose-700 font-mono block font-medium">POTENTIAL GAPS</span>
          <span className="text-xl font-bold text-amber-600 font-mono mt-1 block">
            {report.testAnalysis.potentialGapsCount}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Missing matching test</span>
        </Card>
      </div>

      {/* Uncommitted Working Tree Changes Notice */}
      {report.uncommitted.hasUncommitted && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              Uncommitted Working Tree Changes Detected
            </h4>
            <span className="text-[11px] font-mono text-amber-800">
              Not included in committed PR comparison
            </span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            You have active modifications in your workspace. RepoPilot separates uncommitted files from the committed PR branch diff so you can review what has actually been committed versus what remains in your worktree.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-white border border-amber-200 shadow-2xs">
              <span className="text-slate-500 block text-[10px]">STAGED:</span>
              <span className="text-emerald-700 font-semibold">{report.uncommitted.stagedCount} files</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-amber-200 shadow-2xs">
              <span className="text-slate-500 block text-[10px]">UNSTAGED:</span>
              <span className="text-amber-700 font-semibold">
                {report.uncommitted.unstagedCount} files ({report.uncommitted.unstagedFiles.join(', ') || 'none'})
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-amber-200 shadow-2xs">
              <span className="text-slate-500 block text-[10px]">UNTRACKED:</span>
              <span className="text-slate-700 font-semibold">
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
              <FileDiff className="w-4 h-4 text-blue-600" />
              Committed Branch Changes (vs &apos;{report.baseBranch}&apos;)
            </span>
          }
          subtitle="All committed modifications between the current branch and the selected base branch"
        />
        <div className="divide-y divide-slate-100">
          <div className="grid grid-cols-12 px-4 py-2 text-[11px] font-mono text-slate-500 uppercase bg-slate-50 border-y border-slate-200">
            <div className="col-span-2 sm:col-span-2">Type</div>
            <div className="col-span-6 sm:col-span-5">File Path</div>
            <div className="col-span-4 sm:col-span-5">Affected Functional Area</div>
          </div>
          {report.branchChanges.map((change) => (
            <div
              key={change.path}
              className="grid grid-cols-12 px-4 py-3 items-center text-xs hover:bg-slate-50/80 transition-colors"
            >
              <div className="col-span-2 sm:col-span-2">{getChangeBadge(change.changeType)}</div>
              <div className="col-span-6 sm:col-span-5 font-mono text-slate-900 font-medium truncate flex items-center gap-2">
                <span>{change.path}</span>
                {change.oldPath && (
                  <span className="text-[10px] text-slate-400 font-sans">
                    (from {change.oldPath})
                  </span>
                )}
              </div>
              <div className="col-span-4 sm:col-span-5 text-slate-600 text-xs truncate">
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] border border-slate-200">
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
              <FileCode className="w-4 h-4 text-emerald-600" />
              Test Coverage & Potential Gap Analysis
            </span>
          }
          subtitle="Heuristic mapping of modified files against candidate test suites"
        />
        <div className="divide-y divide-slate-100">
          <div className="grid grid-cols-12 px-4 py-2 text-[11px] font-mono text-slate-500 uppercase bg-slate-50 border-y border-slate-200">
            <div className="col-span-5 sm:col-span-4">Changed File</div>
            <div className="col-span-3 sm:col-span-2">Test Status</div>
            <div className="col-span-4 sm:col-span-6">Candidate Test Mapping & Notes</div>
          </div>
          {report.testAnalysis.mappings.map((mapping) => (
            <div
              key={mapping.changedFile}
              className="grid grid-cols-12 px-4 py-3 items-center text-xs hover:bg-slate-50/80 transition-colors"
            >
              <div className="col-span-5 sm:col-span-4 font-mono text-slate-900 font-medium truncate">
                {mapping.changedFile}
              </div>
              <div className="col-span-3 sm:col-span-2">
                {mapping.hasPotentialGap ? (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant="amber" size="sm">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      Potential Gap
                    </Badge>
                  </div>
                ) : mapping.relatedTests.length > 0 ? (
                  <Badge variant="emerald" size="sm">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Test Found
                  </Badge>
                ) : (
                  <Badge variant="zinc" size="sm">
                    Non-code
                  </Badge>
                )}
              </div>
              <div className="col-span-4 sm:col-span-6 text-slate-600 text-xs leading-relaxed truncate sm:whitespace-normal">
                {mapping.relatedTests.length > 0 && (
                  <span className="font-mono text-blue-700 mr-2 font-medium">
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
      <Card className="bg-white border-slate-200">
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-600" />
              Suggested Test Verification Recommendations
            </span>
          }
          subtitle="Run the targeted test commands in your terminal before opening your PR"
        />
        <CardContent className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-slate-500 uppercase text-[10px]">SUGGESTED CMD:</span>
              <code className="text-emerald-700 font-semibold truncate">
                {report.testAnalysis.suggestedCommand || 'pytest'}
              </code>
            </div>
            {report.testAnalysis.suggestedCommand && (
              <button
                onClick={() => handleCopyCmd(report.testAnalysis.suggestedCommand!)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors shrink-0"
                title="Copy command"
              >
                {copiedCmd ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Safety guarantee:</strong> RepoPilot operates exclusively in read-only mode. It never executes test suites autonomously and never modifies Git branches.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
