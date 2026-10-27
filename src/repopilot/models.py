"""Data models for RepoPilot scan, explorer, and diagnostics results."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Optional


class CheckStatus(str, Enum):
    """Status of an inspected file or directory check."""

    FOUND = "FOUND"
    MISSING = "MISSING"
    NOT_CHECKED = "NOT_CHECKED"


class ProjectCategory(str, Enum):
    """Categorization of the scanned project based on detected technologies."""

    PYTHON = "python"
    NODEJS = "nodejs"
    BOTH = "both"
    NEITHER = "neither"


class ConfidenceLevel(str, Enum):
    """Confidence level for heuristics and recommendations."""

    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


@dataclass
class FileCheck:
    """Represents the audit status of a specific project file or directory."""

    name: str
    category: str
    status: CheckStatus
    description: str
    is_directory: bool = False
    details: Optional[str] = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "category": self.category,
            "status": self.status.value,
            "description": self.description,
            "is_directory": self.is_directory,
            "details": self.details,
        }


@dataclass
class ToolStatus:
    """Represents the availability and version of a local development tool."""

    name: str
    command: str
    installed: bool
    version: Optional[str] = None
    required: bool = True
    details: Optional[str] = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "command": self.command,
            "installed": self.installed,
            "version": self.version,
            "required": self.required,
            "details": self.details,
        }


@dataclass
class RepositoryScan:
    """Result of safely scanning a target repository."""

    target_path: str
    resolved_path: str
    exists: bool = True
    is_dir: bool = True
    is_accessible: bool = True
    error_message: Optional[str] = None
    project_types: list[str] = field(default_factory=list)
    category: ProjectCategory = ProjectCategory.NEITHER
    file_checks: list[FileCheck] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "target_path": self.target_path,
            "resolved_path": self.resolved_path,
            "exists": self.exists,
            "is_dir": self.is_dir,
            "is_accessible": self.is_accessible,
            "error_message": self.error_message,
            "project_types": self.project_types,
            "category": self.category.value,
            "file_checks": [fc.to_dict() for fc in self.file_checks],
        }


@dataclass
class DiagnosticReport:
    """Comprehensive diagnostic report containing scan results, tools, and next steps."""

    scan: RepositoryScan
    tools: list[ToolStatus] = field(default_factory=list)
    next_steps: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "scan": self.scan.to_dict(),
            "tools": [t.to_dict() for t in self.tools],
            "next_steps": self.next_steps,
        }


@dataclass
class ImportantFileExplanation:
    """Explanation of an existing important configuration or repository file."""

    path: str
    role: str
    description: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "path": self.path,
            "role": self.role,
            "description": self.description,
        }


@dataclass
class StartingPoint:
    """Suggested file for developers to inspect first when exploring a codebase."""

    path: str
    reason: str
    confidence: ConfidenceLevel

    def to_dict(self) -> dict[str, Any]:
        return {
            "path": self.path,
            "reason": self.reason,
            "confidence": self.confidence.value,
        }


@dataclass
class TreeNode:
    """Represents a node in the limited-depth file tree."""

    name: str
    rel_path: str
    is_dir: bool
    is_symlink: bool = False
    target_symlink: Optional[str] = None
    children: list[TreeNode] = field(default_factory=list)
    error: Optional[str] = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "rel_path": self.rel_path,
            "is_dir": self.is_dir,
            "is_symlink": self.is_symlink,
            "target_symlink": self.target_symlink,
            "children": [c.to_dict() for c in self.children],
            "error": self.error,
        }


@dataclass
class TreeSummary:
    """Summary of the repository directory tree traversal."""

    root: TreeNode
    total_files: int
    total_dirs: int
    truncated: bool = False
    max_depth: int = 2
    max_entries: int = 200

    def to_dict(self) -> dict[str, Any]:
        return {
            "root": self.root.to_dict(),
            "total_files": self.total_files,
            "total_dirs": self.total_dirs,
            "truncated": self.truncated,
            "max_depth": self.max_depth,
            "max_entries": self.max_entries,
        }


@dataclass
class StructureOverview:
    """Architectural overview of the scanned codebase structure."""

    top_level_files: list[str] = field(default_factory=list)
    top_level_dirs: list[str] = field(default_factory=list)
    source_dirs: list[str] = field(default_factory=list)
    test_dirs: list[str] = field(default_factory=list)
    doc_dirs: list[str] = field(default_factory=list)
    entry_points: list[str] = field(default_factory=list)
    config_files: list[str] = field(default_factory=list)
    recognized_frameworks: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "top_level_files": self.top_level_files,
            "top_level_dirs": self.top_level_dirs,
            "source_dirs": self.source_dirs,
            "test_dirs": self.test_dirs,
            "doc_dirs": self.doc_dirs,
            "entry_points": self.entry_points,
            "config_files": self.config_files,
            "recognized_frameworks": self.recognized_frameworks,
        }


@dataclass
class ExploreReport:
    """Comprehensive report produced by the `explore` command."""

    scan: RepositoryScan
    overview: StructureOverview
    tree: TreeSummary
    important_files: list[ImportantFileExplanation] = field(default_factory=list)
    starting_points: list[StartingPoint] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "scan": self.scan.to_dict(),
            "overview": self.overview.to_dict(),
            "tree": self.tree.to_dict(),
            "important_files": [f.to_dict() for f in self.important_files],
            "starting_points": [p.to_dict() for p in self.starting_points],
        }


# --- Milestone 3: PR Compass Models ---


class ChangeType(str, Enum):
    """Classification of Git file changes."""

    ADDED = "added"
    MODIFIED = "modified"
    DELETED = "deleted"
    RENAMED = "renamed"
    COPIED = "copied"


@dataclass
class FileChange:
    """Represents a single changed file between Git refs or in working tree."""

    path: str
    change_type: ChangeType
    old_path: Optional[str] = None
    is_committed: bool = True
    status_label: str = "committed"
    affected_area: str = "General"

    def to_dict(self) -> dict[str, Any]:
        return {
            "path": self.path,
            "change_type": self.change_type.value,
            "old_path": self.old_path,
            "is_committed": self.is_committed,
            "status_label": self.status_label,
            "affected_area": self.affected_area,
        }


@dataclass
class UncommittedStatus:
    """Detailed summary of uncommitted changes in the Git working tree."""

    has_uncommitted: bool = False
    staged_count: int = 0
    unstaged_count: int = 0
    untracked_count: int = 0
    staged_files: list[str] = field(default_factory=list)
    unstaged_files: list[str] = field(default_factory=list)
    untracked_files: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "has_uncommitted": self.has_uncommitted,
            "staged_count": self.staged_count,
            "unstaged_count": self.unstaged_count,
            "untracked_count": self.untracked_count,
            "staged_files": self.staged_files,
            "unstaged_files": self.unstaged_files,
            "untracked_files": self.untracked_files,
        }


@dataclass
class GitBranchInfo:
    """Git branch identification and comparison metadata."""

    is_git_repo: bool = True
    current_branch: Optional[str] = None
    base_branch: str = "main"
    base_ref: Optional[str] = None
    comparison_range: Optional[str] = None
    has_commits: bool = True
    error_message: Optional[str] = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "is_git_repo": self.is_git_repo,
            "current_branch": self.current_branch,
            "base_branch": self.base_branch,
            "base_ref": self.base_ref,
            "comparison_range": self.comparison_range,
            "has_commits": self.has_commits,
            "error_message": self.error_message,
        }


@dataclass
class FileTestMapping:
    """Mapping of a changed file to candidate test files and potential gap notices."""

    changed_file: str
    related_tests: list[str] = field(default_factory=list)
    has_potential_gap: bool = False
    note: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {
            "changed_file": self.changed_file,
            "related_tests": self.related_tests,
            "has_potential_gap": self.has_potential_gap,
            "note": self.note,
        }


@dataclass
class TestAnalysis:
    """Analysis of testing coverage, inferred test framework, and suggested commands."""

    framework: str = "None detected"
    suggested_command: Optional[str] = None
    mappings: list[FileTestMapping] = field(default_factory=list)
    tests_executed: bool = False
    potential_gaps_count: int = 0

    def to_dict(self) -> dict[str, Any]:
        return {
            "framework": self.framework,
            "suggested_command": self.suggested_command,
            "mappings": [m.to_dict() for m in self.mappings],
            "tests_executed": self.tests_executed,
            "potential_gaps_count": self.potential_gaps_count,
        }


@dataclass
class PRCheckReport:
    """Comprehensive pre-PR diagnostic report produced by `pr-check`."""

    git_info: GitBranchInfo
    uncommitted: UncommittedStatus
    branch_changes: list[FileChange] = field(default_factory=list)
    summary: dict[str, int] = field(default_factory=dict)
    affected_areas: list[str] = field(default_factory=list)
    test_analysis: TestAnalysis = field(default_factory=TestAnalysis)
    warnings: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "git_info": self.git_info.to_dict(),
            "uncommitted": self.uncommitted.to_dict(),
            "branch_changes": [c.to_dict() for c in self.branch_changes],
            "summary": self.summary,
            "affected_areas": self.affected_areas,
            "test_analysis": self.test_analysis.to_dict(),
            "warnings": self.warnings,
        }
