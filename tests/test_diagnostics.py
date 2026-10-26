"""Unit tests for tool diagnostics and recommendation generation."""

from __future__ import annotations

import subprocess
from pathlib import Path
from unittest.mock import MagicMock, patch

from repopilot.diagnostics import (
    _run_tool_command,
    check_git,
    check_node,
    check_npm,
    check_python,
    evaluate_tools,
    generate_next_steps,
    run_diagnostics,
)
from repopilot.models import (
    CheckStatus,
    FileCheck,
    ProjectCategory,
    RepositoryScan,
    ToolStatus,
)


def test_run_tool_command_missing_executable():
    """Returns not installed when executable is not found in PATH."""
    with patch("shutil.which", return_value=None):
        installed, version, err = _run_tool_command(["nonexistent_tool_12345"])
        assert installed is False
        assert version is None
        assert "not installed" in (err or "").lower()


def test_run_tool_command_timeout():
    """Handles tool timeout safely."""
    with patch("shutil.which", return_value="/bin/tool"), patch(
        "subprocess.run", side_effect=subprocess.TimeoutExpired(cmd=["tool"], timeout=5)
    ):
        installed, version, err = _run_tool_command(["tool"])
        assert installed is False
        assert version is None
        assert "timed out" in (err or "").lower()


def test_run_tool_command_failure_exit_code():
    """Handles tool command returning non-zero code."""
    mock_res = MagicMock()
    mock_res.returncode = 1
    mock_res.stdout = ""
    mock_res.stderr = "Fatal error"

    with patch("shutil.which", return_value="/bin/tool"), patch("subprocess.run", return_value=mock_res):
        installed, version, err = _run_tool_command(["tool"])
        assert installed is False
        assert "Fatal error" in (err or "")


def test_run_tool_command_success():
    """Extracts first line of output on command success."""
    mock_res = MagicMock()
    mock_res.returncode = 0
    mock_res.stdout = "tool version 1.2.3\nExtra output line\n"
    mock_res.stderr = ""

    with patch("shutil.which", return_value="/bin/tool"), patch("subprocess.run", return_value=mock_res):
        installed, version, err = _run_tool_command(["tool"])
        assert installed is True
        assert version == "tool version 1.2.3"
        assert err is None


def test_check_git_version_parsing():
    """Correctly parses git version string."""
    with patch("repopilot.diagnostics._run_tool_command", return_value=(True, "git version 2.44.0", None)):
        status = check_git()
        assert status.installed is True
        assert status.version == "2.44.0"
        assert status.name == "Git"


def test_check_node_and_npm():
    """Checks Node and npm parsing."""
    with patch("repopilot.diagnostics._run_tool_command", return_value=(True, "v20.11.1", None)):
        status = check_node()
        assert status.installed is True
        assert status.version == "20.11.1"

    with patch("repopilot.diagnostics._run_tool_command", return_value=(True, "10.2.4", None)):
        status = check_npm()
        assert status.installed is True
        assert status.version == "10.2.4"


def test_evaluate_tools_by_category():
    """Evaluates appropriate tool set depending on project category."""
    with patch("repopilot.diagnostics._run_tool_command", return_value=(True, "1.0.0", None)):
        # Python project: Git and Python
        py_tools = evaluate_tools(ProjectCategory.PYTHON)
        tool_names = [t.name for t in py_tools]
        assert "Git" in tool_names
        assert "Python" in tool_names
        assert "Node.js" not in tool_names

        # Node project: Git, Node.js, npm
        node_tools = evaluate_tools(ProjectCategory.NODEJS)
        node_names = [t.name for t in node_tools]
        assert "Git" in node_names
        assert "Node.js" in node_names
        assert "npm" in node_names
        assert "Python" not in node_names

        # Both: Git, Python, Node.js, npm
        both_tools = evaluate_tools(ProjectCategory.BOTH)
        both_names = [t.name for t in both_tools]
        assert set(both_names) == {"Git", "Python", "Node.js", "npm"}


def test_generate_next_steps_python_poetry():
    """Generates poetry install step when poetry.lock and pyproject.toml are found."""
    scan = RepositoryScan(
        target_path=".",
        resolved_path="/repo",
        project_types=["Python"],
        category=ProjectCategory.PYTHON,
        file_checks=[
            FileCheck(name="pyproject.toml", category="Python", status=CheckStatus.FOUND, description="config"),
            FileCheck(name="poetry.lock", category="Python", status=CheckStatus.FOUND, description="lock"),
            FileCheck(name="README.md", category="General", status=CheckStatus.FOUND, description="docs"),
            FileCheck(name=".gitignore", category="General", status=CheckStatus.FOUND, description="ignore"),
        ],
    )
    tools = [
        ToolStatus(name="Git", command="git --version", installed=True, version="2.0.0"),
        ToolStatus(name="Python", command="python3 --version", installed=True, version="3.12.0"),
    ]

    steps = generate_next_steps(scan, tools)
    assert any("poetry install" in s for s in steps)


def test_generate_next_steps_node_pnpm():
    """Generates pnpm install step when pnpm-lock.yaml is found."""
    scan = RepositoryScan(
        target_path=".",
        resolved_path="/repo",
        project_types=["Node.js"],
        category=ProjectCategory.NODEJS,
        file_checks=[
            FileCheck(name="package.json", category="Node.js", status=CheckStatus.FOUND, description="manifest"),
            FileCheck(name="pnpm-lock.yaml", category="Node.js", status=CheckStatus.FOUND, description="lock"),
            FileCheck(name="README.md", category="General", status=CheckStatus.MISSING, description="docs"),
            FileCheck(name=".gitignore", category="General", status=CheckStatus.MISSING, description="ignore"),
        ],
    )
    tools = [
        ToolStatus(name="Git", command="git --version", installed=True, version="2.0.0"),
        ToolStatus(name="Node.js", command="node --version", installed=True, version="20.0.0"),
        ToolStatus(name="npm", command="npm --version", installed=True, version="10.0.0"),
    ]

    steps = generate_next_steps(scan, tools)
    assert any("pnpm install" in s for s in steps)
    # Missing README and .gitignore suggestions
    assert any("README.md" in s for s in steps)
    assert any(".gitignore" in s for s in steps)


def test_generate_next_steps_missing_tools():
    """Recommends tool installation when required tools are missing."""
    scan = RepositoryScan(
        target_path=".",
        resolved_path="/repo",
        project_types=["Python", "Node.js"],
        category=ProjectCategory.BOTH,
        file_checks=[
            FileCheck(name="pyproject.toml", category="Python", status=CheckStatus.FOUND, description="config"),
            FileCheck(name="package.json", category="Node.js", status=CheckStatus.FOUND, description="manifest"),
        ],
    )
    tools = [
        ToolStatus(name="Git", command="git --version", installed=False),
        ToolStatus(name="Python", command="python3 --version", installed=False),
        ToolStatus(name="Node.js", command="node --version", installed=False),
        ToolStatus(name="npm", command="npm --version", installed=False),
    ]

    steps = generate_next_steps(scan, tools)
    assert any("Install Git" in s for s in steps)
    assert any("Install Python" in s for s in steps)
    assert any("Install Node.js" in s for s in steps)


def test_run_diagnostics_failed_scan():
    """run_diagnostics aborts tool checks on non-existent or invalid scan."""
    scan = RepositoryScan(
        target_path="/invalid",
        resolved_path="/invalid",
        exists=False,
        is_dir=False,
        is_accessible=False,
        error_message="Not found",
        category=ProjectCategory.NEITHER,
    )
    report = run_diagnostics(scan)
    assert report.tools == []
    assert len(report.next_steps) > 0
    assert "Verify the repository path" in report.next_steps[0]
