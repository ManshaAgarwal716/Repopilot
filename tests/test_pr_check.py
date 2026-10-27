"""Unit and integration tests for PR Compass (Milestone 3)."""

from __future__ import annotations

import json
import subprocess
from pathlib import Path

import pytest
from typer.testing import CliRunner

from repopilot.cli import app
from repopilot.models import ChangeType
from repopilot.pr_check import analyze_pr, categorize_affected_area

runner = CliRunner()


@pytest.fixture
def git_repo(tmp_path: Path) -> Path:
    """Creates a temporary Git repository with an initial commit on 'main'."""
    repo = tmp_path / "repo"
    repo.mkdir()

    # Initialize repository
    subprocess.run(["git", "init", "-b", "main"], cwd=repo, check=True, capture_output=True)
    subprocess.run(["git", "config", "user.name", "Test User"], cwd=repo, check=True, capture_output=True)
    subprocess.run(["git", "config", "user.email", "test@example.com"], cwd=repo, check=True, capture_output=True)

    # Initial files
    (repo / "README.md").write_text("# Project\n", encoding="utf-8")
    (repo / "pyproject.toml").write_text("[project]\nname='app'\ndependencies=['pytest']\n", encoding="utf-8")
    src = repo / "src"
    src.mkdir()
    (src / "app.py").write_text("def run(): pass\n", encoding="utf-8")
    tests = repo / "tests"
    tests.mkdir()
    (tests / "test_app.py").write_text("def test_run(): pass\n", encoding="utf-8")

    # Initial commit
    subprocess.run(["git", "add", "."], cwd=repo, check=True, capture_output=True)
    subprocess.run(["git", "commit", "-m", "Initial commit"], cwd=repo, check=True, capture_output=True)

    return repo


def test_pr_check_clean_feature_branch(git_repo: Path):
    """Audits a clean feature branch with committed changes against main."""
    # Create feature branch
    subprocess.run(["git", "checkout", "-b", "feature/billing"], cwd=git_repo, check=True, capture_output=True)

    # Add new module and matching test
    (git_repo / "src" / "billing.py").write_text("def bill(): pass\n", encoding="utf-8")
    (git_repo / "tests" / "test_billing.py").write_text("def test_bill(): pass\n", encoding="utf-8")
    subprocess.run(["git", "add", "."], cwd=git_repo, check=True, capture_output=True)
    subprocess.run(["git", "commit", "-m", "Add billing feature"], cwd=git_repo, check=True, capture_output=True)

    report = analyze_pr(git_repo, base_branch="main")

    assert report.git_info.is_git_repo is True
    assert report.git_info.current_branch == "feature/billing"
    assert report.git_info.base_branch == "main"
    assert report.uncommitted.has_uncommitted is False
    assert report.summary["total"] == 2
    assert report.summary["added"] == 2

    # Check test mapping
    billing_mapping = next((m for m in report.test_analysis.mappings if "billing.py" in m.changed_file), None)
    assert billing_mapping is not None
    assert billing_mapping.has_potential_gap is False
    assert "tests/test_billing.py" in billing_mapping.related_tests
    assert report.test_analysis.tests_executed is False


def test_pr_check_added_modified_deleted_renamed(git_repo: Path):
    """Audits added, modified, deleted, and renamed files."""
    subprocess.run(["git", "checkout", "-b", "feature/refactor"], cwd=git_repo, check=True, capture_output=True)

    # 1. Added
    (git_repo / "src" / "new_mod.py").write_text("pass\n", encoding="utf-8")
    # 2. Modified
    (git_repo / "src" / "app.py").write_text("def run(): return 42\n", encoding="utf-8")
    # 3. Deleted
    subprocess.run(["git", "rm", "README.md"], cwd=git_repo, check=True, capture_output=True)
    # 4. Renamed
    subprocess.run(["git", "mv", "tests/test_app.py", "tests/test_application.py"], cwd=git_repo, check=True, capture_output=True)

    subprocess.run(["git", "add", "."], cwd=git_repo, check=True, capture_output=True)
    subprocess.run(["git", "commit", "-m", "Refactor and rename"], cwd=git_repo, check=True, capture_output=True)

    report = analyze_pr(git_repo, base_branch="main")

    change_types = {c.path: c.change_type for c in report.branch_changes}
    assert change_types["src/new_mod.py"] == ChangeType.ADDED
    assert change_types["src/app.py"] == ChangeType.MODIFIED
    assert change_types["README.md"] == ChangeType.DELETED
    assert change_types["tests/test_application.py"] == ChangeType.RENAMED

    renamed = next(c for c in report.branch_changes if c.path == "tests/test_application.py")
    assert renamed.old_path == "tests/test_app.py"


def test_pr_check_uncommitted_changes(git_repo: Path):
    """Detects and categorizes staged, unstaged, and untracked changes in working tree."""
    # Staged change
    (git_repo / "src" / "staged_file.py").write_text("staged = True\n", encoding="utf-8")
    subprocess.run(["git", "add", "src/staged_file.py"], cwd=git_repo, check=True, capture_output=True)

    # Unstaged change
    (git_repo / "src" / "app.py").write_text("unstaged modification\n", encoding="utf-8")

    # Untracked change
    (git_repo / "scratch.txt").write_text("notes\n", encoding="utf-8")

    report = analyze_pr(git_repo, base_branch="main")

    assert report.uncommitted.has_uncommitted is True
    assert report.uncommitted.staged_count == 1
    assert "src/staged_file.py" in report.uncommitted.staged_files
    assert report.uncommitted.unstaged_count == 1
    assert "src/app.py" in report.uncommitted.unstaged_files
    assert report.uncommitted.untracked_count == 1
    assert "scratch.txt" in report.uncommitted.untracked_files
    assert any("uncommitted changes" in w.lower() for w in report.warnings)


def test_pr_check_missing_base_branch(git_repo: Path):
    """Gracefully handles non-existent base branch without crashing."""
    report = analyze_pr(git_repo, base_branch="nonexistent_base_xyz")

    assert report.git_info.is_git_repo is True
    assert report.git_info.base_ref is None
    assert any("not found" in w.lower() for w in report.warnings)
    assert report.branch_changes == []


def test_pr_check_test_discovery_and_gaps(git_repo: Path):
    """Correctly discovers matching tests and flags potential gaps when tests are missing."""
    subprocess.run(["git", "checkout", "-b", "feature/gap-test"], cwd=git_repo, check=True, capture_output=True)

    # File with no test
    (git_repo / "src" / "untested_service.py").write_text("def secret(): pass\n", encoding="utf-8")
    # File with test
    (git_repo / "src" / "tested_service.py").write_text("def logic(): pass\n", encoding="utf-8")
    (git_repo / "tests" / "test_tested_service.py").write_text("def test_logic(): pass\n", encoding="utf-8")

    subprocess.run(["git", "add", "."], cwd=git_repo, check=True, capture_output=True)
    subprocess.run(["git", "commit", "-m", "Add services"], cwd=git_repo, check=True, capture_output=True)

    report = analyze_pr(git_repo, base_branch="main")

    gap_mapping = next(m for m in report.test_analysis.mappings if "untested_service.py" in m.changed_file)
    assert gap_mapping.has_potential_gap is True
    assert gap_mapping.related_tests == []

    covered_mapping = next(m for m in report.test_analysis.mappings if "tested_service.py" in m.changed_file)
    assert covered_mapping.has_potential_gap is False
    assert "tests/test_tested_service.py" in covered_mapping.related_tests

    assert report.test_analysis.potential_gaps_count >= 1
    assert report.test_analysis.tests_executed is False
    assert "pytest" in report.test_analysis.framework


def test_pr_check_unusual_filenames(git_repo: Path):
    """Handles paths containing spaces and Unicode symbols."""
    subprocess.run(["git", "checkout", "-b", "feature/unicode"], cwd=git_repo, check=True, capture_output=True)

    special_file = git_repo / "src" / "special file 🚀.py"
    special_file.write_text("val = 10\n", encoding="utf-8")

    subprocess.run(["git", "add", "."], cwd=git_repo, check=True, capture_output=True)
    subprocess.run(["git", "commit", "-m", "Add special file"], cwd=git_repo, check=True, capture_output=True)

    report = analyze_pr(git_repo, base_branch="main")
    assert any("special file 🚀.py" in c.path for c in report.branch_changes)


def test_pr_check_not_a_git_repo(tmp_path: Path):
    """Returns clear non-git error for standard directories."""
    report = analyze_pr(tmp_path)
    assert report.git_info.is_git_repo is False
    assert "not a git repository" in (report.git_info.error_message or "").lower()


def test_pr_check_git_repo_without_commits(tmp_path: Path):
    """Handles empty repository with no commits gracefully."""
    empty_repo = tmp_path / "empty_repo"
    empty_repo.mkdir()
    subprocess.run(["git", "init"], cwd=empty_repo, check=True, capture_output=True)

    report = analyze_pr(empty_repo)
    assert report.git_info.is_git_repo is True
    assert report.git_info.has_commits is False
    assert "no commits" in (report.git_info.error_message or "").lower()


def test_categorize_affected_area():
    """Validates heuristic area categorization."""
    assert categorize_affected_area("src/app/main.py") == "Application Source"
    assert categorize_affected_area("tests/test_main.py") == "Test Suite"
    assert categorize_affected_area("docs/guide.md") == "Documentation"
    assert categorize_affected_area("pyproject.toml") == "Build & Dependencies"
    assert categorize_affected_area(".github/workflows/ci.yml") == "CI/CD Workflows"
    assert categorize_affected_area("docker-compose.yml") == "Container & Infrastructure"
    assert categorize_affected_area(".gitignore") == "Repository Configuration"


# --- CLI Integration Tests ---


def test_cli_pr_check_on_clean_branch(git_repo: Path):
    """CLI pr-check command executes on valid repository and displays Rich report."""
    subprocess.run(["git", "checkout", "-b", "feat/sample"], cwd=git_repo, check=True, capture_output=True)
    (git_repo / "src" / "sample.py").write_text("x = 1\n", encoding="utf-8")
    subprocess.run(["git", "add", "."], cwd=git_repo, check=True, capture_output=True)
    subprocess.run(["git", "commit", "-m", "Sample commit"], cwd=git_repo, check=True, capture_output=True)

    result = runner.invoke(app, ["pr-check", str(git_repo), "--base", "main"])
    assert result.exit_code == 0
    assert "RepoPilot PR Compass" in result.stdout
    assert "Current Branch: feat/sample" in result.stdout
    assert "Base Branch: main" in result.stdout
    assert "src/sample.py" in result.stdout
    assert "Test Verification Recommendations" in result.stdout


def test_cli_pr_check_json_output(git_repo: Path):
    """CLI pr-check --json produces structured and parseable JSON output."""
    subprocess.run(["git", "checkout", "-b", "feat/json-test"], cwd=git_repo, check=True, capture_output=True)
    (git_repo / "src" / "api.py").write_text("def get(): pass\n", encoding="utf-8")
    subprocess.run(["git", "add", "."], cwd=git_repo, check=True, capture_output=True)
    subprocess.run(["git", "commit", "-m", "API commit"], cwd=git_repo, check=True, capture_output=True)

    result = runner.invoke(app, ["pr-check", str(git_repo), "--base", "main", "--json"])
    assert result.exit_code == 0

    data = json.loads(result.stdout)
    assert "git_info" in data
    assert "uncommitted" in data
    assert "branch_changes" in data
    assert "test_analysis" in data
    assert data["git_info"]["current_branch"] == "feat/json-test"
    assert data["summary"]["added"] == 1
    assert data["test_analysis"]["tests_executed"] is False


def test_cli_pr_check_missing_base_branch(git_repo: Path):
    """CLI pr-check with invalid base branch exits with code 1 and helpful warning."""
    result = runner.invoke(app, ["pr-check", str(git_repo), "--base", "missing_branch_999"])
    assert result.exit_code == 1
    assert "Warning" in result.stdout or "not found" in result.stdout


def test_cli_pr_check_not_git_repo(tmp_path: Path):
    """CLI pr-check exits with code 1 on non-git directory."""
    result = runner.invoke(app, ["pr-check", str(tmp_path)])
    assert result.exit_code == 1
    assert "Git Error" in result.stdout


def test_cli_pr_check_nonexistent_path():
    """CLI pr-check exits with code 1 on nonexistent path."""
    result = runner.invoke(app, ["pr-check", "/nonexistent/repo_path_99999"])
    assert result.exit_code == 1
    assert "Git Error" in result.stdout
    assert "does not exist" in result.stdout


def test_cli_pr_check_nonexistent_path_json():
    """CLI pr-check --json returns structured JSON on nonexistent path."""
    result = runner.invoke(app, ["pr-check", "/nonexistent/repo_path_99999", "--json"])
    assert result.exit_code == 1
    data = json.loads(result.stdout)
    assert data["git_info"]["is_git_repo"] is False
    assert "does not exist" in data["git_info"]["error_message"].lower()


def test_cli_pr_check_file_target(tmp_path: Path):
    """CLI pr-check exits with code 1 when target is a file instead of a directory."""
    file_path = tmp_path / "not_a_repo.txt"
    file_path.write_text("hello", encoding="utf-8")
    result = runner.invoke(app, ["pr-check", str(file_path)])
    assert result.exit_code == 1
    assert "Git Error" in result.stdout
    assert "is a file" in result.stdout
    assert "directory" in result.stdout
