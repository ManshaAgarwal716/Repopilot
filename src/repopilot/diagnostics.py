"""Environment diagnostics and next-step recommendations for RepoPilot.

Safely checks system tool availability using timeouts and strict error handling,
and produces actionable next steps based on the scan results.
"""

from __future__ import annotations

import re
import shutil
import subprocess
import sys
from typing import Final, Optional

from repopilot.models import (
    CheckStatus,
    DiagnosticReport,
    ProjectCategory,
    RepositoryScan,
    ToolStatus,
)

DEFAULT_TIMEOUT_SECONDS: Final[int] = 5


def _run_tool_command(command: list[str], timeout: int = DEFAULT_TIMEOUT_SECONDS) -> tuple[bool, Optional[str], Optional[str]]:
    """Safely executes a system tool version command.

    Args:
        command: List of command arguments, e.g. ["git", "--version"].
        timeout: Maximum seconds to wait before terminating.

    Returns:
        tuple[bool, Optional[str], Optional[str]]: (is_available, version_string, error_message)
    """
    executable = command[0]
    if shutil.which(executable) is None:
        return False, None, f"'{executable}' is not installed or not found in PATH"

    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=timeout,
            check=False,
        )
        if result.returncode == 0:
            output = result.stdout.strip() or result.stderr.strip()
            # Clean up output: extract first line
            first_line = output.splitlines()[0] if output else "Available"
            return True, first_line, None
        else:
            err = (result.stderr or result.stdout).strip()
            return False, None, f"Command exited with code {result.returncode}: {err}"
    except subprocess.TimeoutExpired:
        return False, None, f"Command timed out after {timeout} seconds"
    except (PermissionError, OSError) as exc:
        return False, None, f"Execution failed: {exc}"


def check_git() -> ToolStatus:
    """Check if Git is installed and retrieve its version."""
    installed, raw_version, err = _run_tool_command(["git", "--version"])
    version = None
    if installed and raw_version:
        # Match e.g. "git version 2.50.1" -> "2.50.1"
        match = re.search(r"(\d+\.\d+(\.\d+)?)", raw_version)
        version = match.group(1) if match else raw_version
    return ToolStatus(
        name="Git",
        command="git --version",
        installed=installed,
        version=version,
        required=True,
        details=err if not installed else None,
    )


def check_python(required: bool = True) -> ToolStatus:
    """Check installed Python version."""
    # Check using python3 command
    installed, raw_version, err = _run_tool_command(["python3", "--version"])
    version = None
    if installed and raw_version:
        match = re.search(r"(\d+\.\d+(\.\d+)?)", raw_version)
        version = match.group(1) if match else raw_version
    else:
        # Fallback to current running interpreter if python3 binary wasn't directly in path
        version = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
        installed = True
        err = None

    return ToolStatus(
        name="Python",
        command="python3 --version",
        installed=installed,
        version=version,
        required=required,
        details=err if not installed else None,
    )


def check_node(required: bool = True) -> ToolStatus:
    """Check if Node.js is installed and retrieve its version."""
    installed, raw_version, err = _run_tool_command(["node", "--version"])
    version = None
    if installed and raw_version:
        match = re.search(r"v?(\d+\.\d+(\.\d+)?)", raw_version)
        version = match.group(1) if match else raw_version
    return ToolStatus(
        name="Node.js",
        command="node --version",
        installed=installed,
        version=version,
        required=required,
        details=err if not installed else None,
    )


def check_npm(required: bool = True) -> ToolStatus:
    """Check if npm is installed and retrieve its version."""
    installed, raw_version, err = _run_tool_command(["npm", "--version"])
    version = None
    if installed and raw_version:
        match = re.search(r"(\d+\.\d+(\.\d+)?)", raw_version)
        version = match.group(1) if match else raw_version
    return ToolStatus(
        name="npm",
        command="npm --version",
        installed=installed,
        version=version,
        required=required,
        details=err if not installed else None,
    )


def evaluate_tools(category: ProjectCategory) -> list[ToolStatus]:
    """Evaluates system tools depending on the project category."""
    tools: list[ToolStatus] = []

    # Git is always checked for repository workflows
    tools.append(check_git())

    if category in (ProjectCategory.PYTHON, ProjectCategory.BOTH):
        tools.append(check_python(required=True))
    elif category == ProjectCategory.NEITHER:
        tools.append(check_python(required=False))

    if category in (ProjectCategory.NODEJS, ProjectCategory.BOTH):
        tools.append(check_node(required=True))
        tools.append(check_npm(required=True))
    elif category == ProjectCategory.NEITHER:
        tools.append(check_node(required=False))
        tools.append(check_npm(required=False))

    return tools


def generate_next_steps(scan: RepositoryScan, tools: list[ToolStatus]) -> list[str]:
    """Generates deterministic, actionable next steps based on scan results and tool diagnostics."""
    steps: list[str] = []

    if not scan.exists:
        steps.append(f"Verify the repository path '{scan.target_path}' and ensure it exists.")
        return steps

    if not scan.is_dir:
        steps.append(f"Specify a directory path instead of a file for scanning.")
        return steps

    if not scan.is_accessible:
        steps.append("Check file system permissions to ensure the repository directory is readable.")
        return steps

    # Tool readiness checks
    tool_map = {t.name: t for t in tools}
    git_tool = tool_map.get("Git")
    if git_tool and not git_tool.installed:
        steps.append("Install Git (https://git-scm.com or via package manager) to manage version control.")

    py_tool = tool_map.get("Python")
    node_tool = tool_map.get("Node.js")
    npm_tool = tool_map.get("npm")

    # Map file statuses for quick reference
    found_files = {fc.name for fc in scan.file_checks if fc.status == CheckStatus.FOUND}

    # Python next steps
    if "Python" in scan.project_types:
        if py_tool and not py_tool.installed:
            steps.append("Install Python 3.12+ (https://www.python.org or via brew/pyenv).")
        else:
            if "poetry.lock" in found_files and "pyproject.toml" in found_files:
                steps.append("Install dependencies using Poetry: poetry install")
            elif "Pipfile" in found_files:
                steps.append("Install dependencies using Pipenv: pipenv install --dev")
            elif "pyproject.toml" in found_files:
                steps.append("Create and activate a virtual environment, then install editable package:")
                steps.append("  python3 -m venv .venv && source .venv/bin/activate && pip install -e .")
            elif "requirements.txt" in found_files:
                steps.append("Create and activate a virtual environment, then install requirements:")
                steps.append("  python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt")

    # Node.js next steps
    if "Node.js" in scan.project_types:
        if node_tool and not node_tool.installed:
            steps.append("Install Node.js 18+ (https://nodejs.org or via nvm/brew).")
        if npm_tool and not npm_tool.installed and (node_tool and node_tool.installed):
            steps.append("Install npm (npm usually comes bundled with Node.js).")

        if node_tool and node_tool.installed:
            if "pnpm-lock.yaml" in found_files:
                steps.append("Install dependencies using pnpm: pnpm install")
            elif "yarn.lock" in found_files:
                steps.append("Install dependencies using Yarn: yarn install")
            elif "package-lock.json" in found_files:
                steps.append("Install dependencies using npm: npm ci")
            elif "package.json" in found_files:
                steps.append("Install dependencies using npm: npm install")

    # General hygiene & documentation
    if "README.md" in found_files:
        steps.append("Review README.md for project-specific prerequisites, environment variables, and run commands.")
    else:
        steps.append("Consider creating a README.md to document project overview, setup steps, and prerequisites.")

    if ".gitignore" not in found_files:
        steps.append("Add a .gitignore file to prevent accidental commits of local dependencies and environment secrets.")

    if ".github/workflows" in found_files:
        steps.append("Check .github/workflows/ to see automated CI test, lint, and build commands used by the repository.")

    if scan.category == ProjectCategory.NEITHER:
        steps.append("No standard Python or Node.js project files were detected.")
        steps.append("If this repository uses another language or framework, verify its documentation for setup instructions.")

    return steps


def run_diagnostics(scan: RepositoryScan) -> DiagnosticReport:
    """Executes environment tool diagnostics and aggregates the full report."""
    if not scan.exists or not scan.is_dir or not scan.is_accessible:
        # Don't run unnecessary tool checks on failed paths
        return DiagnosticReport(
            scan=scan,
            tools=[],
            next_steps=generate_next_steps(scan, []),
        )

    tools = evaluate_tools(scan.category)
    next_steps = generate_next_steps(scan, tools)

    return DiagnosticReport(
        scan=scan,
        tools=tools,
        next_steps=next_steps,
    )
