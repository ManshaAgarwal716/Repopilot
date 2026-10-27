import {
  DoctorReport,
  ExplorerReport,
  PRCompassReport,
  RepositoryItem,
  AIGeneratedTest,
  AIPRReview,
  AIChatMessage,
} from '../types';

export const POPULAR_REPOSITORIES: RepositoryItem[] = [
  {
    id: 'repo-repopilot-remote',
    name: 'ManshaAgarwal716/Repopilot',
    path: 'https://github.com/ManshaAgarwal716/Repopilot',
    originType: 'github',
    remoteUrl: 'https://github.com/ManshaAgarwal716/Repopilot',
    isDemo: true,
    projectType: 'python',
    lastOpened: 'Just now',
    branch: 'main',
    stars: 12,
    forks: 3,
    description: 'Safe local repository scanner, explorer, and pre-PR diagnostic tool for developers.',
    defaultBranch: 'main',
  },
  {
    id: 'repo-fastapi',
    name: 'tiangolo/fastapi',
    path: 'https://github.com/tiangolo/fastapi',
    originType: 'github',
    remoteUrl: 'https://github.com/tiangolo/fastapi',
    isDemo: true,
    projectType: 'python',
    lastOpened: '2 hours ago',
    branch: 'master',
    stars: 76800,
    forks: 6200,
    description: 'FastAPI framework, high performance, easy to learn, fast to code, ready for production',
    defaultBranch: 'master',
  },
  {
    id: 'repo-react',
    name: 'facebook/react',
    path: 'https://github.com/facebook/react',
    originType: 'github',
    remoteUrl: 'https://github.com/facebook/react',
    isDemo: true,
    projectType: 'nodejs',
    lastOpened: 'Yesterday',
    branch: 'main',
    stars: 231000,
    forks: 46500,
    description: 'The library for web and native user interfaces.',
    defaultBranch: 'main',
  },
  {
    id: 'repo-flask',
    name: 'pallets/flask',
    path: 'https://github.com/pallets/flask',
    originType: 'github',
    remoteUrl: 'https://github.com/pallets/flask',
    isDemo: true,
    projectType: 'python',
    lastOpened: '3 days ago',
    branch: 'main',
    stars: 69200,
    forks: 16100,
    description: 'The Python micro framework for building web applications.',
    defaultBranch: 'main',
  },
];

export const LOCAL_DEMO_REPOSITORIES: RepositoryItem[] = [
  {
    id: 'local-repopilot',
    name: 'repopilot (Local Clone)',
    path: '/Users/apple12390/repopilot',
    originType: 'local',
    isDemo: true,
    projectType: 'python',
    lastOpened: 'Just now',
    branch: 'feature/pr-compass',
  },
  {
    id: 'local-ecommerce',
    name: 'ecommerce-platform',
    path: '/Users/apple12390/projects/ecommerce-platform',
    originType: 'local',
    isDemo: true,
    projectType: 'nodejs',
    lastOpened: 'Yesterday',
    branch: 'feat/checkout-v2',
  },
];

export const DEMO_REPOSITORIES: RepositoryItem[] = [
  ...POPULAR_REPOSITORIES,
  ...LOCAL_DEMO_REPOSITORIES,
];

export const DEMO_DOCTOR_REPORT: DoctorReport = {
  targetPath: '/Users/apple12390/repopilot',
  resolvedPath: '/Users/apple12390/repopilot',
  category: 'python',
  projectTypes: ['Python (PEP 518/621 pyproject.toml)', 'Git Repository'],
  fileChecks: [
    {
      name: 'pyproject.toml',
      category: 'Python',
      status: 'FOUND',
      description: 'Python project packaging & tool specifications (PEP 518/621, Hatchling build backend)',
      isDirectory: false,
    },
    {
      name: 'README.md',
      category: 'General',
      status: 'FOUND',
      description: 'Primary project documentation, quickstart, safety guarantees, and architecture overview',
      isDirectory: false,
    },
    {
      name: 'CONTRIBUTING.md',
      category: 'General',
      status: 'FOUND',
      description: 'Guidelines, setup instructions, and code standards for project contributors',
      isDirectory: false,
    },
    {
      name: '.gitignore',
      category: 'General',
      status: 'FOUND',
      description: 'Git ignore patterns for build/cache/virtualenv artifacts',
      isDirectory: false,
    },
    {
      name: '.github/workflows',
      category: 'General',
      status: 'FOUND',
      description: 'GitHub Actions CI/CD workflows directory (Ubuntu/macOS matrix testing)',
      isDirectory: true,
    },
    {
      name: 'requirements.txt',
      category: 'Python',
      status: 'MISSING',
      description: 'Pip dependency specification list',
      isDirectory: false,
      details: 'Not required when dependencies are declared directly in pyproject.toml',
    },
    {
      name: 'Pipfile',
      category: 'Python',
      status: 'MISSING',
      description: 'Pipenv dependency manifest',
      isDirectory: false,
    },
    {
      name: 'poetry.lock',
      category: 'Python',
      status: 'MISSING',
      description: 'Poetry dependency lockfile',
      isDirectory: false,
    },
    {
      name: 'package.json',
      category: 'Node.js',
      status: 'FOUND',
      description: 'Frontend dashboard manifest with React 18, Vite 6, and Tailwind CSS',
      isDirectory: false,
    },
    {
      name: 'tsconfig.json',
      category: 'Node.js (Extended)',
      status: 'FOUND',
      description: 'TypeScript compiler configuration for dashboard frontend',
      isDirectory: false,
    },
  ],
  tools: [
    {
      name: 'Git',
      command: 'git --version',
      installed: true,
      version: '2.50.1',
      required: true,
    },
    {
      name: 'Python',
      command: 'python3 --version',
      installed: true,
      version: '3.14.2',
      required: true,
    },
    {
      name: 'Node.js',
      command: 'node --version',
      installed: true,
      version: 'v24.20.0',
      required: false,
    },
    {
      name: 'npm',
      command: 'npm --version',
      installed: true,
      version: '11.19.0',
      required: false,
    },
  ],
  nextSteps: [
    'Create and activate a virtual environment, then install editable package with dev tools:\npython3 -m venv .venv && source .venv/bin/activate && pip install -e ".[dev]"',
    'Run the complete pytest test suite (67 tests) to verify local test suite integrity:\npytest -v',
    'Run Ruff linter to audit code formatting and style:\nruff check .',
    'Check out the frontend dashboard:\ncd frontend && npm run dev',
  ],
};

export const DEMO_EXPLORER_REPORT: ExplorerReport = {
  overview: {
    sourceDirs: ['src/', 'frontend/src/'],
    testDirs: ['tests/'],
    docFiles: ['README.md', 'CONTRIBUTING.md', 'LICENSE', 'frontend/README.md'],
    likelyEntryPoints: [
      'repopilot.cli:app (CLI entry point registered in pyproject.toml)',
      'src/repopilot/cli.py (Typer application definition)',
      'frontend/src/main.tsx (Vite dashboard root)',
    ],
    recognizedFrameworks: [
      'Typer (Python CLI application framework)',
      'Rich (Terminal formatting & syntax highlighting)',
      'pytest (Python test suite runner)',
      'Hatchling (PEP 517 build backend)',
      'React 18 & Vite 6 (Frontend dashboard)',
      'Tailwind CSS v3 (UI design system)',
    ],
    keyConfigFiles: [
      'pyproject.toml',
      '.gitignore',
      '.github/workflows/ci.yml',
      'frontend/package.json',
      'frontend/tailwind.config.js',
      'CONTRIBUTING.md',
      'LICENSE',
    ],
  },
  treeRoot: {
    name: 'repopilot',
    path: '.',
    isDirectory: true,
    children: [
      {
        name: '.github',
        path: '.github',
        isDirectory: true,
        children: [
          {
            name: 'workflows',
            path: '.github/workflows',
            isDirectory: true,
            children: [
              {
                name: 'ci.yml',
                path: '.github/workflows/ci.yml',
                isDirectory: false,
                sizeBytes: 812,
                contentSample: `name: CI\non:\n  push:\n    branches: [main]\n  pull_request:\n    branches: [main]\n\njobs:\n  test:\n    strategy:\n      matrix:\n        os: [ubuntu-latest, macos-latest]\n        python-version: ["3.12", "3.13", "3.14"]\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-python@v5\n      - run: pip install -e ".[dev]"\n      - run: ruff check .\n      - run: pytest -v`,
              },
            ],
          },
        ],
      },
      {
        name: 'frontend',
        path: 'frontend',
        isDirectory: true,
        children: [
          {
            name: 'src',
            path: 'frontend/src',
            isDirectory: true,
            children: [
              { name: 'App.tsx', path: 'frontend/src/App.tsx', isDirectory: false, sizeBytes: 4200 },
              { name: 'main.tsx', path: 'frontend/src/main.tsx', isDirectory: false, sizeBytes: 240 },
              { name: 'index.css', path: 'frontend/src/index.css', isDirectory: false, sizeBytes: 780 },
            ],
          },
          { name: 'package.json', path: 'frontend/package.json', isDirectory: false, sizeBytes: 650 },
          { name: 'vite.config.ts', path: 'frontend/vite.config.ts', isDirectory: false, sizeBytes: 210 },
          { name: 'tailwind.config.js', path: 'frontend/tailwind.config.js', isDirectory: false, sizeBytes: 980 },
        ],
      },
      {
        name: 'src',
        path: 'src',
        isDirectory: true,
        children: [
          {
            name: 'repopilot',
            path: 'src/repopilot',
            isDirectory: true,
            children: [
              {
                name: '__init__.py',
                path: 'src/repopilot/__init__.py',
                isDirectory: false,
                sizeBytes: 128,
                contentSample: `"""RepoPilot - Safe local repository scanner and developer onboarding tool."""\n\n__version__ = "0.1.0"\n__all__ = ["__version__"]`,
              },
              {
                name: 'cli.py',
                path: 'src/repopilot/cli.py',
                isDirectory: false,
                sizeBytes: 6310,
                contentSample: `import typer\nfrom rich.console import Console\n\napp = typer.Typer(name="repopilot", help="Safe developer tool to inspect repositories.")\n\n@app.command()\ndef doctor(path: Path = typer.Argument(Path("."))): ...\n\n@app.command()\ndef explore(path: Path = typer.Argument(Path("."))): ...\n\n@app.command()\ndef pr_check(path: Path = typer.Argument(Path("."))): ...`,
              },
              { name: 'diagnostics.py', path: 'src/repopilot/diagnostics.py', isDirectory: false, sizeBytes: 9980 },
              { name: 'explorer.py', path: 'src/repopilot/explorer.py', isDirectory: false, sizeBytes: 23800 },
              { name: 'models.py', path: 'src/repopilot/models.py', isDirectory: false, sizeBytes: 11400 },
              { name: 'pr_check.py', path: 'src/repopilot/pr_check.py', isDirectory: false, sizeBytes: 21200 },
              { name: 'report.py', path: 'src/repopilot/report.py', isDirectory: false, sizeBytes: 21100 },
              { name: 'scanner.py', path: 'src/repopilot/scanner.py', isDirectory: false, sizeBytes: 13000 },
            ],
          },
        ],
      },
      {
        name: 'tests',
        path: 'tests',
        isDirectory: true,
        children: [
          { name: 'test_cli.py', path: 'tests/test_cli.py', isDirectory: false, sizeBytes: 7420 },
          { name: 'test_diagnostics.py', path: 'tests/test_diagnostics.py', isDirectory: false, sizeBytes: 8400 },
          { name: 'test_explorer.py', path: 'tests/test_explorer.py', isDirectory: false, sizeBytes: 10400 },
          { name: 'test_pr_check.py', path: 'tests/test_pr_check.py', isDirectory: false, sizeBytes: 13200 },
          { name: 'test_scanner.py', path: 'tests/test_scanner.py', isDirectory: false, sizeBytes: 9100 },
        ],
      },
      { name: 'pyproject.toml', path: 'pyproject.toml', isDirectory: false, sizeBytes: 1312 },
      { name: 'README.md', path: 'README.md', isDirectory: false, sizeBytes: 15400 },
      { name: 'CONTRIBUTING.md', path: 'CONTRIBUTING.md', isDirectory: false, sizeBytes: 3100 },
      { name: 'LICENSE', path: 'LICENSE', isDirectory: false, sizeBytes: 1079 },
      { name: '.gitignore', path: '.gitignore', isDirectory: false, sizeBytes: 578 },
    ],
  },
  totalEntries: 28,
  truncated: false,
  maxDepth: 3,
  startingPoints: [
    {
      path: 'README.md',
      confidence: 'high',
      rationale: 'Primary project overview, 60-second summary, setup commands, and architectural context.',
    },
    {
      path: 'pyproject.toml',
      confidence: 'high',
      rationale: 'Defines project metadata, dependencies, build toolchain, and CLI script entry point [repopilot].',
    },
    {
      path: 'src/repopilot/cli.py',
      confidence: 'high',
      rationale: 'Typer entry point where doctor, explore, and pr-check commands are registered.',
    },
    {
      path: 'tests/test_cli.py',
      confidence: 'medium',
      rationale: 'Integration tests demonstrate all CLI invocations, flag combinations, and exit code assertions.',
    },
    {
      path: 'CONTRIBUTING.md',
      confidence: 'medium',
      rationale: 'Outlines development philosophy, test commands, and coding conventions for contributors.',
    },
  ],
  importantFiles: [
    {
      path: 'pyproject.toml',
      role: 'Build & Packaging',
      description: 'Python project configuration, build specification, and dependency declarations (PEP 518/621).',
      contentSnippet: `[project]\nname = "repopilot"\nversion = "0.1.0"\ndescription = "Safe local repository scanner, explorer, and pre-PR diagnostic tool"\nrequires-python = ">=3.12"\n\n[project.scripts]\nrepopilot = "repopilot.cli:app"`,
    },
    {
      path: '.github/workflows/ci.yml',
      role: 'CI/CD Automation',
      description: 'Automated GitHub Actions workflow running Ruff linting and pytest on Python 3.12, 3.13, and 3.14.',
      contentSnippet: `name: CI\non: [push, pull_request]\njobs:\n  test:\n    strategy:\n      matrix:\n        os: [ubuntu-latest, macos-latest]\n        python-version: ["3.12", "3.13", "3.14"]`,
    },
    {
      path: 'README.md',
      role: 'Documentation',
      description: 'Primary project documentation, usage guides, architecture overview, and onboarding.',
    },
    {
      path: 'CONTRIBUTING.md',
      role: 'Documentation',
      description: 'Guidelines, setup instructions, and code standards for project contributors.',
    },
    {
      path: 'LICENSE',
      role: 'Legal',
      description: 'Open-source MIT License terms governing use, reproduction, and redistribution.',
    },
    {
      path: '.gitignore',
      role: 'Version Control',
      description: 'Specifies intentionally untracked patterns that Git should ignore.',
    },
  ],
};

export const DEMO_PR_COMPASS_REPORT: PRCompassReport = {
  currentBranch: 'feature/pr-compass',
  baseBranch: 'main',
  baseRef: 'origin/main',
  comparisonRange: 'origin/main...HEAD',
  hasCommits: true,
  uncommitted: {
    hasUncommitted: true,
    stagedCount: 0,
    unstagedCount: 1,
    untrackedCount: 1,
    stagedFiles: [],
    unstagedFiles: ['README.md'],
    untrackedFiles: ['frontend/src/scratch.ts'],
  },
  branchChanges: [
    {
      path: 'src/repopilot/pr_check.py',
      changeType: 'added',
      affectedArea: 'Application Source',
      statusLabel: 'committed',
      diffSnippet: `+ def analyze_pr(repo_path: str | Path, base_branch: str = "main") -> PRCheckReport:\n+     path_obj = Path(repo_path).expanduser().resolve()\n+     if not path_obj.exists():\n+         return PRCheckReport(...)`,
    },
    {
      path: 'tests/test_pr_check.py',
      changeType: 'added',
      affectedArea: 'Test Suite',
      statusLabel: 'committed',
      diffSnippet: `+ def test_pr_check_clean_feature_branch(git_repo: Path):\n+     report = analyze_pr(git_repo, base_branch="main")\n+     assert report.git_info.is_git_repo is True`,
    },
    {
      path: 'src/repopilot/cli.py',
      changeType: 'modified',
      affectedArea: 'Application Source',
      statusLabel: 'committed',
      diffSnippet: `@@ -165,6 +165,12 @@\n+ @app.command(name="pr-check")\n+ def pr_check(path: Path = typer.Argument(Path(".")), base: str = "main"): ...`,
    },
    {
      path: 'src/repopilot/models.py',
      changeType: 'modified',
      affectedArea: 'Application Source',
      statusLabel: 'committed',
      diffSnippet: `@@ -280,12 +280,24 @@\n+ @dataclass\n+ class PRCheckReport:\n+     git_info: GitBranchInfo\n+     branch_changes: list[FileChange]`,
    },
    {
      path: 'src/repopilot/report.py',
      changeType: 'modified',
      affectedArea: 'Application Source',
      statusLabel: 'committed',
      diffSnippet: `@@ -340,10 +340,30 @@\n+ def render_pr_check_report(report: PRCheckReport, console: Console | None = None) -> None:\n+     # Formats Rich terminal tables for PR diff`,
    },
  ],
  summary: {
    total: 5,
    added: 2,
    modified: 3,
    deleted: 0,
    renamed: 0,
  },
  affectedAreas: [
    'Application Source',
    'Test Suite',
  ],
  testAnalysis: {
    framework: 'pytest',
    suggestedCommand: 'pytest tests/test_pr_check.py tests/test_cli.py',
    mappings: [
      {
        changedFile: 'src/repopilot/pr_check.py',
        relatedTests: ['tests/test_pr_check.py'],
        hasPotentialGap: false,
        note: 'Matching test file found based on naming convention.',
      },
      {
        changedFile: 'tests/test_pr_check.py',
        relatedTests: ['tests/test_pr_check.py'],
        hasPotentialGap: false,
        note: 'Test file itself was modified.',
      },
      {
        changedFile: 'src/repopilot/cli.py',
        relatedTests: ['tests/test_cli.py'],
        hasPotentialGap: false,
        note: 'Matching test file found based on naming convention.',
      },
      {
        changedFile: 'src/repopilot/models.py',
        relatedTests: [],
        hasPotentialGap: true,
        note: 'Potential gap: No direct test file matching test_models.py found (models covered indirectly).',
        generatedTestPreview: `def test_models_pr_check_serialization():\n    report = PRCheckReport(...)\n    data = report.to_dict()\n    assert "git_info" in data`,
      },
      {
        changedFile: 'src/repopilot/report.py',
        relatedTests: [],
        hasPotentialGap: true,
        note: 'Potential gap: No direct test file matching test_report.py found (formatting covered indirectly).',
        generatedTestPreview: `def test_render_pr_check_report_mock():\n    console = MagicMock()\n    render_pr_check_report(report, console=console)\n    assert console.print.called`,
      },
    ],
    potentialGapsCount: 2,
    testsExecuted: false,
  },
  warnings: [
    'Working tree has uncommitted changes (0 staged, 1 unstaged, 1 untracked). These are not included in the committed branch comparison.',
    'Found 2 code file(s) with potential test coverage gaps (no direct test file detected).',
  ],
};

// --- AI Copilot Knowledge Base & Preloaded Responses ---
export const DEMO_AI_CHAT_HISTORY: AIChatMessage[] = [
  {
    id: 'msg-1',
    role: 'assistant',
    content: "👋 Hi! I'm RepoPilot AI Copilot. I analyze repository architecture, explain code, and generate unit tests for unverified files. How can I help you explore this repository?",
    timestamp: '10:00 AM',
  },
  {
    id: 'msg-2',
    role: 'user',
    content: 'Can you explain the high-level architecture of RepoPilot and how its three commands work?',
    timestamp: '10:01 AM',
  },
  {
    id: 'msg-3',
    role: 'assistant',
    content: `**RepoPilot** is built around a strictly read-only 3-phase inspection lifecycle:

1. **Repository Doctor (\`repopilot doctor\`)**: Uses \`scanner.py\` to detect whether the project is Python, Node.js, or both. In \`diagnostics.py\`, it verifies runtime binaries (\`git\`, \`python3\`, \`node\`, \`npm\`) using subprocess timeouts and generates deterministic onboarding steps.
2. **Repository Explorer (\`repopilot explore\`)**: Traverses directory structures with depth constraints (\`--depth\`), detects framework manifests, and analyzes starting points based on confidence heuristics.
3. **PR Compass (\`repopilot pr-check\`)**: Executes read-only Git commands (\`rev-parse\`, \`diff\`, \`status --porcelain\`) to compute committed differences versus \`main\`, isolates uncommitted working tree edits, and matches modified code files against test file naming patterns.`,
    timestamp: '10:01 AM',
    fileReference: 'src/repopilot/cli.py',
  },
];

export const DEMO_AI_GENERATED_TESTS: Record<string, AIGeneratedTest> = {
  'src/repopilot/models.py': {
    targetFile: 'src/repopilot/models.py',
    suggestedPath: 'tests/test_models.py',
    framework: 'pytest',
    rationale: 'models.py defines dataclasses for diagnostic reports, file checks, and PR diffs. A dedicated test ensures all to_dict() methods produce JSON-serializable primitives.',
    testCasesCovered: [
      'test_file_check_to_dict_serializes_status_enum',
      'test_pr_check_report_to_dict_structure',
      'test_repository_scan_default_factory_immutability',
    ],
    code: `"""Unit tests for RepoPilot data models and serialization."""
from repopilot.models import (
    CheckStatus,
    FileCheck,
    GitBranchInfo,
    PRCheckReport,
    UncommittedStatus,
    TestAnalysis,
)

def test_file_check_to_dict():
    fc = FileCheck(
        name="pyproject.toml",
        category="Python",
        status=CheckStatus.FOUND,
        description="Build spec",
    )
    d = fc.to_dict()
    assert d["name"] == "pyproject.toml"
    assert d["status"] == "FOUND"

def test_pr_check_report_to_dict():
    report = PRCheckReport(
        git_info=GitBranchInfo(is_git_repo=True, has_commits=True),
        uncommitted=UncommittedStatus(),
        branch_changes=[],
        summary={"total": 0, "added": 0, "modified": 0, "deleted": 0, "renamed": 0},
        affected_areas=[],
        testAnalysis=TestAnalysis(framework="pytest", mappings=[], potential_gaps_count=0, tests_executed=False),
        warnings=[],
    )
    data = report.to_dict()
    assert data["git_info"]["is_git_repo"] is True
    assert isinstance(data["summary"]["total"], int)`,
  },
  'src/repopilot/report.py': {
    targetFile: 'src/repopilot/report.py',
    suggestedPath: 'tests/test_report.py',
    framework: 'pytest',
    rationale: 'report.py handles Rich console formatting and render_json serialization. Tests verify that terminal panels and JSON outputs execute without unhandled exceptions.',
    testCasesCovered: [
      'test_render_report_with_mock_console',
      'test_render_pr_check_report_uncommitted_warning',
      'test_render_json_valid_json_string',
    ],
    code: `"""Unit tests for Rich terminal reporting and JSON rendering."""
import json
from unittest.mock import MagicMock
from repopilot.report import render_json, render_report
from repopilot.models import DiagnosticReport, RepositoryScan

def test_render_json_valid_string():
    scan = RepositoryScan(target_path=".", resolved_path="/tmp")
    rep = DiagnosticReport(scan=scan, tools=[], next_steps=["Step 1"])
    out = render_json(rep)
    parsed = json.loads(out)
    assert parsed["scan"]["target_path"] == "."
    assert parsed["next_steps"] == ["Step 1"]`,
  },
};

export const DEMO_AI_PR_REVIEW: AIPRReview = {
  summary: 'Introduces Milestone 3 (PR Compass) and Milestone 4 (CI/CD, Packaging, and Quality Hardening). Adds pre-PR Git branch comparison, test coverage gap detection, GitHub Actions CI workflow, and full documentation.',
  riskLevel: 'low',
  impactAssessment: 'Read-only CLI extension. Does not alter existing doctor or explore functionality. No breaking changes to existing data models or APIs.',
  keyChanges: [
    'Added repopilot.pr_check engine with Git subprocess handling with timeouts.',
    'Added tests/test_pr_check.py with 15+ comprehensive unit & integration tests.',
    'Hardened JSON error handlers using json.dumps across all CLI commands.',
    'Added GitHub Actions CI matrix for Python 3.12, 3.13, 3.14 across Ubuntu and macOS.',
  ],
  suggestedReviewFocus: [
    'Verify that core.quotepath=false is preserved for foreign Unicode paths in Git.',
    'Review timeout handling on slow Git repositories.',
    'Confirm that uncommitted changes are kept strictly separate from committed branch diffs.',
  ],
  generatedMarkdownPR: `## Description
This PR implements **PR Compass** and **Milestone 4: Production Readiness** for RepoPilot.

### What Changed
- Added \`repopilot pr-check\` command comparing local feature branches against \`main\`
- Added heuristic test discovery and test coverage gap detection
- Added GitHub Actions CI workflow (\`.github/workflows/ci.yml\`)
- Created \`CONTRIBUTING.md\` and overhauled \`README.md\`

### Safety & Compatibility
- Verified read-only execution: no Git commits, resets, or stash actions
- Tested across Python 3.12, 3.13, 3.14
- 67/67 tests passing in test suite`,
};

// --- Terminal Preset Outputs ---
export const TERMINAL_OUTPUTS: Record<string, string> = {
  'repopilot doctor .': `╭────────────────── RepoPilot Doctor — Repository Diagnostics ─────────────────╮
│ Target Repository: /Users/apple12390/repopilot                               │
│ Detected Type: Python Project                                                │
╰──────────────────────────────────────────────────────────────────────────────╯
                           Common Project Files Audit                           
╭────────────────────┬────────────────────────┬──────────────────┬─────────────╮
│ Category           │ File / Directory       │ Status           │ Description │
├────────────────────┼────────────────────────┼──────────────────┼─────────────┤
│ General            │ README.md              │ ✔ Found          │ Repository  │
│ General            │ .gitignore             │ ✔ Found          │ Git ignore  │
│ General            │ .github/workflows/     │ ✔ Found          │ GitHub CI   │
│ Python             │ pyproject.toml         │ ✔ Found          │ PEP 518/621 │
│ Python             │ requirements.txt       │ ✘ Missing        │ Pip deps    │
╰────────────────────┴────────────────────────┴──────────────────┴─────────────╯
                       Development Environment Tools                        
╭──────────────┬────────────────────┬──────────────────┬───────────────────╮
│ Tool         │ Command            │ Status           │ Version / Details │
├──────────────┼────────────────────┼──────────────────┼───────────────────┤
│ Git          │ git --version      │ ✔ Available      │ 2.50.1            │
│ Python       │ python3 --version  │ ✔ Available      │ 3.14.2            │
│ Node.js      │ node --version     │ ✔ Available      │ v24.20.0          │
│ npm          │ npm --version      │ ✔ Available      │ 11.19.0           │
╰──────────────┴────────────────────┴──────────────────┴───────────────────╯
╭──────────────────────────── Suggested Next Steps ────────────────────────────╮
│ 1. Create and activate a virtual environment, then install editable package: │
│     python3 -m venv .venv && source .venv/bin/activate && pip install -e .   │
│ 2. Run pytest test suite: pytest -v                                          │
╰──────────────────────────────────────────────────────────────────────────────╯
Safety note: RepoPilot inspected files and environment tools in read-only mode.`,

  'repopilot explore . --depth 2': `╭────────────────────── Repository Structure Overview ─────────────────────────╮
│ Component              │ Identified Elements                                 │
├────────────────────────┼─────────────────────────────────────────────────────┤
│ Source Directories     │ src/, frontend/src/                                 │
│ Test Directories       │ tests/                                              │
│ Documentation          │ README.md, CONTRIBUTING.md, LICENSE                 │
│ Likely Entry Points    │ repopilot.cli:app (CLI script: 'repopilot')         │
│ Key Config Files       │ pyproject.toml, .gitignore, LICENSE                 │
│ Recognized Frameworks  │ Typer (CLI framework), pytest (test framework)      │
╰────────────────────────┴─────────────────────────────────────────────────────╯
                   Suggested Starting Points for Exploration                    
╭──────────────────────────┬──────────────────┬────────────────────────────────╮
│ File / Path              │ Confidence       │ Why to Inspect First           │
├──────────────────────────┼──────────────────┼────────────────────────────────┤
│ README.md                │ High             │ Primary project overview       │
│ pyproject.toml           │ High             │ Dependencies & packaging spec  │
│ repopilot.cli:app        │ High             │ Application entry point        │
╰──────────────────────────┴──────────────────┴────────────────────────────────╯
╭───────────────────────── Repository Directory Tree ──────────────────────────╮
│ 📁 repopilot/                                                                │
│ ├── 📁 .github/                                                              │
│ │   └── 📁 workflows/                                                        │
│ ├── 📁 frontend/                                                             │
│ │   ├── 📁 src/                                                              │
│ │   └── 📄 package.json                                                      │
│ ├── 📁 src/                                                                  │
│ │   └── 📁 repopilot/                                                        │
│ ├── 📁 tests/                                                                │
│ ├── 📄 pyproject.toml                                                        │
│ └── 📄 README.md                                                             │
╰──────────────────────────────────────────────────────────────────────────────╯`,

  'repopilot pr-check --base main': `╭────────────── RepoPilot PR Compass — Pre-PR Diagnostic Report ───────────────╮
│ Current Branch: feature/pr-compass                                           │
│ Base Branch: main (origin/main)                                              │
│ Comparison Range: origin/main...HEAD                                         │
│ Working Tree Status: ⚠ Uncommitted Changes in Working Tree                   │
│ Committed Changes: 5 files changed (+2 added, ~3 modified, -0 deleted)       │
╰──────────────────────────────────────────────────────────────────────────────╯
                     Committed Branch Changes (vs 'main')                      
╭──────────┬────────────────────────────┬────────────────────────┬─────────────╮
│ Type     │ File Path                  │ Affected Area          │ Details     │
├──────────┼────────────────────────────┼────────────────────────┼─────────────┤
│ Added    │ src/repopilot/pr_check.py  │ Application Source     │ New file    │
│ Added    │ tests/test_pr_check.py     │ Test Suite             │ New file    │
│ Modified │ src/repopilot/cli.py       │ Application Source     │ Modified    │
│ Modified │ src/repopilot/models.py    │ Application Source     │ Modified    │
│ Modified │ src/repopilot/report.py    │ Application Source     │ Modified    │
╰──────────┴────────────────────────────┴────────────────────────┴─────────────╯
                        Uncommitted Working Tree Changes                        
╭────────────────┬──────────┬──────────────────────────────────────────────────╮
│ Category       │ Count    │ Files                                            │
├────────────────┼──────────┼──────────────────────────────────────────────────┤
│ Unstaged       │ 1        │ README.md                                        │
│ Untracked      │ 1        │ frontend/src/scratch.ts                          │
╰────────────────┴──────────┴──────────────────────────────────────────────────╯
Note: Uncommitted changes are NOT part of the committed PR comparison.

                     Test Coverage & Potential Gap Analysis                     
╭───────────────────────────────┬─────────────────┬───────────────────────────┬╮
│ Changed File                  │ Test Status     │ Related Test Files        ││
├───────────────────────────────┼─────────────────┼───────────────────────────┼┤
│ src/repopilot/pr_check.py     │ ✔ Test Found    │ tests/test_pr_check.py    ││
│ tests/test_pr_check.py        │ Test File       │ tests/test_pr_check.py    ││
│ src/repopilot/cli.py          │ ✔ Test Found    │ tests/test_cli.py         ││
│ src/repopilot/models.py       │ ⚠ Potential Gap │ None detected             ││
│ src/repopilot/report.py       │ ⚠ Potential Gap │ None detected             ││
╰───────────────────────────────┴─────────────────┴───────────────────────────┴╯
╭───────────────────── Test Verification Recommendations ──────────────────────╮
│ Detected Test Framework: pytest                                              │
│ Suggested Test Command: pytest tests/test_pr_check.py tests/test_cli.py      │
╰──────────────────────────────────────────────────────────────────────────────╯
Safety note: RepoPilot operates in read-only mode. No Git state was altered.`,
};
