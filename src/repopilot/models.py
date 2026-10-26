"""Data models for RepoPilot scan, explorer, and diagnostics results."""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
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
