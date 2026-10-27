export type ActiveScreen = 'dashboard' | 'doctor' | 'explorer' | 'pr-compass';

export interface RepositoryItem {
  id: string;
  name: string;
  path: string;
  isDemo: boolean;
  projectType: 'python' | 'nodejs' | 'both' | 'generic';
  lastOpened: string;
  branch?: string;
}

// --- Doctor Diagnostics Types ---
export type CheckStatus = 'FOUND' | 'MISSING' | 'NOT_CHECKED';
export type ProjectCategory = 'python' | 'nodejs' | 'both' | 'neither';

export interface FileCheck {
  name: string;
  category: string;
  status: CheckStatus;
  description: string;
  isDirectory?: boolean;
  details?: string;
}

export interface ToolStatus {
  name: string;
  command: string;
  installed: boolean;
  version?: string;
  required: boolean;
  details?: string;
}

export interface DoctorReport {
  targetPath: string;
  resolvedPath: string;
  category: ProjectCategory;
  projectTypes: string[];
  fileChecks: FileCheck[];
  tools: ToolStatus[];
  nextSteps: string[];
}

// --- Explorer Types ---
export interface TreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  isSymlink?: boolean;
  symlinkTarget?: string;
  sizeBytes?: number;
  children?: TreeNode[];
}

export interface StructureOverview {
  sourceDirs: string[];
  testDirs: string[];
  docFiles: string[];
  likelyEntryPoints: string[];
  recognizedFrameworks: string[];
  keyConfigFiles: string[];
}

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface StartingPoint {
  path: string;
  confidence: ConfidenceLevel;
  rationale: string;
}

export interface ImportantFile {
  path: string;
  role: string;
  description: string;
}

export interface ExplorerReport {
  overview: StructureOverview;
  treeRoot: TreeNode;
  totalEntries: number;
  truncated: boolean;
  maxDepth: number;
  startingPoints: StartingPoint[];
  importantFiles: ImportantFile[];
}

// --- PR Compass Types ---
export type ChangeType = 'added' | 'modified' | 'deleted' | 'renamed' | 'copied';

export interface FileChange {
  path: string;
  changeType: ChangeType;
  oldPath?: string;
  affectedArea: string;
  statusLabel: string;
}

export interface UncommittedStatus {
  hasUncommitted: boolean;
  stagedCount: number;
  unstagedCount: number;
  untrackedCount: number;
  stagedFiles: string[];
  unstagedFiles: string[];
  untrackedFiles: string[];
}

export interface FileTestMapping {
  changedFile: string;
  relatedTests: string[];
  hasPotentialGap: boolean;
  note: string;
}

export interface TestAnalysis {
  framework: string;
  suggestedCommand?: string;
  mappings: FileTestMapping[];
  potentialGapsCount: number;
  testsExecuted: boolean;
}

export interface PRCompassReport {
  currentBranch: string;
  baseBranch: string;
  baseRef?: string;
  comparisonRange?: string;
  hasCommits: boolean;
  uncommitted: UncommittedStatus;
  branchChanges: FileChange[];
  summary: {
    total: number;
    added: number;
    modified: number;
    deleted: number;
    renamed: number;
  };
  affectedAreas: string[];
  testAnalysis: TestAnalysis;
  warnings: string[];
}
