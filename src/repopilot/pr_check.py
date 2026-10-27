"""PR Compass engine for RepoPilot.

Safely analyzes Git branch differences and working tree state, discovers relevant
tests, identifies potential testing gaps, and suggests verification commands
without modifying repository state or executing arbitrary code.
"""

from __future__ import annotations

import os
import shutil
import subprocess
from pathlib import Path
from typing import Final, Optional

from repopilot.explorer import detect_frameworks
from repopilot.models import (
    ChangeType,
    FileChange,
    FileTestMapping,
    GitBranchInfo,
    PRCheckReport,
    TestAnalysis,
    UncommittedStatus,
)
from repopilot.scanner import IGNORED_DIRS

DEFAULT_GIT_TIMEOUT: Final[int] = 5

CODE_EXTENSIONS: Final[set[str]] = {
    ".py", ".js", ".ts", ".jsx", ".tsx", ".mjs", ".cjs", ".go", ".rs", ".java", ".c", ".cpp", ".rb"
}
DOC_EXTENSIONS: Final[set[str]] = {".md", ".rst", ".txt", ".adoc"}
REPO_CONFIG_NAMES: Final[set[str]] = {".gitignore", ".editorconfig", "LICENSE", ".pre-commit-config.yaml"}
BUILD_CONFIG_NAMES: Final[set[str]] = {
    "pyproject.toml", "package.json", "requirements.txt", "Pipfile", "Pipfile.lock",
    "poetry.lock", "package-lock.json", "pnpm-lock.yaml", "yarn.lock", "tsconfig.json",
    "Makefile", "pytest.ini"
}


def _clean_git_path(p: str) -> str:
    """Safely cleans and unquotes Git path tokens."""
    s = p.strip()
    if s.startswith('"') and s.endswith('"') and len(s) >= 2:
        s = s[1:-1]
        try:
            # Handle octal escapes produced by Git if quotepath was engaged
            s = s.encode("latin-1").decode("unicode_escape").encode("latin-1").decode("utf-8")
        except Exception:
            pass
    return s


def _run_git(args: list[str], cwd: Path, timeout: int = DEFAULT_GIT_TIMEOUT) -> tuple[bool, str, str]:
    """Safely executes a git command using argument lists with timeouts.

    Args:
        args: List of command arguments, e.g. ["rev-parse", "--is-inside-work-tree"].
        cwd: Target directory to execute in.
        timeout: Subprocess timeout in seconds.

    Returns:
        tuple[bool, str, str]: (success, stdout_str, stderr_str)
    """
    if shutil.which("git") is None:
        return False, "", "Git executable not found in system PATH"

    cmd = ["git", "-c", "core.quotepath=false", "-C", str(cwd)] + args
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
            check=False,
        )
        return (result.returncode == 0), result.stdout.rstrip(), result.stderr.strip()
    except subprocess.TimeoutExpired:
        return False, "", f"Git command timed out after {timeout} seconds"
    except (PermissionError, OSError) as exc:
        return False, "", f"Failed to invoke Git: {exc}"


def categorize_affected_area(path: str) -> str:
    """Categorizes the functional area of a repository affected by a changed file."""
    parts = Path(path).parts
    first_part = parts[0].lower() if parts else ""
    path_lower = path.lower()
    file_name = Path(path).name

    if path in REPO_CONFIG_NAMES or file_name in REPO_CONFIG_NAMES:
        return "Repository Configuration"
    elif first_part in ("src", "app", "lib", "core", "packages"):
        return "Application Source"
    elif first_part in ("tests", "test", "spec", "specs", "__tests__") or file_name.startswith("test_") or file_name.endswith(("_test.py", ".test.js", ".test.ts", ".spec.js", ".spec.ts")):
        return "Test Suite"
    elif first_part in ("docs", "doc") or any(path_lower.endswith(ext) for ext in DOC_EXTENSIONS):
        return "Documentation"
    elif ".github" in parts or path_lower.startswith(".github/"):
        return "CI/CD Workflows"
    elif path in ("Dockerfile", "docker-compose.yml", "docker-compose.yaml", "compose.yaml", "compose.yml") or "docker" in path_lower or "compose" in path_lower:
        return "Container & Infrastructure"
    elif any(parts[0] == name or file_name == name for name in BUILD_CONFIG_NAMES) or path_lower.endswith((".toml", ".json", ".lock", ".yaml", ".yml")):
        return "Build & Dependencies"
    else:
        return "General"


def find_all_test_files(repo_path: Path) -> list[str]:
    """Safely discovers existing test files within the repository.

    Excludes ignored directories (.git, node_modules, .venv, etc.).
    """
    test_files: list[str] = []
    test_dirs = ["tests", "test", "__tests__", "spec", "specs"]

    # Search in designated test directories
    for t_dir_name in test_dirs:
        t_dir = repo_path / t_dir_name
        if t_dir.is_dir():
            try:
                for root, dirs, files in os.walk(t_dir):
                    dirs[:] = [d for d in dirs if d not in IGNORED_DIRS]
                    for f in files:
                        p = Path(root) / f
                        rel = str(p.relative_to(repo_path))
                        test_files.append(rel)
            except OSError:
                continue

    # Also check shallow root level for test files (e.g. test_*.py)
    try:
        with os.scandir(repo_path) as it:
            for entry in it:
                if entry.name in IGNORED_DIRS:
                    continue
                if entry.is_file(follow_symlinks=False):
                    if entry.name.startswith("test_") or entry.name.endswith(("_test.py", ".test.js", ".test.ts", ".spec.js", ".spec.ts")):
                        test_files.append(entry.name)
    except OSError:
        pass

    return sorted(list(dict.fromkeys(test_files)))


def match_tests_for_file(changed_file: str, all_test_files: list[str]) -> tuple[list[str], bool, str]:
    """Matches a changed file against candidate test files and identifies potential gaps.

    Returns:
        tuple[list[str], bool, str]: (related_tests, has_potential_gap, explanation_note)
    """
    p = Path(changed_file)
    ext = p.suffix.lower()
    stem = p.stem.lower()
    name_lower = p.name.lower()

    # Case 1: The changed file is itself a test file
    is_in_test_dir = any(part in ("tests", "test", "__tests__", "spec", "specs") for part in p.parts)
    is_test_filename = name_lower.startswith("test_") or name_lower.endswith(("_test.py", "_test.js", "_test.ts", ".test.js", ".test.ts", ".spec.js", ".spec.ts"))
    if is_in_test_dir or is_test_filename:
        return [changed_file], False, "Test file itself was modified."

    # Case 2: Non-code files (docs, configs, lockfiles, images)
    if ext not in CODE_EXTENSIONS:
        return [], False, "Non-code file; dedicated unit test not typically required."

    # Case 3: Code file -> look for candidate matching tests
    matching_tests: list[str] = []
    # Pattern 1: test_<stem> or <stem>_test
    # Pattern 2: <stem>.test.<ext> or <stem>.spec.<ext>
    for tf in all_test_files:
        tf_name = Path(tf).name.lower()
        if (
            tf_name == f"test_{stem}{ext}"
            or tf_name == f"{stem}_test{ext}"
            or tf_name.startswith(f"{stem}.test.")
            or tf_name.startswith(f"{stem}.spec.")
            or f"test_{stem}" in tf_name
        ):
            matching_tests.append(tf)

    if matching_tests:
        return matching_tests, False, "Matching test file(s) found based on naming convention."
    else:
        return [], True, f"Potential gap: No direct test file matching 'test_{stem}{ext}' or '{stem}.test.*' was found."


def infer_test_framework_and_command(repo_path: Path, matching_tests: list[str]) -> tuple[str, Optional[str]]:
    """Infers the repository's test framework and suggests an appropriate test command."""
    frameworks = detect_frameworks(repo_path)
    framework_lower = [f.lower() for f in frameworks]

    # Python projects
    if any("pytest" in f for f in framework_lower) or (repo_path / "pyproject.toml").is_file() or (repo_path / "setup.cfg").is_file():
        framework = "pytest"
        if matching_tests:
            # Suggest running the specific matching tests first
            target_tests = " ".join(matching_tests[:3])
            return framework, f"pytest {target_tests}"
        return framework, "pytest"

    # Node.js projects
    pkg_json = repo_path / "package.json"
    if pkg_json.is_file():
        if any("vitest" in f for f in framework_lower):
            framework = "Vitest"
        elif any("jest" in f for f in framework_lower):
            framework = "Jest"
        else:
            framework = "npm test"

        if (repo_path / "pnpm-lock.yaml").is_file():
            return framework, "pnpm test"
        elif (repo_path / "yarn.lock").is_file():
            return framework, "yarn test"
        else:
            return framework, "npm test"

    return "None detected", None


def analyze_pr(
    repo_path: str | Path,
    base_branch: str = "main",
) -> PRCheckReport:
    """Executes a pre-PR Git changes analysis, test discovery, and gap audit.

    Args:
        repo_path: Path to the target Git repository.
        base_branch: Base branch name for comparison (default "main").

    Returns:
        PRCheckReport: Comprehensive diagnostic report.
    """
    path_obj = Path(repo_path).expanduser().resolve()
    warnings: list[str] = []

    # 0. Validate target path existence and directory type
    if not path_obj.exists():
        return PRCheckReport(
            git_info=GitBranchInfo(
                is_git_repo=False,
                current_branch=None,
                base_branch=base_branch,
                has_commits=False,
                error_message=f"Target path '{path_obj}' does not exist.",
            ),
            uncommitted=UncommittedStatus(),
            warnings=[f"Target path '{path_obj}' does not exist."],
        )

    if not path_obj.is_dir():
        return PRCheckReport(
            git_info=GitBranchInfo(
                is_git_repo=False,
                current_branch=None,
                base_branch=base_branch,
                has_commits=False,
                error_message=f"Target path '{path_obj}' is a file, not a directory.",
            ),
            uncommitted=UncommittedStatus(),
            warnings=[f"Target path '{path_obj}' is a file, not a directory."],
        )

    # 1. Verify Git repository
    success, is_work_tree, err = _run_git(["rev-parse", "--is-inside-work-tree"], path_obj)
    if not success or is_work_tree != "true":
        return PRCheckReport(
            git_info=GitBranchInfo(
                is_git_repo=False,
                current_branch=None,
                base_branch=base_branch,
                has_commits=False,
                error_message=f"'{path_obj}' is not a Git repository (or Git is not installed).",
            ),
            uncommitted=UncommittedStatus(),
            warnings=[f"Target path '{path_obj}' is not a Git repository."],
        )

    # 2. Check for commits on HEAD
    success, head_commit, err = _run_git(["rev-parse", "--verify", "HEAD"], path_obj)
    if not success:
        return PRCheckReport(
            git_info=GitBranchInfo(
                is_git_repo=True,
                current_branch=None,
                base_branch=base_branch,
                has_commits=False,
                error_message="Git repository has no commits yet on HEAD.",
            ),
            uncommitted=UncommittedStatus(),
            warnings=["Repository contains no commits yet; cannot determine branch differences."],
        )

    # 3. Determine current branch
    success, current_branch, _ = _run_git(["symbolic-ref", "--short", "HEAD"], path_obj)
    if not success or not current_branch:
        success, short_sha, _ = _run_git(["rev-parse", "--short", "HEAD"], path_obj)
        current_branch = f"HEAD (detached at {short_sha})" if success else "HEAD"

    # 4. Check uncommitted changes in working tree
    staged_files: list[str] = []
    unstaged_files: list[str] = []
    untracked_files: list[str] = []

    success, status_out, _ = _run_git(["status", "--porcelain=v1", "-uall"], path_obj)
    if success and status_out:
        for line in status_out.splitlines():
            if len(line) < 3:
                continue
            code = line[:2]
            file_name = line[2:].lstrip()
            # If renamed, take the target name
            if " -> " in file_name:
                file_name = file_name.split(" -> ")[1].strip()
            file_name = _clean_git_path(file_name)

            # Untracked
            if code == "??":
                untracked_files.append(file_name)
            else:
                x, y = code[0], code[1]
                if x in ("A", "M", "D", "R", "C"):
                    staged_files.append(file_name)
                if y in ("M", "D"):
                    unstaged_files.append(file_name)

    has_uncommitted = bool(staged_files or unstaged_files or untracked_files)
    uncommitted_status = UncommittedStatus(
        has_uncommitted=has_uncommitted,
        staged_count=len(staged_files),
        unstaged_count=len(unstaged_files),
        untracked_count=len(untracked_files),
        staged_files=staged_files,
        unstaged_files=unstaged_files,
        untracked_files=untracked_files,
    )

    if has_uncommitted:
        warnings.append(
            f"Working tree has uncommitted changes ({len(staged_files)} staged, "
            f"{len(unstaged_files)} unstaged, {len(untracked_files)} untracked). "
            "These are not included in the committed branch comparison."
        )

    # 5. Resolve base branch
    resolved_base: Optional[str] = None
    # Check local ref
    success, _, _ = _run_git(["rev-parse", "--verify", base_branch], path_obj)
    if success:
        resolved_base = base_branch
    else:
        # Check remote tracking ref
        success, _, _ = _run_git(["rev-parse", "--verify", f"origin/{base_branch}"], path_obj)
        if success:
            resolved_base = f"origin/{base_branch}"

    branch_changes: list[FileChange] = []
    comparison_range: Optional[str] = None

    if not resolved_base:
        warning_msg = (
            f"Base branch '{base_branch}' was not found in local or remote tracking branches. "
            "Cannot calculate branch differences."
        )
        warnings.append(warning_msg)
        git_info = GitBranchInfo(
            is_git_repo=True,
            current_branch=current_branch,
            base_branch=base_branch,
            base_ref=None,
            comparison_range=None,
            has_commits=True,
            error_message=warning_msg,
        )
    else:
        # Check if current branch equals resolved base branch
        success, current_sha, _ = _run_git(["rev-parse", "HEAD"], path_obj)
        success, base_sha, _ = _run_git(["rev-parse", resolved_base], path_obj)

        if current_sha == base_sha:
            comparison_range = f"{resolved_base}...HEAD (identical)"
            git_info = GitBranchInfo(
                is_git_repo=True,
                current_branch=current_branch,
                base_branch=base_branch,
                base_ref=resolved_base,
                comparison_range=comparison_range,
                has_commits=True,
            )
        else:
            # Find merge-base
            success, merge_base, _ = _run_git(["merge-base", resolved_base, "HEAD"], path_obj)
            diff_target = merge_base if (success and merge_base) else resolved_base
            comparison_range = f"{resolved_base}...HEAD"

            success, diff_out, _ = _run_git(["diff", "--name-status", diff_target, "HEAD"], path_obj)
            if success and diff_out:
                for line in diff_out.splitlines():
                    if not line.strip():
                        continue
                    tokens = line.split("\t")
                    status_raw = tokens[0].strip()

                    if status_raw.startswith("R"):
                        change_type = ChangeType.RENAMED
                        old_p = _clean_git_path(tokens[1]) if len(tokens) > 1 else None
                        new_p = _clean_git_path(tokens[2]) if len(tokens) > 2 else _clean_git_path(tokens[1])
                        branch_changes.append(
                            FileChange(
                                path=new_p,
                                change_type=change_type,
                                old_path=old_p,
                                is_committed=True,
                                status_label="committed",
                                affected_area=categorize_affected_area(new_p),
                            )
                        )
                    elif status_raw.startswith("A"):
                        path_str = _clean_git_path(tokens[1])
                        branch_changes.append(
                            FileChange(
                                path=path_str,
                                change_type=ChangeType.ADDED,
                                is_committed=True,
                                status_label="committed",
                                affected_area=categorize_affected_area(path_str),
                            )
                        )
                    elif status_raw.startswith("D"):
                        path_str = _clean_git_path(tokens[1])
                        branch_changes.append(
                            FileChange(
                                path=path_str,
                                change_type=ChangeType.DELETED,
                                is_committed=True,
                                status_label="committed",
                                affected_area=categorize_affected_area(path_str),
                            )
                        )
                    elif status_raw.startswith("M"):
                        path_str = _clean_git_path(tokens[1])
                        branch_changes.append(
                            FileChange(
                                path=path_str,
                                change_type=ChangeType.MODIFIED,
                                is_committed=True,
                                status_label="committed",
                                affected_area=categorize_affected_area(path_str),
                            )
                        )
                    elif status_raw.startswith("C"):
                        old_p = _clean_git_path(tokens[1]) if len(tokens) > 1 else None
                        new_p = _clean_git_path(tokens[2]) if len(tokens) > 2 else _clean_git_path(tokens[1])
                        branch_changes.append(
                            FileChange(
                                path=new_p,
                                change_type=ChangeType.COPIED,
                                old_path=old_p,
                                is_committed=True,
                                status_label="committed",
                                affected_area=categorize_affected_area(new_p),
                            )
                        )

            git_info = GitBranchInfo(
                is_git_repo=True,
                current_branch=current_branch,
                base_branch=base_branch,
                base_ref=resolved_base,
                comparison_range=comparison_range,
                has_commits=True,
            )

    # 6. Change counts summary
    summary_counts: dict[str, int] = {
        "total": len(branch_changes),
        "added": sum(1 for c in branch_changes if c.change_type == ChangeType.ADDED),
        "modified": sum(1 for c in branch_changes if c.change_type == ChangeType.MODIFIED),
        "deleted": sum(1 for c in branch_changes if c.change_type == ChangeType.DELETED),
        "renamed": sum(1 for c in branch_changes if c.change_type == ChangeType.RENAMED),
    }

    # 7. Affected areas list
    affected_areas = sorted(list({c.affected_area for c in branch_changes}))

    # 8. Test Discovery and Gaps Audit
    # We analyze committed files as well as staged/unstaged uncommitted files to give full pre-PR awareness
    files_to_check = [c.path for c in branch_changes]
    for uncommitted_f in staged_files + unstaged_files:
        if uncommitted_f not in files_to_check:
            files_to_check.append(uncommitted_f)

    all_test_files = find_all_test_files(path_obj)
    mappings: list[FileTestMapping] = []
    potential_gaps_count = 0
    all_matched_tests: list[str] = []

    for f_path in files_to_check:
        matched_tests, is_gap, note = match_tests_for_file(f_path, all_test_files)
        if is_gap:
            potential_gaps_count += 1
        all_matched_tests.extend(matched_tests)
        mappings.append(
            FileTestMapping(
                changed_file=f_path,
                related_tests=matched_tests,
                has_potential_gap=is_gap,
                note=note,
            )
        )

    framework, suggested_cmd = infer_test_framework_and_command(path_obj, sorted(list(set(all_matched_tests))))

    if potential_gaps_count > 0:
        warnings.append(
            f"Found {potential_gaps_count} code file(s) with potential test coverage gaps (no matching test files detected)."
        )

    test_analysis = TestAnalysis(
        framework=framework,
        suggested_command=suggested_cmd,
        mappings=mappings,
        tests_executed=False,
        potential_gaps_count=potential_gaps_count,
    )

    return PRCheckReport(
        git_info=git_info,
        uncommitted=uncommitted_status,
        branch_changes=branch_changes,
        summary=summary_counts,
        affected_areas=affected_areas,
        test_analysis=test_analysis,
        warnings=warnings,
    )
