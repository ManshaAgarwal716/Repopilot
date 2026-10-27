# RepoPilot 🧭

[![Python Versions](https://img.shields.io/badge/python-3.12%20%7C%203.13%20%7C%203.14-blue.svg)](pyproject.toml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Safety: Read--Only](https://img.shields.io/badge/Safety-Strictly%20Read--Only-green.svg)](#safety-guarantees)

**RepoPilot** is an open-source, local-first developer CLI tool that helps engineers understand unfamiliar codebases, audit tool prerequisites, explore repository architecture, and verify Git branch changes before submitting Pull Requests.

---

## ⚡ 60-Second Overview

When onboarding to an unfamiliar project or preparing a code submission, developers typically face three hurdles:
1. **"Will this run locally?"** Missing runtime prerequisites, incorrect package managers, or undiscovered config files cause setup friction.
2. **"Where do I begin reading?"** Large directory trees obscure the actual entry points, framework choices, and architectural roles of config files.
3. **"Are my changes ready for a PR?"** Commits may introduce untested code files or leave uncommitted modifications accidentally untracked.

RepoPilot solves these with three dedicated, completely safe, read-only commands:

| Command | Purpose | What It Delivers |
| :--- | :--- | :--- |
| **`repopilot doctor`** | **Environment Diagnostics** | Detects project type (Python, Node.js, full-stack), audits project manifests, verifies local tool availability (Git, Python, Node, npm), and provides tailored setup next steps. |
| **`repopilot explore`** | **Codebase Exploration** | Renders depth-limited directory trees, explains key configuration files, detects recognized frameworks, and ranks high-confidence starting points. |
| **`repopilot pr-check`** | **Pre-PR Compass** | Compares your local branch commits against `main` (or a custom `--base`), categorizes affected functional areas, discovers matching test files, and flags potential test coverage gaps. |

---

## Safety Guarantees

RepoPilot is engineered for trust and safety:
- **Strictly Read-Only**: Never alters, writes, commits, resets, stashes, or pushes Git state or local files.
- **Zero Script Execution**: Never executes repository scripts, setup scripts (`setup.py`), build hooks, or package managers automatically.
- **Explicit Test Non-Execution**: Discovers tests and suggests verification commands, but never runs test suites autonomously.
- **Subprocess Safety**: All subprocess invocations use explicit argument lists and strict timeouts—never `shell=True`.
- **Credential Privacy**: Never reads or prints `.env` secrets, private keys, or credentials.
- **Symlink Protection**: Does not traverse cyclic symlinks (`follow_symlinks=False`).
- **100% Local & Offline**: No cloud APIs, no external telemetry, and no AI keys required.

---

## Installation

### Prerequisites

- **Python**: 3.12 or newer (supported on Python 3.12, 3.13, and 3.14)
- **Git**: Installed and accessible in your system `PATH`
- **Supported Operating Systems**: macOS, Linux, and Windows

### Quick Install from Source

```bash
# 1. Clone the repository
git clone https://github.com/ManshaAgarwal716/Repopilot.git
cd Repopilot

# 2. Create and activate a clean virtual environment
python3 -m venv .venv
source .venv/bin/activate

# 3. Install RepoPilot
pip install .
```

For development (including `pytest` and `ruff`):

```bash
pip install -e ".[dev]"
```

Verify your installation:

```bash
repopilot --help
repopilot --version
```

---

## Quick-Start Usage

### 1. Pre-PR Git Change Verification (`repopilot pr-check`)

Run PR Compass to audit your branch changes before opening a Pull Request:

```bash
# Inspect current branch changes relative to 'main'
repopilot pr-check

# Compare against a different base branch (e.g. 'develop')
repopilot pr-check --base develop

# Run on a specific repository path
repopilot pr-check /path/to/project --base main
```

#### Example Output:

```text
╭────────────── RepoPilot PR Compass — Pre-PR Diagnostic Report ───────────────╮
│ Current Branch: feature/billing-service                                      │
│ Base Branch: main (origin/main)                                              │
│ Comparison Range: origin/main...HEAD                                         │
│ Working Tree Status: ⚠ Uncommitted Changes in Working Tree                   │
│ Committed Changes: 2 files changed (+2 added, ~0 modified, -0 deleted, 0     │
│ renamed)                                                                     │
╰──────────────────────────────────────────────────────────────────────────────╯
                     Committed Branch Changes (vs 'main')                      
╭──────────┬────────────────────────────┬────────────────────────┬─────────────╮
│ Type     │ File Path                  │ Affected Area          │ Details     │
├──────────┼────────────────────────────┼────────────────────────┼─────────────┤
│ Added    │ src/services/billing.py    │ Application Source     │ New file in │
│          │                            │                        │ branch      │
│ Added    │ tests/test_billing.py      │ Test Suite             │ New file in │
│          │                            │                        │ branch      │
╰──────────┴────────────────────────────┴────────────────────────┴─────────────╯
                        Uncommitted Working Tree Changes                        
╭────────────────┬──────────┬──────────────────────────────────────────────────╮
│ Category       │ Count    │ Files                                            │
├────────────────┼──────────┼──────────────────────────────────────────────────┤
│ Unstaged       │ 1        │ README.md                                        │
╰────────────────┴──────────┴──────────────────────────────────────────────────╯
Note: Uncommitted changes are present in your workspace but are NOT part of the 
committed PR comparison.

                     Test Coverage & Potential Gap Analysis                     
╭───────────────────────────────┬─────────────────┬───────────────────────────┬╮
│ Changed File                  │ Test Status     │ Related Test Files        ││
├───────────────────────────────┼─────────────────┼───────────────────────────┼┤
│ src/services/billing.py       │ ✔ Test Found    │ tests/test_billing.py     ││
│ tests/test_billing.py         │ Test File       │ tests/test_billing.py     ││
╰───────────────────────────────┴─────────────────┴───────────────────────────┴╯
╭───────────────────── Test Verification Recommendations ──────────────────────╮
│ Detected Test Framework: pytest                                              │
│ Suggested Test Command: pytest tests/test_billing.py                         │
│ Tests Executed by RepoPilot: False (RepoPilot is read-only and does not run  │
│ test suites automatically)                                                   │
╰──────────────────────────────────────────────────────────────────────────────╯
```

---

### 2. Codebase Exploration (`repopilot explore`)

Explore repository structure, locate entry points, and view file trees:

```bash
# Explore current directory (default recursion depth = 2)
repopilot explore .

# Customize recursion depth and maximum tree entries
repopilot explore /path/to/project --depth 3 --max-entries 150
```

#### Example Output:

```text
╭────────────────────── Repository Structure Overview ─────────────────────────╮
│ Component              │ Identified Elements                                 │
├────────────────────────┼─────────────────────────────────────────────────────┤
│ Source Directories     │ src/                                                │
│ Test Directories       │ tests/                                              │
│ Documentation          │ README.md, CONTRIBUTING.md                          │
│ Likely Entry Points    │ repopilot.cli:app (CLI script: 'repopilot')         │
│ Key Config Files       │ pyproject.toml, .gitignore, LICENSE                 │
│ Recognized Frameworks  │ Typer (CLI framework), pytest (test framework)      │
╰────────────────────────┴─────────────────────────────────────────────────────╯
                   Suggested Starting Points for Exploration                    
╭──────────────────────────┬──────────────────┬────────────────────────────────╮
│ File / Path              │ Confidence       │ Why to Inspect First           │
├──────────────────────────┼──────────────────┼────────────────────────────────┤
│ README.md                │ High             │ Primary project overview and   │
│                          │                  │ architectural context.         │
│ pyproject.toml           │ High             │ Defines project metadata,      │
│                          │                  │ dependencies, and CLI scripts. │
│ repopilot.cli:app        │ High             │ Primary application entry      │
│                          │                  │ point where execution begins.  │
╰──────────────────────────┴──────────────────┴────────────────────────────────╯
╭───────────────────────── Repository Directory Tree ──────────────────────────╮
│ 📁 repopilot/                                                                │
│ ├── 📁 src/                                                                  │
│ │   └── 📁 repopilot/                                                        │
│ ├── 📁 tests/                                                                │
│ ├── 📄 .gitignore                                                            │
│ ├── 📄 CONTRIBUTING.md                                                       │
│ ├── 📄 LICENSE                                                               │
│ ├── 📄 pyproject.toml                                                        │
│ └── 📄 README.md                                                             │
╰──────────────────────────────────────────────────────────────────────────────╯
```

---

### 3. Environment Diagnostics (`repopilot doctor`)

Scan a repository to verify required tools and configuration files:

```bash
# Scan current repository
repopilot doctor .
```

#### Example Output:

```text
╭────────────────── RepoPilot Doctor — Repository Diagnostics ─────────────────╮
│ Target Repository: /Users/username/repopilot                                 │
│ Detected Type: Python Project                                                │
╰──────────────────────────────────────────────────────────────────────────────╯
                           Common Project Files Audit                           
╭────────────────────┬────────────────────────┬──────────────────┬─────────────╮
│ Category           │ File / Directory       │ Status           │ Description │
├────────────────────┼────────────────────────┼──────────────────┼─────────────┤
│ General            │ README.md              │ ✔ Found          │ Repository  │
│                    │                        │                  │ docs        │
│ General            │ .gitignore             │ ✔ Found          │ Git ignore  │
│ Python             │ pyproject.toml         │ ✔ Found          │ PEP 518/621 │
│ Python             │ requirements.txt       │ ✘ Missing        │ Pip deps    │
╰────────────────────┴────────────────────────┴──────────────────┴─────────────╯
                       Development Environment Tools                        
╭──────────────┬────────────────────┬──────────────────┬───────────────────╮
│ Tool         │ Command            │ Status           │ Version / Details │
├──────────────┼────────────────────┼──────────────────┼───────────────────┤
│ Git          │ git --version      │ ✔ Available      │ 2.50.1            │
│ Python       │ python3 --version  │ ✔ Available      │ 3.14.2            │
╰──────────────┴────────────────────┴──────────────────┴───────────────────╯
╭──────────────────────────── Suggested Next Steps ────────────────────────────╮
│ 1. Create and activate a virtual environment, then install editable package: │
│     python3 -m venv .venv && source .venv/bin/activate && pip install -e .   │
│ 2. Review README.md for setup instructions and run commands.                 │
╰──────────────────────────────────────────────────────────────────────────────╯
```

---

## Automation & JSON Output

Every command supports `--json` for integration with scripts, CI pipelines, and IDE extensions:

```bash
repopilot doctor . --json
repopilot explore . --json
repopilot pr-check --base main --json
```

All JSON payloads output strictly valid, machine-readable JSON matching the internal dataclass schemas.

---

## Heuristic Limitations

To maintain predictable behavior and user safety:
- **Naming Conventions**: Test discovery relies on standard naming conventions (`test_*.py`, `*_test.py`, `*.test.js`, `*.spec.ts`, etc.). Files tested exclusively through external end-to-end suites or unconventional paths may be flagged as potential gaps for human review.
- **Inferred Starting Points**: Recommended entry points are inferred from metadata manifests and standard directory structures.
- **No Test Execution**: Suggested test commands are provided for developer execution; RepoPilot never invokes test runners directly.

---

## Development & Testing

### Running Tests

Run the full pytest suite (67 tests):

```bash
pytest -v
```

### Code Style & Linting

RepoPilot uses Ruff for fast, consistent linting:

```bash
ruff check .
```

### Continuous Integration (CI)

Our GitHub Actions workflow (`.github/workflows/ci.yml`) automatically tests:
- **Operating Systems**: `ubuntu-latest`, `macos-latest`
- **Python Matrix**: `3.12`, `3.13`, `3.14`
- **Quality Checks**: Ruff linting, full pytest test suite, and CLI command execution.

---

## Contributing

We welcome contributions! Please review [CONTRIBUTING.md](CONTRIBUTING.md) for details on our development workflow, coding standards, and PR guidelines.

---

## License

This project is licensed under the [MIT License](LICENSE).
