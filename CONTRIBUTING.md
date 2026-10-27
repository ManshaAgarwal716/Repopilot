# Contributing to RepoPilot

Thank you for your interest in contributing to **RepoPilot**! RepoPilot is an open-source, local-first developer tool designed to help developers safely inspect, explore, and verify codebases.

---

## Core Philosophy & Design Principles

Before contributing code, please keep our foundational principles in mind:

1. **Strictly Read-Only Safety**: RepoPilot must never modify, commit, reset, stash, or push repository files or Git state.
2. **No Arbitrary Code Execution**: RepoPilot must never execute repository scripts, install dependencies automatically, run test suites autonomously, or invoke build lifecycle hooks.
3. **Local Scope**: RepoPilot is a fast, offline CLI tool. We do not use remote AI APIs, autonomous agents, web scrapers, or cloud dashboards.
4. **Resilient Subprocess and File I/O**: All external tool checks (Git, Python, Node.js) must use argument lists (never `shell=True`), strict timeouts, and safe exception handlers. File traversals must honor ignore lists (`.git`, `node_modules`, `.venv`) and avoid following cyclic symlinks.
5. **Clear, Deterministic Output**: Terminal output uses Rich formatting; structured `--json` output must always be parseable, deterministic, and valid JSON.

---

## Development Setup

### 1. Prerequisites

- **Python**: Version 3.12 or newer (tested on 3.12, 3.13, and 3.14).
- **Git**: Installed and available in your `PATH`.

### 2. Fork and Clone

```bash
git clone https://github.com/ManshaAgarwal716/Repopilot.git
cd Repopilot
```

### 3. Create a Virtual Environment

```bash
python3 -m venv .venv
source .venv/bin/activate
```

On Windows:
```cmd
.venv\Scripts\activate
```

### 4. Install Dependencies

Install RepoPilot in editable mode with development dependencies (including `pytest` and `ruff`):

```bash
pip install -e ".[dev]"
```

Verify your installation:

```bash
repopilot --version
repopilot --help
```

---

## Quality Checks & Testing

We maintain high testing and code quality standards. All contributions must pass linting and the complete test suite.

### Running Linting & Formatting Checks

We use [Ruff](https://astral.sh/ruff) for fast, consistent linting:

```bash
ruff check .
```

To automatically format fixable issues:

```bash
ruff check --fix .
```

### Running the Test Suite

Run the full pytest suite:

```bash
pytest -v
```

### Writing Tests

- Add unit and integration tests under the `tests/` directory.
- Use pytest's built-in `tmp_path` fixture for creating temporary directories and files.
- For Git-related tests, initialize a temporary git repo within `tmp_path` and configure dummy user details (`user.name`, `user.email`).
- Ensure all tests run offline without external network dependencies.

---

## Pre-PR Verification with RepoPilot

You can use RepoPilot on itself to verify your branch changes before opening a Pull Request!

```bash
# Check branch diff against main and audit test coverage
repopilot pr-check --base main

# Verify explore command works
repopilot explore .

# Verify doctor diagnostics
repopilot doctor .
```

---

## Pull Request Process

1. Create a descriptive feature branch:
   ```bash
   git checkout -b feature/my-new-feature
   ```
2. Implement your changes following existing code conventions and type hints (`from __future__ import annotations`).
3. Ensure all tests and lint checks pass:
   ```bash
   ruff check .
   pytest -v
   ```
4. Commit your changes with clear, descriptive commit messages.
5. Push your feature branch to your fork and submit a Pull Request targeting the `main` branch.
6. Provide a concise summary of what was added or fixed, why the change is needed, and how it was tested.

---

## Code of Conduct

Please maintain a welcoming, respectful, and constructive environment for all contributors.
