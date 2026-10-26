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
    assert "explore" in result.stdout
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


# --- Explore Command Tests ---


def test_cli_explore_on_directory(tmp_path: Path):
    """`repopilot explore <path>` explores repository and prints Rich panels."""
    (tmp_path / "pyproject.toml").write_text("[project]\nname='sample'\ndependencies=['typer']\n", encoding="utf-8")
    (tmp_path / "README.md").write_text("# Sample Project\n", encoding="utf-8")
    src = tmp_path / "src"
    src.mkdir()
    (src / "main.py").write_text("print('hello')\n", encoding="utf-8")

    result = runner.invoke(app, ["explore", str(tmp_path)])
    assert result.exit_code == 0
    assert "RepoPilot Explorer" in result.stdout
    assert "Repository Structure Overview" in result.stdout
    assert "Suggested Starting Points" in result.stdout
    assert "Repository Directory Tree" in result.stdout
    assert "README.md" in result.stdout
    assert "pyproject.toml" in result.stdout


def test_cli_explore_json_output(tmp_path: Path):
    """`repopilot explore <path> --json` produces structured JSON output."""
    (tmp_path / "package.json").write_text('{"name": "demo-ui", "dependencies": {"react": "^18.0.0"}}', encoding="utf-8")
    (tmp_path / "README.md").write_text("# Demo\n", encoding="utf-8")

    result = runner.invoke(app, ["explore", str(tmp_path), "--json"])
    assert result.exit_code == 0

    data = json.loads(result.stdout)
    assert "scan" in data
    assert "overview" in data
    assert "tree" in data
    assert "important_files" in data
    assert "starting_points" in data
    assert "React (UI library)" in data["overview"]["recognized_frameworks"]
    assert any(sp["path"] == "README.md" for sp in data["starting_points"])


def test_cli_explore_depth_and_max_entries(tmp_path: Path):
    """`repopilot explore` respects depth and max-entries flags."""
    (tmp_path / "a").mkdir()
    (tmp_path / "a" / "b").mkdir()
    (tmp_path / "a" / "b" / "deep.txt").write_text("deep", encoding="utf-8")

    # With depth 1, 'b' is not recursed
    result_d1 = runner.invoke(app, ["explore", str(tmp_path), "--depth", "1", "--json"])
    assert result_d1.exit_code == 0
    data_d1 = json.loads(result_d1.stdout)
    assert data_d1["tree"]["max_depth"] == 1
    assert len(data_d1["tree"]["root"]["children"][0]["children"]) == 0

    # With depth 2, 'b' is visible
    result_d2 = runner.invoke(app, ["explore", str(tmp_path), "--depth", "2", "--json"])
    assert result_d2.exit_code == 0
    data_d2 = json.loads(result_d2.stdout)
    assert len(data_d2["tree"]["root"]["children"][0]["children"]) == 1


def test_cli_explore_invalid_numeric_options(tmp_path: Path):
    """Rejects depth and max-entries <= 0 with validation error."""
    res_depth = runner.invoke(app, ["explore", str(tmp_path), "--depth", "0"])
    assert res_depth.exit_code != 0
    err_text = res_depth.stdout + (getattr(res_depth, "stderr", "") or "")
    assert "Depth must be at least 1" in err_text

    res_entries = runner.invoke(app, ["explore", str(tmp_path), "--max-entries", "0"])
    assert res_entries.exit_code != 0
    err_text_entries = res_entries.stdout + (getattr(res_entries, "stderr", "") or "")
    assert "Max entries must be at least 1" in err_text_entries


def test_cli_explore_nonexistent_path():
    """`repopilot explore <nonexistent>` exits with code 1."""
    result = runner.invoke(app, ["explore", "/path/that/does/not/exist_98765"])
    assert result.exit_code == 1
    assert "Scan Error" in result.stdout
    assert "does not exist" in result.stdout


def test_cli_explore_nonexistent_path_json():
    """`repopilot explore <nonexistent> --json` returns structured JSON with error."""
    result = runner.invoke(app, ["explore", "/path/that/does/not/exist_98765", "--json"])
    assert result.exit_code == 1
    data = json.loads(result.stdout)
    assert data["scan"]["exists"] is False
    assert "does not exist" in data["scan"]["error_message"].lower()


def test_cli_explore_file_target(tmp_path: Path):
    """`repopilot explore <file>` fails when given a file path."""
    file_target = tmp_path / "hello.txt"
    file_target.write_text("content", encoding="utf-8")

    result = runner.invoke(app, ["explore", str(file_target)])
    assert result.exit_code == 1
    assert "is a file, not a directory" in result.stdout
