import React, { useState } from 'react';
import {
  Stethoscope,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Copy,
  Check,
  Sparkles,
  Layers,
  Wrench,
  ListOrdered,
  Terminal,
} from 'lucide-react';
import { DoctorReport, RepositoryItem } from '../types';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';

interface DoctorViewProps {
  activeRepo: RepositoryItem | null;
  report: DoctorReport | null;
  onOpenRepoSelector: () => void;
  onLoadDemoRepo: () => void;
  isLoading?: boolean;
  onReanalyze?: () => void;
}

export const DoctorView: React.FC<DoctorViewProps> = ({
  activeRepo,
  report,
  onOpenRepoSelector,
  onLoadDemoRepo,
  isLoading,
  onReanalyze,
}) => {
  const [filter, setFilter] = useState<'all' | 'found' | 'missing'>('all');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Empty state: no repo selected
  if (!activeRepo) {
    return (
      <EmptyState
        icon={Stethoscope}
        title="No Repository Selected for Doctor Diagnostics"
        description="Select a local repository or connect a public GitHub repository to inspect project manifests, ecosystem tools, and setup recommendations."
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
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
          <Sparkles className="w-7 h-7 animate-spin" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-sm font-semibold text-slate-900 font-mono">
            Auditing Environment & Tools: {activeRepo.name}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            RepoPilot engine is checking runtime binaries, verifying package manifests, and determining installation next steps...
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
                <Stethoscope className="w-4 h-4 text-emerald-600" />
                <span>Run Doctor Diagnostics: {activeRepo.name}</span>
              </span>
            }
            subtitle="Verify development prerequisites, system tool availability, and configuration manifests"
          />
          <CardContent className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Target repository: <code className="font-mono text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{activeRepo.path}</code>. Click below to run live environment diagnostics.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              {onReanalyze && (
                <button
                  onClick={onReanalyze}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>Run Doctor Diagnostics Now</span>
                </button>
              )}
              <button
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent('repopilot:terminal', {
                      detail: { command: `repopilot doctor ${activeRepo.path}` },
                    })
                  )
                }
                className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-mono transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-600" />
                <span>Run in Terminal</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter file checks
  const filteredChecks = report.fileChecks.filter((fc) => {
    if (filter === 'found') return fc.status === 'FOUND';
    if (filter === 'missing') return fc.status === 'MISSING';
    return true;
  });

  const foundCount = report.fileChecks.filter((fc) => fc.status === 'FOUND').length;
  const missingCount = report.fileChecks.filter((fc) => fc.status === 'MISSING').length;
  const toolsAvailable = report.tools.filter((t) => t.installed).length;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Live Active Repository Banner */}
      <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-700">
            Active diagnostics for <strong className="text-slate-900 font-mono">{activeRepo.name}</strong> ({report.category.toUpperCase()} category, {foundCount} config files verified).
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onReanalyze && (
            <button
              onClick={onReanalyze}
              className="px-2 py-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] border border-slate-200 transition-colors shadow-2xs"
            >
              Re-scan
            </button>
          )}
          <button
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent('repopilot:terminal', {
                  detail: { command: `repopilot doctor ${activeRepo.path}` },
                })
              )
            }
            className="px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 text-emerald-700 font-mono text-[11px] border border-slate-200 flex items-center gap-1.5 transition-colors shadow-2xs font-medium"
          >
            <Terminal className="w-3 h-3" />
            <span>Terminal</span>
          </button>
        </div>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4">
          <span className="text-[11px] text-slate-500 font-mono block mb-1">PROJECT TYPE</span>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-900 capitalize">{report.category} Project</span>
            <Badge variant="emerald" size="sm">
              Detected
            </Badge>
          </div>
          <span className="text-[11px] text-slate-400 font-mono block mt-1">
            {report.projectTypes[0] || 'Generic'}
          </span>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] text-slate-500 font-mono block mb-1">AUDIT FILES FOUND</span>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-emerald-600 font-mono">{foundCount}</span>
            <span className="text-xs text-slate-500">of {report.fileChecks.length} checked</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono block mt-1">Core configs verified</span>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] text-slate-500 font-mono block mb-1">DEV TOOLS AVAILABLE</span>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-blue-600 font-mono">{toolsAvailable}</span>
            <span className="text-xs text-slate-500">of {report.tools.length} detected</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono block mt-1">Local CLI & runtimes</span>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] text-slate-500 font-mono block mb-1">SETUP NEXT STEPS</span>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-slate-900 font-mono">{report.nextSteps.length}</span>
            <Badge variant="zinc" size="sm">
              Tailored
            </Badge>
          </div>
          <span className="text-[11px] text-slate-400 font-mono block mt-1">Actionable instructions</span>
        </Card>
      </div>

      {/* Development Environment Tools */}
      <Card>
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-600" />
              Development Environment Tools
            </span>
          }
          subtitle="Verifies prerequisite command line runtimes and tools on the host system"
        />
        <div className="divide-y divide-slate-100">
          <div className="grid grid-cols-12 px-4 py-2 text-[11px] font-mono text-slate-500 uppercase bg-slate-50 border-y border-slate-200">
            <div className="col-span-4 sm:col-span-3">Tool</div>
            <div className="col-span-4 sm:col-span-3">Command Checked</div>
            <div className="col-span-2 sm:col-span-3">Status</div>
            <div className="col-span-2 sm:col-span-3 text-right">Detected Version</div>
          </div>
          {report.tools.map((tool) => (
            <div
              key={tool.name}
              className="grid grid-cols-12 px-4 py-3 items-center text-xs hover:bg-slate-50/80 transition-colors"
            >
              <div className="col-span-4 sm:col-span-3 flex items-center gap-2 font-medium text-slate-900">
                <span>{tool.name}</span>
                {tool.required && (
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 font-mono">
                    Required
                  </span>
                )}
              </div>
              <div className="col-span-4 sm:col-span-3 font-mono text-[11px] text-slate-500 truncate">
                {tool.command}
              </div>
              <div className="col-span-2 sm:col-span-3">
                {tool.installed ? (
                  <Badge variant="emerald" dot size="sm">
                    Available
                  </Badge>
                ) : (
                  <Badge variant="rose" dot size="sm">
                    Missing
                  </Badge>
                )}
              </div>
              <div className="col-span-2 sm:col-span-3 text-right font-mono text-slate-800 text-[11px]">
                {tool.version || (tool.details ? <span className="text-slate-400">{tool.details}</span> : '—')}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Common Project Files Audit */}
      <Card>
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Common Project Files Audit
            </span>
          }
          subtitle="Checks standard configuration manifests, packaging specs, and lockfiles"
          action={
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({report.fileChecks.length})
              </button>
              <button
                onClick={() => setFilter('found')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  filter === 'found'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Found ({foundCount})
              </button>
              <button
                onClick={() => setFilter('missing')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  filter === 'missing'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Missing ({missingCount})
              </button>
            </div>
          }
        />
        <div className="divide-y divide-slate-100">
          <div className="grid grid-cols-12 px-4 py-2 text-[11px] font-mono text-slate-500 uppercase bg-slate-50 border-y border-slate-200">
            <div className="col-span-4 sm:col-span-3">File / Directory</div>
            <div className="col-span-3 sm:col-span-2">Category</div>
            <div className="col-span-2 sm:col-span-2">Status</div>
            <div className="col-span-3 sm:col-span-5">Architectural Role & Description</div>
          </div>
          {filteredChecks.map((check) => {
            let statusBadge = (
              <Badge variant="zinc" size="sm">
                <MinusCircle className="w-3 h-3 text-slate-400" />
                Not Checked
              </Badge>
            );
            if (check.status === 'FOUND') {
              statusBadge = (
                <Badge variant="emerald" size="sm">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Found
                </Badge>
              );
            } else if (check.status === 'MISSING') {
              statusBadge = (
                <Badge variant="zinc" size="sm">
                  <XCircle className="w-3 h-3 text-slate-400" />
                  Missing
                </Badge>
              );
            }

            return (
              <div
                key={check.name}
                className="grid grid-cols-12 px-4 py-3 items-center text-xs hover:bg-slate-50/80 transition-colors"
              >
                <div className="col-span-4 sm:col-span-3 font-mono font-medium text-slate-900 flex items-center gap-1.5 truncate">
                  <span>{check.name}</span>
                  {check.isDirectory && <span className="text-slate-400 font-sans text-[10px]">/dir</span>}
                </div>
                <div className="col-span-3 sm:col-span-2 text-slate-600 text-[11px]">
                  {check.category}
                </div>
                <div className="col-span-2 sm:col-span-2">{statusBadge}</div>
                <div className="col-span-3 sm:col-span-5 text-slate-600 text-xs leading-relaxed truncate sm:whitespace-normal">
                  {check.description}
                  {check.details && <span className="block text-[11px] text-slate-400 mt-0.5">{check.details}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Suggested Next Steps */}
      <Card>
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-emerald-600" />
              Tailored Setup Recommendations
            </span>
          }
          subtitle="Step-by-step guidance derived from detected technology stack and project configuration"
        />
        <CardContent className="space-y-3">
          {report.nextSteps.map((step, index) => {
            const isMultiLine = step.includes('\n');
            const [desc, code] = isMultiLine ? step.split('\n') : [step, null];

            return (
              <div
                key={index}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-mono font-semibold flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <div className="space-y-1.5 min-w-0">
                    <p className="text-xs text-slate-800 leading-relaxed">{desc}</p>
                    {code && (
                      <div className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-mono text-[11px] text-blue-700 overflow-x-auto shadow-2xs">
                        <code>{code}</code>
                      </div>
                    )}
                  </div>
                </div>

                {code && (
                  <button
                    onClick={() => handleCopy(code, index)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors shrink-0"
                    title="Copy snippet"
                  >
                    {copiedIndex === index ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};
