"""Integration tests for Typer CLI commands."""

from __future__ import annotations

import json
from pathlib import Path

from typer.testing import CliRunner

from repopilot import __version__
from repopilot.cli import app

runner = CliRunner()


def test_cli_help():
    """`repopilot --help` displays usage instructions and commands."""
    result = runner.invoke(app, ["--help"])
    assert result.exit_code == 0
    assert "Usage: repopilot" in result.stdout
    assert "doctor" in result.stdout
    assert "--help" in result.stdout


def test_cli_version():
    """`repopilot --version` displays current version."""
    result = runner.invoke(app, ["--version"])
    assert result.exit_code == 0
    assert __version__ in result.stdout


def test_cli_doctor_on_directory(tmp_path: Path):
    """`repopilot doctor <path>` scans a valid repository directory."""
    (tmp_path / "pyproject.toml").write_text("[project]\nname='test'\n", encoding="utf-8")
    (tmp_path / "README.md").write_text("# Test\n", encoding="utf-8")

    result = runner.invoke(app, ["doctor", str(tmp_path)])
    assert result.exit_code == 0
    assert "RepoPilot Doctor" in result.stdout
    assert "Python Project" in result.stdout
    assert "Common Project Files Audit" in result.stdout
    assert "pyproject.toml" in result.stdout


def test_cli_doctor_json_output(tmp_path: Path):
    """`repopilot doctor <path> --json` produces valid JSON output."""
    (tmp_path / "package.json").write_text('{"name": "test-pkg"}', encoding="utf-8")

    result = runner.invoke(app, ["doctor", str(tmp_path), "--json"])
    assert result.exit_code == 0

    data = json.loads(result.stdout)
    assert "scan" in data
    assert "tools" in data
    assert "next_steps" in data
    assert data["scan"]["category"] == "nodejs"
    assert "Node.js" in data["scan"]["project_types"]
    assert any(fc["name"] == "package.json" and fc["status"] == "FOUND" for fc in data["scan"]["file_checks"])


def test_cli_doctor_nonexistent_path():
    """`repopilot doctor <nonexistent>` exits with non-zero code and reports error."""
    result = runner.invoke(app, ["doctor", "/path/that/really/does/not/exist_12345"])
    assert result.exit_code == 1
    assert "Scan Error" in result.stdout
    assert "does not exist" in result.stdout


def test_cli_doctor_nonexistent_path_json():
    """`repopilot doctor <nonexistent> --json` returns structured JSON and exit code 1."""
    result = runner.invoke(app, ["doctor", "/path/that/really/does/not/exist_12345", "--json"])
    assert result.exit_code == 1
    data = json.loads(result.stdout)
    assert data["scan"]["exists"] is False
    assert "does not exist" in data["scan"]["error_message"].lower()


def test_cli_doctor_file_target(tmp_path: Path):
    """`repopilot doctor <file>` fails gracefully when targeting a file."""
    sample_file = tmp_path / "file.txt"
    sample_file.write_text("not a dir", encoding="utf-8")

    result = runner.invoke(app, ["doctor", str(sample_file)])
    assert result.exit_code == 1
    assert "is a file, not a directory" in result.stdout
