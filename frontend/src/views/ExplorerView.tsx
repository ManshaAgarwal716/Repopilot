import React, { useState } from 'react';
import {
  FolderTree,
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  FileCheck,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Info,
  Search,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import { ExplorerReport, RepositoryItem, TreeNode, ConfidenceLevel } from '../types';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Badge, BadgeVariant } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';

interface ExplorerViewProps {
  activeRepo: RepositoryItem | null;
  report: ExplorerReport | null;
  onOpenRepoSelector: () => void;
  onLoadDemoRepo: () => void;
}

// Recursive Tree Node Item component
const TreeNodeItem: React.FC<{
  node: TreeNode;
  level?: number;
  searchQuery: string;
}> = ({ node, level = 0, searchQuery }) => {
  const [isOpen, setIsOpen] = useState(true);

  const isDirectory = node.isDirectory;
  const hasChildren = Boolean(node.children && node.children.length > 0);

  // Filter check if matching search
  const matchesSearch =
    !searchQuery ||
    node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (node.children &&
      node.children.some((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase())));

  if (!matchesSearch) return null;

  const formatSize = (bytes?: number) => {
    if (!bytes) return null;
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const getFileIcon = (name: string) => {
    if (name.endsWith('.py') || name.endsWith('.ts') || name.endsWith('.js')) {
      return <FileCode className="w-3.5 h-3.5 text-cyan-400" />;
    }
    if (name.endsWith('.toml') || name.endsWith('.json') || name.endsWith('.yaml') || name.endsWith('.yml')) {
      return <FileCheck className="w-3.5 h-3.5 text-amber-400" />;
    }
    return <FileText className="w-3.5 h-3.5 text-charcoal-400" />;
  };

  return (
    <div>
      <div
        onClick={() => isDirectory && setIsOpen(!isOpen)}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        className={`flex items-center justify-between py-1.5 pr-3 text-xs font-mono transition-colors rounded-md group ${
          isDirectory ? 'cursor-pointer hover:bg-charcoal-850/70 text-charcoal-200' : 'hover:bg-charcoal-850/40 text-charcoal-300'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {isDirectory ? (
            <span className="text-charcoal-500 group-hover:text-charcoal-300 transition-colors">
              {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </span>
          ) : (
            <span className="w-3.5" />
          )}

          {isDirectory ? (
            isOpen ? (
              <FolderOpen className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
            ) : (
              <Folder className="w-3.5 h-3.5 text-brand-cyan/80 shrink-0" />
            )
          ) : (
            <span className="shrink-0">{getFileIcon(node.name)}</span>
          )}

          <span className={`truncate ${isDirectory ? 'font-medium text-charcoal-100' : 'text-charcoal-300'}`}>
            {node.name}
          </span>
          {node.isSymlink && (
            <span className="text-[10px] text-amber-400 font-sans px-1 bg-amber-950/40 border border-amber-800/40 rounded">
              symlink
            </span>
          )}
        </div>

        {!isDirectory && node.sizeBytes !== undefined && (
          <span className="text-[10px] text-charcoal-500 font-mono shrink-0 ml-2">
            {formatSize(node.sizeBytes)}
          </span>
        )}
      </div>

      {isDirectory && isOpen && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <TreeNodeItem
              key={child.path}
              node={child}
              level={level + 1}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const ExplorerView: React.FC<ExplorerViewProps> = ({
  activeRepo,
  report,
  onOpenRepoSelector,
  onLoadDemoRepo,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Empty state: no repo selected
  if (!activeRepo) {
    return (
      <EmptyState
        icon={FolderTree}
        title="No Repository Selected for Codebase Exploration"
        description="Select a local repository or load the interactive demo repository to inspect directory hierarchies, understand configuration roles, and view recommended starting points."
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
              Explorer Pending for: <code className="font-mono text-brand-cyan">{activeRepo.path}</code>
            </h4>
            <p className="text-xs text-charcoal-400 leading-relaxed">
              In this frontend milestone, live repository traversal requires running the local CLI. The backend HTTP API server is planned for the next release.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader
            title="Run Repository Explorer in Terminal"
            subtitle="Explore directory architecture and starting points using the local CLI"
          />
          <CardContent className="space-y-4">
            <div className="bg-charcoal-950 border border-charcoal-800 rounded-xl p-4 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-charcoal-400 border-b border-charcoal-800 pb-2">
                <span>TERMINAL COMMAND</span>
                <span className="text-[11px] text-cyan-400">Depth Limit = 2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal-200">repopilot explore {activeRepo.path}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onLoadDemoRepo}
                className="px-3.5 py-2 rounded-lg bg-brand-cyan/15 hover:bg-brand-cyan/25 text-brand-cyan border border-brand-cyan/30 text-xs font-medium transition-colors"
              >
                Switch to Demo Dataset to View File Tree
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const confidenceBadgeMap: Record<ConfidenceLevel, { variant: BadgeVariant; label: string }> = {
    high: { variant: 'emerald', label: 'High Confidence' },
    medium: { variant: 'amber', label: 'Medium Confidence' },
    low: { variant: 'zinc', label: 'Low Confidence' },
  };

  return (
    <div className="space-y-6">
      {/* Demo Banner */}
      {activeRepo.isDemo && (
        <div className="p-3 bg-charcoal-900 border border-brand-cyan/30 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-cyan shrink-0" />
            <span className="text-charcoal-200">
              Viewing simulated codebase structure for <strong className="text-charcoal-100 font-mono">{activeRepo.name}</strong>.
            </span>
          </div>
          <Badge variant="cyan" size="sm">
            Demo Mode
          </Badge>
        </div>
      )}

      {/* Recognized Frameworks & Architecture Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recognized Frameworks */}
        <Card className="lg:col-span-1">
          <CardHeader
            title="Recognized Frameworks"
            subtitle="Extracted from build specifications"
          />
          <CardContent className="space-y-2">
            {report.overview.recognizedFrameworks.map((fw) => (
              <div
                key={fw}
                className="p-2.5 rounded-lg bg-charcoal-950 border border-charcoal-800 flex items-center justify-between text-xs"
              >
                <span className="text-charcoal-200 font-medium">{fw}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Likely Entry Points */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Likely Entry Points"
            subtitle="Locations where program initialization begins"
          />
          <CardContent className="space-y-2">
            {report.overview.likelyEntryPoints.map((ep) => (
              <div
                key={ep}
                className="p-2.5 rounded-lg bg-charcoal-950 border border-charcoal-800 flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-2 truncate">
                  <Compass className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
                  <span className="text-charcoal-200 truncate">{ep}</span>
                </div>
                <Badge variant="cyan" size="sm" className="shrink-0 ml-2">
                  Entry Point
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Suggested Starting Points */}
      <Card>
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-brand-cyan" />
              Suggested Starting Points for Exploration
            </span>
          }
          subtitle="Ranked starting points for an engineer exploring this codebase for the first time"
        />
        <div className="divide-y divide-charcoal-800/80">
          <div className="grid grid-cols-12 px-4 py-2 text-[11px] font-mono text-charcoal-500 uppercase">
            <div className="col-span-5 sm:col-span-4">File / Directory</div>
            <div className="col-span-3 sm:col-span-2">Confidence</div>
            <div className="col-span-4 sm:col-span-6">Why Inspect First</div>
          </div>
          {report.startingPoints.map((point) => {
            const conf = confidenceBadgeMap[point.confidence];
            return (
              <div
                key={point.path}
                className="grid grid-cols-12 px-4 py-3 items-center text-xs hover:bg-charcoal-850/40 transition-colors"
              >
                <div className="col-span-5 sm:col-span-4 font-mono font-medium text-charcoal-200 truncate flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan shrink-0" />
                  <span className="truncate">{point.path}</span>
                </div>
                <div className="col-span-3 sm:col-span-2">
                  <Badge variant={conf.variant} size="sm">
                    {conf.label}
                  </Badge>
                </div>
                <div className="col-span-4 sm:col-span-6 text-charcoal-400 text-xs leading-relaxed truncate sm:whitespace-normal">
                  {point.rationale}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* File Tree Panel & Important Files Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* File Tree Panel */}
        <div className="lg:col-span-6">
          <Card className="h-full flex flex-col">
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-brand-cyan" />
                  Repository Directory Tree
                </span>
              }
              subtitle={`Visualizing ${report.totalEntries} entries (depth limit: ${report.maxDepth})`}
            />
            {/* Search Box */}
            <div className="p-3 border-b border-charcoal-800/80 bg-charcoal-950/40">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-charcoal-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter tree files and directories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-charcoal-900 border border-charcoal-750 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-charcoal-200 placeholder:text-charcoal-500 focus:outline-none focus:border-brand-cyan"
                />
              </div>
            </div>

            {/* Tree Container */}
            <div className="p-3 overflow-y-auto max-h-[460px] flex-1">
              <TreeNodeItem node={report.treeRoot} searchQuery={searchQuery} />
            </div>

            <div className="p-2.5 border-t border-charcoal-800/80 bg-charcoal-950/40 text-[11px] text-charcoal-500 font-mono flex items-center justify-between">
              <span>Ignored: .git, node_modules, .venv</span>
              <span>Symlink traversal: disabled</span>
            </div>
          </Card>
        </div>

        {/* Important Project Files Explained */}
        <div className="lg:col-span-6">
          <Card className="h-full flex flex-col">
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-cyan" />
                  Important Project Files Explained
                </span>
              }
              subtitle="Evidence-based role classification for core repository manifests"
            />
            <div className="divide-y divide-charcoal-800/80 overflow-y-auto max-h-[500px] flex-1">
              {report.importantFiles.map((file) => (
                <div key={file.path} className="p-3.5 hover:bg-charcoal-850/40 transition-colors space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-charcoal-200">{file.path}</span>
                    <Badge variant="zinc" size="sm">
                      {file.role}
                    </Badge>
                  </div>
                  <p className="text-xs text-charcoal-400 leading-relaxed">{file.description}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
