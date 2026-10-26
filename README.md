# RepoPilot 🧭

**RepoPilot** is an open-source developer tool designed to help engineers quickly understand unfamiliar codebases and get them running locally with confidence.

RepoPilot currently provides:
1. **Repository Doctor (`repopilot doctor`)**: A fast, reliable, and completely safe local repository scanner and diagnostics engine. It inspects configuration files, detects technology stacks, audits system tool readiness, and generates tailored onboarding steps.
2. **Repository Explorer (`repopilot explore`)**: A structural exploration engine that visualizes directory trees up to configurable depth limits, explains the architectural roles of key configuration files, detects recognized frameworks, and suggests the best starting points for code exploration.

---

## Features

- **Safe Read-Only Inspection**: Operates exclusively in read-only mode. Never modifies repository files, never executes repository scripts, never installs packages automatically, and never reads or prints `.env` secrets, credentials, or private keys.
- **Repository Exploration & Visualization**:
  - **Limited-Depth File Tree**: Configurable directory tree traversal with sensible defaults (`--depth`, `--max-entries`), truncation notices, and deterministic sorting.
  - **No Symlink Loops**: Identifies symbolic links without following them, preventing cyclic traversals.
  - **Excluded Noise**: Automatically excludes `.git`, `node_modules`, `.venv`, `venv`, `dist`, `build`, `__pycache__`, and IDE directories.
- **Structural Architecture Overview**:
  - Discovers source directories (`src/`, `lib/`, `app/`), test suites (`tests/`), and documentation.
  - Highlights conventional execution entry points (`main.py`, `app.py`, CLI script definitions in `pyproject.toml`, `index.ts`).
  - Identifies recognized frameworks reliably from dependency manifests (e.g. FastAPI, Flask, Django, Typer, React, Next.js, Express, Vitest, Docker, Docker Compose).
- **Important Files Explained**: Provides evidence-based explanations for configuration files present in the repository (`pyproject.toml`, `package.json`, `Dockerfile`, `docker-compose.yml`, `tsconfig.json`, `Makefile`, etc.).
- **Suggested Starting Points**: Ranks where a developer should begin reading code with explicit confidence badges (`High`, `Medium`, `Low`).
- **Rich Terminal UI & JSON Mode**: Beautiful terminal tables, panels, and trees powered by Rich, plus a `--json` output flag for scripting, automated pipelines, and IDE plugins.

---

## Installation

### Prerequisites

- Python 3.12 or newer
- Git

### Installing from Source

```bash
git clone https://github.com/ManshaAgarwal716/Repopilot.git
cd repopilot
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
```

To verify the installation:

```bash
repopilot --help
```

---

## Usage

### 1. View Usage Instructions

```bash
repopilot --help
```

Output:
```
Usage: repopilot [OPTIONS] COMMAND [ARGS]...

  RepoPilot: Safe developer tool to inspect repositories, verify tooling, and get running locally.

Options:
  -v, --version  Show RepoPilot version and exit.
  --help         Show this message and exit.

Commands:
  doctor   Scan a local repository to detect project type, audit common files, check tool prerequisites, and suggest next steps.
  explore  Explore repository structure, visualize file tree, explain important files, and identify starting points.
```

---

### 2. Exploring a Codebase (`repopilot explore`)

#### Explore Current Directory
```bash
repopilot explore .
```

#### Explore a Specific Repository Path
```bash
repopilot explore /path/to/project
```

#### Adjust File Tree Depth
Specify directory recursion depth (default is 2):
```bash
repopilot explore /path/to/project --depth 3
```

#### Limit Displayed Tree Entries
Limit the maximum number of file tree entries (default is 200):
```bash
repopilot explore /path/to/project --max-entries 100
```

#### Machine-Readable JSON Output
```bash
repopilot explore /path/to/project --json
```

#### Example Terminal Output: `repopilot explore .`
```text
╭──────────── RepoPilot Explorer — Codebase Structure & Onboarding ────────────╮
│ Target Repository: /Users/developer/repopilot                                 │
│ Detected Type: Python Project                                                │
│ Tree Scope: 8 files, 3 directories (max depth: 2, entry limit: 200)          │
╰──────────────────────────────────────────────────────────────────────────────╯
                       Repository Structure Overview                       
╭────────────────────────┬────────────────────────────────────────────────╮
│ Component              │ Identified Elements                            │
├────────────────────────┼────────────────────────────────────────────────┤
│ Source Directories     │ src/                                           │
│ Test Directories       │ tests/                                         │
│ Documentation          │ None identified                                │
│ Likely Entry Points    │ repopilot.cli:app (CLI script: 'repopilot')    │
│ Key Config Files       │ .gitignore, LICENSE, pyproject.toml, README.md │
│ Recognized Frameworks  │ Typer (CLI framework), pytest (test framework) │
╰────────────────────────┴────────────────────────────────────────────────╯
                   Suggested Starting Points for Exploration                    
╭──────────────────────────┬──────────────────┬────────────────────────────────╮
│ File / Path              │ Confidence       │ Why to Inspect First           │
├──────────────────────────┼──────────────────┼────────────────────────────────┤
│ README.md                │ High             │ Primary project overview,      │
│                          │                  │ setup commands, and            │
│                          │                  │ architectural context.         │
│ pyproject.toml           │ High             │ Defines project metadata,      │
│                          │                  │ dependencies, build toolchain, │
│                          │                  │ and CLI scripts.               │
│ repopilot.cli:app        │ High             │ Likely application execution   │
│                          │                  │ entry point where program      │
│                          │                  │ initialization begins.         │
│ tests/                   │ Medium           │ Tests reveal expected module   │
│                          │                  │ behavior, input fixtures, and  │
│                          │                  │ public API usage patterns.     │
╰──────────────────────────┴──────────────────┴────────────────────────────────╯
Note: Suggestions are inferred from conventions; inspect files to confirm actual roles.

                       Important Project Files Explained                        
╭──────────────────────────┬────────────────────┬──────────────────────────────╮
│ File / Directory         │ Role               │ Description                  │
├──────────────────────────┼────────────────────┼──────────────────────────────┤
│ pyproject.toml           │ Build & Packaging  │ Python project               │
│                          │                    │ configuration, build         │
│                          │                    │ specification, and           │
│                          │                    │ dependency declarations.     │
│ README.md                │ Documentation      │ Primary project              │
│                          │                    │ documentation, usage guides, │
│                          │                    │ and onboarding.              │
│ LICENSE                  │ Legal              │ Software license terms.      │
│ .gitignore               │ Version Control    │ Git untracked patterns.      │
╰──────────────────────────┴────────────────────┴──────────────────────────────╯
╭───────────────────────── Repository Directory Tree ──────────────────────────╮
│ 📁 repopilot/ (/Users/developer/repopilot)                                    │
│ ├── 📁 src/                                                                  │
│ │   └── 📁 repopilot/                                                        │
│ ├── 📁 tests/                                                                │
│ │   ├── 📄 test_cli.py                                                       │
│ │   ├── 📄 test_diagnostics.py                                               │
│ │   ├── 📄 test_explorer.py                                                  │
│ │   └── 📄 test_scanner.py                                                   │
│ ├── 📄 .gitignore                                                            │
│ ├── 📄 LICENSE                                                               │
│ ├── 📄 pyproject.toml                                                        │
│ └── 📄 README.md                                                             │
╰──────────────────────────────────────────────────────────────────────────────╯
Safety note: RepoPilot inspected filenames and structure only. No repository scripts were executed and no secrets accessed.
```

---

### 3. Environment Diagnostics (`repopilot doctor`)

Scan a repository and check that required development tools (Git, Python, Node.js, npm) are installed on your machine:

```bash
repopilot doctor .
```

Or target another directory:

```bash
repopilot doctor /path/to/repo
```

To export diagnostic output in JSON format:

```bash
repopilot doctor /path/to/repo --json
```

---

## Development Setup

### 1. Clone & Setup Environment

```bash
git clone https://github.com/ManshaAgarwal716/Repopilot.git
cd repopilot

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install package in editable mode with development dependencies
pip install -e ".[dev]"
```

### 2. Running Tests

Run the full pytest suite:

```bash
pytest
```

Run tests with verbose output:

```bash
pytest -v
```

---

## Project Structure

```
repopilot/
├── src/
│   └── repopilot/
│       ├── __init__.py         # Package version and metadata
│       ├── cli.py              # Typer CLI application (doctor, explore)
│       ├── diagnostics.py      # System tool checks & next-step generation
│       ├── explorer.py         # Codebase explorer, tree builder & framework detector
│       ├── models.py           # Dataclasses and enums for scans and reports
│       ├── report.py           # Rich terminal and JSON rendering
│       └── scanner.py          # Safe repository inspection engine
├── tests/
│   ├── __init__.py
│   ├── test_cli.py             # CLI command, error, and JSON integration tests
│   ├── test_diagnostics.py     # Tool detection and next-step recommendation tests
│   ├── test_explorer.py        # Exploration, tree building, framework, and starting point tests
│   └── test_scanner.py         # Repository scanning, type detection, and safety tests
├── pyproject.toml              # PEP 621 build configuration with hatchling
├── .gitignore                  # Ignore rules for python, node, and build artifacts
├── LICENSE                     # MIT License
└── README.md                   # Documentation and onboarding guide
```

---

## Safety Guarantees

1. **Read-Only**: RepoPilot never writes, alters, creates, or deletes any files in the target repository.
2. **No Arbitrary Code Execution**: RepoPilot never invokes repository scripts, package setup files (`setup.py`), or npm lifecycle hooks.
3. **No Automatic Dependency Installation**: RepoPilot only suggests commands; it never executes `pip install`, `npm install`, or similar commands automatically.
4. **Credential Privacy**: RepoPilot never reads or logs `.env` files, SSH keys, certificates, or tokens.
5. **No Deep Traversals of Ignored Directories**: Large and sensitive directories (`.git`, `node_modules`, `.venv`, `build`) are never recursed into.
6. **No Symbolic Link Following**: Symbolic links are recorded with their target reference without following them, protecting against infinite filesystem recursion loops.

---

## Limitations of Heuristic-Based Analysis

- **Inferred Roles vs. Runtime Architecture**: Starting point suggestions and entry point detection rely on standard filename conventions and declared package script keys. They should be treated as informed suggestions rather than definitive architecture diagrams.
- **Framework Detection Boundary**: Frameworks are identified purely by safe parsing of top-level manifest files (`pyproject.toml`, `requirements.txt`, `package.json`, Docker files). Dynamically installed or unlisted internal modules will not be detected.
- **Tree Depth Limits**: Deeply nested mono-repo subpackages beyond the configured `--depth` will not be traversed unless `--depth` is increased.
- **Local Repositories Only**: Milestone 2 inspects local filesystem directories only; remote GitHub repository inspection will be addressed in future milestones.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository and create a feature branch (`git checkout -b feature/my-feature`).
2. Ensure Python 3.12+ compatibility and adhere to type hints.
3. Write unit tests using `pytest` and temporary directories (`tmp_path`).
4. Ensure all tests pass: `pytest`.
5. Open a pull request with a descriptive title and explanation of changes.

---

## License

This project is licensed under the [MIT License](LICENSE).
