import { DoctorReport, ExplorerReport, PRCompassReport, RepositoryItem } from '../types';

export const DEMO_REPOSITORIES: RepositoryItem[] = [
  {
    id: 'demo-repopilot',
    name: 'repopilot',
    path: '/Users/developer/repopilot',
    isDemo: true,
    projectType: 'python',
    lastOpened: 'Just now',
    branch: 'feature/pr-compass',
  },
  {
    id: 'demo-web-store',
    name: 'ecommerce-frontend',
    path: '/Users/developer/projects/ecommerce-frontend',
    isDemo: true,
    projectType: 'nodejs',
    lastOpened: 'Yesterday',
    branch: 'main',
  },
  {
    id: 'demo-fullstack-crm',
    name: 'crm-platform',
    path: '/Users/developer/work/crm-platform',
    isDemo: true,
    projectType: 'both',
    lastOpened: '3 days ago',
    branch: 'develop',
  },
];

export const DEMO_DOCTOR_REPORT: DoctorReport = {
  targetPath: '/Users/developer/repopilot',
  resolvedPath: '/Users/developer/repopilot',
  category: 'python',
  projectTypes: ['Python (PEP 518/621 pyproject.toml)'],
  fileChecks: [
    {
      name: 'README.md',
      category: 'General',
      status: 'FOUND',
      description: 'Repository documentation and onboarding instructions',
      isDirectory: false,
    },
    {
      name: '.gitignore',
      category: 'General',
      status: 'FOUND',
      description: 'Git ignore patterns for build/cache artifacts',
      isDirectory: false,
    },
    {
      name: '.github/workflows',
      category: 'General',
      status: 'FOUND',
      description: 'GitHub Actions CI/CD workflows directory',
      isDirectory: true,
    },
    {
      name: 'pyproject.toml',
      category: 'Python',
      status: 'FOUND',
      description: 'Python project configuration and packaging (PEP 518/621)',
      isDirectory: false,
    },
    {
      name: 'requirements.txt',
      category: 'Python',
      status: 'MISSING',
      description: 'Standard pip requirements list (pyproject.toml used instead)',
      isDirectory: false,
      details: 'Not required when dependencies are declared in pyproject.toml',
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
      name: 'setup.py',
      category: 'Python (Extended)',
      status: 'MISSING',
      description: 'Legacy Python setup script',
      isDirectory: false,
    },
    {
      name: 'package.json',
      category: 'Node.js',
      status: 'MISSING',
      description: 'Node.js package manifest and dependency tree',
      isDirectory: false,
    },
    {
      name: 'tsconfig.json',
      category: 'Node.js (Extended)',
      status: 'NOT_CHECKED',
      description: 'TypeScript compiler configuration (Node stack not detected)',
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
    'Create and activate a virtual environment, then install editable package:\npython3 -m venv .venv && source .venv/bin/activate && pip install -e ".[dev]"',
    'Run the complete test suite to verify local environment integrity:\npytest -v',
    'Inspect .github/workflows/ci.yml to see automated CI checks across Python 3.12, 3.13, and 3.14.',
    'Refer to CONTRIBUTING.md for coding guidelines and pre-PR verification steps.',
  ],
};

export const DEMO_EXPLORER_REPORT: ExplorerReport = {
  overview: {
    sourceDirs: ['src/'],
    testDirs: ['tests/'],
    docFiles: ['README.md', 'CONTRIBUTING.md', 'LICENSE'],
    likelyEntryPoints: [
      'repopilot.cli:app (CLI script: repopilot)',
      'src/repopilot/cli.py (Typer application definition)',
    ],
    recognizedFrameworks: [
      'Typer (CLI application framework)',
      'Rich (Terminal formatting & syntax highlighting)',
      'pytest (Test suite runner)',
      'Hatchling (PEP 517 build backend)',
    ],
    keyConfigFiles: [
      'pyproject.toml',
      '.gitignore',
      '.github/workflows/ci.yml',
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
              },
            ],
          },
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
              { name: '__init__.py', path: 'src/repopilot/__init__.py', isDirectory: false, sizeBytes: 128 },
              { name: 'cli.py', path: 'src/repopilot/cli.py', isDirectory: false, sizeBytes: 6310 },
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
          { name: '__init__.py', path: 'tests/__init__.py', isDirectory: false, sizeBytes: 0 },
          { name: 'test_cli.py', path: 'tests/test_cli.py', isDirectory: false, sizeBytes: 7420 },
          { name: 'test_diagnostics.py', path: 'tests/test_diagnostics.py', isDirectory: false, sizeBytes: 8400 },
          { name: 'test_explorer.py', path: 'tests/test_explorer.py', isDirectory: false, sizeBytes: 10400 },
          { name: 'test_pr_check.py', path: 'tests/test_pr_check.py', isDirectory: false, sizeBytes: 13200 },
          { name: 'test_scanner.py', path: 'tests/test_scanner.py', isDirectory: false, sizeBytes: 9100 },
        ],
      },
      { name: '.gitignore', path: '.gitignore', isDirectory: false, sizeBytes: 578 },
      { name: 'CONTRIBUTING.md', path: 'CONTRIBUTING.md', isDirectory: false, sizeBytes: 3100 },
      { name: 'LICENSE', path: 'LICENSE', isDirectory: false, sizeBytes: 1079 },
      { name: 'pyproject.toml', path: 'pyproject.toml', isDirectory: false, sizeBytes: 1312 },
      { name: 'README.md', path: 'README.md', isDirectory: false, sizeBytes: 15400 },
    ],
  },
  totalEntries: 22,
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
      path: 'tests/',
      confidence: 'medium',
      rationale: '67 unit & integration tests demonstrate expected module behavior, edge cases, and CLI invocations.',
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
    },
    {
      path: '.github/workflows/ci.yml',
      role: 'CI/CD Automation',
      description: 'Automated GitHub Actions workflow running Ruff linting and pytest on Python 3.12, 3.13, and 3.14.',
    },
    {
      path: 'CONTRIBUTING.md',
      role: 'Documentation',
      description: 'Guidelines, setup instructions, and code standards for project contributors.',
    },
    {
      path: 'README.md',
      role: 'Documentation',
      description: 'Primary project documentation, usage guides, architecture overview, and onboarding.',
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
    },
    {
      path: 'tests/test_pr_check.py',
      changeType: 'added',
      affectedArea: 'Test Suite',
      statusLabel: 'committed',
    },
    {
      path: 'src/repopilot/cli.py',
      changeType: 'modified',
      affectedArea: 'Application Source',
      statusLabel: 'committed',
    },
    {
      path: 'src/repopilot/models.py',
      changeType: 'modified',
      affectedArea: 'Application Source',
      statusLabel: 'committed',
    },
    {
      path: 'src/repopilot/report.py',
      changeType: 'modified',
      affectedArea: 'Application Source',
      statusLabel: 'committed',
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
      },
      {
        changedFile: 'src/repopilot/report.py',
        relatedTests: [],
        hasPotentialGap: true,
        note: 'Potential gap: No direct test file matching test_report.py found (formatting covered indirectly).',
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
