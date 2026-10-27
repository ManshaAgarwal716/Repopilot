import React, { useState } from 'react';
import {
  Stethoscope,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Copy,
  Check,
  Sparkles,
  Info,
  Layers,
  Wrench,
  ListOrdered,
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
}

export const DoctorView: React.FC<DoctorViewProps> = ({
  activeRepo,
  report,
  onOpenRepoSelector,
  onLoadDemoRepo,
}) => {
  const [filter, setFilter] = useState<'all' | 'found' | 'missing'>('all');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Empty state: no repo selected
  if (!activeRepo) {
    return (
      <EmptyState
        icon={Stethoscope}
        title="No Repository Selected for Doctor Diagnostics"
        description="Select a local repository or load the interactive demo repository to inspect project manifests, ecosystem tools, and setup recommendations."
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
              Live Analysis Pending for: <code className="font-mono text-brand-cyan">{activeRepo.path}</code>
            </h4>
            <p className="text-xs text-charcoal-400 leading-relaxed">
              In this frontend milestone, live repository analysis requires running the local CLI. The backend HTTP API server is planned for the next release.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader
            title="Run Repository Doctor in Terminal"
            subtitle="Execute the verified Python CLI on your target directory right now"
          />
          <CardContent className="space-y-4">
            <div className="bg-charcoal-950 border border-charcoal-800 rounded-xl p-4 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-charcoal-400 border-b border-charcoal-800 pb-2">
                <span>TERMINAL COMMAND</span>
                <span className="text-[11px] text-emerald-400">Read-Only</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal-200">repopilot doctor {activeRepo.path}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onLoadDemoRepo}
                className="px-3.5 py-2 rounded-lg bg-brand-cyan/15 hover:bg-brand-cyan/25 text-brand-cyan border border-brand-cyan/30 text-xs font-medium transition-colors"
              >
                Switch to Demo Dataset to View Sample Output
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
      {/* Demo Banner */}
      {activeRepo.isDemo && (
        <div className="p-3 bg-charcoal-900 border border-brand-cyan/30 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-cyan shrink-0" />
            <span className="text-charcoal-200">
              Viewing simulated diagnostics for <strong className="text-charcoal-100 font-mono">{activeRepo.name}</strong>.
            </span>
          </div>
          <Badge variant="cyan" size="sm">
            Demo Mode
          </Badge>
        </div>
      )}

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4">
          <span className="text-[11px] text-charcoal-400 font-mono block mb-1">PROJECT TYPE</span>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-charcoal-100 capitalize">{report.category} Project</span>
            <Badge variant="emerald" size="sm">
              Detected
            </Badge>
          </div>
          <span className="text-[11px] text-charcoal-500 font-mono block mt-1">
            {report.projectTypes[0] || 'Generic'}
          </span>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] text-charcoal-400 font-mono block mb-1">AUDIT FILES FOUND</span>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-emerald-400 font-mono">{foundCount}</span>
            <span className="text-xs text-charcoal-400">of {report.fileChecks.length} checked</span>
          </div>
          <span className="text-[11px] text-charcoal-500 font-mono block mt-1">Core configs verified</span>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] text-charcoal-400 font-mono block mb-1">DEV TOOLS AVAILABLE</span>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-brand-cyan font-mono">{toolsAvailable}</span>
            <span className="text-xs text-charcoal-400">of {report.tools.length} detected</span>
          </div>
          <span className="text-[11px] text-charcoal-500 font-mono block mt-1">Local CLI & runtimes</span>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] text-charcoal-400 font-mono block mb-1">SETUP NEXT STEPS</span>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-charcoal-100 font-mono">{report.nextSteps.length}</span>
            <Badge variant="zinc" size="sm">
              Tailored
            </Badge>
          </div>
          <span className="text-[11px] text-charcoal-500 font-mono block mt-1">Actionable instructions</span>
        </Card>
      </div>

      {/* Development Environment Tools */}
      <Card>
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-brand-cyan" />
              Development Environment Tools
            </span>
          }
          subtitle="Verifies prerequisite command line runtimes and tools on the host system"
        />
        <div className="divide-y divide-charcoal-800/80">
          <div className="grid grid-cols-12 px-4 py-2 text-[11px] font-mono text-charcoal-500 uppercase">
            <div className="col-span-4 sm:col-span-3">Tool</div>
            <div className="col-span-4 sm:col-span-3">Command Checked</div>
            <div className="col-span-2 sm:col-span-3">Status</div>
            <div className="col-span-2 sm:col-span-3 text-right">Detected Version</div>
          </div>
          {report.tools.map((tool) => (
            <div
              key={tool.name}
              className="grid grid-cols-12 px-4 py-3 items-center text-xs hover:bg-charcoal-850/40 transition-colors"
            >
              <div className="col-span-4 sm:col-span-3 flex items-center gap-2 font-medium text-charcoal-200">
                <span>{tool.name}</span>
                {tool.required && (
                  <span className="text-[10px] text-amber-400 bg-amber-950/40 px-1.5 py-0.2 rounded border border-amber-800/40 font-mono">
                    Required
                  </span>
                )}
              </div>
              <div className="col-span-4 sm:col-span-3 font-mono text-[11px] text-charcoal-400 truncate">
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
              <div className="col-span-2 sm:col-span-3 text-right font-mono text-charcoal-200 text-[11px]">
                {tool.version || (tool.details ? <span className="text-charcoal-500">{tool.details}</span> : '—')}
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
              <Layers className="w-4 h-4 text-brand-cyan" />
              Common Project Files Audit
            </span>
          }
          subtitle="Checks standard configuration manifests, packaging specs, and lockfiles"
          action={
            <div className="flex items-center gap-1 bg-charcoal-950 p-0.5 rounded-lg border border-charcoal-800">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-charcoal-800 text-charcoal-100 shadow-sm'
                    : 'text-charcoal-400 hover:text-charcoal-200'
                }`}
              >
                All ({report.fileChecks.length})
              </button>
              <button
                onClick={() => setFilter('found')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  filter === 'found'
                    ? 'bg-charcoal-800 text-emerald-300 shadow-sm'
                    : 'text-charcoal-400 hover:text-charcoal-200'
                }`}
              >
                Found ({foundCount})
              </button>
              <button
                onClick={() => setFilter('missing')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  filter === 'missing'
                    ? 'bg-charcoal-800 text-charcoal-300 shadow-sm'
                    : 'text-charcoal-400 hover:text-charcoal-200'
                }`}
              >
                Missing ({missingCount})
              </button>
            </div>
          }
        />
        <div className="divide-y divide-charcoal-800/80">
          <div className="grid grid-cols-12 px-4 py-2 text-[11px] font-mono text-charcoal-500 uppercase">
            <div className="col-span-4 sm:col-span-3">File / Directory</div>
            <div className="col-span-3 sm:col-span-2">Category</div>
            <div className="col-span-2 sm:col-span-2">Status</div>
            <div className="col-span-3 sm:col-span-5">Architectural Role & Description</div>
          </div>
          {filteredChecks.map((check) => {
            let statusBadge = (
              <Badge variant="zinc" size="sm">
                <MinusCircle className="w-3 h-3 text-charcoal-400" />
                Not Checked
              </Badge>
            );
            if (check.status === 'FOUND') {
              statusBadge = (
                <Badge variant="emerald" size="sm">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Found
                </Badge>
              );
            } else if (check.status === 'MISSING') {
              statusBadge = (
                <Badge variant="zinc" size="sm">
                  <XCircle className="w-3 h-3 text-charcoal-400" />
                  Missing
                </Badge>
              );
            }

            return (
              <div
                key={check.name}
                className="grid grid-cols-12 px-4 py-3 items-center text-xs hover:bg-charcoal-850/40 transition-colors"
              >
                <div className="col-span-4 sm:col-span-3 font-mono font-medium text-charcoal-200 flex items-center gap-1.5 truncate">
                  <span>{check.name}</span>
                  {check.isDirectory && <span className="text-charcoal-500 font-sans text-[10px]">/dir</span>}
                </div>
                <div className="col-span-3 sm:col-span-2 text-charcoal-400 text-[11px]">
                  {check.category}
                </div>
                <div className="col-span-2 sm:col-span-2">{statusBadge}</div>
                <div className="col-span-3 sm:col-span-5 text-charcoal-400 text-xs leading-relaxed truncate sm:whitespace-normal">
                  {check.description}
                  {check.details && <span className="block text-[11px] text-charcoal-500 mt-0.5">{check.details}</span>}
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
              <ListOrdered className="w-4 h-4 text-emerald-400" />
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
                className="p-3.5 rounded-xl bg-charcoal-950 border border-charcoal-800 flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs font-mono font-semibold flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <div className="space-y-1.5 min-w-0">
                    <p className="text-xs text-charcoal-200 leading-relaxed">{desc}</p>
                    {code && (
                      <div className="bg-charcoal-900 border border-charcoal-800 rounded-lg px-3 py-1.5 font-mono text-[11px] text-brand-cyan overflow-x-auto">
                        <code>{code}</code>
                      </div>
                    )}
                  </div>
                </div>

                {code && (
                  <button
                    onClick={() => handleCopy(code, index)}
                    className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-200 hover:bg-charcoal-800 transition-colors shrink-0"
                    title="Copy snippet"
                  >
                    {copiedIndex === index ? (
                      <Check className="w-4 h-4 text-emerald-400" />
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
