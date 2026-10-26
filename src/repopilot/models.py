"""Data models for RepoPilot scan and diagnostics results."""

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
