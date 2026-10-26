"""Unit tests for repository scanning and file recognition."""

from __future__ import annotations

import os
from pathlib import Path
from unittest.mock import patch

from repopilot.models import CheckStatus, ProjectCategory
from repopilot.scanner import scan_repository


def test_scan_empty_directory(tmp_path: Path):
    """Empty directory should be classified as neither Python nor Node.js."""
    scan = scan_repository(tmp_path)

    assert scan.exists is True
    assert scan.is_dir is True
    assert scan.is_accessible is True
    assert scan.error_message is None
    assert scan.category == ProjectCategory.NEITHER
    assert scan.project_types == []

    # Check status of core files
    status_by_name = {fc.name: fc.status for fc in scan.file_checks}
    assert status_by_name["README.md"] == CheckStatus.MISSING
    assert status_by_name[".gitignore"] == CheckStatus.MISSING
    assert status_by_name[".github/workflows"] == CheckStatus.MISSING
    assert status_by_name["pyproject.toml"] == CheckStatus.MISSING
    assert status_by_name["package.json"] == CheckStatus.MISSING

    # Extended checks should be NOT_CHECKED since neither type was detected
    assert status_by_name["setup.py"] == CheckStatus.NOT_CHECKED
    assert status_by_name["tsconfig.json"] == CheckStatus.NOT_CHECKED


def test_scan_python_project_pyproject(tmp_path: Path):
    """Detects Python project when pyproject.toml is present."""
    (tmp_path / "pyproject.toml").write_text("[project]\nname='demo'\n", encoding="utf-8")
    (tmp_path / "README.md").write_text("# Demo\n", encoding="utf-8")

    scan = scan_repository(tmp_path)

    assert scan.category == ProjectCategory.PYTHON
    assert scan.project_types == ["Python"]

    status_by_name = {fc.name: fc.status for fc in scan.file_checks}
    assert status_by_name["pyproject.toml"] == CheckStatus.FOUND
    assert status_by_name["README.md"] == CheckStatus.FOUND
    assert status_by_name["requirements.txt"] == CheckStatus.MISSING
    assert status_by_name["package.json"] == CheckStatus.MISSING

    # Secondary Python checks should have been evaluated (found or missing)
    assert status_by_name["setup.py"] == CheckStatus.MISSING
    # Node secondary checks should be NOT_CHECKED
    assert status_by_name["tsconfig.json"] == CheckStatus.NOT_CHECKED


def test_scan_python_project_requirements(tmp_path: Path):
    """Detects Python project with requirements.txt."""
    (tmp_path / "requirements.txt").write_text("requests==2.31.0\n", encoding="utf-8")

    scan = scan_repository(tmp_path)
    assert scan.category == ProjectCategory.PYTHON
    assert "Python" in scan.project_types


def test_scan_python_project_pipfile(tmp_path: Path):
    """Detects Python project with Pipfile."""
    (tmp_path / "Pipfile").write_text("[packages]\n", encoding="utf-8")

    scan = scan_repository(tmp_path)
    assert scan.category == ProjectCategory.PYTHON
    assert "Python" in scan.project_types


def test_scan_python_project_poetry_lock(tmp_path: Path):
    """Detects Python project with poetry.lock."""
    (tmp_path / "poetry.lock").write_text("# Poetry lockfile\n", encoding="utf-8")

    scan = scan_repository(tmp_path)
    assert scan.category == ProjectCategory.PYTHON
    assert "Python" in scan.project_types


def test_scan_python_project_source_files(tmp_path: Path):
    """Detects Python project from top-level and src/ .py files."""
    src_dir = tmp_path / "src"
    src_dir.mkdir()
    (src_dir / "main.py").write_text("print('hello')\n", encoding="utf-8")

    scan = scan_repository(tmp_path)
    assert scan.category == ProjectCategory.PYTHON
    assert "Python" in scan.project_types


def test_scan_nodejs_project_package_json(tmp_path: Path):
    """Detects Node.js project when package.json is present."""
    (tmp_path / "package.json").write_text('{"name": "demo"}', encoding="utf-8")
    (tmp_path / "package-lock.json").write_text("{}", encoding="utf-8")

    scan = scan_repository(tmp_path)

    assert scan.category == ProjectCategory.NODEJS
    assert scan.project_types == ["Node.js"]

    status_by_name = {fc.name: fc.status for fc in scan.file_checks}
    assert status_by_name["package.json"] == CheckStatus.FOUND
    assert status_by_name["package-lock.json"] == CheckStatus.FOUND
    assert status_by_name["yarn.lock"] == CheckStatus.MISSING
    assert status_by_name["pyproject.toml"] == CheckStatus.MISSING

    # Secondary Node checks should have been evaluated
    assert status_by_name["tsconfig.json"] == CheckStatus.MISSING
    # Secondary Python checks should be NOT_CHECKED
    assert status_by_name["setup.py"] == CheckStatus.NOT_CHECKED


def test_scan_nodejs_project_lockfiles(tmp_path: Path):
    """Detects Node.js project with pnpm or yarn lockfiles."""
    (tmp_path / "pnpm-lock.yaml").write_text("lockfileVersion: '6.0'\n", encoding="utf-8")

    scan = scan_repository(tmp_path)
    assert scan.category == ProjectCategory.NODEJS
    assert "Node.js" in scan.project_types


def test_scan_mixed_project(tmp_path: Path):
    """Detects both Python and Node.js in full-stack repositories."""
    (tmp_path / "pyproject.toml").write_text("[project]\nname='backend'\n", encoding="utf-8")
    (tmp_path / "package.json").write_text('{"name": "frontend"}', encoding="utf-8")
    (tmp_path / ".gitignore").write_text("node_modules/\n.venv/\n", encoding="utf-8")

    scan = scan_repository(tmp_path)

    assert scan.category == ProjectCategory.BOTH
    assert set(scan.project_types) == {"Python", "Node.js"}

    status_by_name = {fc.name: fc.status for fc in scan.file_checks}
    assert status_by_name["pyproject.toml"] == CheckStatus.FOUND
    assert status_by_name["package.json"] == CheckStatus.FOUND
    assert status_by_name[".gitignore"] == CheckStatus.FOUND

    # Secondary checks for both should be active
    assert status_by_name["setup.py"] in (CheckStatus.FOUND, CheckStatus.MISSING)
    assert status_by_name["tsconfig.json"] in (CheckStatus.FOUND, CheckStatus.MISSING)


def test_scan_general_files_and_directories(tmp_path: Path):
    """Verifies recognition of README.md, .gitignore, and .github/workflows directory."""
    (tmp_path / "README.md").write_text("# Title\n", encoding="utf-8")
    (tmp_path / ".gitignore").write_text("*.log\n", encoding="utf-8")
    workflows_dir = tmp_path / ".github" / "workflows"
    workflows_dir.mkdir(parents=True)
    (workflows_dir / "ci.yml").write_text("name: CI\n", encoding="utf-8")

    scan = scan_repository(tmp_path)

    status_by_name = {fc.name: fc.status for fc in scan.file_checks}
    assert status_by_name["README.md"] == CheckStatus.FOUND
    assert status_by_name[".gitignore"] == CheckStatus.FOUND
    assert status_by_name[".github/workflows"] == CheckStatus.FOUND


def test_scan_ignores_forbidden_directories(tmp_path: Path):
    """Ensures node_modules, .git, and .venv are ignored and not used for root project detection."""
    # Put Python file only inside .venv/
    venv_lib = tmp_path / ".venv" / "lib"
    venv_lib.mkdir(parents=True)
    (venv_lib / "site.py").write_text("print('venv')\n", encoding="utf-8")

    # Put JS file only inside node_modules/
    node_mod = tmp_path / "node_modules" / "somepkg"
    node_mod.mkdir(parents=True)
    (node_mod / "index.js").write_text("console.log(1)\n", encoding="utf-8")

    scan = scan_repository(tmp_path)
    # Neither should be detected because these directories are strictly ignored
    assert scan.category == ProjectCategory.NEITHER
    assert scan.project_types == []


def test_scan_nonexistent_path():
    """Nonexistent paths should be handled gracefully with clear error and NOT_CHECKED status."""
    nonexistent = Path("/nonexistent/directory/that/definitely/does/not/exist/repopilot_test")
    scan = scan_repository(nonexistent)

    assert scan.exists is False
    assert scan.is_dir is False
    assert scan.is_accessible is False
    assert "does not exist" in (scan.error_message or "").lower()
    assert scan.category == ProjectCategory.NEITHER
    assert all(fc.status == CheckStatus.NOT_CHECKED for fc in scan.file_checks)


def test_scan_file_instead_of_directory(tmp_path: Path):
    """Targeting a regular file should set is_dir=False and return clean error."""
    file_path = tmp_path / "sample.txt"
    file_path.write_text("hello", encoding="utf-8")

    scan = scan_repository(file_path)

    assert scan.exists is True
    assert scan.is_dir is False
    assert scan.is_accessible is False
    assert "not a directory" in (scan.error_message or "").lower()
    assert all(fc.status == CheckStatus.NOT_CHECKED for fc in scan.file_checks)


def test_scan_inaccessible_directory(tmp_path: Path):
    """Simulate permission error when accessing directory."""
    with patch("os.scandir", side_effect=PermissionError("Permission denied")):
        scan = scan_repository(tmp_path)

        assert scan.exists is True
        assert scan.is_dir is True
        assert scan.is_accessible is False
        assert "Permission denied" in (scan.error_message or "")
        assert all(fc.status == CheckStatus.NOT_CHECKED for fc in scan.file_checks)
