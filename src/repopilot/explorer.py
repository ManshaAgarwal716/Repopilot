"""Repository exploration engine for RepoPilot.

Safely analyzes repository structure, visualizes directory hierarchy with configurable
depth limits, explains important configuration files, and suggests starting points
for developers without executing any repository code or accessing sensitive credentials.
"""

from __future__ import annotations

import json
import os
import tomllib
from pathlib import Path
from typing import Final, Optional

from repopilot.models import (
    ConfidenceLevel,
    ExploreReport,
    ImportantFileExplanation,
    RepositoryScan,
    StartingPoint,
    StructureOverview,
    TreeNode,
    TreeSummary,
)
from repopilot.scanner import IGNORED_DIRS, scan_repository

# Standard files with verified explanations of their architectural role
IMPORTANT_FILES_CATALOG: Final[dict[str, tuple[str, str]]] = {
    "pyproject.toml": (
        "Build & Packaging",
        "Python project configuration, build specification, and dependency declarations (PEP 518/621).",
    ),
    "requirements.txt": (
        "Dependencies",
        "Pip dependency specification listing required external Python packages.",
    ),
    "Pipfile": (
        "Dependencies",
        "Pipenv configuration file defining project package dependencies and environment.",
    ),
    "Pipfile.lock": (
        "Lockfile",
        "Pipenv lockfile with pinned package versions and cryptographic hashes.",
    ),
    "poetry.lock": (
        "Lockfile",
        "Poetry lockfile with exact pinned dependency versions for reproducible installs.",
    ),
    "package.json": (
        "Build & Manifest",
        "Node.js package manifest defining project metadata, npm scripts, and dependencies.",
    ),
    "package-lock.json": (
        "Lockfile",
        "npm lockfile ensuring deterministic node module installations across environments.",
    ),
    "pnpm-lock.yaml": (
        "Lockfile",
        "pnpm lockfile pinning exact dependency tree versions.",
    ),
    "yarn.lock": (
        "Lockfile",
        "Yarn lockfile guaranteeing consistent package installations.",
    ),
    "tsconfig.json": (
        "Configuration",
        "TypeScript compiler options, target JavaScript version, and path aliases.",
    ),
    "Dockerfile": (
        "Containerization",
        "Docker instructions for building an application container image.",
    ),
    "docker-compose.yml": (
        "Orchestration",
        "Docker Compose configuration for running multi-container services locally.",
    ),
    "docker-compose.yaml": (
        "Orchestration",
        "Docker Compose configuration for running multi-container services locally.",
    ),
    "compose.yaml": (
        "Orchestration",
        "Modern Docker Compose service definitions for local development.",
    ),
    "compose.yml": (
        "Orchestration",
        "Modern Docker Compose service definitions for local development.",
    ),
    "README.md": (
        "Documentation",
        "Primary project documentation, usage guides, architecture overview, and onboarding.",
    ),
    "CONTRIBUTING.md": (
        "Documentation",
        "Guidelines, setup instructions, and code standards for project contributors.",
    ),
    "LICENSE": (
        "Legal",
        "Open-source or proprietary software license terms governing use and redistribution.",
    ),
    ".gitignore": (
        "Version Control",
        "Specifies intentionally untracked patterns that Git should ignore.",
    ),
    ".github/workflows": (
        "CI/CD Automation",
        "GitHub Actions CI/CD workflows for automated testing, linting, and deployment.",
    ),
    "pytest.ini": (
        "Testing",
        "Configuration file for pytest test runner options, markers, and path definitions.",
    ),
    "Makefile": (
        "Task Runner",
        "Make build automation recipes and developer task shortcuts.",
    ),
}

# Known framework dependencies mapped to readable names
PYTHON_FRAMEWORKS_MAP: Final[dict[str, str]] = {
    "fastapi": "FastAPI (web framework)",
    "flask": "Flask (web framework)",
    "django": "Django (web framework)",
    "pytest": "pytest (test framework)",
    "typer": "Typer (CLI framework)",
    "click": "Click (CLI framework)",
    "pydantic": "Pydantic (data validation)",
    "sqlalchemy": "SQLAlchemy (ORM)",
    "celery": "Celery (distributed task queue)",
    "tornado": "Tornado (async networking)",
    "starlette": "Starlette (ASGI framework)",
    "sphinx": "Sphinx (documentation generator)",
    "torch": "PyTorch (machine learning)",
    "tensorflow": "TensorFlow (machine learning)",
}

NODE_FRAMEWORKS_MAP: Final[dict[str, str]] = {
    "react": "React (UI library)",
    "next": "Next.js (React framework)",
    "vue": "Vue.js (UI framework)",
    "nuxt": "Nuxt (Vue framework)",
    "svelte": "Svelte (UI framework)",
    "express": "Express (web framework)",
    "fastify": "Fastify (web framework)",
    "@nestjs/core": "NestJS (backend framework)",
    "nestjs": "NestJS (backend framework)",
    "vite": "Vite (frontend build tool)",
    "typescript": "TypeScript (typed JavaScript)",
    "jest": "Jest (test framework)",
    "vitest": "Vitest (test framework)",
    "tailwindcss": "Tailwind CSS (styling)",
    "prisma": "Prisma (ORM)",
}

# Standard directory conventions
KNOWN_SOURCE_DIRS: Final[set[str]] = {
    "src", "lib", "app", "core", "packages", "client", "server", "api", "web", "frontend", "backend"
}
KNOWN_TEST_DIRS: Final[set[str]] = {"tests", "test", "spec", "specs", "__tests__"}
KNOWN_DOC_DIRS: Final[set[str]] = {"docs", "doc", "documentation", "wiki"}

# Conventional entry point filenames
PYTHON_ENTRY_CANDIDATES: Final[list[str]] = [
    "main.py", "app.py", "cli.py", "run.py", "manage.py", "__main__.py", "wsgi.py", "asgi.py"
]
NODE_ENTRY_CANDIDATES: Final[list[str]] = [
    "index.js", "index.ts", "main.js", "main.ts", "server.js", "server.ts", "app.js", "app.ts"
]


def detect_frameworks(root: Path) -> list[str]:
    """Safely extracts recognized frameworks from dependency configuration files.

    Reads only declared package manifests with size limits and never executes code.
    """
    detected: set[str] = set()

    # 1. Inspect pyproject.toml
    pyproject_path = root / "pyproject.toml"
    if pyproject_path.exists() and pyproject_path.is_file():
        try:
            if pyproject_path.stat().st_size < 1_000_000:  # limit to 1MB
                with open(pyproject_path, "rb") as f:
                    data = tomllib.load(f)

                # PEP 621 dependencies
                deps = data.get("project", {}).get("dependencies", [])
                for dep in deps:
                    pkg_name = dep.split("[")[0].split("<")[0].split(">")[0].split("=")[0].split("~")[0].strip().lower()
                    if pkg_name in PYTHON_FRAMEWORKS_MAP:
                        detected.add(PYTHON_FRAMEWORKS_MAP[pkg_name])

                # Optional dependencies
                opt_deps = data.get("project", {}).get("optional-dependencies", {})
                if isinstance(opt_deps, dict):
                    for group_deps in opt_deps.values():
                        if isinstance(group_deps, list):
                            for dep in group_deps:
                                pkg_name = dep.split("[")[0].split("<")[0].split(">")[0].split("=")[0].split("~")[0].strip().lower()
                                if pkg_name in PYTHON_FRAMEWORKS_MAP:
                                    detected.add(PYTHON_FRAMEWORKS_MAP[pkg_name])

                # Poetry dependencies
                poetry_deps = data.get("tool", {}).get("poetry", {}).get("dependencies", {})
                if isinstance(poetry_deps, dict):
                    for dep in poetry_deps:
                        pkg_name = dep.strip().lower()
                        if pkg_name in PYTHON_FRAMEWORKS_MAP:
                            detected.add(PYTHON_FRAMEWORKS_MAP[pkg_name])
        except Exception:
            pass

    # 2. Inspect requirements.txt
    req_path = root / "requirements.txt"
    if req_path.exists() and req_path.is_file():
        try:
            if req_path.stat().st_size < 500_000:
                with open(req_path, "r", encoding="utf-8", errors="ignore") as f:
                    for line in f:
                        line = line.strip()
                        if not line or line.startswith("#"):
                            continue
                        pkg_name = line.split("[")[0].split("<")[0].split(">")[0].split("=")[0].split("~")[0].strip().lower()
                        if pkg_name in PYTHON_FRAMEWORKS_MAP:
                            detected.add(PYTHON_FRAMEWORKS_MAP[pkg_name])
        except Exception:
            pass

    # 3. Inspect package.json
    pkg_json_path = root / "package.json"
    if pkg_json_path.exists() and pkg_json_path.is_file():
        try:
            if pkg_json_path.stat().st_size < 500_000:
                with open(pkg_json_path, "r", encoding="utf-8", errors="ignore") as f:
                    data = json.load(f)
                all_deps: dict[str, str] = {}
                if isinstance(data.get("dependencies"), dict):
                    all_deps.update(data["dependencies"])
                if isinstance(data.get("devDependencies"), dict):
                    all_deps.update(data["devDependencies"])

                for dep in all_deps:
                    dep_lower = dep.lower()
                    if dep_lower in NODE_FRAMEWORKS_MAP:
                        detected.add(NODE_FRAMEWORKS_MAP[dep_lower])
        except Exception:
            pass

    # 4. Containerization checks
    if (root / "Dockerfile").is_file():
        detected.add("Docker (containerization)")
    if any((root / name).is_file() for name in ("docker-compose.yml", "docker-compose.yaml", "compose.yaml", "compose.yml")):
        detected.add("Docker Compose (multi-service development)")

    return sorted(detected)


def build_file_tree(
    root_path: Path,
    max_depth: int = 2,
    max_entries: int = 200,
) -> TreeSummary:
    """Safely builds a limited-depth directory tree.

    Args:
        root_path: Resolved Path to repository root.
        max_depth: Maximum directory recursion depth (>= 1).
        max_entries: Total file and directory nodes limit across tree.

    Returns:
        TreeSummary: Root tree node and traversal summary statistics.
    """
    total_files = 0
    total_dirs = 0
    count = 0
    truncated = False

    root_node = TreeNode(
        name=root_path.name or str(root_path),
        rel_path=".",
        is_dir=True,
    )

    def _traverse(current_dir: Path, current_node: TreeNode, depth: int) -> None:
        nonlocal total_files, total_dirs, count, truncated

        if depth > max_depth or truncated:
            return

        try:
            with os.scandir(current_dir) as it:
                # Materialize entries and filter ignored names
                raw_entries: list[os.DirEntry[str]] = []
                for entry in it:
                    if entry.name in IGNORED_DIRS:
                        continue
                    raw_entries.append(entry)

                # Deterministic sort: directories first (alphabetical), then files (alphabetical)
                dirs = sorted([e for e in raw_entries if e.is_dir(follow_symlinks=False)], key=lambda e: e.name.lower())
                files = sorted([e for e in raw_entries if not e.is_dir(follow_symlinks=False)], key=lambda e: e.name.lower())
                sorted_entries = dirs + files

                for entry in sorted_entries:
                    if count >= max_entries:
                        truncated = True
                        return

                    is_symlink = entry.is_symlink()
                    is_dir = entry.is_dir(follow_symlinks=False)
                    rel_p = str(Path(entry.path).relative_to(root_path))

                    target_link: Optional[str] = None
                    if is_symlink:
                        try:
                            target_link = os.readlink(entry.path)
                        except OSError:
                            target_link = "unresolved symlink"

                    child_node = TreeNode(
                        name=entry.name,
                        rel_path=rel_p,
                        is_dir=is_dir,
                        is_symlink=is_symlink,
                        target_symlink=target_link,
                    )

                    count += 1
                    current_node.children.append(child_node)

                    if is_dir:
                        total_dirs += 1
                        # Strictly do NOT follow symlinked directories
                        if not is_symlink and depth < max_depth:
                            _traverse(Path(entry.path), child_node, depth + 1)
                    else:
                        total_files += 1

        except (PermissionError, OSError) as exc:
            current_node.error = f"Access denied: {exc}"

    _traverse(root_path, root_node, 1)

    return TreeSummary(
        root=root_node,
        total_files=total_files,
        total_dirs=total_dirs,
        truncated=truncated,
        max_depth=max_depth,
        max_entries=max_entries,
    )


def analyze_structure(root_path: Path, scan: RepositoryScan) -> StructureOverview:
    """Examines repository structure to identify top-level files, source, test, and doc directories."""
    top_level_files: list[str] = []
    top_level_dirs: list[str] = []
    source_dirs: list[str] = []
    test_dirs: list[str] = []
    doc_dirs: list[str] = []
    entry_points: list[str] = []
    config_files: list[str] = []

    try:
        with os.scandir(root_path) as it:
            for entry in it:
                if entry.name in IGNORED_DIRS:
                    continue
                if entry.is_dir(follow_symlinks=False):
                    top_level_dirs.append(entry.name)
                    name_lower = entry.name.lower()
                    if name_lower in KNOWN_SOURCE_DIRS:
                        source_dirs.append(entry.name)
                    if name_lower in KNOWN_TEST_DIRS:
                        test_dirs.append(entry.name)
                    if name_lower in KNOWN_DOC_DIRS:
                        doc_dirs.append(entry.name)
                elif entry.is_file(follow_symlinks=False):
                    top_level_files.append(entry.name)
                    if entry.name in IMPORTANT_FILES_CATALOG:
                        config_files.append(entry.name)
    except OSError:
        pass

    top_level_files.sort(key=str.lower)
    top_level_dirs.sort(key=str.lower)
    source_dirs.sort(key=str.lower)
    test_dirs.sort(key=str.lower)
    doc_dirs.sort(key=str.lower)
    config_files.sort(key=str.lower)

    # Check for CLI / package scripts defined in pyproject.toml
    pyproject_p = root_path / "pyproject.toml"
    if pyproject_p.is_file():
        try:
            with open(pyproject_p, "rb") as f:
                data = tomllib.load(f)
            scripts = data.get("project", {}).get("scripts", {})
            if isinstance(scripts, dict):
                for name, target in scripts.items():
                    entry_points.append(f"{target} (CLI script: '{name}')")
        except Exception:
            pass

    # Check for conventional entry points in root and source directories (and their immediate packages)
    search_dirs = [root_path]
    for s_dir in source_dirs:
        sub_p = root_path / s_dir
        if sub_p.is_dir():
            search_dirs.append(sub_p)
            try:
                with os.scandir(sub_p) as it:
                    for entry in it:
                        if entry.name not in IGNORED_DIRS and entry.is_dir(follow_symlinks=False):
                            search_dirs.append(Path(entry.path))
            except OSError:
                pass

    for directory in search_dirs:
        try:
            with os.scandir(directory) as it:
                for entry in it:
                    if entry.is_file(follow_symlinks=False):
                        rel = str(Path(entry.path).relative_to(root_path))
                        if entry.name in PYTHON_ENTRY_CANDIDATES:
                            if rel not in entry_points:
                                entry_points.append(rel)
                        elif entry.name in NODE_ENTRY_CANDIDATES:
                            if rel not in entry_points:
                                entry_points.append(rel)
                        elif entry.name in ("__init__.py",):
                            # Package indicator
                            pass
        except OSError:
            pass

    # Deduplicate and sort entry points
    entry_points = sorted(list(dict.fromkeys(entry_points)))

    frameworks = detect_frameworks(root_path)

    return StructureOverview(
        top_level_files=top_level_files,
        top_level_dirs=top_level_dirs,
        source_dirs=source_dirs,
        test_dirs=test_dirs,
        doc_dirs=doc_dirs,
        entry_points=entry_points,
        config_files=config_files,
        recognized_frameworks=frameworks,
    )


def identify_important_files(root_path: Path, scan: RepositoryScan) -> list[ImportantFileExplanation]:
    """Identifies and explains existing important configuration and repository files."""
    explanations: list[ImportantFileExplanation] = []

    for name, (role, description) in IMPORTANT_FILES_CATALOG.items():
        target = root_path / name
        try:
            if target.exists():
                explanations.append(
                    ImportantFileExplanation(
                        path=name if not target.is_dir() else f"{name}/",
                        role=role,
                        description=description,
                    )
                )
        except OSError:
            continue

    # Sort deterministically
    explanations.sort(key=lambda item: (item.role, item.path))
    return explanations


def find_starting_points(
    root_path: Path,
    scan: RepositoryScan,
    overview: StructureOverview,
) -> list[StartingPoint]:
    """Generates heuristic-based, ranked suggestions for files a developer should inspect first."""
    suggestions: list[StartingPoint] = []

    # 1. README.md (High Confidence)
    if (root_path / "README.md").is_file():
        suggestions.append(
            StartingPoint(
                path="README.md",
                reason="Primary project overview, setup commands, and architectural context.",
                confidence=ConfidenceLevel.HIGH,
            )
        )

    # 2. Primary Configuration & Build Specification (High Confidence)
    if (root_path / "pyproject.toml").is_file():
        suggestions.append(
            StartingPoint(
                path="pyproject.toml",
                reason="Defines project metadata, dependencies, build toolchain, and CLI scripts.",
                confidence=ConfidenceLevel.HIGH,
            )
        )
    elif (root_path / "package.json").is_file():
        suggestions.append(
            StartingPoint(
                path="package.json",
                reason="Defines runnable scripts (dev, test, build), metadata, and package dependencies.",
                confidence=ConfidenceLevel.HIGH,
            )
        )
    elif (root_path / "requirements.txt").is_file():
        suggestions.append(
            StartingPoint(
                path="requirements.txt",
                reason="Lists core dependencies needed to run the Python project.",
                confidence=ConfidenceLevel.MEDIUM,
            )
        )

    # 3. Entrypoint Files (High or Medium Confidence)
    for ep in overview.entry_points:
        clean_path = ep.split(" ")[0]
        # Avoid duplicate suggestions
        if not any(s.path == clean_path for s in suggestions):
            conf = ConfidenceLevel.HIGH if "CLI script" in ep or clean_path in ("main.py", "app.py", "src/main.py", "src/index.ts") else ConfidenceLevel.MEDIUM
            suggestions.append(
                StartingPoint(
                    path=clean_path,
                    reason="Likely application execution entry point where program initialization begins.",
                    confidence=conf,
                )
            )
            # Only recommend the top 2 entrypoints to keep suggestion list focused
            if len([s for s in suggestions if "entry point" in s.reason.lower()]) >= 2:
                break

    # 4. Multi-Service Container Orchestration (Medium Confidence)
    for compose_name in ("docker-compose.yml", "docker-compose.yaml", "compose.yaml", "compose.yml"):
        if (root_path / compose_name).is_file():
            suggestions.append(
                StartingPoint(
                    path=compose_name,
                    reason="Defines local development services, databases, exposed ports, and container topology.",
                    confidence=ConfidenceLevel.MEDIUM,
                )
            )
            break

    # 5. Test Suite (Medium Confidence)
    if overview.test_dirs:
        test_dir_name = overview.test_dirs[0]
        suggestions.append(
            StartingPoint(
                path=f"{test_dir_name}/",
                reason="Tests reveal expected module behavior, input fixtures, and public API usage patterns.",
                confidence=ConfidenceLevel.MEDIUM,
            )
        )

    # If no suggestions found (e.g. empty repository), provide general exploratory tip
    if not suggestions:
        if overview.top_level_files:
            first_file = overview.top_level_files[0]
            suggestions.append(
                StartingPoint(
                    path=first_file,
                    reason="Top-level file in repository; inspect to understand repository contents.",
                    confidence=ConfidenceLevel.LOW,
                )
            )
        else:
            suggestions.append(
                StartingPoint(
                    path=".",
                    reason="Directory appears empty or lacks standard convention markers.",
                    confidence=ConfidenceLevel.LOW,
                )
            )

    return suggestions


def explore_repository(
    path: str | Path,
    max_depth: int = 2,
    max_entries: int = 200,
) -> ExploreReport:
    """Executes a full repository exploration scan.

    Args:
        path: Path to target repository directory.
        max_depth: Maximum directory recursion depth (default 2).
        max_entries: Maximum total items to render in file tree (default 200).

    Returns:
        ExploreReport: Full report with scan status, structure overview, tree, important files, and starting points.
    """
    scan = scan_repository(path)
    if not scan.exists or not scan.is_dir or not scan.is_accessible:
        empty_root = TreeNode(name=str(path), rel_path=".", is_dir=False, error=scan.error_message)
        empty_tree = TreeSummary(root=empty_root, total_files=0, total_dirs=0, truncated=False, max_depth=max_depth, max_entries=max_entries)
        return ExploreReport(
            scan=scan,
            overview=StructureOverview(),
            tree=empty_tree,
            important_files=[],
            starting_points=[],
        )

    resolved_root = Path(scan.resolved_path)
    overview = analyze_structure(resolved_root, scan)
    tree = build_file_tree(resolved_root, max_depth=max_depth, max_entries=max_entries)
    important_files = identify_important_files(resolved_root, scan)
    starting_points = find_starting_points(resolved_root, scan, overview)

    return ExploreReport(
        scan=scan,
        overview=overview,
        tree=tree,
        important_files=important_files,
        starting_points=starting_points,
    )
