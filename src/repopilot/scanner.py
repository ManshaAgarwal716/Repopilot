"""Repository scanner module for RepoPilot.

Safely inspects a repository directory to detect project types and recognize
common configuration and ecosystem files without executing any code or
reading confidential files.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Final

from repopilot.models import (
    CheckStatus,
    FileCheck,
    ProjectCategory,
    RepositoryScan,
)

# Directories that must never be traversed recursively for safety and performance
IGNORED_DIRS: Final[set[str]] = {
    ".git",
    "node_modules",
    ".venv",
    "venv",
    "env",
    ".env",
    "__pycache__",
    ".pytest_cache",
    ".mypy_cache",
    ".ruff_cache",
    ".tox",
    "build",
    "dist",
    ".eggs",
    ".idea",
    ".vscode",
}

# Standard files checked for every repository
GENERAL_CHECKS: Final[list[tuple[str, str, bool]]] = [
    ("README.md", "Repository documentation and instructions", False),
    (".gitignore", "Git ignore patterns for build/cache artifacts", False),
    (".github/workflows", "GitHub Actions CI/CD workflows directory", True),
]

PYTHON_CORE_CHECKS: Final[list[tuple[str, str, bool]]] = [
    ("pyproject.toml", "Python project configuration (PEP 518/621/Poetry/Hatch/Flit)", False),
    ("requirements.txt", "Pip dependency specification", False),
    ("Pipfile", "Pipenv dependency specification", False),
    ("poetry.lock", "Poetry dependency lockfile", False),
]

NODE_CORE_CHECKS: Final[list[tuple[str, str, bool]]] = [
    ("package.json", "Node.js package manifest and dependency list", False),
    ("package-lock.json", "npm lockfile", False),
    ("pnpm-lock.yaml", "pnpm lockfile", False),
    ("yarn.lock", "Yarn lockfile", False),
]

# Secondary / conditional checks to clearly distinguish checked vs not checked files
PYTHON_SECONDARY_CHECKS: Final[list[tuple[str, str, bool]]] = [
    ("setup.py", "Legacy Python setup script", False),
    ("Pipfile.lock", "Pipenv lockfile", False),
]

NODE_SECONDARY_CHECKS: Final[list[tuple[str, str, bool]]] = [
    ("tsconfig.json", "TypeScript compiler configuration", False),
    (".npmrc", "npm configuration file", False),
]


def _safe_has_python_sources(root: Path) -> bool:
    """Safely check if top-level or src/ directory contains Python source files.

    Does not recurse into ignored directories.
    """
    try:
        # Check top-level directory
        with os.scandir(root) as it:
            for entry in it:
                if entry.name in IGNORED_DIRS:
                    continue
                if entry.is_file(follow_symlinks=False) and entry.name.endswith(".py"):
                    return True
                if entry.is_dir(follow_symlinks=False) and entry.name in ("src", "app", "lib"):
                    try:
                        with os.scandir(entry.path) as sub_it:
                            for sub_entry in sub_it:
                                if sub_entry.is_file(follow_symlinks=False) and sub_entry.name.endswith(".py"):
                                    return True
                    except OSError:
                        continue
    except OSError:
        pass
    return False


def _safe_has_node_sources(root: Path) -> bool:
    """Safely check if top-level or src/ directory contains JS/TS source files."""
    try:
        with os.scandir(root) as it:
            for entry in it:
                if entry.name in IGNORED_DIRS:
                    continue
                if entry.is_file(follow_symlinks=False) and entry.name.endswith((".js", ".ts", ".mjs", ".cjs")):
                    return True
                if entry.is_dir(follow_symlinks=False) and entry.name in ("src", "lib"):
                    try:
                        with os.scandir(entry.path) as sub_it:
                            for sub_entry in sub_it:
                                if sub_entry.is_file(follow_symlinks=False) and sub_entry.name.endswith((".js", ".ts", ".mjs", ".cjs")):
                                    return True
                    except OSError:
                        continue
    except OSError:
        pass
    return False


def scan_repository(path: str | Path) -> RepositoryScan:
    """Safely scans a repository directory.

    Args:
        path: Path to the target repository directory (str or Path).

    Returns:
        RepositoryScan: Complete scan result with detected types and audited files.
    """
    raw_path_str = str(path)
    try:
        target_path = Path(path).expanduser()
        resolved_path = target_path.resolve()
    except Exception as exc:
        return RepositoryScan(
            target_path=raw_path_str,
            resolved_path=raw_path_str,
            exists=False,
            is_dir=False,
            is_accessible=False,
            error_message=f"Invalid path expression: {exc}",
            category=ProjectCategory.NEITHER,
        )

    # Check existence
    if not target_path.exists():
        # All checks marked NOT_CHECKED because the target path doesn't exist
        checks = [
            FileCheck(name=f, category="General", status=CheckStatus.NOT_CHECKED, description=d, is_directory=is_dir)
            for f, d, is_dir in GENERAL_CHECKS
        ]
        return RepositoryScan(
            target_path=raw_path_str,
            resolved_path=str(resolved_path),
            exists=False,
            is_dir=False,
            is_accessible=False,
            error_message=f"Path does not exist: {target_path}",
            category=ProjectCategory.NEITHER,
            file_checks=checks,
        )

    # Check if directory
    if not target_path.is_dir():
        checks = [
            FileCheck(name=f, category="General", status=CheckStatus.NOT_CHECKED, description=d, is_directory=is_dir)
            for f, d, is_dir in GENERAL_CHECKS
        ]
        return RepositoryScan(
            target_path=raw_path_str,
            resolved_path=str(resolved_path),
            exists=True,
            is_dir=False,
            is_accessible=False,
            error_message=f"Path is not a directory: {target_path}",
            category=ProjectCategory.NEITHER,
            file_checks=checks,
        )

    # Check accessibility
    try:
        with os.scandir(resolved_path):
            pass
    except (PermissionError, OSError) as exc:
        checks = [
            FileCheck(name=f, category="General", status=CheckStatus.NOT_CHECKED, description=d, is_directory=is_dir)
            for f, d, is_dir in GENERAL_CHECKS
        ]
        return RepositoryScan(
            target_path=raw_path_str,
            resolved_path=str(resolved_path),
            exists=True,
            is_dir=True,
            is_accessible=False,
            error_message=f"Permission denied accessing directory: {exc}",
            category=ProjectCategory.NEITHER,
            file_checks=checks,
        )

    # Perform file checks
    file_checks: list[FileCheck] = []

    # 1. General files audit
    for name, description, is_directory in GENERAL_CHECKS:
        target_item = resolved_path / name
        try:
            if target_item.exists():
                if is_directory:
                    if target_item.is_dir():
                        file_checks.append(
                            FileCheck(name=name, category="General", status=CheckStatus.FOUND, description=description, is_directory=True)
                        )
                    else:
                        file_checks.append(
                            FileCheck(name=name, category="General", status=CheckStatus.MISSING, description=f"{description} (found as file, expected directory)", is_directory=True)
                        )
                else:
                    file_checks.append(
                        FileCheck(name=name, category="General", status=CheckStatus.FOUND, description=description, is_directory=False)
                    )
            else:
                file_checks.append(
                    FileCheck(name=name, category="General", status=CheckStatus.MISSING, description=description, is_directory=is_directory)
                )
        except OSError as exc:
            file_checks.append(
                FileCheck(name=name, category="General", status=CheckStatus.NOT_CHECKED, description=description, is_directory=is_directory, details=f"Check failed: {exc}")
            )

    # 2. Python core files audit
    python_markers_found = 0
    for name, description, is_directory in PYTHON_CORE_CHECKS:
        target_item = resolved_path / name
        try:
            if target_item.exists() and target_item.is_file():
                python_markers_found += 1
                file_checks.append(
                    FileCheck(name=name, category="Python", status=CheckStatus.FOUND, description=description, is_directory=False)
                )
            else:
                file_checks.append(
                    FileCheck(name=name, category="Python", status=CheckStatus.MISSING, description=description, is_directory=False)
                )
        except OSError as exc:
            file_checks.append(
                FileCheck(name=name, category="Python", status=CheckStatus.NOT_CHECKED, description=description, is_directory=False, details=f"Check failed: {exc}")
            )

    # 3. Node.js core files audit
    node_markers_found = 0
    for name, description, is_directory in NODE_CORE_CHECKS:
        target_item = resolved_path / name
        try:
            if target_item.exists() and target_item.is_file():
                node_markers_found += 1
                file_checks.append(
                    FileCheck(name=name, category="Node.js", status=CheckStatus.FOUND, description=description, is_directory=False)
                )
            else:
                file_checks.append(
                    FileCheck(name=name, category="Node.js", status=CheckStatus.MISSING, description=description, is_directory=False)
                )
        except OSError as exc:
            file_checks.append(
                FileCheck(name=name, category="Node.js", status=CheckStatus.NOT_CHECKED, description=description, is_directory=False, details=f"Check failed: {exc}")
            )

    # Detect project types
    is_python = python_markers_found > 0 or _safe_has_python_sources(resolved_path)
    is_node = node_markers_found > 0 or _safe_has_node_sources(resolved_path)

    # 4. Secondary checks: clearly distinguish checked vs not checked
    # If the project is identified as Python, we check secondary Python files; otherwise they are NOT_CHECKED.
    for name, description, is_directory in PYTHON_SECONDARY_CHECKS:
        if is_python:
            target_item = resolved_path / name
            status = CheckStatus.FOUND if (target_item.exists() and target_item.is_file()) else CheckStatus.MISSING
            file_checks.append(
                FileCheck(name=name, category="Python (Extended)", status=status, description=description, is_directory=False)
            )
        else:
            file_checks.append(
                FileCheck(
                    name=name,
                    category="Python (Extended)",
                    status=CheckStatus.NOT_CHECKED,
                    description=description,
                    is_directory=False,
                    details="Skipped: repository is not a Python project",
                )
            )

    # If the project is identified as Node.js, we check secondary Node.js files; otherwise they are NOT_CHECKED.
    for name, description, is_directory in NODE_SECONDARY_CHECKS:
        if is_node:
            target_item = resolved_path / name
            status = CheckStatus.FOUND if (target_item.exists() and target_item.is_file()) else CheckStatus.MISSING
            file_checks.append(
                FileCheck(name=name, category="Node.js (Extended)", status=status, description=description, is_directory=False)
            )
        else:
            file_checks.append(
                FileCheck(
                    name=name,
                    category="Node.js (Extended)",
                    status=CheckStatus.NOT_CHECKED,
                    description=description,
                    is_directory=False,
                    details="Skipped: repository is not a Node.js project",
                )
            )

    project_types: list[str] = []
    if is_python:
        project_types.append("Python")
    if is_node:
        project_types.append("Node.js")

    if is_python and is_node:
        category = ProjectCategory.BOTH
    elif is_python:
        category = ProjectCategory.PYTHON
    elif is_node:
        category = ProjectCategory.NODEJS
    else:
        category = ProjectCategory.NEITHER

    return RepositoryScan(
        target_path=raw_path_str,
        resolved_path=str(resolved_path),
        exists=True,
        is_dir=True,
        is_accessible=True,
        error_message=None,
        project_types=project_types,
        category=category,
        file_checks=file_checks,
    )
