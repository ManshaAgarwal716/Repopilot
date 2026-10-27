export type ActiveScreen = 'dashboard' | 'doctor' | 'explorer' | 'pr-compass' | 'ai-copilot';

export type RepoOrigin = 'local' | 'github';

export interface RepositoryItem {
  id: string;
  name: string;
  path: string;
  originType: RepoOrigin;
  remoteUrl?: string;
  isDemo: boolean;
  projectType: 'python' | 'nodejs' | 'both' | 'generic';
  lastOpened: string;
  branch?: string;
  stars?: number;
  forks?: number;
  description?: string;
  defaultBranch?: string;
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
  contentSample?: string;
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
  contentSnippet?: string;
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
  diffSnippet?: string;
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
  generatedTestPreview?: string;
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

// --- AI Copilot & Code Intelligence Types ---
export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  codeSnippet?: string;
  fileReference?: string;
  isStreaming?: boolean;
}

export interface AIGeneratedTest {
  targetFile: string;
  suggestedPath: string;
  framework: string;
  code: string;
  rationale: string;
  testCasesCovered: string[];
}

export interface AIPRReview {
  summary: string;
  riskLevel: 'low' | 'medium' | 'high';
  impactAssessment: string;
  keyChanges: string[];
  suggestedReviewFocus: string[];
  generatedMarkdownPR: string;
}

// --- Integrated Terminal Types ---
export type TerminalTab = 'interactive' | 'doctor' | 'explore' | 'pr-check';

export interface TerminalOutputLine {
  id: string;
  text: string;
  type: 'command' | 'output' | 'error' | 'success' | 'info';
  timestamp?: string;
}
