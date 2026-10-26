# RepoPilot 🧭

**RepoPilot** is an open-source developer tool designed to help engineers quickly understand unfamiliar codebases and get them running locally with confidence.

This first milestone provides a **fast, reliable, and completely safe local repository scanner and diagnostics engine**. It inspects project configuration files, detects technology stacks, audits available developer tools, and generates concrete, actionable next steps for onboarding.

---

## Features

- **Safe Inspection**: Purely read-only inspection. Never modifies repository files, never executes repository scripts, never installs dependencies automatically, and never reads or prints `.env` files or credentials.
- **Project Stack Detection**: Automatically detects Python projects, Node.js projects, full-stack monorepos (both), or generic/unrecognized repositories.
- **Common Files Audit**:
  - **Python**: `pyproject.toml`, `requirements.txt`, `Pipfile`, `poetry.lock` (and secondary checks like `setup.py`, `Pipfile.lock`).
  - **Node.js**: `package.json`, `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock` (and secondary checks like `tsconfig.json`, `.npmrc`).
  - **General**: `README.md`, `.gitignore`, `.github/workflows/`.
  - **Clear Status Distinction**: Explicitly differentiates between files that are `✔ Found`, `✘ Missing`, or `○ Not checked`.
- **Environment Diagnostics**: Checks whether Git, Python, Node.js, and npm are installed locally with exact version detection and timeouts.
- **Actionable Next Steps**: Generates tailored next steps to get the repository running (e.g., virtual environment creation, package manager commands such as `poetry install`, `npm ci`, etc.).
- **Rich Terminal UI & JSON Mode**: Beautiful terminal tables and panels powered by Rich, plus a `--json` output flag for scripting and CI pipelines.

---

## Installation

### Prerequisites

- Python 3.12 or newer
- Git

### Installing from Source

```bash
git clone https://github.com/repopilot/repopilot.git
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
  doctor  Scan a local repository to detect project type, audit common files, check tool prerequisites, and suggest next steps.
```

### 2. Scan Current Directory

```bash
repopilot doctor .
```

Or simply:

```bash
repopilot doctor
```

### 3. Scan a Specific Repository Path

```bash
repopilot doctor /path/to/any/repo
```

### 4. Machine-Readable JSON Output

For automation, CI/CD checks, or editor integrations:

```bash
repopilot doctor /path/to/repo --json
```

---

## Development Setup

### 1. Clone & Setup Environment

```bash
git clone https://github.com/repopilot/repopilot.git
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
│       ├── cli.py              # Typer command-line interface
│       ├── diagnostics.py      # System tool checks & next-step generation
│       ├── models.py           # Data structures and enums
│       ├── report.py           # Rich terminal and JSON rendering
│       └── scanner.py          # Safe repository inspection engine
├── tests/
│   ├── __init__.py
│   ├── test_cli.py             # CLI command, error, and JSON integration tests
│   ├── test_diagnostics.py     # Tool detection and next-step recommendation tests
│   └── test_scanner.py         # Repository scanning, type detection, and safety tests
├── pyproject.toml              # PEP 621 build configuration with hatchling
├── .gitignore                  # Ignore rules for python, node, and build artifacts
├── LICENSE                     # MIT License
└── README.md                   # Documentation and onboarding guide
```

---

## Safety Guarantees

1. **Read-Only**: RepoPilot never writes, alters, creates, or deletes any files in the target repository.
2. **No Arbitrary Code Execution**: RepoPilot does not invoke repository scripts, package setup files (`setup.py`), or npm scripts.
3. **No Automatic Dependency Installation**: RepoPilot only suggests dependency commands; it never executes `pip install`, `npm install`, or similar commands automatically.
4. **Credential Privacy**: RepoPilot never reads or logs `.env` files, SSH keys, certificates, or tokens.
5. **No Deep Traversals**: Ignored directories such as `.git`, `node_modules`, `.venv`, and `build` are never recursed into.

---

## Limitations

As this is Milestone 1 (Local Repository Scanner):
- Scans are localized to the root project configuration and shallow entry points; deep mono-repo subproject dependency graphs are planned for a future milestone.
- Tool checks cover Git, Python, Node.js, and npm. Additional package managers (e.g. Docker, Rust, Go) will be expanded in upcoming releases.
- Only local repositories are inspected; remote GitHub URL inspection will be supported in future milestones.

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
